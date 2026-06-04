import { fetchMaxymiaCourses } from '../../data/queries';
import CourseCatalog from './CourseCatalog';

export const metadata = {
  title: 'Cursos — Campus Maxymia',
  description: 'Explora el catálogo completo de cursos de IA aplicada a ciencias.',
};

export default async function CursosPage() {
  const courses = await fetchMaxymiaCourses();

  return <CourseCatalog courses={courses} />;
}
