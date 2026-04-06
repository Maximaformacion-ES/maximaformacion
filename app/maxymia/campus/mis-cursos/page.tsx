import { fetchMaxymiaCourses, mergeRatings } from '../../data/queries';
import { getAllCourseRatings } from '@/lib/db/queries';
import MyCourses from './MyCourses';

export const metadata = {
  title: 'Mis Cursos — Campus Maxymia',
  description: 'Accede a tus cursos comprados y sigue tu progreso.',
};

export default async function MisCursosPage() {
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

  return <MyCourses courses={mergeRatings(courses, ratings)} />;
}
