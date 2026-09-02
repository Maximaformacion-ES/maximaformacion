import { clerkClient } from '@clerk/nextjs/server';
import { eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { users, enrollments, certificates, examResults } from '@/lib/db/schema';
import {
  getUserByClerkId,
  getUserEnrollments,
  getAllCourseProgress,
  getSubscriptionByClerkId,
} from '@/lib/db/queries';
import { allClerkIds, proClerkIds } from '@/lib/email/audiences';

// ─── Lista de alumnos ──────────────────────────────────────────────────
// Fuente de perfil = Clerk (indexa nombre/email). Enriquecemos con agregados de
// `campus` en 2 queries agrupadas (plan + nº matrículas), NO N+1.

export interface StudentListItem {
  clerkId: string;
  email: string | null;
  name: string;
  imageUrl: string | null;
  plan: string;
  enrollmentCount: number;
  createdAt: number; // epoch ms (de Clerk)
}

export interface StudentList {
  items: StudentListItem[];
  total: number;
}

/** Agregados de `campus` (plan, nº matrículas, email espejo) para unos clerkIds. */
async function campusAggregates(clerkIds: string[]) {
  const planByClerk = new Map<string, string>();
  const enrollByClerk = new Map<string, number>();
  const emailByClerk = new Map<string, string | null>();
  if (clerkIds.length === 0) return { planByClerk, enrollByClerk, emailByClerk };
  try {
    const rows = await db
      .select({ clerkId: users.clerkId, plan: users.plan, email: users.email })
      .from(users)
      .where(inArray(users.clerkId, clerkIds));
    for (const r of rows) {
      planByClerk.set(r.clerkId, r.plan);
      emailByClerk.set(r.clerkId, r.email);
    }
  } catch (e) {
    console.warn('[admin:listStudents] plan/email aggregate failed:', e);
  }
  try {
    const rows = await db
      .select({ clerkId: enrollments.clerkId, n: sql<number>`count(*)::int` })
      .from(enrollments)
      .where(inArray(enrollments.clerkId, clerkIds))
      .groupBy(enrollments.clerkId);
    for (const r of rows) enrollByClerk.set(r.clerkId, r.n);
  } catch (e) {
    console.warn('[admin:listStudents] enrollment aggregate failed:', e);
  }
  return { planByClerk, enrollByClerk, emailByClerk };
}

export async function listStudents(opts: {
  query?: string;
  /** 'pro' → solo alumnos PRO; 'free' → solo alumnos NO PRO. */
  plan?: string;
  /** documentId de un curso → solo matriculados en ese curso. */
  courseDocumentId?: string;
  limit?: number;
  offset?: number;
}): Promise<StudentList> {
  const { query, plan, courseDocumentId, limit = 25, offset = 0 } = opts;
  const cc = await clerkClient();
  const planFilter = plan === 'pro' || plan === 'free' ? plan : undefined;

  // ── Ruta rápida: sin filtros de campus → paginación nativa de Clerk. ──
  if (!planFilter && !courseDocumentId) {
    const res = await cc.users.getUserList({ query: query || undefined, limit, offset, orderBy: '-created_at' });
    const { planByClerk, enrollByClerk } = await campusAggregates(res.data.map((u) => u.id));
    const items: StudentListItem[] = res.data.map((u) => ({
      clerkId: u.id,
      email: u.primaryEmailAddress?.emailAddress ?? u.emailAddresses?.[0]?.emailAddress ?? null,
      name: [u.firstName, u.lastName].filter(Boolean).join(' ') || '(sin nombre)',
      imageUrl: u.imageUrl ?? null,
      plan: planByClerk.get(u.id) ?? 'free',
      enrollmentCount: enrollByClerk.get(u.id) ?? 0,
      createdAt: u.createdAt,
    }));
    return { items, total: res.totalCount };
  }

  // ── Ruta con filtros: los clerkId salen de `campus`/Clerk (matrícula/plan). ──
  let ids: string[] = [];
  try {
    if (courseDocumentId) {
      const rows = await db
        .selectDistinct({ clerkId: enrollments.clerkId })
        .from(enrollments)
        .where(eq(enrollments.programDocumentId, courseDocumentId));
      ids = rows.map((r) => r.clerkId);
    } else if (planFilter === 'pro') {
      const rows = await db.select({ clerkId: users.clerkId }).from(users).where(eq(users.plan, 'pro'));
      ids = rows.map((r) => r.clerkId);
    } else {
      // 'free' = todos los registrados (Clerk) menos los PRO. No basta con
      // campus.users (solo espeja a quien ha comprado/interactuado).
      const [all, pro] = await Promise.all([allClerkIds(), proClerkIds()]);
      ids = all.filter((id) => !pro.has(id));
    }
    // Curso + plan a la vez → intersección/resta con el conjunto PRO.
    if (courseDocumentId && planFilter) {
      const proSet = await proClerkIds();
      ids = planFilter === 'pro' ? ids.filter((id) => proSet.has(id)) : ids.filter((id) => !proSet.has(id));
    }
  } catch (e) {
    console.warn('[admin:listStudents] campus filter failed:', e);
    return { items: [], total: 0 };
  }
  ids = Array.from(new Set(ids));
  if (ids.length === 0) return { items: [], total: 0 };

  const { planByClerk, enrollByClerk, emailByClerk } = await campusAggregates(ids);

  // Resolver perfil en Clerk por lotes (email/nombre/foto/fecha), con fallback a
  // campus.users para los clerkId que Clerk no devuelva (dev pk_test / borrados).
  const byId = new Map<string, StudentListItem>();
  for (let i = 0; i < ids.length; i += 100) {
    try {
      const res = await cc.users.getUserList({ userId: ids.slice(i, i + 100), limit: 100 });
      for (const u of res.data) {
        byId.set(u.id, {
          clerkId: u.id,
          email: u.primaryEmailAddress?.emailAddress ?? u.emailAddresses?.[0]?.emailAddress ?? emailByClerk.get(u.id) ?? null,
          name: [u.firstName, u.lastName].filter(Boolean).join(' ') || '(sin nombre)',
          imageUrl: u.imageUrl ?? null,
          plan: planByClerk.get(u.id) ?? 'free',
          enrollmentCount: enrollByClerk.get(u.id) ?? 0,
          createdAt: u.createdAt,
        });
      }
    } catch (e) {
      console.warn('[admin:listStudents] clerk resolve chunk failed:', e);
    }
  }
  for (const id of ids) {
    if (byId.has(id)) continue;
    const email = emailByClerk.get(id);
    byId.set(id, {
      clerkId: id,
      email: email ?? null,
      name: email ? email.split('@')[0] : '(sin nombre)',
      imageUrl: null,
      plan: planByClerk.get(id) ?? 'free',
      enrollmentCount: enrollByClerk.get(id) ?? 0,
      createdAt: 0,
    });
  }

  // Búsqueda de texto (nombre/email) sobre el conjunto filtrado.
  let all = Array.from(byId.values());
  const q = query?.trim().toLowerCase();
  if (q) {
    all = all.filter((it) => it.name.toLowerCase().includes(q) || (it.email ?? '').toLowerCase().includes(q));
  }
  all.sort((a, b) => b.createdAt - a.createdAt);

  return { items: all.slice(offset, offset + limit), total: all.length };
}

// ─── Ficha 360 de un alumno ────────────────────────────────────────────

export interface Student360 {
  clerkId: string;
  email: string | null;
  name: string;
  imageUrl: string | null;
  plan: string;
  hasBeenPro: boolean;
  subscription: Awaited<ReturnType<typeof getSubscriptionByClerkId>> | null;
  enrollments: Awaited<ReturnType<typeof getUserEnrollments>>;
  progress: Awaited<ReturnType<typeof getAllCourseProgress>>;
  certificates: (typeof certificates.$inferSelect)[];
  exams: (typeof examResults.$inferSelect)[];
}

export async function getStudent360(clerkId: string): Promise<Student360 | null> {
  const cc = await clerkClient();
  let clerkUser;
  try {
    clerkUser = await cc.users.getUser(clerkId);
  } catch {
    return null;
  }

  const dbUser = await getUserByClerkId(clerkId);

  // Cada lectura de campus es defensiva: la BD de prod puede ir por detrás de
  // migraciones y no queremos que una tabla ausente tumbe toda la ficha.
  const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await fn();
    } catch (e) {
      console.warn('[admin:getStudent360] read failed:', e);
      return fallback;
    }
  };

  const [enrollmentsRows, progress, certs, exams, subscription] = await Promise.all([
    safe(() => getUserEnrollments(clerkId), [] as Awaited<ReturnType<typeof getUserEnrollments>>),
    safe(() => getAllCourseProgress(clerkId), {} as Awaited<ReturnType<typeof getAllCourseProgress>>),
    safe(() => db.select().from(certificates).where(eq(certificates.clerkId, clerkId)), []),
    safe(() => db.select().from(examResults).where(eq(examResults.clerkId, clerkId)), []),
    safe<Student360['subscription']>(() => getSubscriptionByClerkId(clerkId), null),
  ]);

  return {
    clerkId,
    email:
      clerkUser.primaryEmailAddress?.emailAddress ??
      clerkUser.emailAddresses?.[0]?.emailAddress ??
      dbUser?.email ??
      null,
    name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || '(sin nombre)',
    imageUrl: clerkUser.imageUrl ?? null,
    plan: dbUser?.plan ?? ((clerkUser.publicMetadata as { plan?: string })?.plan ?? 'free'),
    hasBeenPro: dbUser?.hasBeenPro ?? false,
    subscription,
    enrollments: enrollmentsRows,
    progress,
    certificates: certs,
    exams,
  };
}
