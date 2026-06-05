import CampusShell from './CampusShell';
import { fetchMaxymiaCourses } from '../data/queries';

export default async function CampusLayout({ children }: { children: React.ReactNode }) {
  // No login wall at the layout level: the course ficha
  // (/maxymia/campus/[courseSlug]) is a PUBLIC landing that anyone can see.
  // The pages that DO require login (dashboard, mis-cursos, notas, catalog)
  // guard themselves with requireCampusLogin(), and lesson routes gate their
  // content server-side via getCourseAccess. The shell handles the signed-out
  // state (Clerk shows a sign-in button).
  const courses = await fetchMaxymiaCourses();

  return <CampusShell courses={courses}>{children}</CampusShell>;
}
