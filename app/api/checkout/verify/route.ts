import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { isDbConfigured } from '@/lib/db/client';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-12-15.clover' });
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify this session belongs to this user
    if (session.metadata?.userId !== userId) {
      return NextResponse.json({ error: 'Session does not belong to this user' }, { status: 403 });
    }

    // Only process completed payments
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const paymentType = session.metadata?.type;

    // Handle subscription / trial: update Clerk metadata to plan: 'pro'
    if (paymentType === 'trial' || paymentType === 'subscription') {
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;
      const isTrial = paymentType === 'trial';

      const stripeSubscription = subscriptionId
        ? await stripe.subscriptions.retrieve(subscriptionId)
        : null;

      // Try DB first
      if (isDbConfigured()) {
        try {
          const { upsertUser, upsertSubscription, updateUserPlan } = await import('@/lib/db/queries');
          await upsertUser(userId, session.customer_email || undefined);
          await upsertSubscription({
            clerkId: userId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            status: stripeSubscription?.status || 'active',
            plan: 'pro',
            startedAt: new Date(),
          });
          await updateUserPlan(userId, 'pro');

          // Also flag hasUsedTrial in Clerk so the checkout-time guard sees
          // it even when the user is mainly stored in the DB.
          if (isTrial) {
            try {
              const cc = await clerkClient();
              const u = await cc.users.getUser(userId);
              await cc.users.updateUserMetadata(userId, {
                publicMetadata: { ...u.publicMetadata, hasUsedTrial: true },
              });
            } catch (e) {
              console.warn('Could not mark hasUsedTrial in Clerk metadata:', e);
            }
          }

          return NextResponse.json({ success: true, upgraded: true });
        } catch (dbError) {
          console.warn('DB subscription update failed, falling back to Clerk:', dbError);
        }
      }

      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const currentMetadata = user.publicMetadata || {};

      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...currentMetadata,
          plan: 'pro',
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: stripeSubscription?.status || 'active',
          subscribedAt: new Date().toISOString(),
          ...(isTrial ? { hasUsedTrial: true } : {}),
        },
      });

      return NextResponse.json({ success: true, upgraded: true });
    }

    if (paymentType !== 'maxymia-course' && paymentType !== 'course') {
      return NextResponse.json({ error: 'Not a course purchase' }, { status: 400 });
    }

    // For subscription/trial we also accept payment_status === 'no_payment_required' (free trials)
    // but the early return above already handled them. Course flow requires actual payment.

    const documentId = session.metadata?.documentId || session.metadata?.courseId;
    const title = session.metadata?.programTitle || session.metadata?.courseTitle;
    const programId = session.metadata?.programId;
    const paymentIntentId = session.payment_intent as string;

    if (!documentId) {
      return NextResponse.json({ error: 'Missing course identifier' }, { status: 400 });
    }

    // Try DB first
    if (isDbConfigured()) {
      try {
        const { upsertUser, createEnrollment } = await import('@/lib/db/queries');

        await upsertUser(userId, session.customer_email || undefined);
        await createEnrollment({
          clerkId: userId,
          programId: programId ? Number(programId) : undefined,
          programDocumentId: documentId,
          accessType: 'purchased',
          stripePaymentId: paymentIntentId,
          price: (session.amount_total || 0) / 100,
          title,
        });

        console.log(`Verified purchase for user ${userId}: ${title} (${documentId})`);
        return NextResponse.json({ success: true, enrolled: true });
      } catch (dbError) {
        console.warn('DB enrollment failed, falling back to Clerk:', dbError);
      }
    }

    // Fallback: save to Clerk metadata
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const currentMetadata = user.publicMetadata || {};

    interface PurchasedCourse {
      programId: number | null;
      documentId: string;
      purchasedAt: string;
      stripePaymentId: string;
      price: number;
      title?: string;
    }

    const existingPurchases = (currentMetadata.purchasedCourses as PurchasedCourse[]) || [];
    const alreadyPurchased = existingPurchases.some((p) => p.documentId === documentId);

    if (!alreadyPurchased) {
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...currentMetadata,
          purchasedCourses: [
            ...existingPurchases,
            {
              programId: programId ? Number(programId) : null,
              documentId,
              purchasedAt: new Date().toISOString(),
              stripePaymentId: paymentIntentId,
              price: (session.amount_total || 0) / 100,
              title,
            },
          ],
        },
      });
    }

    return NextResponse.json({ success: true, enrolled: true });
  } catch (error) {
    console.error('Checkout verify error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
