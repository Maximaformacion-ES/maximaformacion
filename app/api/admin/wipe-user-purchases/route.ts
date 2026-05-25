import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
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
 * Auth: signed-in user with an @atlansec.es address. This is destructive,
 * so keep the surface narrow.
 *
 * NOT touched: campus.users row (account stays), campus.subscriptions
 * (separate concern — handle via Stripe portal/manual SQL if needed),
 * Stripe customer/payments, Moodle account (would have to be deleted in
 * Moodle admin separately).
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const me = await currentUser();
    const myEmail = me?.emailAddresses?.[0]?.emailAddress ?? '';
    if (!myEmail.endsWith('@atlansec.es')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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

    // Count what's there now, regardless of dry-run.
    const counts = {
      enrollments: (
        await db.select({ id: enrollments.id }).from(enrollments).where(eq(enrollments.clerkId, clerkId))
      ).length,
      lessonProgress: (
        await db.select({ id: lessonProgress.id }).from(lessonProgress).where(eq(lessonProgress.clerkId, clerkId))
      ).length,
      courseActivity: (
        await db.select({ id: courseActivity.id }).from(courseActivity).where(eq(courseActivity.clerkId, clerkId))
      ).length,
      courseReviews: (
        await db.select({ id: courseReviews.id }).from(courseReviews).where(eq(courseReviews.clerkId, clerkId))
      ).length,
      courseUpdateReads: (
        await db.select({ id: courseUpdateReads.id }).from(courseUpdateReads).where(eq(courseUpdateReads.clerkId, clerkId))
      ).length,
      examResults: (
        await db.select({ id: examResults.id }).from(examResults).where(eq(examResults.clerkId, clerkId))
      ).length,
      certificates: (
        await db.select({ id: certificates.id }).from(certificates).where(eq(certificates.clerkId, clerkId))
      ).length,
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
    // Order matters when FKs are present (none here cascade, but we delete
    // dependent rows before any potential parent). All filter on clerkId.
    await db.delete(lessonProgress).where(eq(lessonProgress.clerkId, clerkId));
    await db.delete(courseActivity).where(eq(courseActivity.clerkId, clerkId));
    await db.delete(courseReviews).where(eq(courseReviews.clerkId, clerkId));
    await db.delete(courseUpdateReads).where(eq(courseUpdateReads.clerkId, clerkId));
    await db.delete(examResults).where(eq(examResults.clerkId, clerkId));
    await db.delete(certificates).where(eq(certificates.clerkId, clerkId));
    await db.delete(enrollments).where(eq(enrollments.clerkId, clerkId));

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
      deleted: counts,
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
