import { draftMode } from 'next/headers';
import { getProgramById, getAllProgramSlugs } from '@/lib/strapi/queries';
import { COMPLETE_PROGRAMS } from '../../data/programs';
import ProgramDetailClient from './ProgramDetailClient';

export const revalidate = 60;

interface ProgramPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate static params for SSG
export async function generateStaticParams() {
  try {
    const slugs = await getAllProgramSlugs();
    return slugs.map((slug) => ({ id: slug }));
  } catch {
    // Fallback to local data IDs (error logged by strapiRequest)
    return COMPLETE_PROGRAMS.map((p) => ({ id: p.id.toString() }));
  }
}

export default async function ProgramPage({ params }: ProgramPageProps) {
  const { isEnabled: isDraft } = await draftMode();
  const resolvedParams = await params;
  const id = resolvedParams.id;

  let program = null;

  try {
    // First try to fetch by ID (for numeric IDs)
    const numericId = parseInt(id, 10);
    if (!isNaN(numericId)) {
      program = await getProgramById(numericId, isDraft);
    }

    // If not found by numeric ID, try by documentId or slug
    if (!program) {
      program = await getProgramById(id, isDraft);
    }
  } catch {
    // Error already logged by strapiRequest
  }

  // Fallback to local data if Strapi is unavailable or program not found
  if (!program) {
    const numericId = parseInt(id, 10);
    const localProgram = COMPLETE_PROGRAMS.find((p) => p.id === numericId);
    if (localProgram) {
      program = {
        ...localProgram,
        documentId: localProgram.id.toString(),
        slug: localProgram.title.toLowerCase().replace(/\s+/g, '-'),
      };
    }
  }

  return <ProgramDetailClient program={program} />;
}
