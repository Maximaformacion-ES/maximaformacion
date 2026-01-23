import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  const client = await clerkClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const customerId = session.customer as string;
        const paymentType = session.metadata?.type || 'subscription';

        if (!userId) {
          console.error('No userId in session metadata');
          break;
        }

        // Get current user metadata
        const user = await client.users.getUser(userId);
        const currentMetadata = user.publicMetadata || {};

        if (paymentType === 'course' && session.mode === 'payment') {
          // Handle course purchase
          const programId = session.metadata?.programId;
          const documentId = session.metadata?.documentId;
          const programTitle = session.metadata?.programTitle;
          const paymentIntentId = session.payment_intent as string;

          if (!programId || !documentId) {
            console.error('Missing programId or documentId in session metadata');
            break;
          }

          // Add to user's purchased courses
          interface PurchasedCourse {
            programId: number;
            documentId: string;
            purchasedAt: string;
            stripePaymentId: string;
            price: number;
            title?: string;
          }

          const existingPurchases = (currentMetadata.purchasedCourses as PurchasedCourse[]) || [];

          // Check if already purchased to avoid duplicates
          const alreadyPurchased = existingPurchases.some(
            (p) => p.documentId === documentId || p.programId === Number(programId)
          );

          if (!alreadyPurchased) {
            const newPurchase: PurchasedCourse = {
              programId: Number(programId),
              documentId,
              purchasedAt: new Date().toISOString(),
              stripePaymentId: paymentIntentId,
              price: (session.amount_total || 0) / 100,
              title: programTitle,
            };

            await client.users.updateUserMetadata(userId, {
              publicMetadata: {
                ...currentMetadata,
                stripeCustomerId: customerId || currentMetadata.stripeCustomerId,
                purchasedCourses: [...existingPurchases, newPurchase],
              },
              privateMetadata: {
                ...user.privateMetadata,
                stripeCustomerId: customerId || (user.privateMetadata as Record<string, unknown>)?.stripeCustomerId,
              },
            });
            console.log(`✅ User ${userId} purchased course: ${programTitle} (${documentId})`);
          } else {
            console.log(`ℹ️ User ${userId} already owns course ${documentId}`);
          }
        } else {
          // Handle subscription (existing logic)
          const subscriptionId = session.subscription as string;

          await client.users.updateUserMetadata(userId, {
            publicMetadata: {
              ...currentMetadata,
              plan: 'pro',
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              subscribedAt: new Date().toISOString(),
            },
            privateMetadata: {
              ...user.privateMetadata,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
            },
          });
          console.log(`✅ User ${userId} upgraded to Pro`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by Stripe customer ID
        const users = await client.users.getUserList({
          limit: 100,
        });

        const user = users.data.find(
          (u) => u.publicMetadata?.stripeCustomerId === customerId
        );

        if (user) {
          const isActive = subscription.status === 'active' || subscription.status === 'trialing';
          
          await client.users.updateUserMetadata(user.id, {
            publicMetadata: {
              ...user.publicMetadata,
              plan: isActive ? 'pro' : 'free',
              subscriptionStatus: subscription.status,
            },
          });
          console.log(`✅ User ${user.id} subscription updated: ${subscription.status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by Stripe customer ID
        const users = await client.users.getUserList({
          limit: 100,
        });

        const user = users.data.find(
          (u) => u.publicMetadata?.stripeCustomerId === customerId
        );

        if (user) {
          await client.users.updateUserMetadata(user.id, {
            publicMetadata: {
              ...user.publicMetadata,
              plan: 'free',
              subscriptionStatus: 'canceled',
              canceledAt: new Date().toISOString(),
            },
          });
          console.log(`✅ User ${user.id} subscription canceled`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find user by Stripe customer ID
        const users = await client.users.getUserList({
          limit: 100,
        });

        const user = users.data.find(
          (u) => u.publicMetadata?.stripeCustomerId === customerId
        );

        if (user) {
          await client.users.updateUserMetadata(user.id, {
            publicMetadata: {
              ...user.publicMetadata,
              lastPaymentAt: new Date().toISOString(),
            },
          });
          console.log(`✅ User ${user.id} payment succeeded`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find user by Stripe customer ID
        const users = await client.users.getUserList({
          limit: 100,
        });

        const user = users.data.find(
          (u) => u.publicMetadata?.stripeCustomerId === customerId
        );

        if (user) {
          await client.users.updateUserMetadata(user.id, {
            publicMetadata: {
              ...user.publicMetadata,
              paymentFailed: true,
              paymentFailedAt: new Date().toISOString(),
            },
          });
          console.log(`⚠️ User ${user.id} payment failed`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
