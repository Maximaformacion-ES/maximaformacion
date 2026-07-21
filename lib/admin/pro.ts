import { clerkClient } from '@clerk/nextjs/server';
import { upsertUser, updateUserPlan } from '@/lib/db/queries';
import { sendEmail } from '@/lib/email/client';
import { proWelcomeEmail } from '@/lib/email/templates/pro-welcome';
import { writeAudit } from './audit';

/**
 * Da o quita el plan PRO a un alumno **sin pasar por Stripe** (acceso de
 * cortesía/manual). Escribe el plan en `campus.users` (que además fija
 * `has_been_pro` la primera vez) y lo espeja en Clerk `publicMetadata.plan`
 * (varias partes de la web leen el plan directamente de Clerk vía useUser()).
 * No crea ni cancela suscripciones de Stripe.
 */
export async function setPro(
  actor: string,
  targetClerkId: string,
  isPro: boolean
): Promise<{ ok: boolean; plan: string; emailSent: boolean }> {
  const plan = isPro ? 'pro' : 'free';

  await upsertUser(targetClerkId); // asegura que existe la fila en campus.users
  await updateUserPlan(targetClerkId, plan);

  // Resolvemos email/nombre de Clerk (para el espejo del plan y el email de bienvenida).
  let email: string | null = null;
  let name = 'alumno';
  try {
    const cc = await clerkClient();
    const u = await cc.users.getUser(targetClerkId);
    email = u.primaryEmailAddress?.emailAddress ?? u.emailAddresses?.[0]?.emailAddress ?? null;
    name = u.firstName || u.fullName || (email ? email.split('@')[0] : 'alumno');
    await cc.users.updateUserMetadata(targetClerkId, {
      publicMetadata: { ...(u.publicMetadata as Record<string, unknown>), plan },
    });
  } catch (e) {
    console.warn(`[admin:setPro] no se pudo espejar el plan en Clerk para ${targetClerkId}:`, e);
  }

  // Email de bienvenida al dar PRO (best-effort: no bloquea la acción si falla).
  let emailSent = false;
  if (isPro && email) {
    try {
      const { subject, html, text } = proWelcomeEmail(name);
      await sendEmail({ to: email, subject, html, text, from: 'Máxima Formación <cursos@maximaformacion.es>' });
      emailSent = true;
    } catch (e) {
      console.warn(`[admin:setPro] no se pudo enviar el email de bienvenida PRO a ${email}:`, e);
    }
  }

  await writeAudit({
    actor,
    action: isPro ? 'set_pro' : 'unset_pro',
    entityType: 'plan',
    targetClerkId,
    diff: { plan, emailSent },
    source: 'panel',
  });

  return { ok: true, plan, emailSent };
}
