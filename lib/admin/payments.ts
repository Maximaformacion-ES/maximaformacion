import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import {
  enrollments,
  subscriptions,
  lessonProgress,
  courseActivity,
  courseReviews,
  courseUpdateReads,
  examResults,
  certificates,
} from '@/lib/db/schema';
import { writeAudit } from './audit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-12-15.clover',
});

function msg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.warn('[admin:payments] read failed:', e);
    return fallback;
  }
}

// ─── Ver pagos ─────────────────────────────────────────────────────────

export interface PaymentRow {
  documentId: string;
  title: string;
  price: string | null;
  purchasedAt: string | null;
  stripePaymentId: string | null;
  accessType: string;
  /** ¿Tiene un payment intent de Stripe reembolsable (pi_…)? */
  refundable: boolean;
}

export interface PaymentsView {
  purchases: PaymentRow[];
  subscription: {
    status: string;
    plan: string;
    currentPeriodEnd: string | null;
    paymentFailed: boolean | null;
  } | null;
}

export async function getPayments(clerkId: string): Promise<PaymentsView> {
  const purchases = await safe(
    () => db.select().from(enrollments).where(eq(enrollments.clerkId, clerkId)),
    [] as (typeof enrollments.$inferSelect)[]
  );
  const [sub] = await safe(
    () => db.select().from(subscriptions).where(eq(subscriptions.clerkId, clerkId)).limit(1),
    [] as (typeof subscriptions.$inferSelect)[]
  );

  return {
    purchases: purchases.map((p) => ({
      documentId: p.programDocumentId,
      title: p.title ?? p.programDocumentId,
      price: p.price ?? null,
      purchasedAt: p.purchasedAt ? p.purchasedAt.toISOString() : null,
      stripePaymentId: p.stripePaymentId,
      accessType: p.accessType,
      refundable: !!p.stripePaymentId && p.stripePaymentId.startsWith('pi_'),
    })),
    subscription: sub
      ? {
          status: sub.status,
          plan: sub.plan,
          currentPeriodEnd: sub.currentPeriodEnd ? sub.currentPeriodEnd.toISOString() : null,
          paymentFailed: sub.paymentFailed,
        }
      : null,
  };
}

// ─── Reembolso (DINERO REAL) ───────────────────────────────────────────

export interface RefundParams {
  actor: string;
  clerkId: string;
  documentId: string;
  confirm?: boolean;
}

export async function refund(params: RefundParams): Promise<{
  dryRun?: boolean;
  ok?: boolean;
  error?: string;
  paymentIntent?: string;
  amount?: string | number | null;
  title?: string;
  refundId?: string;
  status?: string | null;
}> {
  const { actor, clerkId, documentId, confirm = false } = params;

  const [enr] = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.clerkId, clerkId), eq(enrollments.programDocumentId, documentId)))
    .limit(1);
  if (!enr) return { error: 'No existe esa matrícula para el alumno.' };

  const pi = enr.stripePaymentId;
  if (!pi || !pi.startsWith('pi_')) {
    return {
      error:
        'Esta matrícula no tiene un pago de Stripe reembolsable (acceso manual/gratuito o sin payment intent).',
    };
  }

  if (!confirm) {
    return { dryRun: true, paymentIntent: pi, amount: enr.price, title: enr.title ?? documentId };
  }

  try {
    const r = await stripe.refunds.create({ payment_intent: pi });
    await writeAudit({
      actor,
      action: 'refund',
      entityType: 'payment',
      entityId: documentId,
      targetClerkId: clerkId,
      diff: { paymentIntent: pi, refundId: r.id, amount: r.amount, status: r.status },
    });
    return { ok: true, refundId: r.id, amount: r.amount, status: r.status };
  } catch (e) {
    return { error: msg(e) };
  }
}

// ─── Borrar compras (wipe) ─────────────────────────────────────────────
// Convierte la lógica del endpoint /api/admin/wipe-user-purchases en caso de uso.

export interface WipeParams {
  actor: string;
  clerkId: string;
  confirm?: boolean;
}

export async function wipePurchases(params: WipeParams): Promise<{
  dryRun?: boolean;
  ok?: boolean;
  counts?: Record<string, number | string>;
  deleted?: Record<string, 'ok' | string>;
  clerkKeys?: string[];
}> {
  const { actor, clerkId, confirm = false } = params;

  const countOne = async (name: string, run: () => Promise<{ id: string }[]>): Promise<number | string> => {
    try {
      return (await run()).length;
    } catch (e) {
      return `skip: ${msg(e)}`;
    }
  };

  const counts: Record<string, number | string> = {
    lessonProgress: await countOne('lessonProgress', () =>
      db.select({ id: lessonProgress.id }).from(lessonProgress).where(eq(lessonProgress.clerkId, clerkId))
    ),
    courseActivity: await countOne('courseActivity', () =>
      db.select({ id: courseActivity.id }).from(courseActivity).where(eq(courseActivity.clerkId, clerkId))
    ),
    courseReviews: await countOne('courseReviews', () =>
      db.select({ id: courseReviews.id }).from(courseReviews).where(eq(courseReviews.clerkId, clerkId))
    ),
    courseUpdateReads: await countOne('courseUpdateReads', () =>
      db.select({ id: courseUpdateReads.id }).from(courseUpdateReads).where(eq(courseUpdateReads.clerkId, clerkId))
    ),
    examResults: await countOne('examResults', () =>
      db.select({ id: examResults.id }).from(examResults).where(eq(examResults.clerkId, clerkId))
    ),
    certificates: await countOne('certificates', () =>
      db.select({ id: certificates.id }).from(certificates).where(eq(certificates.clerkId, clerkId))
    ),
    enrollments: await countOne('enrollments', () =>
      db.select({ id: enrollments.id }).from(enrollments).where(eq(enrollments.clerkId, clerkId))
    ),
  };

  // Metadata de Clerk que se limpiaría.
  const cc = await clerkClient();
  const u = await cc.users.getUser(clerkId);
  const meta = (u.publicMetadata as Record<string, unknown>) || {};
  const clerkKeys = (['purchasedCourses', 'courseProgress'] as const).filter((k) => meta[k] !== undefined);

  if (!confirm) {
    return { dryRun: true, counts, clerkKeys };
  }

  // ── DESTRUCTIVO ──
  const deleted: Record<string, 'ok' | string> = {};
  const del = async (name: string, run: () => Promise<unknown>) => {
    try {
      await run();
      deleted[name] = 'ok';
    } catch (e) {
      deleted[name] = `skip: ${msg(e)}`;
    }
  };
  await del('lessonProgress', () => db.delete(lessonProgress).where(eq(lessonProgress.clerkId, clerkId)));
  await del('courseActivity', () => db.delete(courseActivity).where(eq(courseActivity.clerkId, clerkId)));
  await del('courseReviews', () => db.delete(courseReviews).where(eq(courseReviews.clerkId, clerkId)));
  await del('courseUpdateReads', () => db.delete(courseUpdateReads).where(eq(courseUpdateReads.clerkId, clerkId)));
  await del('examResults', () => db.delete(examResults).where(eq(examResults.clerkId, clerkId)));
  await del('certificates', () => db.delete(certificates).where(eq(certificates.clerkId, clerkId)));
  await del('enrollments', () => db.delete(enrollments).where(eq(enrollments.clerkId, clerkId)));

  if (clerkKeys.length > 0) {
    const next = { ...meta };
    for (const k of clerkKeys) delete next[k];
    await cc.users.updateUserMetadata(clerkId, { publicMetadata: next });
  }

  await writeAudit({
    actor,
    action: 'wipe_purchases',
    entityType: 'purchases',
    targetClerkId: clerkId,
    diff: { counts, clerkKeys },
  });

  return { ok: true, deleted, clerkKeys };
}
