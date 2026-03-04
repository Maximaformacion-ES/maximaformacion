import { fetchMaxymiaCourses, mergeRatings } from '../../data/queries';
import { getAllCourseRatings } from '@/lib/db/queries';
import CourseCatalog from './CourseCatalog';

export const metadata = {
  title: 'Cursos — Campus Maxymia',
  description: 'Explora el catálogo completo de cursos de IA aplicada a ciencias.',
};

export default async function CursosPage() {
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

  return <CourseCatalog courses={mergeRatings(courses, ratings)} />;
}
