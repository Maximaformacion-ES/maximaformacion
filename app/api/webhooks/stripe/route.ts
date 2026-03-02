import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';
import { isDbConfigured } from '@/lib/db/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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

        if (paymentType === 'course' && session.mode === 'payment') {
          const programId = session.metadata?.programId;
          const documentId = session.metadata?.documentId;
          const programTitle = session.metadata?.programTitle;
          const paymentIntentId = session.payment_intent as string;

          if (!programId || !documentId) {
            console.error('Missing programId or documentId in session metadata');
            return true;
          }

          await createEnrollment({
            clerkId: userId,
            programId: Number(programId),
            programDocumentId: documentId,
            accessType: 'purchased',
            stripePaymentId: paymentIntentId,
            price: (session.amount_total || 0) / 100,
            title: programTitle,
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

          console.log(`User ${userId} purchased course: ${programTitle} (${documentId})`);
        } else {
          const subscriptionId = session.subscription as string;

          await upsertSubscription({
            clerkId: userId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            status: 'active',
            plan: 'pro',
            startedAt: new Date(),
          });

          await updateUserPlan(userId, 'pro');
          console.log(`User ${userId} upgraded to Pro`);
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
          await updateSubscriptionStatus(sub.clerkId, sub.status, sub.plan, {
            lastPaymentAt: new Date(),
            paymentFailed: false,
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
          await updateSubscriptionStatus(sub.clerkId, sub.status, sub.plan, { paymentFailed: true });
          console.log(`User ${sub.clerkId} payment failed`);
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

      if (paymentType === 'course' && session.mode === 'payment') {
        const programId = session.metadata?.programId;
        const documentId = session.metadata?.documentId;
        const programTitle = session.metadata?.programTitle;
        const paymentIntentId = session.payment_intent as string;

        if (!programId || !documentId) break;

        interface PurchasedCourse {
          programId: number;
          documentId: string;
          purchasedAt: string;
          stripePaymentId: string;
          price: number;
          title?: string;
        }

        const existingPurchases = (currentMetadata.purchasedCourses as PurchasedCourse[]) || [];
        const alreadyPurchased = existingPurchases.some(
          (p) => p.documentId === documentId || p.programId === Number(programId)
        );

        if (!alreadyPurchased) {
          await client.users.updateUserMetadata(userId, {
            publicMetadata: {
              ...currentMetadata,
              stripeCustomerId: customerId || currentMetadata.stripeCustomerId,
              purchasedCourses: [...existingPurchases, {
                programId: Number(programId),
                documentId,
                purchasedAt: new Date().toISOString(),
                stripePaymentId: paymentIntentId,
                price: (session.amount_total || 0) / 100,
                title: programTitle,
              }],
            },
          });
        }
      } else {
        const subscriptionId = session.subscription as string;
        await client.users.updateUserMetadata(userId, {
          publicMetadata: {
            ...currentMetadata,
            plan: 'pro',
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscribedAt: new Date().toISOString(),
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
          publicMetadata: { ...user.publicMetadata, lastPaymentAt: new Date().toISOString() },
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
        await client.users.updateUserMetadata(user.id, {
          publicMetadata: { ...user.publicMetadata, paymentFailed: true, paymentFailedAt: new Date().toISOString() },
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
