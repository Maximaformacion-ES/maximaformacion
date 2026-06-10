import { notFound } from 'next/navigation';
import { fetchMaxymiaCourseBySlug } from '../../data/queries';
import { getCourseAccess } from '@/lib/auth/entitlement';
import { getInstitutions } from '@/lib/strapi/queries';
import MaxymiaCourseOverview from './MaxymiaCourseOverview';

interface PageProps {
  params: Promise<{ courseSlug: string }>;
}

export default async function CourseOverviewPage({ params }: PageProps) {
  const { courseSlug } = await params;
  // Instituciones (clientes con logos) son brand-level; en paralelo con el curso.
  const [course, institutions] = await Promise.all([
    fetchMaxymiaCourseBySlug(courseSlug),
    getInstitutions(),
  ]);

  if (!course) notFound();

  // Resolve access on the server so the first paint is already correct: a
  // non-buyer sees the purchase view (MaxymiaCourseDetail) from the start
  // instead of the student view ("Comenzar curso") flashing while the
  // client-side profile loads. The client hook still revalidates after
  // hydration (e.g. a checkout just completed in another tab).
  const { hasAccess: initialHasAccess } = await getCourseAccess(course.id, course.isPro);

  return <MaxymiaCourseOverview course={course} initialHasAccess={initialHasAccess} institutions={institutions} />;
}
