import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchMaxymiaCourseOverviewBySlug, fetchMaxymiaCourses } from '../../data/queries';
import { getCourseAccess } from '@/lib/auth/entitlement';
import { getTeachers, getBadges, getInstitutions } from '@/lib/strapi/queries';
import { JsonLd } from '@/app/components/JsonLd';
import { maxymiaCourseSchema } from '@/lib/seo/jsonld';
import MaxymiaCourseOverview from './MaxymiaCourseOverview';

interface PageProps {
  params: Promise<{ courseSlug: string }>;
}

// Metadata propia por curso (antes usaba el título genérico del layout). Usa la
// query "overview" cacheada → sin llamada extra a Strapi (comparte caché con la
// página). Locale por defecto `es`.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = await fetchMaxymiaCourseOverviewBySlug(courseSlug);
  if (!course) return { title: 'Curso | Maxymia' };
  const title = course.title.es || course.title.en || 'Curso';
  const description = (course.description?.es || course.description?.en || '').slice(0, 300);
  const url = `/maxymia/campus/${courseSlug}`;
  return {
    title: `${title} | Maxymia`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      ...(course.image ? { images: [course.image] } : {}),
    },
  };
}

export default async function CourseOverviewPage({ params }: PageProps) {
  const { courseSlug } = await params;

  // El DETAIL del curso es la query más pesada, pero teachers/catálogo/sellos/
  // instituciones NO dependen de él → los lanzamos TODOS en paralelo (antes las 4
  // esperaban a que resolviera el DETAIL: waterfall). Solo `getCourseAccess`
  // necesita `course.id`, así que va después (auth+1 query DB, rápido).
  const [course, teachers, allCourses, allBadges, allInstitutions] = await Promise.all([
    fetchMaxymiaCourseOverviewBySlug(courseSlug),
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

  const jsonLd = maxymiaCourseSchema({
    slug: courseSlug,
    name: course.title.es || course.title.en || '',
    description: course.description?.es || course.description?.en,
    image: course.image,
    price: course.price,
    durationHours: course.durationHours,
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <MaxymiaCourseOverview
        course={course}
        initialHasAccess={initialHasAccess}
        teacherAvatars={teacherAvatars}
        recommended={recommended}
        allBadges={allBadges}
        allInstitutions={allInstitutions}
      />
    </>
  );
}
