import { draftMode } from 'next/headers';
import { getPrograms } from '@/lib/strapi/queries';
import { COMPLETE_PROGRAMS } from '../data/programs';
import ProgramsClient from './ProgramsClient';
import type { Program } from '@/lib/strapi/types';

export const revalidate = 60;

export default async function CursosPage() {
  const { isEnabled: isDraft } = await draftMode();

  let programs: Program[];

  try {
    // Try to fetch from Strapi
    const { programs: strapiPrograms } = await getPrograms({ draft: isDraft });
    programs = strapiPrograms;
  } catch {
    // Fallback to local data if Strapi is unavailable
    // Error already logged by strapiRequest
    programs = COMPLETE_PROGRAMS.map((p) => ({
      ...p,
      documentId: p.id.toString(),
    }));
  }

  return <ProgramsClient initialPrograms={programs} />;
}
