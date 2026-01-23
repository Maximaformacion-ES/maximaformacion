import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { strapiRequest } from '@/lib/strapi/client';
import type { StrapiSingleResponse, StrapiProgram } from '@/lib/strapi/types';

// Price IDs from your Stripe Dashboard - replace these with your actual price IDs
const PRICE_IDS = {
  pro: {
    month: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
    year: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly',
  },
};

interface CheckoutRequestBody {
  type?: 'subscription' | 'course';
  planId?: string;
  planPeriod?: 'month' | 'year';
  programId?: string;
  documentId?: string;
}

export async function POST(request: Request) {
  try {
    // Initialize Stripe inside the handler to avoid build-time errors
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

    const user = await currentUser();
    const body: CheckoutRequestBody = await request.json();
    const { type = 'subscription', planId, planPeriod = 'month', programId, documentId } = body;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Handle course purchase (one-time payment)
    if (type === 'course') {
      if (!programId && !documentId) {
        return NextResponse.json(
          { error: 'Program ID or Document ID is required for course purchase' },
          { status: 400 }
        );
      }

      // Fetch program from Strapi to get Stripe price ID
      const lookupId = documentId || programId;
      let program: StrapiProgram | null = null;

      try {
        const response = await strapiRequest<StrapiSingleResponse<StrapiProgram>>(
          `/api/programs/${lookupId}?populate=*`,
          { revalidate: 0 }
        );
        program = response.data;
      } catch (error) {
        console.error('Error fetching program:', error);
        return NextResponse.json(
          { error: 'Program not found' },
          { status: 404 }
        );
      }

      if (!program) {
        return NextResponse.json(
          { error: 'Program not found' },
          { status: 404 }
        );
      }

      if (!program.stripePriceId) {
        return NextResponse.json(
          { error: 'This course is not available for purchase. Please contact support.' },
          { status: 400 }
        );
      }

      // Create one-time payment checkout session
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price: program.stripePriceId,
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/cursos/${program.documentId}?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/programas/${program.documentId}?canceled=true`,
        customer_email: user?.emailAddresses?.[0]?.emailAddress,
        metadata: {
          userId,
          type: 'course',
          programId: String(program.id),
          documentId: program.documentId,
          programTitle: program.title,
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
      });

      return NextResponse.json({
        url: session.url,
        sessionId: session.id,
      });
    }

    // Handle subscription (existing logic)
    if (!planId || planId === 'free') {
      return NextResponse.json(
        { error: 'Valid plan ID is required' },
        { status: 400 }
      );
    }

    // Get the price ID based on plan and period
    const priceId = PRICE_IDS[planId as keyof typeof PRICE_IDS]?.[planPeriod as 'month' | 'year'];

    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan or period' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      customer_email: user?.emailAddresses?.[0]?.emailAddress,
      metadata: {
        userId,
        type: 'subscription',
        planId,
        planPeriod,
      },
      subscription_data: {
        metadata: {
          userId,
          clerkUserId: userId,
        },
      },
      // Allow promotion codes
      allow_promotion_codes: true,
      // Billing address collection
      billing_address_collection: 'auto',
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: String(error) },
      { status: 500 }
    );
  }
}
