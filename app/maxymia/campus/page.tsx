import { fetchMaxymiaCourses } from '../data/queries';
import CampusDashboard from './CampusDashboard';

export const metadata = {
  title: 'Campus Maxymia — IA Aplicada a Ciencias',
  description: 'Tu campus virtual de Inteligencia Artificial aplicada a ciencias.',
};

export default async function CampusPage() {
  const courses = await fetchMaxymiaCourses();

  return <CampusDashboard courses={courses} />;
}
