import { draftMode } from 'next/headers';
import { getPrograms, getBadges, getHomeData } from '@/lib/strapi/queries';
import { fetchMaxymiaCourses } from './maxymia/data/queries';
import { maxymiaCourseAsProgram } from './maxymia/data/adapters';
import type { MaxymiaCourse } from './maxymia/types';
import HomeClient from './HomeClient';
import type { HomeData } from '@/lib/strapi/types';

export const revalidate = 60;

export default async function Home() {
  const { isEnabled: isDraft } = await draftMode();

  const [{ programs }, badges, homeData, maxymiaCourses] = await Promise.all([
    getPrograms({ draft: isDraft }),
    getBadges(),
    getHomeData(),
    fetchMaxymiaCourses().catch(() => [] as MaxymiaCourse[]),
  ]);

  // Merge Maxymia courses (same as /programas) so the home's area grouping can
  // populate the "Inteligencia Artificial" area, whose courses live in Maxymia.
  const merged = [...programs, ...maxymiaCourses.map(maxymiaCourseAsProgram)];

  return <HomeClient programs={merged} badges={badges} homeData={homeData as HomeData} />;
}
