import { clerkClient } from '@clerk/nextjs/server';
import { sql, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { users, enrollments, certificates } from '@/lib/db/schema';

export interface AdminMetrics {
  students: number;
  enrollments: number;
  pro: number;
  certificates: number;
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
  const [students, enrollCount, proCount, certCount] = await Promise.all([
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
  ]);

  return { students, enrollments: enrollCount, pro: proCount, certificates: certCount };
}
