import { fetchMaxymiaCourses } from '../../data/queries';
import MyGrades from './MyGrades';
import { requireCampusLogin } from '../require-campus-login';

export default async function NotasPage() {
  await requireCampusLogin('/maxymia/campus/notas');
  const courses = await fetchMaxymiaCourses();
  return <MyGrades courses={courses} />;
}
