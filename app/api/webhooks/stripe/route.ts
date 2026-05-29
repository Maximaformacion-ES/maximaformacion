import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';
import { isDbConfigured } from '@/lib/db/client';
import { strapiRequest } from '@/lib/strapi/client';
import type { StrapiSingleResponse, StrapiProgram } from '@/lib/strapi/types';
import { provisionMoodleAccess } from '@/lib/moodle/provision';
import { sendEmail } from '@/lib/email/client';
import { adminPurchaseNotificationEmail } from '@/lib/email/templates/admin-purchase-notification';
import { diplomaWelcomeEmail } from '@/lib/email/templates/diploma-welcome';
import { getSiteUrl } from '@/lib/site-url';

const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'cursos@maximaformacion.es';

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
/**
 * Resolve the buyer's real name from Clerk (which is what they registered
 * with, and what we want printed on certificates) instead of trusting
 * `session.customer_details.name` from Stripe Checkout — that field is
 * free-text typed at billing time and frequently arrives partial,
 * abbreviated, or just plain wrong (e.g. "a" → Moodle ends up showing
 * "a Máxima" because the fallback lastname kicks in).
 *
 * Returns nulls when Clerk doesn't have the data so the fallback values
 * upstream still apply.
 */
async function resolveStudentName(
  clerkId: string
): Promise<{ firstname: string | null; lastname: string | null }> {
  try {
    const cc = await clerkClient();
    const u = await cc.users.getUser(clerkId);
    return {
      firstname: u.firstName ?? null,
      lastname: u.lastName ?? null,
    };
  } catch (e) {
    console.warn(`[provision] Could not resolve Clerk user ${clerkId}:`, e);
    return { firstname: null, lastname: null };
  }
}

async function provisionMoodleForPurchase(params: {
  documentId: string;
  programTitle: string | undefined;
  customerEmail: string | null;
  clerkId: string;
}): Promise<void> {
  const { documentId, programTitle, customerEmail, clerkId } = params;

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

  const { firstname, lastname } = await resolveStudentName(clerkId);

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
    console.log(
      `[provision] OK for ${customerEmail} on "${program.title}" (moodle=${program.moodle}, courseId=${program.moodleCourseId})`
    );
  } catch (error) {
    // The error message coming from provisionMoodleAccess is already
    // tagged with the phase (moodle:lookup, moodle:create-user,
    // moodle:enrol, email:credentials, email:confirmation).
    const msg = error instanceof Error ? error.message : String(error);
    console.error(
      `[provision] FAILED for ${customerEmail} on "${program.title}" (moodle=${program.moodle}, courseId=${program.moodleCourseId}): ${msg}`
    );
    // Intentionally swallowed: enrollment in our DB still succeeds, and
    // we don't want Stripe to retry forever. The phase tag in the log
    // tells operators exactly which step to fix manually.
  }
}

/**
 * Mirror a plan change (and optional flag patches) into Clerk publicMetadata.
 * Several places in the app read user.publicMetadata.plan directly via
 * useUser(), so if we only write the DB the user keeps seeing the old plan
 * on the client until the metadata catches up. Best-effort: we log and
 * swallow Clerk errors so a transient outage doesn't poison the webhook.
 */
// Si el alumno compra el curso "Moodle para Docentes y Creación de
// Contenidos con eXeLearning", mandarle el correo de bienvenida con la
// documentación necesaria para emitir el diploma de la Universidad de
// Nebrija — replica el email manual que José Antonio enviaba hasta hoy.
// Solo se dispara para ese slug; cualquier otro curso ignora este paso.
const DIPLOMA_COURSE_SLUG = 'curso-moodle-para-docentes-con-exelearning';
// Display name + email — Gmail/Outlook bajan la sospecha de phishing cuando
// el From identifica a una persona en lugar de un alias suelto. Tiene que
// coincidir con la firma del cuerpo.
const DIPLOMA_EMAIL_FROM = 'José Antonio Lorente <cursos@maximaformacion.es>';
const DIPLOMA_DOCS_INBOX = 'tutor@maximaformacion.es';
const DIPLOMA_PDF_FILES = [
  'Autorización Solicitud de Título.pdf',
  'ANEXO I - TRATAMIENTO DATOS PERSONALES NEBRIJA.pdf',
] as const;

async function sendDiplomaWelcomeIfApplicable(params: {
  documentId: string;
  customerEmail: string | null;
  clerkId: string;
}): Promise<void> {
  const { documentId, customerEmail, clerkId } = params;
  if (!customerEmail) return;

  let program: StrapiProgram | null = null;
  try {
    const response = await strapiRequest<StrapiSingleResponse<StrapiProgram>>(
      `/api/programs/${documentId}?populate=*`,
      { revalidate: 0 }
    );
    program = response.data;
  } catch (error) {
    console.warn(`[diploma-welcome] Could not fetch program ${documentId}:`, error);
    return;
  }

  if (!program || program.slug !== DIPLOMA_COURSE_SLUG) return;

  // Los PDFs viven en public/diploma/. En Vercel, los assets de public/
  // se sirven estáticamente pero NO están en el filesystem del serverless
  // function por defecto, así que los descargamos vía HTTPS desde el
  // propio dominio. En local apunta a localhost:3000 (donde el dev
  // server los sirve igualmente). El nombre con tildes/espacios se
  // codifica con encodeURIComponent — Resend lo recibe como bytes y
  // sólo usa `filename` como display name (sin re-codificar).
  const baseUrl = getSiteUrl('http://localhost:3000');
  let attachments: { filename: string; content: Buffer; contentType: string }[];
  try {
    attachments = await Promise.all(
      DIPLOMA_PDF_FILES.map(async (filename) => {
        const url = `${baseUrl}/diploma/${encodeURIComponent(filename)}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`fetch ${url} → ${res.status}`);
        }
        return {
          filename,
          content: Buffer.from(await res.arrayBuffer()),
          contentType: 'application/pdf',
        };
      })
    );
  } catch (error) {
    console.error(
      `[diploma-welcome] Failed to fetch attachment PDFs — email NOT sent:`,
      error
    );
    return;
  }

  const { firstname } = await resolveStudentName(clerkId);
  const { subject, html, text } = diplomaWelcomeEmail({
    studentName: firstname || 'alumno',
  });

  try {
    await sendEmail({
      to: customerEmail,
      from: DIPLOMA_EMAIL_FROM,
      replyTo: DIPLOMA_DOCS_INBOX,
      subject,
      html,
      text,
      attachments,
    });
    console.log(`[diploma-welcome] sent to ${customerEmail}`);
  } catch (error) {
    console.error(`[diploma-welcome] send failed for ${customerEmail}:`, error);
  }
}

async function syncClerkPlan(
  clerkId: string,
  patch: Record<string, unknown>
): Promise<void> {
  try {
    const cc = await clerkClient();
    const u = await cc.users.getUser(clerkId);
    await cc.users.updateUserMetadata(clerkId, {
      publicMetadata: { ...u.publicMetadata, ...patch },
    });
  } catch (e) {
    console.warn(`[webhook] Could not sync Clerk metadata for ${clerkId}:`, e);
  }
}

/**
 * Forward a Stripe-generated invoice PDF to the maximaformación admin
 * inbox so accountancy can archive without hunting in the Stripe
 * Dashboard. Triggered on `invoice.finalized` events.
 *
 * Why a separate function: the email goes to `cursos@…`, not to the
 * buyer, and the PDF is downloaded server-side and attached so the
 * recipient doesn't depend on Stripe's hosted URL staying live.
 *
 * Best-effort: any failure (PDF fetch, Resend down) is logged and
 * swallowed so the webhook still returns 200 and Stripe doesn't retry.
 */
async function forwardInvoiceToAdmin(invoice: Stripe.Invoice): Promise<void> {
  if (!invoice.invoice_pdf) {
    console.warn(`[invoice-forward] invoice ${invoice.id} has no invoice_pdf URL — skipping`);
    return;
  }

  const pdfResponse = await fetch(invoice.invoice_pdf);
  if (!pdfResponse.ok) {
    throw new Error(`Stripe PDF fetch failed: ${pdfResponse.status}`);
  }
  const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());

  const amountFormatted = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: (invoice.currency || 'eur').toUpperCase(),
  }).format((invoice.amount_paid || invoice.amount_due || 0) / 100);

  const customer =
    invoice.customer_name ||
    invoice.customer_email ||
    (typeof invoice.customer === 'string' ? invoice.customer : 'desconocido');

  // Invoice number falls back to invoice.id during preview mode where
  // Stripe hasn't assigned a sequence number yet.
  const invoiceLabel = invoice.number || invoice.id;
  const filename = `factura-${invoiceLabel}.pdf`;

  const subject = `Factura ${invoiceLabel} — ${customer} (${amountFormatted})`;
  const html = `<!DOCTYPE html><html lang="es"><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;padding:24px;">
    <p style="margin:0 0 12px;color:#f59e0b;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Factura emitida</p>
    <h1 style="margin:0 0 20px;font-size:20px;">${invoiceLabel}</h1>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:8px 0;color:#666;width:120px;">Cliente</td><td style="padding:8px 0;font-weight:500;">${customer}</td></tr>
      <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;">${invoice.customer_email || '—'}</td></tr>
      <tr><td style="padding:8px 0;color:#666;">Importe</td><td style="padding:8px 0;font-weight:600;color:#f59e0b;">${amountFormatted}</td></tr>
      <tr><td style="padding:8px 0;color:#666;">Estado</td><td style="padding:8px 0;">${invoice.status || 'unknown'}</td></tr>
    </table>
    <p style="margin:24px 0 0;color:#999;font-size:12px;">PDF adjunto. Notificación automática.</p>
  </body></html>`;

  const text = [
    `Factura emitida: ${invoiceLabel}`,
    `Cliente: ${customer} <${invoice.customer_email || '—'}>`,
    `Importe: ${amountFormatted}`,
    `Estado:  ${invoice.status || 'unknown'}`,
    '',
    'PDF adjunto. Notificación automática.',
  ].join('\n');

  await sendEmail({
    to: ADMIN_NOTIFICATION_EMAIL,
    subject,
    html,
    text,
    replyTo: invoice.customer_email || undefined,
    attachments: [
      {
        filename,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });

  console.log(`[invoice-forward] ${invoiceLabel} → ${ADMIN_NOTIFICATION_EMAIL}`);
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

          // Fire-and-forget admin notification so a Resend outage or
          // missing template never blocks the enrollment / Moodle
          // pipeline below. Wrapped in try/catch with an explicit
          // .catch on the awaited send.
          try {
            const studentName = await resolveStudentName(userId);
            const fullName = [studentName.firstname, studentName.lastname].filter(Boolean).join(' ') || 'Sin nombre';
            // DNI/NIE/CIF llega como custom_field key='dni'
            // (ver app/api/checkout/route.ts). Si la sesión es legacy
            // (compra anterior a este push), llegará undefined y el
            // email lo marca como "no facilitado" en rojo para que
            // José Antonio sepa reclamarlo manualmente.
            const dniField = session.custom_fields?.find((f) => f.key === 'dni');
            const studentDni = dniField?.text?.value || undefined;
            const notification = adminPurchaseNotificationEmail({
              studentName: fullName,
              studentEmail: session.customer_email || 'desconocido',
              studentDni,
              productTitle: title || documentId,
              productType:
                paymentType === 'maxymia-course'
                  ? 'Maxymia'
                  : title?.toLowerCase().startsWith('máster') || title?.toLowerCase().startsWith('master')
                    ? 'Master'
                    : 'Curso',
              amount: (session.amount_total || 0) / 100,
              currency: (session.currency || 'eur').toUpperCase(),
              stripeSessionId: session.id,
              purchasedAt: new Date(),
            });
            await sendEmail({
              to: ADMIN_NOTIFICATION_EMAIL,
              subject: notification.subject,
              html: notification.html,
              text: notification.text,
              replyTo: session.customer_email || undefined,
            });
          } catch (e) {
            console.warn('[admin-notify] failed to send purchase email:', e);
          }

          // Provision Moodle access if the program is configured for it.
          // Only for regular program purchases (not Maxymia courses).
          if (paymentType === 'course') {
            await provisionMoodleForPurchase({
              documentId,
              programTitle: title,
              customerEmail: session.customer_email,
              clerkId: userId,
            });

            // Si el curso requiere diploma de Nebrija (hoy solo el de
            // Moodle + eXeLearning), pedir la documentación al alumno.
            await sendDiplomaWelcomeIfApplicable({
              documentId,
              customerEmail: session.customer_email,
              clerkId: userId,
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
          await syncClerkPlan(sub.clerkId, {
            plan,
            subscriptionStatus: subscription.status,
          });
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
          await syncClerkPlan(sub.clerkId, {
            plan: 'free',
            subscriptionStatus: 'canceled',
            canceledAt: new Date().toISOString(),
          });
          console.log(`User ${sub.clerkId} subscription canceled`);
        }
        return true;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const sub = await getSubscriptionByStripeCustomer(customerId);
        if (sub) {
          // Payment recovered → clear the failure flag everywhere.
          await updateSubscriptionStatus(sub.clerkId, sub.status, sub.plan, {
            lastPaymentAt: new Date(),
            paymentFailed: false,
            paymentFailedAt: null,
          });
          await syncClerkPlan(sub.clerkId, {
            lastPaymentAt: new Date().toISOString(),
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
          // No grace period: a failed Stripe charge revokes Pro access
          // immediately. We still stamp paymentFailedAt for the audit
          // trail and keep the original timestamp on retries so it
          // reflects the first failure of the streak.
          const paymentFailedAt = sub.paymentFailedAt ?? new Date();
          await updateSubscriptionStatus(sub.clerkId, sub.status, 'free', {
            paymentFailed: true,
            paymentFailedAt,
          });
          await updateUserPlan(sub.clerkId, 'free');
          await syncClerkPlan(sub.clerkId, {
            plan: 'free',
            paymentFailed: true,
            paymentFailedAt: paymentFailedAt.toISOString(),
          });
          console.log(`User ${sub.clerkId} payment failed → plan downgraded to free (first failure ${paymentFailedAt.toISOString()})`);
        }
        return true;
      }

      case 'invoice.finalized': {
        // Forward every Stripe-generated invoice to the admin inbox so
        // José Antonio doesn't have to dig through the Stripe Dashboard
        // (req. 29-may-2026). PDF is fetched server-side and attached so
        // the recipient can archive without depending on Stripe's hosted
        // URL staying live forever.
        const invoice = event.data.object as Stripe.Invoice;
        await forwardInvoiceToAdmin(invoice).catch((e) =>
          console.warn('[invoice-forward] failed:', e)
        );
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

        // Admin notification (same flow as the DB-backed branch above).
        try {
          const studentName = await resolveStudentName(userId);
          const fullName = [studentName.firstname, studentName.lastname].filter(Boolean).join(' ') || 'Sin nombre';
          const dniField = session.custom_fields?.find((f) => f.key === 'dni');
          const studentDni = dniField?.text?.value || undefined;
          const notification = adminPurchaseNotificationEmail({
            studentName: fullName,
            studentEmail: session.customer_email || 'desconocido',
            studentDni,
            productTitle: title || documentId,
            productType:
              paymentType === 'maxymia-course'
                ? 'Maxymia'
                : title?.toLowerCase().startsWith('máster') || title?.toLowerCase().startsWith('master')
                  ? 'Master'
                  : 'Curso',
            amount: (session.amount_total || 0) / 100,
            currency: (session.currency || 'eur').toUpperCase(),
            stripeSessionId: session.id,
            purchasedAt: new Date(),
          });
          await sendEmail({
            to: ADMIN_NOTIFICATION_EMAIL,
            subject: notification.subject,
            html: notification.html,
            text: notification.text,
            replyTo: session.customer_email || undefined,
          });
        } catch (e) {
          console.warn('[admin-notify] failed to send purchase email:', e);
        }

        // Provision Moodle access if the program is configured for it.
        if (paymentType === 'course') {
          await provisionMoodleForPurchase({
            documentId,
            programTitle: title,
            customerEmail: session.customer_email,
            clerkId: userId,
          });

          // Diploma docs welcome (ver handleWithDb).
          await sendDiplomaWelcomeIfApplicable({
            documentId,
            customerEmail: session.customer_email,
            clerkId: userId,
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
        // Preserve the original failure timestamp so the audit trail
        // reflects the first failure of the streak, not the latest retry.
        const existing = user.publicMetadata?.paymentFailedAt as string | undefined;
        await client.users.updateUserMetadata(user.id, {
          publicMetadata: {
            ...user.publicMetadata,
            plan: 'free',
            paymentFailed: true,
            paymentFailedAt: existing || new Date().toISOString(),
          },
        });
      }
      break;
    }

    case 'invoice.finalized': {
      // Mirror of the DB-branch behaviour: forward the PDF to admin.
      // No Clerk state to update here — it's a pure side-effect.
      const invoice = event.data.object as Stripe.Invoice;
      await forwardInvoiceToAdmin(invoice).catch((e) =>
        console.warn('[invoice-forward] failed:', e)
      );
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
