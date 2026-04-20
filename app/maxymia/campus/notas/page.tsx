import { fetchMaxymiaCourses } from '../../data/queries';
import MyGrades from './MyGrades';

export default async function NotasPage() {
  const courses = await fetchMaxymiaCourses();
  return <MyGrades courses={courses} />;
}
