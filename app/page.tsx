import { draftMode } from 'next/headers';
import { getPrograms, getLogos, getBadges } from '@/lib/strapi/queries';
import { isStrapiConfigured } from '@/lib/strapi/client';
import { COMPLETE_PROGRAMS } from './data/programs';
import HomeClient from './HomeClient';
import type { Program, Logo, Badge } from '@/lib/strapi/types';

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
  let logos: Logo[] = [];
  let badges: Badge[] = [];

  if (isStrapiConfigured()) {
    try {
      const [{ programs: strapiPrograms }, strapiLogos, strapiBadges] = await Promise.all([
        getPrograms({ draft: isDraft }),
        getLogos(),
        getBadges(),
      ]);
      logos = strapiLogos;
      badges = strapiBadges;
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

  return <HomeClient programs={programs} logos={logos} badges={badges} />;
}
