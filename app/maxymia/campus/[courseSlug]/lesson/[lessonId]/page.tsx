import { notFound, redirect } from 'next/navigation';
import { after } from 'next/server';
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

  // Curso (cacheado en el edge por Cloudflare) + sesión, EN PARALELO.
  const [result, { userId }] = await Promise.all([
    fetchLesson(courseSlug, lessonId),
    auth(),
  ]);

  if (!result) notFound();

  // Gate de acceso + updates del alumno EN PARALELO (ambos solo dependen del curso
  // ya cargado). El acceso se valida en servidor: la layout del campus solo exige
  // estar logueado, no haber comprado ESTE curso, así que sin esto cualquiera
  // podría abrir una lección por URL. Enrollment va por course id.
  const [{ hasAccess }, unitUpdates] = await Promise.all([
    getCourseAccess(result.course.id, result.course.isPro),
    userId
      ? getUserUnitUpdates(userId, result.course.id)
      : Promise.resolve(new Map<string, { type: UnitChange; ids: string[] }>()),
  ]);

  if (!hasAccess) {
    redirect(`/maxymia/campus/${courseSlug}`);
  }

  // Changelog (Opción 2): "Contenido nuevo / actualizado" por unidad hasta leerlo.
  const updatedUnits: Record<string, { type: UnitChange; ids: string[] }> = {};
  unitUpdates.forEach((v, uid) => {
    updatedUnits[uid] = v;
  });
  if (userId) {
    // Si el CONTENIDO de una unidad ya completada se actualizó, la re-abrimos
    // (la des-completamos) para que el alumno la repase.
    const reopen = Object.entries(updatedUnits)
      .filter(([, v]) => v.type === 'updated')
      .map(([uid]) => uid);
    if (reopen.length > 0) {
      await unmarkUnits(userId, result.course.id, reopen);
    }
  }

  // Reconcilia el snapshot en SEGUNDO PLANO (tras enviar la respuesta): hashear las
  // ~280 unidades + leer el snapshot en CADA navegación pesaba en el camino crítico
  // y casi nunca hay cambios. Ahora no bloquea el render; un cambio de contenido se
  // detecta para la siguiente visita (best-effort).
  after(async () => {
    try {
      await reconcileCourseUpdates(result.course);
    } catch {
      // best-effort
    }
  });

  return (
    <MaxymiaLessonPlayer
      course={result.course}
      block={result.block}
      lesson={result.lesson}
      updatedUnits={updatedUnits}
    />
  );
}
