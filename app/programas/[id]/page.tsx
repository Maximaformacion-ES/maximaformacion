import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { getProgramBySlug, getAllProgramSlugs } from '@/lib/strapi/queries';
import { isStrapiConfigured } from '@/lib/strapi/client';
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

// Dynamic metadata based on program
export async function generateMetadata({ params }: ProgramPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.id;

  let title = 'Programa | Máxima Formación';
  let description = 'Descubre este programa formativo de Máxima Formación. Formación de calidad en estadística, ciencia de datos e innovación.';

  if (isStrapiConfigured()) {
    try {
      const program = await getProgramBySlug(slug, false);
      if (program) {
        title = `${program.title} | Máxima Formación`;
        description = program.description || description;
      }
    } catch {
      // Strapi unavailable, try local fallback
    }
  }

  // Fallback to local data if no title was resolved from Strapi
  if (title === 'Programa | Máxima Formación') {
    const localProgram = COMPLETE_PROGRAMS.find(
      (p) => generateSlug(p.title) === slug
    );
    if (localProgram) {
      title = `${localProgram.title} | Máxima Formación`;
      description = localProgram.description || description;
    }
  }

  return { title, description };
}

// Generate static params for SSG
export async function generateStaticParams() {
  if (isStrapiConfigured()) {
    try {
      const slugs = await getAllProgramSlugs();
      if (slugs.length > 0) {
        return slugs.map((slug) => ({ id: slug }));
      }
    } catch {
      // Strapi unavailable, use local data
    }
  }
  // Fallback to local data slugs
  return COMPLETE_PROGRAMS.map((p) => ({
    id: generateSlug(p.title),
  }));
}

export default async function ProgramPage({ params }: ProgramPageProps) {
  const { isEnabled: isDraft } = await draftMode();
  const resolvedParams = await params;
  const slug = resolvedParams.id;

  let program = null;

  if (isStrapiConfigured()) {
    try {
      program = await getProgramBySlug(slug, isDraft);
    } catch {
      // Strapi unavailable, will use local fallback below
    }
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
