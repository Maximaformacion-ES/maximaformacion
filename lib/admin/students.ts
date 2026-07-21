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

export async function listStudents(opts: {
  query?: string;
  limit?: number;
  offset?: number;
}): Promise<StudentList> {
  const { query, limit = 25, offset = 0 } = opts;
  const cc = await clerkClient();
  const res = await cc.users.getUserList({
    query: query || undefined,
    limit,
    offset,
    orderBy: '-created_at',
  });

  const clerkIds = res.data.map((u) => u.id);

  // Agregados de campus para esos clerkIds (2 queries, no por-fila).
  const planByClerk = new Map<string, string>();
  const enrollByClerk = new Map<string, number>();
  if (clerkIds.length > 0) {
    try {
      const planRows = await db
        .select({ clerkId: users.clerkId, plan: users.plan })
        .from(users)
        .where(inArray(users.clerkId, clerkIds));
      for (const r of planRows) planByClerk.set(r.clerkId, r.plan);
    } catch (e) {
      console.warn('[admin:listStudents] plan aggregate failed:', e);
    }
    try {
      const enrollRows = await db
        .select({ clerkId: enrollments.clerkId, n: sql<number>`count(*)::int` })
        .from(enrollments)
        .where(inArray(enrollments.clerkId, clerkIds))
        .groupBy(enrollments.clerkId);
      for (const r of enrollRows) enrollByClerk.set(r.clerkId, r.n);
    } catch (e) {
      console.warn('[admin:listStudents] enrollment aggregate failed:', e);
    }
  }

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
