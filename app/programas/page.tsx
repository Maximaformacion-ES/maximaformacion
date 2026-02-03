import { draftMode } from 'next/headers';
import { getPrograms, getTopics } from '@/lib/strapi/queries';
import { isStrapiConfigured } from '@/lib/strapi/client';
import { COMPLETE_PROGRAMS } from '../data/programs';
import ProgramsClient from './ProgramsClient';
import type { Program, Topic } from '@/lib/strapi/types';

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

function extractTopicsFromPrograms(programs: Program[]): Topic[] {
  const unique = new Map<string, Topic>();
  for (const p of programs) {
    for (const topic of (p.topics || [])) {
      if (!unique.has(topic.name)) {
        unique.set(topic.name, topic);
      }
    }
  }
  return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export default async function CursosPage() {
  const { isEnabled: isDraft } = await draftMode();

  let programs: Program[];
  let topics: Topic[] = [];

  if (isStrapiConfigured()) {
    try {
      const [{ programs: strapiPrograms }, strapiTopics] = await Promise.all([
        getPrograms({ draft: isDraft }),
        getTopics(),
      ]);

      if (strapiPrograms.length > 0) {
        programs = strapiPrograms;
        topics = strapiTopics.length > 0 ? strapiTopics : extractTopicsFromPrograms(strapiPrograms);
      } else {
        programs = COMPLETE_PROGRAMS.map((p) => ({
          ...p,
          documentId: p.id.toString(),
          slug: generateSlug(p.title),
        }));
        topics = extractTopicsFromPrograms(programs);
      }
    } catch {
      programs = COMPLETE_PROGRAMS.map((p) => ({
        ...p,
        documentId: p.id.toString(),
        slug: generateSlug(p.title),
      }));
      topics = extractTopicsFromPrograms(programs);
    }
  } else {
    programs = COMPLETE_PROGRAMS.map((p) => ({
      ...p,
      documentId: p.id.toString(),
      slug: generateSlug(p.title),
    }));
    topics = extractTopicsFromPrograms(programs);
  }

  return <ProgramsClient initialPrograms={programs} availableTopics={topics} />;
}
