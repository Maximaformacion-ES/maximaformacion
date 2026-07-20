import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { lessonProgress, courseActivity } from '@/lib/db/schema';
import { writeAudit } from './audit';

function msg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/**
 * Resetea el progreso de un alumno en UN curso: borra sus `lesson_progress` y su
 * `course_activity` de ese `programDocumentId`. NO toca `course_snapshots` (es la
 * estructura global del curso, no del alumno). Dry-run por defecto.
 */
export async function resetCourseProgress(params: {
  actor: string;
  clerkId: string;
  documentId: string;
  confirm?: boolean;
}): Promise<{ dryRun?: boolean; ok?: boolean; lessons?: number; error?: string }> {
  const { actor, clerkId, documentId, confirm = false } = params;

  const rows = await db
    .select({ id: lessonProgress.id })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.clerkId, clerkId), eq(lessonProgress.programDocumentId, documentId)));
  const lessons = rows.length;

  if (!confirm) return { dryRun: true, lessons };

  try {
    await db
      .delete(lessonProgress)
      .where(and(eq(lessonProgress.clerkId, clerkId), eq(lessonProgress.programDocumentId, documentId)));
    await db
      .delete(courseActivity)
      .where(and(eq(courseActivity.clerkId, clerkId), eq(courseActivity.programDocumentId, documentId)));
    await writeAudit({
      actor,
      action: 'reset_progress',
      entityType: 'progress',
      entityId: documentId,
      targetClerkId: clerkId,
      diff: { lessons },
    });
    return { ok: true, lessons };
  } catch (e) {
    return { error: msg(e) };
  }
}
