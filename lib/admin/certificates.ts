import { and, eq } from 'drizzle-orm';
import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db/client';
import { certificates } from '@/lib/db/schema';
import { writeAudit } from './audit';

function msg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/**
 * Emite un certificado MANUALMENTE desde el panel (sin la comprobación de
 * elegibilidad del endpoint público). Idempotente por (clerkId, courseId).
 */
export async function issueCertificate(params: {
  actor: string;
  clerkId: string;
  courseId: string;
  courseTitle: string;
  instructor?: string;
}): Promise<{ ok?: boolean; certId?: string; already?: boolean; error?: string }> {
  const { actor, clerkId, courseId, courseTitle, instructor } = params;
  if (!courseId || !courseTitle) return { error: 'Falta el curso o el título.' };

  try {
    const [existing] = await db
      .select()
      .from(certificates)
      .where(and(eq(certificates.clerkId, clerkId), eq(certificates.courseId, courseId)))
      .limit(1);
    if (existing) return { ok: true, certId: existing.id, already: true };

    let studentName = 'Alumno';
    try {
      const cc = await clerkClient();
      const u = await cc.users.getUser(clerkId);
      studentName =
        [u.firstName, u.lastName].filter(Boolean).join(' ') ||
        u.emailAddresses[0]?.emailAddress ||
        'Alumno';
    } catch {
      /* nombre por defecto */
    }

    const [ins] = await db
      .insert(certificates)
      .values({
        clerkId,
        courseId,
        courseTitle,
        studentName,
        instructor: instructor?.trim() || null,
        completedAt: new Date(),
      })
      .returning();
    await writeAudit({
      actor,
      action: 'issue_certificate',
      entityType: 'certificate',
      entityId: ins.id,
      targetClerkId: clerkId,
      diff: { courseId, courseTitle },
    });
    return { ok: true, certId: ins.id };
  } catch (e) {
    // Incluye el caso "column/relation does not exist" si la tabla de prod no
    // está reconciliada con el schema → devuelve mensaje claro, nunca 500.
    return { error: msg(e) };
  }
}

export async function revokeCertificate(params: { actor: string; certId: string }): Promise<{ ok?: boolean; error?: string }> {
  const { actor, certId } = params;
  const [cert] = await db.select().from(certificates).where(eq(certificates.id, certId)).limit(1);
  if (!cert) return { error: 'Certificado no encontrado.' };
  try {
    await db.update(certificates).set({ revokedAt: new Date() }).where(eq(certificates.id, certId));
    await writeAudit({
      actor,
      action: 'revoke_certificate',
      entityType: 'certificate',
      entityId: certId,
      targetClerkId: cert.clerkId,
      diff: { courseId: cert.courseId },
    });
    return { ok: true };
  } catch (e) {
    return { error: msg(e) };
  }
}

export async function reinstateCertificate(params: { actor: string; certId: string }): Promise<{ ok?: boolean; error?: string }> {
  const { actor, certId } = params;
  const [cert] = await db.select().from(certificates).where(eq(certificates.id, certId)).limit(1);
  if (!cert) return { error: 'Certificado no encontrado.' };
  try {
    await db.update(certificates).set({ revokedAt: null }).where(eq(certificates.id, certId));
    await writeAudit({
      actor,
      action: 'reinstate_certificate',
      entityType: 'certificate',
      entityId: certId,
      targetClerkId: cert.clerkId,
      diff: { courseId: cert.courseId },
    });
    return { ok: true };
  } catch (e) {
    return { error: msg(e) };
  }
}
