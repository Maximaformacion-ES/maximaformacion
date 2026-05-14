import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { getPrograms, getTopics } from '@/lib/strapi/queries';
import { fetchMaxymiaCourses } from '@/app/maxymia/data/queries';
import { maxymiaCourseAsProgram } from '@/app/maxymia/data/adapters';
import type { MaxymiaCourse } from '@/app/maxymia/types';
import ProgramsClient from './ProgramsClient';
import type { Program, Topic } from '@/lib/strapi/types';

export const revalidate = 60;

interface CursosPageProps {
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ searchParams }: CursosPageProps): Promise<Metadata> {
  const { page } = await searchParams;
  const parsed = Math.max(1, parseInt(page || '1', 10) || 1);
  const isFirst = parsed === 1;
  return {
    title: isFirst
      ? 'Másters y Cursos | Máxima Formación'
      : `Másters y Cursos – Página ${parsed} | Máxima Formación`,
    description:
      'Catálogo de másters y cursos online en estadística, bioestadística, ciencia de datos, R, machine learning, IA y Moodle.',
    alternates: {
      canonical: isFirst ? '/programas' : `/programas?page=${parsed}`,
    },
    // Para páginas 2+, dejamos que Google las indexe (cada slice tiene contenido único)
    // pero no son tan importantes como la primera.
  };
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

export default async function CursosPage({ searchParams }: CursosPageProps) {
  const { isEnabled: isDraft } = await draftMode();
  const { page } = await searchParams;
  const initialPage = Math.max(1, parseInt(page || '1', 10) || 1);

  const [{ programs }, strapiTopics, maxymiaCourses] = await Promise.all([
    getPrograms({ draft: isDraft }),
    getTopics(),
    fetchMaxymiaCourses().catch(() => [] as MaxymiaCourse[]),
  ]);

  const merged = [...programs, ...maxymiaCourses.map(maxymiaCourseAsProgram)];
  const topics = strapiTopics.length > 0 ? strapiTopics : extractTopicsFromPrograms(merged);

  return (
    <ProgramsClient
      initialPrograms={merged}
      availableTopics={topics}
      initialPage={initialPage}
    />
  );
}
