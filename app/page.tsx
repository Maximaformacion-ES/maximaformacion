import { draftMode } from 'next/headers';
import { getPrograms } from '@/lib/strapi/queries';
import { COMPLETE_PROGRAMS } from './data/programs';
import HomeClient from './HomeClient';
import type { Program } from '@/lib/strapi/types';

export const revalidate = 60;

export default async function Home() {
  const { isEnabled: isDraft } = await draftMode();

  let programs: Program[];

  try {
    // Try to fetch from Strapi
    const { programs: strapiPrograms } = await getPrograms({ draft: isDraft });
    programs = strapiPrograms;
  } catch {
    // Fallback to local data if Strapi is unavailable
    programs = COMPLETE_PROGRAMS.map((p) => ({
      ...p,
      documentId: p.id.toString(),
      slug: p.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim(),
    }));
  }

  return <HomeClient programs={programs} />;
}
