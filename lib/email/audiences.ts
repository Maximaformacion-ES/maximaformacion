import { clerkClient } from '@clerk/nextjs/server';
import { eq, gte, inArray } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { users, enrollments, courseActivity } from '@/lib/db/schema';

// ─── Segmentos de audiencia ────────────────────────────────────────────
export type Segment =
  | { kind: 'course'; documentIds: string[] }
  | { kind: 'pro' }
  | { kind: 'inactive'; days: number }
  | { kind: 'all' };

export interface Recipient {
  clerkId: string;
  email: string;
  name: string;
}

/** Valida/normaliza el body de un request → Segment (o null si no es válido). */
export function resolveSegment(input: unknown): Segment | null {
  if (!input || typeof input !== 'object') return null;
  const s = input as Record<string, unknown>;
  switch (s.kind) {
    case 'course': {
      const ids = Array.isArray(s.documentIds)
        ? s.documentIds.filter((x): x is string => typeof x === 'string' && x.length > 0)
        : [];
      return ids.length > 0 ? { kind: 'course', documentIds: ids } : null;
    }
    case 'pro':
      return { kind: 'pro' };
    case 'inactive': {
      const days = typeof s.days === 'number' && s.days > 0 ? Math.floor(s.days) : 30;
      return { kind: 'inactive', days };
    }
    case 'all':
      return { kind: 'all' };
    default:
      return null;
  }
}

// ─── Resolución de clerkIds por segmento (SQL sobre campus, defensivo) ──
async function clerkIdsForSegment(segment: Segment): Promise<string[]> {
  try {
    switch (segment.kind) {
      case 'course': {
        const rows = await db
          .selectDistinct({ clerkId: enrollments.clerkId })
          .from(enrollments)
          .where(inArray(enrollments.programDocumentId, segment.documentIds));
        return rows.map((r) => r.clerkId);
      }
      case 'pro': {
        const rows = await db.select({ clerkId: users.clerkId }).from(users).where(eq(users.plan, 'pro'));
        return rows.map((r) => r.clerkId);
      }
      case 'all': {
        // "Todos" = TODOS los usuarios registrados. La fuente autoritativa es Clerk
        // (puede haber un usuario en Clerk sin fila espejo en `campus.users`), así
        // que enumeramos Clerk paginando. Unimos con `campus.users` por si acaso.
        const ids = new Set<string>();
        try {
          const cc = await clerkClient();
          const pageSize = 100;
          for (let offset = 0; offset < 100_000; offset += pageSize) {
            const res = await cc.users.getUserList({ limit: pageSize, offset });
            for (const u of res.data) ids.add(u.id);
            if (res.data.length < pageSize) break;
          }
        } catch (e) {
          console.warn('[audiences] Clerk getUserList (all) failed, fallback a campus.users:', e);
        }
        const rows = await db.select({ clerkId: users.clerkId }).from(users);
        for (const r of rows) ids.add(r.clerkId);
        return Array.from(ids);
      }
      case 'inactive': {
        // Alumnos CON matrícula cuya última actividad es anterior al corte (o sin
        // ninguna actividad registrada).
        const cutoff = new Date(Date.now() - segment.days * 24 * 60 * 60 * 1000);
        const enrolled = await db.selectDistinct({ clerkId: enrollments.clerkId }).from(enrollments);
        const enrolledIds = enrolled.map((r) => r.clerkId);
        if (enrolledIds.length === 0) return [];
        const active = await db
          .selectDistinct({ clerkId: courseActivity.clerkId })
          .from(courseActivity)
          .where(gte(courseActivity.lastAccessedAt, cutoff));
        const activeSet = new Set(active.map((r) => r.clerkId));
        return enrolledIds.filter((id) => !activeSet.has(id));
      }
    }
  } catch (e) {
    console.warn('[audiences] clerkIdsForSegment failed:', e);
    return [];
  }
}

/**
 * Resuelve un segmento a la lista de destinatarios {clerkId, email, name}. Los
 * clerkId salen de `campus`; el email+nombre AUTORITATIVOS de Clerk (en lotes de
 * 100). Si Clerk falla, cae al email de `campus.users`. Descarta sin email;
 * deduplica por clerkId.
 */
export async function buildAudience(segment: Segment): Promise<Recipient[]> {
  const clerkIds = Array.from(new Set(await clerkIdsForSegment(segment)));
  if (clerkIds.length === 0) return [];

  // Fallback de email desde campus.users.
  const fallbackEmail = new Map<string, string | null>();
  try {
    const rows = await db
      .select({ clerkId: users.clerkId, email: users.email })
      .from(users)
      .where(inArray(users.clerkId, clerkIds));
    for (const r of rows) fallbackEmail.set(r.clerkId, r.email);
  } catch (e) {
    console.warn('[audiences] fallback emails failed:', e);
  }

  const byId = new Map<string, Recipient>();
  const cc = await clerkClient();
  for (let i = 0; i < clerkIds.length; i += 100) {
    const chunk = clerkIds.slice(i, i + 100);
    try {
      const res = await cc.users.getUserList({ userId: chunk, limit: 100 });
      for (const u of res.data) {
        const email =
          u.primaryEmailAddress?.emailAddress ??
          u.emailAddresses?.[0]?.emailAddress ??
          fallbackEmail.get(u.id) ??
          null;
        if (!email) continue;
        const name = u.fullName || u.firstName || email.split('@')[0];
        byId.set(u.id, { clerkId: u.id, email, name });
      }
    } catch (e) {
      console.warn('[audiences] Clerk chunk failed, using fallback emails:', e);
    }
  }

  // Fallback: cualquier clerkId que Clerk NO haya devuelto (Clerk de desarrollo
  // distinto al de prod, usuario borrado en Clerk, o fallo de lote) usa el email
  // del espejo `campus.users`. Sin esto, en dev (pk_test) la audiencia salía vacía
  // porque los clerkId de la BD no existen en la instancia de test.
  for (const id of clerkIds) {
    if (byId.has(id)) continue;
    const email = fallbackEmail.get(id);
    if (!email) continue;
    byId.set(id, { clerkId: id, email, name: email.split('@')[0] });
  }

  // Orden ESTABLE (por nombre, luego email): sin esto el orden dependería del
  // scan de Postgres (selectDistinct sin ORDER BY) y "cambiaba" en cada consulta.
  return Array.from(byId.values()).sort(
    (a, b) => a.name.localeCompare(b.name, 'es') || a.email.localeCompare(b.email)
  );
}
