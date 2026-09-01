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
}

export interface PurchaseList {
  items: PurchaseListItem[];
  total: number;
  /** Suma de precios del conjunto filtrado completo (no solo la página). */
  totalAmount: number;
  /** Compras e importe de los últimos 30 días (con los mismos filtros). */
  last30Count: number;
  last30Amount: number;
}

const EMPTY: PurchaseList = { items: [], total: 0, totalAmount: 0, last30Count: 0, last30Amount: 0 };

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

  const [rows, [totals], [recent]] = await Promise.all([
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
            amount: sql<string | null>`sum(${enrollments.price})`,
          })
          .from(enrollments)
          .where(where),
      [{ n: 0, amount: null }]
    ),
    safe(
      () =>
        db
          .select({
            n: sql<number>`count(*)::int`,
            amount: sql<string | null>`sum(${enrollments.price})`,
          })
          .from(enrollments)
          .where(and(gte(enrollments.purchasedAt, thirtyDaysAgo), ...(conds.length > 0 ? conds : []))),
      [{ n: 0, amount: null }]
    ),
  ]);

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
      };
    }),
    total: totals?.n ?? 0,
    totalAmount: totals?.amount ? Number(totals.amount) : 0,
    last30Count: recent?.n ?? 0,
    last30Amount: recent?.amount ? Number(recent.amount) : 0,
  };
}
