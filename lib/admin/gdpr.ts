import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import {
  users,
  subscriptions,
  enrollments,
  lessonProgress,
  courseActivity,
  courseReviews,
  courseUpdateReads,
  certificates,
  examResults,
  leadCaptureLog,
} from '@/lib/db/schema';
import { isKlaviyoConfigured } from '@/lib/klaviyo/client';
import { writeAudit } from './audit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-12-15.clover',
});

function msg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export interface GdprParams {
  actor: string;
  clerkId: string;
  confirm?: boolean;
}

export interface GdprResult {
  dryRun?: boolean;
  email: string | null;
  report: Record<string, unknown>;
}

/**
 * Derecho al olvido (RGPD). Reimplementa `scripts/gdpr-delete-user.ts` como caso
 * de uso. Borra los datos personales en TODOS los sistemas, best-effort por
 * sistema. Las FACTURAS de Stripe se retienen por ley (solo se borra el customer,
 * la PII). Dry-run por defecto. LA ACCIÓN MÁS DESTRUCTIVA del panel.
 */
export async function gdprDelete(params: GdprParams): Promise<GdprResult> {
  const { actor, clerkId, confirm = false } = params;

  // Resolver email (Clerk primero; si no, el espejo campus.users).
  const cc = await clerkClient();
  let email: string | null = null;
  let clerkExists = false;
  try {
    const u = await cc.users.getUser(clerkId);
    email = u.primaryEmailAddress?.emailAddress ?? u.emailAddresses[0]?.emailAddress ?? null;
    clerkExists = true;
  } catch {
    /* no existe en Clerk */
  }
  if (!email) {
    try {
      const [row] = await db.select({ email: users.email }).from(users).where(eq(users.clerkId, clerkId)).limit(1);
      email = row?.email ?? null;
    } catch {
      /* */
    }
  }

  // Stripe customer id (de la suscripción).
  let stripeCustomerId: string | null = null;
  try {
    const [sub] = await db
      .select({ cid: subscriptions.stripeCustomerId })
      .from(subscriptions)
      .where(eq(subscriptions.clerkId, clerkId))
      .limit(1);
    stripeCustomerId = sub?.cid ?? null;
  } catch {
    /* */
  }

  const cnt = async (run: () => Promise<{ id: string }[]>): Promise<number | string> => {
    try {
      return (await run()).length;
    } catch (e) {
      return `skip: ${msg(e)}`;
    }
  };

  if (!confirm) {
    const campus: Record<string, number | string> = {
      subscriptions: await cnt(() => db.select({ id: subscriptions.id }).from(subscriptions).where(eq(subscriptions.clerkId, clerkId))),
      enrollments: await cnt(() => db.select({ id: enrollments.id }).from(enrollments).where(eq(enrollments.clerkId, clerkId))),
      lessonProgress: await cnt(() => db.select({ id: lessonProgress.id }).from(lessonProgress).where(eq(lessonProgress.clerkId, clerkId))),
      courseActivity: await cnt(() => db.select({ id: courseActivity.id }).from(courseActivity).where(eq(courseActivity.clerkId, clerkId))),
      courseReviews: await cnt(() => db.select({ id: courseReviews.id }).from(courseReviews).where(eq(courseReviews.clerkId, clerkId))),
      courseUpdateReads: await cnt(() => db.select({ id: courseUpdateReads.id }).from(courseUpdateReads).where(eq(courseUpdateReads.clerkId, clerkId))),
      certificates: await cnt(() => db.select({ id: certificates.id }).from(certificates).where(eq(certificates.clerkId, clerkId))),
      examResults: await cnt(() => db.select({ id: examResults.id }).from(examResults).where(eq(examResults.clerkId, clerkId))),
      leadCaptureLog: email
        ? await cnt(() => db.select({ id: leadCaptureLog.id }).from(leadCaptureLog).where(eq(leadCaptureLog.email, email!)))
        : 0,
    };
    return {
      dryRun: true,
      email,
      report: {
        campus: { ...campus, users: clerkExists || email ? 1 : 0 },
        clerk: clerkExists,
        stripeCustomer: stripeCustomerId,
        klaviyo: isKlaviyoConfigured()
          ? email
            ? 'perfil (suprimir MANUALMENTE en Klaviyo)'
            : 'sin email'
          : 'no configurado',
      },
    };
  }

  // ── DESTRUCTIVO: borra por sistema, best-effort ──
  const result: Record<string, unknown> = {};
  const del = async (name: string, run: () => Promise<unknown>) => {
    try {
      await run();
      result[name] = 'ok';
    } catch (e) {
      result[name] = `skip: ${msg(e)}`;
    }
  };

  // Hijos antes que `users` (FK por clerk_id).
  await del('subscriptions', () => db.delete(subscriptions).where(eq(subscriptions.clerkId, clerkId)));
  await del('enrollments', () => db.delete(enrollments).where(eq(enrollments.clerkId, clerkId)));
  await del('lessonProgress', () => db.delete(lessonProgress).where(eq(lessonProgress.clerkId, clerkId)));
  await del('courseActivity', () => db.delete(courseActivity).where(eq(courseActivity.clerkId, clerkId)));
  await del('courseReviews', () => db.delete(courseReviews).where(eq(courseReviews.clerkId, clerkId)));
  await del('courseUpdateReads', () => db.delete(courseUpdateReads).where(eq(courseUpdateReads.clerkId, clerkId)));
  await del('certificates', () => db.delete(certificates).where(eq(certificates.clerkId, clerkId)));
  await del('examResults', () => db.delete(examResults).where(eq(examResults.clerkId, clerkId)));
  if (email) await del('leadCaptureLog', () => db.delete(leadCaptureLog).where(eq(leadCaptureLog.email, email!)));
  await del('users', () => db.delete(users).where(eq(users.clerkId, clerkId)));

  // Clerk (cuenta de auth).
  await del('clerk', () => cc.users.deleteUser(clerkId));

  // Stripe: borra el customer (facturas retenidas por ley).
  if (stripeCustomerId) await del('stripeCustomer', () => stripe.customers.del(stripeCustomerId!));
  else result['stripeCustomer'] = 'sin customer';

  // Klaviyo: el cliente no expone borrado de perfil → manual.
  result['klaviyo'] = isKlaviyoConfigured() ? 'MANUAL: suprimir el perfil en Klaviyo' : 'no configurado';

  await writeAudit({ actor, action: 'gdpr_delete', entityType: 'user', targetClerkId: clerkId, diff: { email, result } });

  return { email, report: result };
}
