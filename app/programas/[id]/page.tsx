import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { getProgramBySlug, getAllProgramSlugs } from '@/lib/strapi/queries';
import ProgramDetailClient from './ProgramDetailClient';

export const revalidate = 60;

interface ProgramPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ProgramPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.id;

  const program = await getProgramBySlug(slug, false);

  if (program) {
    return {
      title: `${program.title} | Máxima Formación`,
      description: program.description,
    };
  }

  return {
    title: 'Programa | Máxima Formación',
    description: 'Descubre este programa formativo de Máxima Formación. Formación de calidad en estadística, ciencia de datos e innovación.',
  };
}

export async function generateStaticParams() {
  const slugs = await getAllProgramSlugs();
  return slugs.map((slug) => ({ id: slug }));
}

export default async function ProgramPage({ params }: ProgramPageProps) {
  const { isEnabled: isDraft } = await draftMode();
  const resolvedParams = await params;
  const slug = resolvedParams.id;

  const program = await getProgramBySlug(slug, isDraft);

  return <ProgramDetailClient program={program} />;
}
