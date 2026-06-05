import { fetchMaxymiaCourses } from '../../data/queries';
import MyCourses from './MyCourses';
import { requireCampusLogin } from '../require-campus-login';

export const metadata = {
  title: 'Mis Cursos — Campus Maxymia',
  description: 'Accede a tus cursos comprados y sigue tu progreso.',
};

export default async function MisCursosPage() {
  await requireCampusLogin('/maxymia/campus/mis-cursos');
  const courses = await fetchMaxymiaCourses();

  return <MyCourses courses={courses} />;
}
