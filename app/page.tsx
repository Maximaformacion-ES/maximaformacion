import { draftMode } from 'next/headers';
import { getPrograms, getBadges, getHomeData } from '@/lib/strapi/queries';
import { isStrapiConfigured } from '@/lib/strapi/client';
import { COMPLETE_PROGRAMS } from './data/programs';
import { HOME_FALLBACK } from './data/home-fallback';
import HomeClient from './HomeClient';
import type { Program, Badge, HomeData } from '@/lib/strapi/types';

export const revalidate = 60;

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default async function Home() {
  const { isEnabled: isDraft } = await draftMode();

  let programs: Program[];
  let badges: Badge[] = [];
  let homeData: HomeData = HOME_FALLBACK;

  if (isStrapiConfigured()) {
    try {
      const [{ programs: strapiPrograms }, strapiBadges, strapiHomeData] = await Promise.all([
        getPrograms({ draft: isDraft }),
        getBadges(),
        getHomeData(),
      ]);
      badges = strapiBadges;
      if (strapiHomeData) {
        homeData = strapiHomeData;
      } else {
      }
      if (strapiPrograms.length > 0) {
        programs = strapiPrograms;
      } else {
        programs = COMPLETE_PROGRAMS.map((p) => ({
          ...p,
          documentId: p.id.toString(),
          slug: generateSlug(p.title),
        }));
      }
    } catch {
      // Fallback to local data if Strapi is unavailable
      programs = COMPLETE_PROGRAMS.map((p) => ({
        ...p,
        documentId: p.id.toString(),
        slug: generateSlug(p.title),
      }));
    }
  } else {
    // Strapi not configured, use local data
    programs = COMPLETE_PROGRAMS.map((p) => ({
      ...p,
      documentId: p.id.toString(),
      slug: generateSlug(p.title),
    }));
  }

  return <HomeClient programs={programs} badges={badges} homeData={homeData} />;
}
