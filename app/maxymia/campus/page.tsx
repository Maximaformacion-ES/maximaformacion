import { fetchMaxymiaCourses, mergeRatings } from '../data/queries';
import { getAllCourseRatings } from '@/lib/db/queries';
import CampusDashboard from './CampusDashboard';

export const metadata = {
  title: 'Campus Maxymia — IA Aplicada a Ciencias',
  description: 'Tu campus virtual de Inteligencia Artificial aplicada a ciencias.',
};

export default async function CampusPage() {
  const [courses, allRatings] = await Promise.all([
    fetchMaxymiaCourses(),
    getAllCourseRatings().catch(() => []),
  ]);

  const ratings: Record<string, { averageRating: number; reviewCount: number }> = {};
  for (const r of allRatings) {
    ratings[r.courseId] = {
      averageRating: r.averageRating ? parseFloat(r.averageRating) : 0,
      reviewCount: r.reviewCount,
    };
  }

  return <CampusDashboard courses={mergeRatings(courses, ratings)} />;
}
