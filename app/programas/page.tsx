import { draftMode } from 'next/headers';
import { getPrograms, getTopics } from '@/lib/strapi/queries';
import ProgramsClient from './ProgramsClient';
import type { Program, Topic } from '@/lib/strapi/types';

export const revalidate = 60;

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

  const [{ programs }, strapiTopics] = await Promise.all([
    getPrograms({ draft: isDraft }),
    getTopics(),
  ]);

  const topics = strapiTopics.length > 0 ? strapiTopics : extractTopicsFromPrograms(programs);

  return <ProgramsClient initialPrograms={programs} availableTopics={topics} />;
}
