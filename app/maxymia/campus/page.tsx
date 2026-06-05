import { fetchMaxymiaCourses } from '../data/queries';
import CampusDashboard from './CampusDashboard';
import { requireCampusLogin } from './require-campus-login';

export const metadata = {
  title: 'Campus Maxymia — IA Aplicada a Ciencias',
  description: 'Tu campus virtual de Inteligencia Artificial aplicada a ciencias.',
};

export default async function CampusPage() {
  await requireCampusLogin('/maxymia/campus');
  const courses = await fetchMaxymiaCourses();

  return <CampusDashboard courses={courses} />;
}
