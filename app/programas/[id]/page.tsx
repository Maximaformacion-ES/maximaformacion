import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { getProgramBySlug, getAllProgramSlugs } from '@/lib/strapi/queries';
import { markdownToHtml } from '@/lib/markdown';
import { JsonLd } from '@/app/components/JsonLd';
import { breadcrumbSchema, courseSchema, faqSchema } from '@/lib/seo/jsonld';
import ProgramDetailClient from './ProgramDetailClient';

export interface ProgramRichHtml {
  longDescription: string;
  objectives: string;
  audience: string;
  careers: string;
}

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
      alternates: { canonical: `/programas/${program.slug}` },
      ...(program.noIndex && {
        robots: { index: false, follow: false },
      }),
    };
  }

  return {
    title: 'Programa | Máxima Formación',
    description: 'Descubre este programa formativo de Máxima Formación. Formación de calidad en estadística, ciencia de datos e innovación.',
    alternates: { canonical: `/programas/${slug}` },
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

  const schemas = program
    ? [
        courseSchema(program),
        breadcrumbSchema([
          { name: 'Inicio', url: '/' },
          { name: 'Programas', url: '/programas' },
          { name: program.title, url: `/programas/${program.slug}` },
        ]),
        ...(program.faqs && program.faqs.length > 0 ? [faqSchema(program.faqs)] : []),
      ]
    : [];

  // Pre-render the long-form markdown server-side so the bot sees the
  // full body of the program in the initial HTML. Without this each
  // markdown field stayed empty until JS hydration finished (the old
  // MarkdownContent client component returned null on first paint),
  // burying 500-1000 words per page from the SEO crawler.
  const richHtml: ProgramRichHtml = program
    ? {
        longDescription: program.longDescription
          ? await markdownToHtml(program.longDescription)
          : '',
        objectives: program.objectives ? await markdownToHtml(program.objectives) : '',
        audience: program.audience ? await markdownToHtml(program.audience) : '',
        careers: program.careers ? await markdownToHtml(program.careers) : '',
      }
    : { longDescription: '', objectives: '', audience: '', careers: '' };

  return (
    <>
      {schemas.length > 0 && <JsonLd data={schemas} />}
      <ProgramDetailClient program={program} richHtml={richHtml} />
    </>
  );
}
