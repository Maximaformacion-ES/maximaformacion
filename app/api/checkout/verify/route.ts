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
    if (paymentType !== 'maxymia-course' && paymentType !== 'course') {
      return NextResponse.json({ error: 'Not a course purchase' }, { status: 400 });
    }

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
