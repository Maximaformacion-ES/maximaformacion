import { fetchMaxymiaCourses } from '../../data/queries';
import CourseCatalog from './CourseCatalog';
import { requireCampusLogin } from '../require-campus-login';

export const metadata = {
  title: 'Cursos — Campus Maxymia',
  description: 'Explora el catálogo completo de cursos de IA aplicada a ciencias.',
};

export default async function CursosPage() {
  await requireCampusLogin('/maxymia/campus/cursos');
  const courses = await fetchMaxymiaCourses();

  return <CourseCatalog courses={courses} />;
}
