import { notFound } from 'next/navigation';
import { fetchMaxymiaCourseBySlug } from '../../data/queries';
import { getCourseRatingStats } from '@/lib/db/queries';
import { getCourseAccess } from '@/lib/auth/entitlement';
import MaxymiaCourseOverview from './MaxymiaCourseOverview';

interface PageProps {
  params: Promise<{ courseSlug: string }>;
}

export default async function CourseOverviewPage({ params }: PageProps) {
  const { courseSlug } = await params;
  const course = await fetchMaxymiaCourseBySlug(courseSlug);

  if (!course) notFound();

  // Resolve access on the server so the first paint is already correct: a
  // non-buyer sees the purchase view (MaxymiaCourseDetail) from the start
  // instead of the student view ("Comenzar curso") flashing while the
  // client-side profile loads. The client hook still revalidates after
  // hydration (e.g. a checkout just completed in another tab).
  const { hasAccess: initialHasAccess } = await getCourseAccess(course.id, course.isPro);

  // Merge real rating from DB
  try {
    const stats = await getCourseRatingStats(course.id);
    if (stats.reviewCount > 0) {
      course.rating = Math.round(stats.averageRating * 10) / 10;
      course.studentCount = course.studentCount ?? stats.reviewCount;
    }
  } catch {
    // DB unavailable — keep existing values
  }

  return <MaxymiaCourseOverview course={course} initialHasAccess={initialHasAccess} />;
}
