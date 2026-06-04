import { fetchMaxymiaCourses } from '../../data/queries';
import MyCourses from './MyCourses';

export const metadata = {
  title: 'Mis Cursos — Campus Maxymia',
  description: 'Accede a tus cursos comprados y sigue tu progreso.',
};

export default async function MisCursosPage() {
  const courses = await fetchMaxymiaCourses();

  return <MyCourses courses={courses} />;
}
