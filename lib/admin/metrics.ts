import { clerkClient } from '@clerk/nextjs/server';
import { sql, eq, isNull, gte } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { users, enrollments, certificates, leadCaptureLog } from '@/lib/db/schema';

export interface AdminMetrics {
  students: number;
  enrollments: number;
  pro: number;
  certificates: number;
  /** Ingresos aprox. = suma de enrollments.price. */
  revenue: number;
  leads: number;
  recentEnrollments: number;
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.warn('[admin:metrics] read failed:', e);
    return fallback;
  }
}

/** KPIs del dashboard. Defensivo: la BD de prod puede ir por detrás de migraciones. */
export async function getAdminMetrics(): Promise<AdminMetrics> {
  const cutoff30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [students, enrollCount, proCount, certCount, revenue, leads, recentEnrollments] = await Promise.all([
    safe(async () => {
      const cc = await clerkClient();
      const res = await cc.users.getUserList({ limit: 1 });
      return res.totalCount;
    }, 0),
    safe(async () => {
      const [r] = await db.select({ n: sql<number>`count(*)::int` }).from(enrollments);
      return r?.n ?? 0;
    }, 0),
    safe(async () => {
      const [r] = await db.select({ n: sql<number>`count(*)::int` }).from(users).where(eq(users.plan, 'pro'));
      return r?.n ?? 0;
    }, 0),
    safe(async () => {
      const [r] = await db
        .select({ n: sql<number>`count(*)::int` })
        .from(certificates)
        .where(isNull(certificates.revokedAt));
      return r?.n ?? 0;
    }, 0),
    safe(async () => {
      const [r] = await db.select({ v: sql<number>`coalesce(sum(${enrollments.price}), 0)::float` }).from(enrollments);
      return Math.round(r?.v ?? 0);
    }, 0),
    safe(async () => {
      const [r] = await db.select({ n: sql<number>`count(*)::int` }).from(leadCaptureLog);
      return r?.n ?? 0;
    }, 0),
    safe(async () => {
      const [r] = await db
        .select({ n: sql<number>`count(*)::int` })
        .from(enrollments)
        .where(gte(enrollments.purchasedAt, cutoff30));
      return r?.n ?? 0;
    }, 0),
  ]);

  return {
    students,
    enrollments: enrollCount,
    pro: proCount,
    certificates: certCount,
    revenue,
    leads,
    recentEnrollments,
  };
}
