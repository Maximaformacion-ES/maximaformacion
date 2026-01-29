import { draftMode } from 'next/headers';
import { getPrograms } from '@/lib/strapi/queries';
import { isStrapiConfigured } from '@/lib/strapi/client';
import { COMPLETE_PROGRAMS } from '../data/programs';
import ProgramsClient from './ProgramsClient';
import type { Program } from '@/lib/strapi/types';

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

export default async function CursosPage() {
  const { isEnabled: isDraft } = await draftMode();

  let programs: Program[];

  if (isStrapiConfigured()) {
    try {
      const { programs: strapiPrograms } = await getPrograms({ draft: isDraft });
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
    programs = COMPLETE_PROGRAMS.map((p) => ({
      ...p,
      documentId: p.id.toString(),
      slug: generateSlug(p.title),
    }));
  }

  return <ProgramsClient initialPrograms={programs} />;
}
