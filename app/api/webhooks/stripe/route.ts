import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';
import { isDbConfigured } from '@/lib/db/client';
import { strapiRequest } from '@/lib/strapi/client';
import type { StrapiSingleResponse, StrapiProgram } from '@/lib/strapi/types';
import { provisionMoodleAccess } from '@/lib/moodle/provision';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Look up the program in Strapi and, if it has Moodle fields configured,
 * create the Moodle user, enrol them in the course and email credentials.
 *
 * Errors are caught and logged so a Moodle/email failure does not cause
 * Stripe to retry the webhook indefinitely. We still want the enrollment
 * record in our DB to succeed.
 */
async function provisionMoodleForPurchase(params: {
  documentId: string;
  programTitle: string | undefined;
  customerEmail: string | null;
  customerName: string | null;
}): Promise<void> {
  const { documentId, programTitle, customerEmail, customerName } = params;

  if (!customerEmail) {
    console.warn('No customer email available for Moodle provisioning');
    return;
  }

  let program: StrapiProgram | null = null;
  try {
    const response = await strapiRequest<StrapiSingleResponse<StrapiProgram>>(
      `/api/programs/${documentId}?populate=*`,
      { revalidate: 0 }
    );
    program = response.data;
  } catch (error) {
    console.error(`[moodle] Failed to fetch program ${documentId}:`, error);
    return;
  }

  if (!program) {
    console.warn(`[moodle] Program ${documentId} not found in Strapi`);
    return;
  }

  if (!program.moodleCourseId || !program.moodle) {
    console.log(
      `[moodle] Program "${program.title}" has no moodleCourseId/moodle configured — skipping provisioning`
    );
    return;
  }

  const [firstname, ...rest] = (customerName ?? '').trim().split(/\s+/);
  const lastname = rest.join(' ');

  try {
    await provisionMoodleAccess({
      email: customerEmail,
      firstname: firstname || 'Alumno',
      lastname: lastname || 'Máxima',
      programTitle: programTitle || program.title,
      programType: program.type,
      moodleInstance: program.moodle,
      moodleCourseId: program.moodleCourseId,
    });
  } catch (error) {
    console.error(
      `[moodle] Provisioning failed for ${customerEmail} on program ${program.title}:`,
      error
    );
    // Intentionally swallowed: enrollment in our DB still succeeds, and
    // we don't want Stripe to retry forever. A monitoring/alert system
    // should pick this up from logs and trigger a manual retry.
  }
}

async function handleWithDb(event: Stripe.Event): Promise<boolean> {
  if (!isDbConfigured()) return false;

  try {
    const {
      upsertUser,
      upsertSubscription,
      updateUserPlan,
      updateSubscriptionStatus,
      createEnrollment,
      getSubscriptionByStripeCustomer,
    } = await import('@/lib/db/queries');

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const customerId = session.customer as string;
        const paymentType = session.metadata?.type || 'subscription';

        if (!userId) {
          console.error('No userId in session metadata');
          return true;
        }

        await upsertUser(userId, session.customer_email || undefined);

        if ((paymentType === 'course' || paymentType === 'maxymia-course') && session.mode === 'payment') {
          // For legacy 'course' type: programId/documentId/programTitle
          // For 'maxymia-course' type: courseId/courseSlug/courseTitle
          const documentId = session.metadata?.documentId || session.metadata?.courseId;
          const programId = session.metadata?.programId;
          const title = session.metadata?.programTitle || session.metadata?.courseTitle;
          const paymentIntentId = session.payment_intent as string;

          if (!documentId) {
            console.error('Missing documentId/courseId in session metadata');
            return true;
          }

          await createEnrollment({
            clerkId: userId,
            programId: programId ? Number(programId) : undefined,
            programDocumentId: documentId,
            accessType: 'purchased',
            stripePaymentId: paymentIntentId,
            price: (session.amount_total || 0) / 100,
            title,
          });

          if (customerId) {
            await upsertSubscription({
              clerkId: userId,
              stripeCustomerId: customerId,
              stripeSubscriptionId: `cust_${customerId}`,
              status: 'none',
              plan: 'free',
            });
          }

          console.log(`User ${userId} purchased ${paymentType}: ${title} (${documentId})`);

          // Provision Moodle access if the program is configured for it.
          // Only for regular program purchases (not Maxymia courses).
          if (paymentType === 'course') {
            await provisionMoodleForPurchase({
              documentId,
              programTitle: title,
              customerEmail: session.customer_email,
              customerName: session.customer_details?.name ?? null,
            });
          }
        } else {
          const subscriptionId = session.subscription as string;
          const isTrial = paymentType === 'trial';

          // Retrieve subscription to get actual status (may be 'trialing')
          const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

          await upsertSubscription({
            clerkId: userId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            status: stripeSubscription.status,
            plan: 'pro',
            startedAt: new Date(),
          });

          await updateUserPlan(userId, 'pro');

          // Mirror `hasUsedTrial` into Clerk metadata so the checkout-time
          // trial guard works regardless of which storage backend is live.
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

          console.log(`User ${userId} upgraded to Pro${isTrial ? ' (trial)' : ''}`);
        }
        return true;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const sub = await getSubscriptionByStripeCustomer(customerId);
        if (sub) {
          const isActive = subscription.status === 'active' || subscription.status === 'trialing';
          const plan = isActive ? 'pro' : 'free';
          await updateSubscriptionStatus(sub.clerkId, subscription.status, plan);
          await updateUserPlan(sub.clerkId, plan);
          console.log(`User ${sub.clerkId} subscription updated: ${subscription.status}`);
        }
        return true;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const sub = await getSubscriptionByStripeCustomer(customerId);
        if (sub) {
          await updateSubscriptionStatus(sub.clerkId, 'canceled', 'free', { canceledAt: new Date() });
          await updateUserPlan(sub.clerkId, 'free');
          console.log(`User ${sub.clerkId} subscription canceled`);
        }
        return true;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const sub = await getSubscriptionByStripeCustomer(customerId);
        if (sub) {
          // Payment recovered → clear the grace-period timestamp.
          await updateSubscriptionStatus(sub.clerkId, sub.status, sub.plan, {
            lastPaymentAt: new Date(),
            paymentFailed: false,
            paymentFailedAt: null,
          });
          console.log(`User ${sub.clerkId} payment succeeded`);
        }
        return true;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const sub = await getSubscriptionByStripeCustomer(customerId);
        if (sub) {
          // Only stamp the grace-period start on the first failure of a
          // streak — if a later retry also fails we keep the original
          // timestamp so the 3-day window doesn't reset.
          const paymentFailedAt = sub.paymentFailedAt ?? new Date();
          await updateSubscriptionStatus(sub.clerkId, sub.status, sub.plan, {
            paymentFailed: true,
            paymentFailedAt,
          });
          console.log(`User ${sub.clerkId} payment failed (grace starts ${paymentFailedAt.toISOString()})`);
        }
        return true;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return true;
    }
  } catch (dbError) {
    console.warn('Database unavailable for webhook, falling back to Clerk:', dbError);
    return false;
  }
}

async function handleWithClerk(event: Stripe.Event) {
  const client = await clerkClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const customerId = session.customer as string;
      const paymentType = session.metadata?.type || 'subscription';

      if (!userId) break;

      const user = await client.users.getUser(userId);
      const currentMetadata = user.publicMetadata || {};

      if ((paymentType === 'course' || paymentType === 'maxymia-course') && session.mode === 'payment') {
        const documentId = session.metadata?.documentId || session.metadata?.courseId;
        const programId = session.metadata?.programId;
        const title = session.metadata?.programTitle || session.metadata?.courseTitle;
        const paymentIntentId = session.payment_intent as string;

        if (!documentId) break;

        interface PurchasedCourse {
          programId: number | null;
          documentId: string;
          purchasedAt: string;
          stripePaymentId: string;
          price: number;
          title?: string;
        }

        const existingPurchases = (currentMetadata.purchasedCourses as PurchasedCourse[]) || [];
        const alreadyPurchased = existingPurchases.some(
          (p) => p.documentId === documentId
        );

        if (!alreadyPurchased) {
          await client.users.updateUserMetadata(userId, {
            publicMetadata: {
              ...currentMetadata,
              stripeCustomerId: customerId || currentMetadata.stripeCustomerId,
              purchasedCourses: [...existingPurchases, {
                programId: programId ? Number(programId) : null,
                documentId,
                purchasedAt: new Date().toISOString(),
                stripePaymentId: paymentIntentId,
                price: (session.amount_total || 0) / 100,
                title,
              }],
            },
          });
        }

        // Provision Moodle access if the program is configured for it.
        if (paymentType === 'course') {
          await provisionMoodleForPurchase({
            documentId,
            programTitle: title,
            customerEmail: session.customer_email,
            customerName: session.customer_details?.name ?? null,
          });
        }
      } else {
        const subscriptionId = session.subscription as string;
        const isTrial = paymentType === 'trial';

        // Retrieve subscription to get actual status
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

        await client.users.updateUserMetadata(userId, {
          publicMetadata: {
            ...currentMetadata,
            plan: 'pro',
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: stripeSubscription.status,
            subscribedAt: new Date().toISOString(),
            ...(isTrial ? { hasUsedTrial: true } : {}),
          },
        });
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const users = await client.users.getUserList({ limit: 100 });
      const user = users.data.find((u) => u.publicMetadata?.stripeCustomerId === customerId);
      if (user) {
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';
        await client.users.updateUserMetadata(user.id, {
          publicMetadata: { ...user.publicMetadata, plan: isActive ? 'pro' : 'free', subscriptionStatus: subscription.status },
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const users = await client.users.getUserList({ limit: 100 });
      const user = users.data.find((u) => u.publicMetadata?.stripeCustomerId === customerId);
      if (user) {
        await client.users.updateUserMetadata(user.id, {
          publicMetadata: { ...user.publicMetadata, plan: 'free', subscriptionStatus: 'canceled', canceledAt: new Date().toISOString() },
        });
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      const users = await client.users.getUserList({ limit: 100 });
      const user = users.data.find((u) => u.publicMetadata?.stripeCustomerId === customerId);
      if (user) {
        await client.users.updateUserMetadata(user.id, {
          publicMetadata: {
            ...user.publicMetadata,
            lastPaymentAt: new Date().toISOString(),
            paymentFailed: false,
            paymentFailedAt: null,
          },
        });
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      const users = await client.users.getUserList({ limit: 100 });
      const user = users.data.find((u) => u.publicMetadata?.stripeCustomerId === customerId);
      if (user) {
        // Preserve the original failure timestamp so the 3-day grace window
        // doesn't reset on each Stripe retry.
        const existing = user.publicMetadata?.paymentFailedAt as string | undefined;
        await client.users.updateUserMetadata(user.id, {
          publicMetadata: {
            ...user.publicMetadata,
            paymentFailed: true,
            paymentFailedAt: existing || new Date().toISOString(),
          },
        });
      }
      break;
    }
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    // Try DB first, fall back to Clerk
    const handled = await handleWithDb(event);
    if (!handled) {
      await handleWithClerk(event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
