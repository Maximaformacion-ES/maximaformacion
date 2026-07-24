import { notFound } from 'next/navigation';
import { fetchMaxymiaCourseBySlug, fetchMaxymiaCourses } from '../../data/queries';
import { getCourseAccess } from '@/lib/auth/entitlement';
import { getTeachers, getBadges, getInstitutions } from '@/lib/strapi/queries';
import MaxymiaCourseOverview from './MaxymiaCourseOverview';

interface PageProps {
  params: Promise<{ courseSlug: string }>;
}

export default async function CourseOverviewPage({ params }: PageProps) {
  const { courseSlug } = await params;

  // El DETAIL del curso es la query más pesada, pero teachers/catálogo/sellos/
  // instituciones NO dependen de él → los lanzamos TODOS en paralelo (antes las 4
  // esperaban a que resolviera el DETAIL: waterfall). Solo `getCourseAccess`
  // necesita `course.id`, así que va después (auth+1 query DB, rápido).
  const [course, teachers, allCourses, allBadges, allInstitutions] = await Promise.all([
    fetchMaxymiaCourseBySlug(courseSlug),
    getTeachers(),
    fetchMaxymiaCourses(),
    // Set GLOBAL de sellos e instituciones: TODOS en todas las fichas.
    getBadges(),
    getInstitutions(),
  ]);

  if (!course) notFound();

  // Resolve access on the server so the first paint is already correct: a
  // non-buyer sees the purchase view (MaxymiaCourseDetail) from the start
  // instead of the student view ("Comenzar curso") flashing while the
  // client-side profile loads. The client hook still revalidates after
  // hydration (e.g. a checkout just completed in another tab).
  const { hasAccess: initialHasAccess } = await getCourseAccess(course.id, course.isPro);

  const teacherAvatars = teachers.map((t) => t.avatarUrl).filter((url): url is string => !!url);

  // Recomendados: misma categoría primero, luego el resto. (Relación a perfilar.)
  const others = allCourses.filter((c) => c.id !== course.id);
  const sameCat = others.filter((c) => c.category === course.category);
  const recommended = [...sameCat, ...others.filter((c) => c.category !== course.category)].slice(0, 4);

  return (
    <MaxymiaCourseOverview
      course={course}
      initialHasAccess={initialHasAccess}
      teacherAvatars={teacherAvatars}
      recommended={recommended}
      allBadges={allBadges}
      allInstitutions={allInstitutions}
    />
  );
}
