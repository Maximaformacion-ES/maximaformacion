import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPrograms, getTopics } from '@/lib/strapi/queries';
import { fetchMaxymiaCourses } from '@/app/maxymia/data/queries';
import { maxymiaCourseAsProgram } from '@/app/maxymia/data/adapters';
import type { MaxymiaCourse } from '@/app/maxymia/types';
import ProgramsClient from './ProgramsClient';
import type { Program, Topic } from '@/lib/strapi/types';
import { SUBJECT_AREAS } from '@/lib/subject-areas';

export const revalidate = 60;

interface CursosPageProps {
  searchParams: Promise<{ page?: string; area?: string }>;
}

// Map legacy ?area= values (sent by older megamenu links and a few external
// referrers) onto the canonical /programas/area/[slug] landing pages.
const AREA_PARAM_TO_SLUG: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const a of SUBJECT_AREAS) {
    map[a.key.toLowerCase()] = a.slug;
    map[a.slug] = a.slug;
  }
  // hand-picked aliases that older megamenu links shipped before the
  // /programas/area/[slug] routes existed
  map['ia'] = 'inteligencia-artificial';
  map['datos'] = 'ciencia-de-datos';
  map['salud'] = 'salud-basada-en-datos';
  map['moodle'] = 'moodle-elearning';
  map['elearning'] = 'moodle-elearning';
  map['e-learning'] = 'moodle-elearning';
  return map;
})();

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
  const { page, area } = await searchParams;

  // Redirect legacy ?area=X URLs to the canonical landing page so search
  // engines collapse the filtered view into a single indexable URL.
  if (area) {
    const slug = AREA_PARAM_TO_SLUG[area.trim().toLowerCase()];
    if (slug) redirect(`/programas/area/${slug}`);
  }

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
