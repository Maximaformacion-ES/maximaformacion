import { createHash } from 'node:crypto';
import { and, eq, gt, inArray, isNull } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import {
  courseUpdates,
  courseUpdateReads,
  courseSnapshots,
  courseActivity,
  lessonProgress,
} from '@/lib/db/schema';
import type { MaxymiaCourse } from '@/app/maxymia/types';

/**
 * "Opción 2": changelog de cambios de curso. Al cargar el curso comparamos el
 * contenido actual (hash por unidad) contra un snapshot guardado; los cambios
 * (unidad nueva / contenido actualizado) se registran en `course_updates`, y el
 * player marca cada unidad como "nuevo"/"actualizado" hasta que el alumno la lee.
 */

export type UnitChange = 'new' | 'updated';

interface UnitVersion {
  hash: string;
  title: string;
  moduleDocId: string;
}

function hash(input: string): string {
  return createHash('sha1').update(input).digest('hex').slice(0, 16);
}

/** Hash de contenido + metadatos por unidad (topic, o lección sin topics). */
function unitVersionsOf(course: MaxymiaCourse): Map<string, UnitVersion> {
  const map = new Map<string, UnitVersion>();
  for (const block of course.blocks) {
    for (const lesson of block.lessons) {
      if (lesson.topics && lesson.topics.length > 0) {
        for (const topic of lesson.topics) {
          const uid = topic.uid || topic.id;
          map.set(uid, {
            hash: hash(JSON.stringify(topic.content ?? {})),
            title: topic.title?.es || topic.title?.en || '',
            moduleDocId: block.id,
          });
        }
      } else {
        const uid = lesson.uid || lesson.id;
        map.set(uid, {
          hash: hash(JSON.stringify(lesson.content ?? {})),
          title: lesson.title?.es || lesson.title?.en || '',
          moduleDocId: block.id,
        });
      }
    }
  }
  return map;
}

/** Huella global del contenido del curso (para no reconciliar si nada cambió). */
function courseStampOf(versions: Map<string, UnitVersion>): string {
  const parts = [...versions.entries()].map(([uid, v]) => `${uid}:${v.hash}`).sort();
  return hash(parts.join('|'));
}

/**
 * Reconcilia el snapshot del curso: si el contenido cambió desde la última vez,
 * registra en `course_updates` las unidades NUEVAS y las de CONTENIDO ACTUALIZADO,
 * y actualiza el snapshot. La primera vez solo crea la línea base (sin updates),
 * para no marcar como "nuevo" todo el contenido ya existente. Best-effort.
 */
export async function reconcileCourseUpdates(course: MaxymiaCourse): Promise<void> {
  try {
    const programDocumentId = course.id;
    const current = unitVersionsOf(course);
    if (current.size === 0) return;
    const stamp = courseStampOf(current);

    const [snap] = await db
      .select()
      .from(courseSnapshots)
      .where(eq(courseSnapshots.programDocumentId, programDocumentId))
      .limit(1);

    if (snap && snap.courseStamp === stamp) return; // nada cambió

    const currentVersions: Record<string, string> = {};
    current.forEach((v, uid) => (currentVersions[uid] = v.hash));

    if (!snap) {
      // Línea base: NO emitimos updates por el contenido ya existente.
      await db
        .insert(courseSnapshots)
        .values({ programDocumentId, courseStamp: stamp, versions: currentVersions })
        .onConflictDoNothing();
      return;
    }

    const old = (snap.versions as Record<string, string>) || {};
    const rows: (typeof courseUpdates.$inferInsert)[] = [];
    for (const [uid, v] of current) {
      if (!(uid in old)) {
        rows.push({
          programDocumentId,
          programTitle: course.title?.es,
          moduleDocumentId: v.moduleDocId,
          lessonDocumentId: uid,
          changeType: 'new_lesson',
          title: v.title || 'Contenido nuevo',
        });
      } else if (old[uid] !== v.hash) {
        rows.push({
          programDocumentId,
          programTitle: course.title?.es,
          moduleDocumentId: v.moduleDocId,
          lessonDocumentId: uid,
          changeType: 'updated_content',
          title: v.title || 'Contenido actualizado',
        });
      }
    }
    if (rows.length > 0) await db.insert(courseUpdates).values(rows);

    await db
      .update(courseSnapshots)
      .set({ versions: currentVersions, courseStamp: stamp, updatedAt: new Date() })
      .where(eq(courseSnapshots.programDocumentId, programDocumentId));
  } catch (err) {
    console.error('[course-updates] reconcile failed', err);
  }
}

/**
 * Para un usuario: por unidad, el tipo de cambio NO leído y posterior a cuando el
 * alumno empezó el curso (un alumno nuevo no ve como "novedad" lo de antes de él).
 * Devuelve { uid -> { type, ids } } para poder marcar como leído al verlo.
 */
export async function getUserUnitUpdates(
  clerkId: string,
  programDocumentId: string
): Promise<Map<string, { type: UnitChange; ids: string[] }>> {
  const result = new Map<string, { type: UnitChange; ids: string[] }>();
  try {
    const [activity] = await db
      .select({ startedAt: courseActivity.startedAt })
      .from(courseActivity)
      .where(and(eq(courseActivity.clerkId, clerkId), eq(courseActivity.programDocumentId, programDocumentId)))
      .limit(1);
    if (!activity) return result; // nunca empezó el curso → nada que avisar

    const rows = await db
      .select({
        id: courseUpdates.id,
        unitUid: courseUpdates.lessonDocumentId,
        changeType: courseUpdates.changeType,
      })
      .from(courseUpdates)
      .leftJoin(
        courseUpdateReads,
        and(
          eq(courseUpdateReads.courseUpdateId, courseUpdates.id),
          eq(courseUpdateReads.clerkId, clerkId)
        )
      )
      .where(
        and(
          eq(courseUpdates.programDocumentId, programDocumentId),
          gt(courseUpdates.createdAt, activity.startedAt),
          isNull(courseUpdateReads.id)
        )
      );

    for (const r of rows) {
      if (!r.unitUid) continue;
      const type: UnitChange = r.changeType === 'new_lesson' ? 'new' : 'updated';
      const prev = result.get(r.unitUid);
      if (prev) {
        prev.ids.push(r.id);
        if (type === 'new') prev.type = 'new'; // "nuevo" prevalece sobre "actualizado"
      } else {
        result.set(r.unitUid, { type, ids: [r.id] });
      }
    }
  } catch (err) {
    console.error('[course-updates] getUserUnitUpdates failed', err);
  }
  return result;
}

/**
 * "Des-completa" (re-abre) unas unidades para un usuario: borra sus filas de
 * lesson_progress. Se usa cuando el CONTENIDO de una unidad ya completada se
 * actualiza → vuelve a estar incompleta para que el alumno la repase, y el
 * progreso de su lección/curso se recalcula solo. Best-effort.
 */
export async function unmarkUnits(
  clerkId: string,
  programDocumentId: string,
  unitUids: string[]
): Promise<void> {
  if (unitUids.length === 0) return;
  try {
    await db
      .delete(lessonProgress)
      .where(
        and(
          eq(lessonProgress.clerkId, clerkId),
          eq(lessonProgress.programDocumentId, programDocumentId),
          inArray(lessonProgress.lessonDocumentId, unitUids)
        )
      );
  } catch (err) {
    console.error('[course-updates] unmarkUnits failed', err);
  }
}

/** Marca como leídas (para el usuario) las updates de unas unidades. Best-effort. */
export async function markUnitUpdatesRead(clerkId: string, updateIds: string[]): Promise<void> {
  if (updateIds.length === 0) return;
  try {
    await db
      .insert(courseUpdateReads)
      .values(updateIds.map((courseUpdateId) => ({ clerkId, courseUpdateId })))
      .onConflictDoNothing();
  } catch (err) {
    console.error('[course-updates] markUnitUpdatesRead failed', err);
  }
}
