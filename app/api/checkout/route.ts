import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { strapiRequest } from '@/lib/strapi/client';
import type { StrapiSingleResponse, StrapiProgram } from '@/lib/strapi/types';
import { fetchMaxymiaCourseBySlug } from '@/app/maxymia/data/queries';
import { isDbConfigured } from '@/lib/db/client';
import { getSiteUrl } from '@/lib/site-url';

// Price IDs from your Stripe Dashboard - replace these with your actual price IDs
const PRICE_IDS = {
  pro: {
    month: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
    year: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly',
  },
};

interface CheckoutRequestBody {
  type?: 'subscription' | 'course' | 'maxymia-course' | 'trial';
  planId?: string;
  planPeriod?: 'month' | 'year';
  programId?: string;
  documentId?: string;
  slug?: string;
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
    const { type = 'subscription', planId, planPeriod = 'month', programId, documentId, slug } = body;
    const baseUrl = getSiteUrl('http://localhost:3000');

    // Handle Maxymia course purchase (one-time payment)
    if (type === 'maxymia-course') {
      if (!slug) {
        return NextResponse.json(
          { error: 'Course slug is required for Maxymia course purchase' },
          { status: 400 }
        );
      }

      // Fetch course using the same Strapi + fallback logic the frontend uses
      const course = await fetchMaxymiaCourseBySlug(slug);

      if (!course) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }

      if (!course.price || course.price <= 0) {
        return NextResponse.json(
          { error: 'This course is not available for purchase.' },
          { status: 400 }
        );
      }

      // Create an ad-hoc Stripe price from the course price
      const stripePrice = await stripe.prices.create({
        currency: 'eur',
        unit_amount: Math.round(course.price * 100),
        product_data: {
          name: course.title.es,
          metadata: { courseId: course.id, slug: course.slug, type: 'maxymia-course' },
        },
      });

      // Apply Pro discounts:
      //   - 100% if course.isPro (included in Pro)
      //   - 20% if user has Pro and the course's `haveDiscount` toggle is on
      const userPlanMaxymia = (user?.publicMetadata as { plan?: string } | undefined)?.plan;
      const userIsProMaxymia = userPlanMaxymia === 'pro';
      const proIncludedCouponMaxymia = process.env.STRIPE_PRO_INCLUDED_COUPON_ID;
      const proCourseCouponMaxymia = process.env.STRIPE_PRO_COURSE_COUPON_ID;
      const maxymiaCouponId =
        userIsProMaxymia && course.isPro && proIncludedCouponMaxymia
          ? proIncludedCouponMaxymia
          : userIsProMaxymia && course.haveDiscount === true && proCourseCouponMaxymia
            ? proCourseCouponMaxymia
            : null;

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price: stripePrice.id, quantity: 1 }],
        success_url: `${baseUrl}/maxymia/campus/${course.slug}?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/maxymia/campus/${course.slug}?canceled=true`,
        customer_email: user?.emailAddresses?.[0]?.emailAddress,
        metadata: {
          userId,
          type: 'maxymia-course',
          courseId: course.id,
          courseSlug: course.slug,
          courseTitle: course.title.es,
          ...(maxymiaCouponId === proIncludedCouponMaxymia
            ? { proDiscountApplied: 'included' }
            : maxymiaCouponId === proCourseCouponMaxymia
              ? { proDiscountApplied: 'course-20' }
              : {}),
        },
        ...(maxymiaCouponId
          ? { discounts: [{ coupon: maxymiaCouponId }] }
          : { allow_promotion_codes: true }),
        billing_address_collection: 'auto',
        locale: 'es',
      });

      return NextResponse.json({
        url: session.url,
        sessionId: session.id,
      });
    }

    // Handle program course purchase (one-time payment)
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

      if (!program.stripePriceId && (!program.price || program.price <= 0)) {
        return NextResponse.json(
          { error: 'This course is not available for purchase. Please contact support.' },
          { status: 400 }
        );
      }

      // Use existing Stripe price or create one ad-hoc from the program price.
      // The stored ID can fail for two reasons:
      //   1. The price doesn't exist in this Stripe account (e.g. dev with
      //      sk_test_ vs Strapi Cloud already migrated to live) — retrieve
      //      throws 404.
      //   2. The price exists but was archived in Stripe (active: false).
      //      Retrieve succeeds but Checkout rejects archived prices in
      //      line_items, surfacing as "Failed to create checkout session".
      // Both cases fall back to creating a fresh ad-hoc price so the user
      // can still complete the purchase.
      let priceIdForCheckout: string | null = program.stripePriceId ?? null;
      if (priceIdForCheckout) {
        try {
          const retrieved = await stripe.prices.retrieve(priceIdForCheckout);
          if (!retrieved.active) {
            console.warn(
              `Stripe price ${priceIdForCheckout} is archived ` +
              `for program ${program.id} (${program.title}); creating ad-hoc.`
            );
            priceIdForCheckout = null;
          }
        } catch {
          console.warn(
            `Stripe price ${priceIdForCheckout} not found in current account ` +
            `for program ${program.id} (${program.title}); creating ad-hoc.`
          );
          priceIdForCheckout = null;
        }
      }
      if (!priceIdForCheckout) {
        // Reuse the stored Stripe Product if it still exists and is active,
        // so we don't accumulate orphan products on every healing event.
        // Only create a brand-new product when the stored one is also
        // missing/archived (or there isn't one).
        let productIdForNewPrice: string | null = program.stripeProductId ?? null;
        if (productIdForNewPrice) {
          try {
            const existingProduct = await stripe.products.retrieve(productIdForNewPrice);
            if (!existingProduct.active) {
              productIdForNewPrice = null;
            }
          } catch {
            productIdForNewPrice = null;
          }
        }

        const priceAmountCents = Math.round(program.price! * 100);
        const newPrice = productIdForNewPrice
          ? await stripe.prices.create({
              product: productIdForNewPrice,
              currency: 'eur',
              unit_amount: priceAmountCents,
              metadata: {
                strapiProgramId: String(program.id),
                source: 'checkout-self-heal',
              },
            })
          : await stripe.prices.create({
              currency: 'eur',
              unit_amount: priceAmountCents,
              product_data: {
                name: program.title,
                metadata: {
                  strapiProgramId: String(program.id),
                  documentId: program.documentId,
                  type: program.type,
                  source: 'checkout-self-heal',
                },
              },
            });
        priceIdForCheckout = newPrice.id;

        // Heal Strapi so the next checkout reuses these IDs instead of
        // creating yet another price every time. The lifecycle guard
        // `onlyStripeFieldsUpdated` in Strapi prevents this PUT from
        // triggering a sync loop. Fire-and-forget: a Strapi blip must
        // not block the user's purchase.
        const strapiUrl = process.env.STRAPI_URL;
        const strapiToken = process.env.STRAPI_API_TOKEN;
        if (strapiUrl && strapiToken && program.documentId) {
          const writeBack: Record<string, string> = { stripePriceId: newPrice.id };
          if (!productIdForNewPrice) {
            const newProductId =
              typeof newPrice.product === 'string'
                ? newPrice.product
                : newPrice.product.id;
            writeBack.stripeProductId = newProductId;
          }
          fetch(`${strapiUrl}/api/programs/${program.documentId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${strapiToken}`,
            },
            body: JSON.stringify({ data: writeBack }),
          })
            .then(async (res) => {
              if (!res.ok) {
                const text = await res.text().catch(() => '');
                console.warn(
                  `[checkout-heal] Strapi PUT returned ${res.status} for ` +
                  `program ${program.documentId}: ${text.slice(0, 200)}`
                );
              } else {
                console.log(
                  `[checkout-heal] Wrote ${Object.keys(writeBack).join(',')} ` +
                  `back to Strapi for program ${program.id} (${program.title})`
                );
              }
            })
            .catch((e) => {
              console.warn('[checkout-heal] Strapi PUT threw:', e);
            });
        }
      }

      // Apply Pro discounts:
      //   - 100% if program.isPro (included in Pro)
      //   - 20% if Curso (not Master), user has Pro, and the course has the
      //     `haveDiscount` toggle enabled in Strapi (opt-in per course)
      const userPlan = (user?.publicMetadata as { plan?: string } | undefined)?.plan;
      const userIsPro = userPlan === 'pro';
      const proIncludedCouponId = process.env.STRIPE_PRO_INCLUDED_COUPON_ID;
      const proCourseCouponId = process.env.STRIPE_PRO_COURSE_COUPON_ID;
      const programCouponId =
        userIsPro && program.isPro && proIncludedCouponId
          ? proIncludedCouponId
          : userIsPro && program.type === 'Curso' && program.haveDiscount === true && proCourseCouponId
            ? proCourseCouponId
            : null;

      // Create one-time payment checkout session
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price: priceIdForCheckout,
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/cursos/${program.documentId}?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/programas/${program.slug}?canceled=true`,
        customer_email: user?.emailAddresses?.[0]?.emailAddress,
        metadata: {
          userId,
          type: 'course',
          programId: String(program.id),
          documentId: program.documentId,
          programTitle: program.title,
          ...(programCouponId === proIncludedCouponId
            ? { proDiscountApplied: 'included' }
            : programCouponId === proCourseCouponId
              ? { proDiscountApplied: 'course-20' }
              : {}),
        },
        ...(programCouponId
          ? { discounts: [{ coupon: programCouponId }] }
          : { allow_promotion_codes: true }),
        billing_address_collection: 'auto',
        locale: 'es',
      });

      return NextResponse.json({
        url: session.url,
        sessionId: session.id,
      });
    }

    // Handle trial (7-day Pro trial for 1€)
    if (type === 'trial') {
      // Enforce one-trial-per-user. We check both Clerk metadata and the
      // subscriptions table because either signal alone is unreliable:
      // - Clerk meta `hasUsedTrial` is only set on the Clerk fallback path
      //   of the webhook/verify flow, so a DB-only user could lack it.
      // - The DB row may exist even after a canceled trial, which is
      //   exactly the case we want to block.
      const meta = (user?.publicMetadata ?? {}) as Record<string, unknown>;
      const hasUsedTrialMeta = meta.hasUsedTrial === true;
      // A Stripe customer id in Clerk metadata is also a strong signal of
      // a prior checkout — keep it as a fallback in case the DB query
      // doesn't see the row for whatever reason.
      const hasStripeCustomerMeta = typeof meta.stripeCustomerId === 'string' && meta.stripeCustomerId.length > 0;

      let hasExistingSubscription = false;
      let dbCheckError: string | null = null;
      let dbConfigured = false;
      if (isDbConfigured()) {
        dbConfigured = true;
        try {
          const { getSubscriptionByClerkId } = await import('@/lib/db/queries');
          const existing = await getSubscriptionByClerkId(userId);
          hasExistingSubscription = !!existing;
        } catch (e) {
          dbCheckError = e instanceof Error ? e.message : String(e);
          console.warn('[trial-guard] DB check threw:', dbCheckError);
        }
      }

      const blocked = hasUsedTrialMeta || hasExistingSubscription || hasStripeCustomerMeta;
      console.log(
        `[trial-guard] user=${userId} blocked=${blocked} ` +
          `hasUsedTrialMeta=${hasUsedTrialMeta} ` +
          `hasStripeCustomerMeta=${hasStripeCustomerMeta} ` +
          `hasExistingSubscription=${hasExistingSubscription} ` +
          `dbConfigured=${dbConfigured} ` +
          `dbCheckError=${dbCheckError ?? 'none'}`
      );

      if (blocked) {
        return NextResponse.json(
          { error: 'Trial already used', code: 'trial_already_used' },
          { status: 400 }
        );
      }

      // The 1€ trial *always* rolls over into the monthly plan, regardless
      // of the toggle the visitor used in /pricing. Reason: someone who
      // clicked "Probar Pro 1€" is signalling minimum commitment — an
      // automatic 173€ yearly charge a week later would feel like a
      // surprise. If they want annual, they can switch from the customer
      // portal once active. We keep the user-chosen `planPeriod` in
      // metadata for analytics ("they saw the yearly toggle but trialed").
      const recurringPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
      const trialPriceId = process.env.STRIPE_PRO_TRIAL_PRICE_ID;

      if (!recurringPriceId || !trialPriceId) {
        return NextResponse.json(
          { error: 'Trial prices not configured' },
          { status: 500 }
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: user?.emailAddresses?.[0]?.emailAddress,
        // Order matters for the Checkout UI: show the 1€ charged-today
        // line first, then the recurring plan that starts after the trial.
        // The trial price is a one-time line item, the recurring price has
        // its own trial_period_days below.
        line_items: [
          {
            price: trialPriceId,
            quantity: 1,
          },
          {
            price: recurringPriceId,
            quantity: 1,
          },
        ],
        subscription_data: {
          trial_period_days: 7,
          metadata: {
            userId,
            planId: 'pro',
            // Always monthly post-trial. Stash the toggle choice the user
            // saw in /pricing under `togglePeriodSeen` for future analytics.
            planPeriod: 'month',
            togglePeriodSeen: planPeriod || 'month',
            isTrial: 'true',
          },
        },
        metadata: {
          userId,
          type: 'trial',
          planPeriod: 'month',
          togglePeriodSeen: planPeriod || 'month',
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        success_url: `${baseUrl}/pricing?success=true&trial=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/pricing`,
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
