import { notFound } from 'next/navigation';
import { fetchMaxymiaCourseBySlug } from '../../data/queries';
import { getCourseRatingStats } from '@/lib/db/queries';
import MaxymiaCourseOverview from './MaxymiaCourseOverview';

interface PageProps {
  params: Promise<{ courseSlug: string }>;
}

export default async function CourseOverviewPage({ params }: PageProps) {
  const { courseSlug } = await params;
  const course = await fetchMaxymiaCourseBySlug(courseSlug);

  if (!course) notFound();

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

  return <MaxymiaCourseOverview course={course} />;
}
