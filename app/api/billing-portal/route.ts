import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { isDbConfigured } from '@/lib/db/client';

export async function POST() {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
    });

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let stripeCustomerId: string | undefined;

    // Try PostgreSQL first
    if (isDbConfigured()) {
      try {
        const { getSubscriptionByClerkId } = await import('@/lib/db/queries');
        const subscription = await getSubscriptionByClerkId(userId);
        stripeCustomerId = subscription?.stripeCustomerId ?? undefined;
      } catch (dbError) {
        console.warn('Database unavailable for billing-portal, falling back to Clerk:', dbError);
      }
    }

    // Fallback: read from Clerk metadata
    if (!stripeCustomerId) {
      const user = await currentUser();
      stripeCustomerId = user?.publicMetadata?.stripeCustomerId as string | undefined;
    }

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${baseUrl}/perfil/plan`,
      locale: 'es',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Billing portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session', details: String(error) },
      { status: 500 }
    );
  }
}
