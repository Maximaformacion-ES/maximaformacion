import { draftMode } from 'next/headers';
import { getProgramBySlug, getAllProgramSlugs } from '@/lib/strapi/queries';
import { COMPLETE_PROGRAMS } from '../../data/programs';
import ProgramDetailClient from './ProgramDetailClient';

export const revalidate = 60;

// Helper to generate slug from title
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
    // Fallback to local data slugs
    return COMPLETE_PROGRAMS.map((p) => ({
      id: generateSlug(p.title),
    }));
  }
}

export default async function ProgramPage({ params }: ProgramPageProps) {
  const { isEnabled: isDraft } = await draftMode();
  const resolvedParams = await params;
  const slug = resolvedParams.id;

  let program = null;

  try {
    program = await getProgramBySlug(slug, isDraft);
  } catch {
    // Error already logged by strapiRequest
  }

  // Fallback to local data if Strapi is unavailable or program not found
  if (!program) {
    const localProgram = COMPLETE_PROGRAMS.find(
      (p) => generateSlug(p.title) === slug
    );
    if (localProgram) {
      program = {
        ...localProgram,
        documentId: localProgram.id.toString(),
        slug: generateSlug(localProgram.title),
      };
    }
  }

  return <ProgramDetailClient program={program} />;
}
