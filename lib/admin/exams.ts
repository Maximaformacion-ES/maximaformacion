import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { examResults } from '@/lib/db/schema';
import { writeAudit } from './audit';

function msg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/** Borra el resultado de un examen (clerkId+examId) para que el alumno pueda repetirlo. */
export async function resetExam(params: {
  actor: string;
  clerkId: string;
  examId: string;
}): Promise<{ ok?: boolean; error?: string }> {
  const { actor, clerkId, examId } = params;

  const [row] = await db
    .select()
    .from(examResults)
    .where(and(eq(examResults.clerkId, clerkId), eq(examResults.examId, examId)))
    .limit(1);
  if (!row) return { error: 'No hay resultado de ese examen para el alumno.' };

  try {
    await db.delete(examResults).where(and(eq(examResults.clerkId, clerkId), eq(examResults.examId, examId)));
    await writeAudit({
      actor,
      action: 'reset_exam',
      entityType: 'exam',
      entityId: examId,
      targetClerkId: clerkId,
      diff: { courseId: row.courseId, blockId: row.blockId },
    });
    return { ok: true };
  } catch (e) {
    return { error: msg(e) };
  }
}
