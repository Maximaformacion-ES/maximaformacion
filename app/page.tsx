import { draftMode } from 'next/headers';
import { getPrograms, getBadges, getHomeData } from '@/lib/strapi/queries';
import HomeClient from './HomeClient';
import type { HomeData } from '@/lib/strapi/types';

export const revalidate = 60;

export default async function Home() {
  const { isEnabled: isDraft } = await draftMode();

  const [{ programs }, badges, homeData] = await Promise.all([
    getPrograms({ draft: isDraft }),
    getBadges(),
    getHomeData(),
  ]);

  return <HomeClient programs={programs} badges={badges} homeData={homeData as HomeData} />;
}
