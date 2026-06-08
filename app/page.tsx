import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { getPrograms, getBadges, getHomeData } from '@/lib/strapi/queries';
import { fetchMaxymiaCourses } from './maxymia/data/queries';
import { maxymiaCourseAsProgram } from './maxymia/data/adapters';
import type { MaxymiaCourse } from './maxymia/types';
import HomeClient from './HomeClient';
import type { HomeData } from '@/lib/strapi/types';

export const revalidate = 60;

// Self-referential canonical for the homepage. The root layout sets a
// site-wide canonical from Strapi (siteMetadata.canonicalUrl), which can be
// an empty string and leaves the most important page of the site without a
// self-canonical. Pin it explicitly here so / always declares itself
// canonical, matching the pattern every other static page already follows.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

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
