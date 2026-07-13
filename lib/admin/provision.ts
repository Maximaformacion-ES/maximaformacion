import { clerkClient } from '@clerk/nextjs/server';
import { provisionMoodleAccess } from '@/lib/moodle/provision';
import { resolveContent } from './content';
import { writeAudit } from './audit';

export interface ReprovisionResult {
  ok: boolean;
  error?: string;
  result?: unknown;
}

/**
 * Re-ejecuta el provisioning de Moodle de un alumno para un programa (alta de
 * usuario Moodle + enrol + email de credenciales). Útil cuando la compra creó la
 * matrícula pero el alta en Moodle falló. Solo aplica a **programas** con Moodle
 * configurado — los cursos Maxymia son in-app y no tienen provisioning.
 */
export async function reprovision(
  actor: string,
  targetClerkId: string,
  documentId: string
): Promise<ReprovisionResult> {
  const content = await resolveContent(documentId);
  if (!content) {
    return { ok: false, error: `Contenido "${documentId}" no encontrado en Strapi.` };
  }
  if (content.type !== 'program' || !content.moodle || !content.moodleCourseId) {
    return {
      ok: false,
      error: 'Este contenido no usa Moodle (Maxymia es in-app; no hay provisioning que reejecutar).',
    };
  }

  const cc = await clerkClient();
  const u = await cc.users.getUser(targetClerkId);
  const email =
    u.primaryEmailAddress?.emailAddress ?? u.emailAddresses?.[0]?.emailAddress ?? null;
  if (!email) {
    return { ok: false, error: 'El alumno no tiene email en Clerk.' };
  }

  try {
    const result = await provisionMoodleAccess({
      email,
      firstname: u.firstName || 'Alumno',
      lastname: u.lastName || 'Máxima',
      programTitle: content.title,
      programType: content.programType ?? 'Curso',
      moodleInstance: content.moodle,
      moodleCourseId: content.moodleCourseId,
    });
    await writeAudit({
      actor,
      action: 'reprovision',
      entityType: 'moodle',
      entityId: documentId,
      targetClerkId,
      diff: { result },
      source: 'panel',
    });
    return { ok: true, result };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    await writeAudit({
      actor,
      action: 'reprovision',
      entityType: 'moodle',
      entityId: documentId,
      targetClerkId,
      diff: { error },
      source: 'panel',
    });
    return { ok: false, error };
  }
}
