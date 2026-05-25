import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import {
  enrollments,
  lessonProgress,
  courseActivity,
  courseReviews,
  courseUpdateReads,
  examResults,
  certificates,
  users as usersTable,
} from '@/lib/db/schema';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * Wipe a user's course purchases and related per-course state. Useful for
 * cleaning up records left over from the pre-fix era where the webhook
 * created enrollments but Moodle provisioning never ran, so the student
 * sees "Acceso activo" with no actual access.
 *
 *   POST /api/admin/wipe-user-purchases?email=...&confirm=true
 *
 * Without `confirm=true` the endpoint runs in dry-run mode and returns
 * counts of rows that *would* be deleted, plus the Clerk metadata keys
 * that *would* be cleared.
 *
 * Auth: signed-in user with publicMetadata.role === 'admin' in Clerk.
 * This is destructive, so keep the surface narrow.
 *
 * NOT touched: campus.users row (account stays), campus.subscriptions
 * (separate concern — handle via Stripe portal/manual SQL if needed),
 * Stripe customer/payments, Moodle account (would have to be deleted in
 * Moodle admin separately).
 */
export async function POST(request: Request) {
  try {
    const gate = await requireAdmin();
    if (gate instanceof NextResponse) return gate;

    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    const confirm = url.searchParams.get('confirm') === 'true';

    if (!email) {
      return NextResponse.json(
        { error: 'email query param is required' },
        { status: 400 }
      );
    }

    const [dbUser] = await db
      .select({ clerkId: usersTable.clerkId, plan: usersTable.plan })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json(
        { error: `No campus.users row found for email ${email}` },
        { status: 404 }
      );
    }

    const clerkId = dbUser.clerkId;

    // Count what's there now. Each table is wrapped because the prod DB
    // is behind on migrations — some of the campus.* tables exist only in
    // the schema file, and we don't want a single missing table to crash
    // the whole wipe.
    type CountResult = number | { skipped: string };
    async function safeCount<T extends { id: unknown; clerkId: unknown }>(
      table: T,
      ref: { clerkId: { name: string } }
    ): Promise<CountResult> {
      try {
        const rows = await db
          .select({ id: (table as { id: unknown }).id as never })
          .from(table as never)
          .where(eq(ref.clerkId as never, clerkId));
        return rows.length;
      } catch (e) {
        return { skipped: e instanceof Error ? e.message : String(e) };
      }
    }

    const counts: Record<string, CountResult> = {
      enrollments: await safeCount(enrollments as never, { clerkId: enrollments.clerkId as never }),
      lessonProgress: await safeCount(lessonProgress as never, { clerkId: lessonProgress.clerkId as never }),
      courseActivity: await safeCount(courseActivity as never, { clerkId: courseActivity.clerkId as never }),
      courseReviews: await safeCount(courseReviews as never, { clerkId: courseReviews.clerkId as never }),
      courseUpdateReads: await safeCount(courseUpdateReads as never, { clerkId: courseUpdateReads.clerkId as never }),
      examResults: await safeCount(examResults as never, { clerkId: examResults.clerkId as never }),
      certificates: await safeCount(certificates as never, { clerkId: certificates.clerkId as never }),
    };

    // Inspect Clerk metadata keys we'd clear.
    const cc = await clerkClient();
    const clerkUser = await cc.users.getUser(clerkId);
    const meta = (clerkUser.publicMetadata as Record<string, unknown>) || {};
    const clerkKeysToClear = (
      ['purchasedCourses', 'courseProgress'] as const
    ).filter((k) => meta[k] !== undefined);

    if (!confirm) {
      return NextResponse.json({
        dryRun: true,
        email,
        clerkId,
        currentPlan: dbUser.plan,
        wouldDelete: counts,
        wouldClearClerkKeys: clerkKeysToClear,
        hint: 'Add &confirm=true to actually wipe.',
      });
    }

    // ── DESTRUCTIVE: from here on, rows are gone. ───────────────────────
    // Same try/catch story as counts above — some tables may not exist
    // in this DB yet. Order is dependent → parent (none cascade today,
    // but stay defensive in case FKs change).
    const deletedSummary: Record<string, 'ok' | { skipped: string }> = {};
    async function safeDelete(
      name: string,
      run: () => Promise<unknown>
    ): Promise<void> {
      try {
        await run();
        deletedSummary[name] = 'ok';
      } catch (e) {
        deletedSummary[name] = { skipped: e instanceof Error ? e.message : String(e) };
      }
    }
    await safeDelete('lessonProgress', () => db.delete(lessonProgress).where(eq(lessonProgress.clerkId, clerkId)));
    await safeDelete('courseActivity', () => db.delete(courseActivity).where(eq(courseActivity.clerkId, clerkId)));
    await safeDelete('courseReviews', () => db.delete(courseReviews).where(eq(courseReviews.clerkId, clerkId)));
    await safeDelete('courseUpdateReads', () => db.delete(courseUpdateReads).where(eq(courseUpdateReads.clerkId, clerkId)));
    await safeDelete('examResults', () => db.delete(examResults).where(eq(examResults.clerkId, clerkId)));
    await safeDelete('certificates', () => db.delete(certificates).where(eq(certificates.clerkId, clerkId)));
    await safeDelete('enrollments', () => db.delete(enrollments).where(eq(enrollments.clerkId, clerkId)));

    // Clear the Clerk-fallback purchases too. We leave hasUsedTrial,
    // stripeCustomerId, plan, and subscription* alone — those belong to
    // the subscription side, not to course purchases.
    const newMeta = { ...meta };
    for (const k of clerkKeysToClear) delete newMeta[k];
    if (clerkKeysToClear.length > 0) {
      await cc.users.updateUserMetadata(clerkId, { publicMetadata: newMeta });
    }

    return NextResponse.json({
      dryRun: false,
      email,
      clerkId,
      countsBefore: counts,
      deleted: deletedSummary,
      clearedClerkKeys: clerkKeysToClear,
    });
  } catch (e) {
    console.error('[wipe-user-purchases] failed:', e);
    return NextResponse.json(
      { error: 'Wipe failed', detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
