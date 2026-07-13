import { clerkClient } from '@clerk/nextjs/server';
import { upsertUser, updateUserPlan } from '@/lib/db/queries';
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
): Promise<{ ok: boolean; plan: string }> {
  const plan = isPro ? 'pro' : 'free';

  await upsertUser(targetClerkId); // asegura que existe la fila en campus.users
  await updateUserPlan(targetClerkId, plan);

  try {
    const cc = await clerkClient();
    const u = await cc.users.getUser(targetClerkId);
    await cc.users.updateUserMetadata(targetClerkId, {
      publicMetadata: { ...(u.publicMetadata as Record<string, unknown>), plan },
    });
  } catch (e) {
    console.warn(`[admin:setPro] no se pudo espejar el plan en Clerk para ${targetClerkId}:`, e);
  }

  await writeAudit({
    actor,
    action: isPro ? 'set_pro' : 'unset_pro',
    entityType: 'plan',
    targetClerkId,
    diff: { plan },
    source: 'panel',
  });

  return { ok: true, plan };
}
