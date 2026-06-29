import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { fetchLesson } from '../../../../data/queries';
import { getCourseAccess } from '@/lib/auth/entitlement';
import {
  reconcileCourseUpdates,
  getUserUnitUpdates,
  unmarkUnits,
  type UnitChange,
} from '@/lib/maxymia/course-updates';
import MaxymiaLessonPlayer from './MaxymiaLessonPlayer';

interface PageProps {
  params: Promise<{ courseSlug: string; lessonId: string }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { courseSlug, lessonId } = await params;
  const result = await fetchLesson(courseSlug, lessonId);

  if (!result) notFound();

  // Server-side access gate. The campus layout only requires the visitor to
  // be signed in — it does NOT verify they bought *this* course, so without
  // this any logged-in user could open any lesson by URL. Bounce a
  // non-entitled visitor to the course page (which shows the purchase view)
  // before the player content is ever sent. Enrollment is keyed by course id.
  const { hasAccess } = await getCourseAccess(result.course.id, result.course.isPro);
  if (!hasAccess) {
    redirect(`/maxymia/campus/${courseSlug}`);
  }

  // Changelog (Opción 2): detecta cambios desde el snapshot y marca por unidad
  // "Contenido nuevo / actualizado" hasta que el alumno lo lee. Best-effort.
  await reconcileCourseUpdates(result.course);
  const { userId } = await auth();
  const updatedUnits: Record<string, { type: UnitChange; ids: string[] }> = {};
  if (userId) {
    const map = await getUserUnitUpdates(userId, result.course.id);
    map.forEach((v, uid) => {
      updatedUnits[uid] = v;
    });
    // Si el CONTENIDO de una unidad ya completada se actualizó, la re-abrimos
    // (la des-completamos) para que el alumno la repase; el progreso de su
    // lección/curso se recalcula solo al caer esa unidad del set de completadas.
    const reopen = Object.entries(updatedUnits)
      .filter(([, v]) => v.type === 'updated')
      .map(([uid]) => uid);
    await unmarkUnits(userId, result.course.id, reopen);
  }

  return (
    <MaxymiaLessonPlayer
      course={result.course}
      block={result.block}
      lesson={result.lesson}
      updatedUnits={updatedUnits}
    />
  );
}
