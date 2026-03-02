import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import CampusShell from './CampusShell';
import { fetchMaxymiaCourses } from '../data/queries';

export default async function CampusLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/maxymia/campus');
  }

  const courses = await fetchMaxymiaCourses();

  return <CampusShell courses={courses}>{children}</CampusShell>;
}
