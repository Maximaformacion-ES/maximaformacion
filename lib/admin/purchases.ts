import { clerkClient } from '@clerk/nextjs/server';
import { and, eq, gte, ilike, inArray, sql, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { enrollments, users } from '@/lib/db/schema';

// ─── Historial global de compras ───────────────────────────────────────
// Fuente = campus.enrollments (cada compra/concesión es una fila con precio,
// título snapshot y payment intent de Stripe). El comprador se resuelve en
// Clerk por lotes solo para la página visible, con fallback a campus.users.

export interface PurchaseListItem {
  id: string;
  clerkId: string;
  buyerName: string;
  buyerEmail: string | null;
  title: string;
  programDocumentId: string;
  price: string | null;
  purchasedAt: string | null; // ISO
  expiresAt: string | null; // ISO
  accessType: string; // 'purchased' | 'admin_granted'
  stripePaymentId: string | null;
  refundedAt: string | null; // ISO; null = no reembolsada
}

export interface MonthPoint {
  /** 'YYYY-MM' */
  month: string;
  count: number;
  /** Ingresos del mes SIN las compras reembolsadas. */
  amount: number;
}

export interface PurchaseList {
  items: PurchaseListItem[];
  total: number;
  /** Suma de precios del conjunto filtrado completo, SIN reembolsadas. */
  totalAmount: number;
  /** Compras e importe (sin reembolsadas) de los últimos 30 días. */
  last30Count: number;
  last30Amount: number;
  /** Compras marcadas como reembolsadas (y su importe) en el conjunto filtrado. */
  refundedCount: number;
  refundedAmount: number;
  /** Serie mensual (últimos 12 meses, con los mismos filtros) para la gráfica. */
  months: MonthPoint[];
}

const EMPTY: PurchaseList = {
  items: [],
  total: 0,
  totalAmount: 0,
  last30Count: 0,
  last30Amount: 0,
  refundedCount: 0,
  refundedAmount: 0,
  months: [],
};

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.warn('[admin:purchases] read failed:', e);
    return fallback;
  }
}

/** clerkIds cuyo nombre/email casa con el texto (Clerk + espejo campus.users). */
async function clerkIdsMatching(q: string): Promise<string[]> {
  const ids = new Set<string>();
  try {
    const cc = await clerkClient();
    const res = await cc.users.getUserList({ query: q, limit: 100 });
    for (const u of res.data) ids.add(u.id);
  } catch (e) {
    console.warn('[admin:listPurchases] clerk query failed:', e);
  }
  await safe(async () => {
    const rows = await db
      .select({ clerkId: users.clerkId })
      .from(users)
      .where(ilike(users.email, `%${q}%`));
    for (const r of rows) ids.add(r.clerkId);
  }, undefined);
  return Array.from(ids);
}

export async function listPurchases(opts: {
  /** Texto libre sobre nombre/email del comprador. */
  query?: string;
  /** documentId de un curso → solo compras de ese curso. */
  courseDocumentId?: string;
  /** 'purchased' | 'admin_granted' → filtrar por tipo de acceso. */
  accessType?: string;
  limit?: number;
  offset?: number;
}): Promise<PurchaseList> {
  const { query, courseDocumentId, accessType, limit = 25, offset = 0 } = opts;

  const conds: SQL[] = [];
  if (courseDocumentId) conds.push(eq(enrollments.programDocumentId, courseDocumentId));
  if (accessType === 'purchased' || accessType === 'admin_granted') {
    conds.push(eq(enrollments.accessType, accessType));
  }
  const q = query?.trim();
  if (q) {
    const ids = await clerkIdsMatching(q);
    if (ids.length === 0) return EMPTY;
    conds.push(inArray(enrollments.clerkId, ids));
  }
  const where = conds.length > 0 ? and(...conds) : undefined;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  // Serie mensual: desde el día 1 de hace 11 meses (12 puntos contando el actual).
  const seriesStart = new Date();
  seriesStart.setDate(1);
  seriesStart.setHours(0, 0, 0, 0);
  seriesStart.setMonth(seriesStart.getMonth() - 11);

  // Importe "bueno" = sin compras reembolsadas.
  const netAmount = sql<string | null>`sum(${enrollments.price}) filter (where ${enrollments.refundedAt} is null)`;

  const [rows, [totals], [recent], series] = await Promise.all([
    safe(
      () =>
        db
          .select()
          .from(enrollments)
          .where(where)
          .orderBy(sql`${enrollments.purchasedAt} desc nulls last`)
          .limit(limit)
          .offset(offset),
      [] as (typeof enrollments.$inferSelect)[]
    ),
    safe(
      () =>
        db
          .select({
            n: sql<number>`count(*)::int`,
            amount: netAmount,
            refundedN: sql<number>`count(*) filter (where ${enrollments.refundedAt} is not null)::int`,
            refundedAmount: sql<string | null>`sum(${enrollments.price}) filter (where ${enrollments.refundedAt} is not null)`,
          })
          .from(enrollments)
          .where(where),
      [{ n: 0, amount: null, refundedN: 0, refundedAmount: null }]
    ),
    safe(
      () =>
        db
          .select({
            n: sql<number>`count(*)::int`,
            amount: netAmount,
          })
          .from(enrollments)
          .where(and(gte(enrollments.purchasedAt, thirtyDaysAgo), ...(conds.length > 0 ? conds : []))),
      [{ n: 0, amount: null }]
    ),
    safe(
      () =>
        db
          .select({
            month: sql<string>`to_char(date_trunc('month', ${enrollments.purchasedAt}), 'YYYY-MM')`,
            n: sql<number>`count(*)::int`,
            amount: netAmount,
          })
          .from(enrollments)
          .where(and(gte(enrollments.purchasedAt, seriesStart), ...(conds.length > 0 ? conds : [])))
          .groupBy(sql`1`)
          .orderBy(sql`1`),
      [] as { month: string; n: number; amount: string | null }[]
    ),
  ]);

  // Rellenar los meses sin compras para que la gráfica no tenga huecos.
  const byMonth = new Map(series.map((r) => [r.month, r]));
  const months: MonthPoint[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(seriesStart.getFullYear(), seriesStart.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const row = byMonth.get(key);
    months.push({ month: key, count: row?.n ?? 0, amount: row?.amount ? Number(row.amount) : 0 });
  }

  // Resolver comprador (nombre/email) para los clerkIds de la página visible.
  const pageIds = Array.from(new Set(rows.map((r) => r.clerkId)));
  const nameById = new Map<string, { name: string; email: string | null }>();
  if (pageIds.length > 0) {
    const emailByClerk = new Map<string, string | null>();
    await safe(async () => {
      const mirror = await db
        .select({ clerkId: users.clerkId, email: users.email })
        .from(users)
        .where(inArray(users.clerkId, pageIds));
      for (const r of mirror) emailByClerk.set(r.clerkId, r.email);
    }, undefined);
    try {
      const cc = await clerkClient();
      for (let i = 0; i < pageIds.length; i += 100) {
        const res = await cc.users.getUserList({ userId: pageIds.slice(i, i + 100), limit: 100 });
        for (const u of res.data) {
          nameById.set(u.id, {
            name: [u.firstName, u.lastName].filter(Boolean).join(' ') || '(sin nombre)',
            email:
              u.primaryEmailAddress?.emailAddress ??
              u.emailAddresses?.[0]?.emailAddress ??
              emailByClerk.get(u.id) ??
              null,
          });
        }
      }
    } catch (e) {
      console.warn('[admin:listPurchases] clerk resolve failed:', e);
    }
    // Fallback para clerkIds que Clerk no devuelva (dev pk_test / borrados).
    for (const id of pageIds) {
      if (nameById.has(id)) continue;
      const email = emailByClerk.get(id) ?? null;
      nameById.set(id, { name: email ? email.split('@')[0] : '(sin nombre)', email });
    }
  }

  return {
    items: rows.map((r) => {
      const buyer = nameById.get(r.clerkId);
      return {
        id: r.id,
        clerkId: r.clerkId,
        buyerName: buyer?.name ?? '(sin nombre)',
        buyerEmail: buyer?.email ?? null,
        title: r.title ?? r.programDocumentId,
        programDocumentId: r.programDocumentId,
        price: r.price ?? null,
        purchasedAt: r.purchasedAt ? r.purchasedAt.toISOString() : null,
        expiresAt: r.expiresAt ? r.expiresAt.toISOString() : null,
        accessType: r.accessType,
        stripePaymentId: r.stripePaymentId,
        refundedAt: r.refundedAt ? r.refundedAt.toISOString() : null,
      };
    }),
    total: totals?.n ?? 0,
    totalAmount: totals?.amount ? Number(totals.amount) : 0,
    last30Count: recent?.n ?? 0,
    last30Amount: recent?.amount ? Number(recent.amount) : 0,
    refundedCount: totals?.refundedN ?? 0,
    refundedAmount: totals?.refundedAmount ? Number(totals.refundedAmount) : 0,
    months,
  };
}

// ─── Marca de reembolso ────────────────────────────────────────────────

/** Marca o desmarca una compra como reembolsada. Devuelve la fila o null. */
export async function setRefunded(
  enrollmentId: string,
  refunded: boolean
): Promise<{ clerkId: string; title: string | null; price: string | null } | null> {
  const [row] = await db
    .update(enrollments)
    .set({ refundedAt: refunded ? new Date() : null })
    .where(eq(enrollments.id, enrollmentId))
    .returning({ clerkId: enrollments.clerkId, title: enrollments.title, price: enrollments.price });
  return row ?? null;
}
