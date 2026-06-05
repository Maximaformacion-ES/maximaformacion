import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db/client';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // If DB is configured, read from PostgreSQL
    if (isDbConfigured()) {
      try {
        const {
          getUserByClerkId,
          upsertUser,
          getSubscriptionByClerkId,
          getUserEnrollments,
          getAllCourseProgress,
        } = await import('@/lib/db/queries');

        let dbUser = await getUserByClerkId(userId);
        if (!dbUser) {
          const clerkUser = await currentUser();
          const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
          dbUser = await upsertUser(userId, email);
        } else if (!dbUser.email) {
          // Backfill email for users created without one
          const clerkUser = await currentUser();
          const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
          if (email) {
            dbUser = await upsertUser(userId, email);
          }
        }

        const [subscription, enrollmentsList, courseProgress] = await Promise.all([
          getSubscriptionByClerkId(userId),
          getUserEnrollments(userId),
          getAllCourseProgress(userId),
        ]);

        // Hide the 1€ trial only for users who have actually been Pro at some
        // point (durable hasBeenPro flag, latched the first time they go Pro).
        // The old heuristic (any subscription row with startedAt) wrongly
        // tripped on the placeholder rows created on single-course purchases,
        // hiding the promo from users who were never Pro.
        const hasUsedTrial = !!dbUser?.hasBeenPro;

        // For trial users, fetch trial_end from Stripe
        let trialEnd: string | null = null;
        if (subscription?.status === 'trialing' && subscription?.stripeSubscriptionId) {
          try {
            const Stripe = (await import('stripe')).default;
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
              apiVersion: '2025-12-15.clover',
            });
            const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
            if (stripeSub.trial_end) {
              trialEnd = new Date(stripeSub.trial_end * 1000).toISOString();
            }
          } catch (e) {
            console.warn('Could not fetch trial_end from Stripe:', e);
          }
        }

        return NextResponse.json({
          plan: dbUser.plan,
          hasUsedTrial,
          subscription: subscription
            ? {
                stripeCustomerId: subscription.stripeCustomerId,
                status: subscription.status,
                startedAt: subscription.startedAt?.toISOString() || null,
                canceledAt: subscription.canceledAt?.toISOString() || null,
                currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() || null,
                lastPaymentAt: subscription.lastPaymentAt?.toISOString() || null,
                paymentFailed: subscription.paymentFailed,
                trialEnd,
              }
            : null,
          enrollments: enrollmentsList.map((e) => ({
            programDocumentId: e.programDocumentId,
            programId: e.programId,
            accessType: e.accessType,
            purchasedAt: e.purchasedAt?.toISOString() || null,
            title: e.title,
          })),
          courseProgress,
        });
      } catch (dbError) {
        console.warn('Database unavailable, falling back to Clerk metadata:', dbError);
        // Fall through to Clerk fallback below
      }
    }

    // Fallback: read from Clerk publicMetadata (works without DB)
    const user = await currentUser();
    const meta = user?.publicMetadata as Record<string, unknown> || {};

    interface PurchasedCourse {
      programId: number;
      documentId: string;
      purchasedAt: string;
      stripePaymentId: string;
      price: number;
      title?: string;
    }

    interface CourseProgress {
      startedAt: string;
      lastAccessedAt: string;
      completedLessons: string[];
      currentLessonId?: string;
      progressPercent: number;
    }

    const purchasedCourses = (meta.purchasedCourses as PurchasedCourse[]) || [];
    const courseProgress = (meta.courseProgress as Record<string, CourseProgress>) || {};

    // Transform Clerk courseProgress to match the DB format
    const progressMap: Record<string, {
      completedLessons: string[];
      currentLessonId: string | null;
      lastAccessedAt: string | null;
      startedAt: string | null;
    }> = {};

    for (const [programDocId, progress] of Object.entries(courseProgress)) {
      progressMap[programDocId] = {
        completedLessons: progress.completedLessons || [],
        currentLessonId: progress.currentLessonId || null,
        lastAccessedAt: progress.lastAccessedAt || null,
        startedAt: progress.startedAt || null,
      };
    }

    const clerkSubscriptionStatus = (meta.subscriptionStatus as string) || 'active';

    // For Clerk fallback, fetch trial_end from Stripe if trialing
    let clerkTrialEnd: string | null = null;
    if (clerkSubscriptionStatus === 'trialing' && meta.stripeSubscriptionId) {
      try {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: '2025-12-15.clover',
        });
        const stripeSub = await stripe.subscriptions.retrieve(meta.stripeSubscriptionId as string);
        if (stripeSub.trial_end) {
          clerkTrialEnd = new Date(stripeSub.trial_end * 1000).toISOString();
        }
      } catch (e) {
        console.warn('Could not fetch trial_end from Stripe:', e);
      }
    }

    return NextResponse.json({
      plan: (meta.plan as string) || 'free',
      hasUsedTrial: (meta.hasUsedTrial as boolean) || false,
      subscription: meta.stripeCustomerId
        ? {
            stripeCustomerId: meta.stripeCustomerId as string,
            status: clerkSubscriptionStatus,
            startedAt: (meta.subscribedAt as string) || null,
            canceledAt: (meta.canceledAt as string) || null,
            currentPeriodEnd: null,
            lastPaymentAt: (meta.lastPaymentAt as string) || null,
            paymentFailed: (meta.paymentFailed as boolean) || false,
            trialEnd: clerkTrialEnd,
          }
        : null,
      enrollments: purchasedCourses.map((c) => ({
        programDocumentId: c.documentId,
        programId: c.programId,
        accessType: 'purchased',
        purchasedAt: c.purchasedAt || null,
        title: c.title || null,
      })),
      courseProgress: progressMap,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
