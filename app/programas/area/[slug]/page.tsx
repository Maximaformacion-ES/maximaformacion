import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import Link from 'next/link';
import { getPrograms } from '@/lib/strapi/queries';
import { fetchMaxymiaCourses } from '@/app/maxymia/data/queries';
import { maxymiaCourseAsProgram } from '@/app/maxymia/data/adapters';
import type { MaxymiaCourse } from '@/app/maxymia/types';
import { SUBJECT_AREAS, SUBJECT_AREA_BY_SLUG } from '@/lib/subject-areas';
import { ProgramCard } from '@/app/components/ProgramCard';
import { AreaLandingShell } from './AreaLandingShell';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return SUBJECT_AREAS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const area = SUBJECT_AREA_BY_SLUG.get(slug);
  if (!area) return {};
  return {
    title: area.metaTitle,
    description: area.metaDescription,
    alternates: { canonical: `/programas/area/${area.slug}` },
    openGraph: {
      title: area.metaTitle,
      description: area.metaDescription,
      type: 'website',
      url: `/programas/area/${area.slug}`,
    },
  };
}

export default async function AreaLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const area = SUBJECT_AREA_BY_SLUG.get(slug);
  if (!area) notFound();

  const { isEnabled: isDraft } = await draftMode();
  const [{ programs }, maxymiaCourses] = await Promise.all([
    getPrograms({ draft: isDraft, limit: 200 }).catch(() => ({ programs: [], total: 0, pageCount: 0 })),
    fetchMaxymiaCourses().catch(() => [] as MaxymiaCourse[]),
  ]);

  const merged = [...programs, ...maxymiaCourses.map(maxymiaCourseAsProgram)];
  const filtered = merged
    .filter((p) => p.subjectArea === area.key)
    .sort((a, b) => a.title.localeCompare(b.title, 'es'));

  return (
    <AreaLandingShell>
      <main className="bg-mx-bg text-mx-text min-h-screen">
        <section className="pt-32 pb-16 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <nav aria-label="breadcrumb" className="mb-6 text-label-md text-mx-text-muted">
              <Link href="/" className="hover:text-mx-orange">Inicio</Link>
              <span className="mx-2">/</span>
              <Link href="/programas" className="hover:text-mx-orange">Formación</Link>
              <span className="mx-2">/</span>
              <span className="text-mx-text">{area.label}</span>
            </nav>
            <span className="text-mx-orange text-label-sm md:text-label-md font-medium tracking-[0.5em] uppercase mb-4 block">
              {area.label}
            </span>
            <h1 className="text-heading-md md:text-display-sm font-black leading-heading mb-6 text-mx-blue uppercase text-balance md:max-w-[60%]">
              {area.heading}
            </h1>
            <p className="max-w-3xl text-mx-text-muted text-body-md md:text-body-lg font-light leading-relaxed">
              {area.intro}
            </p>
            <p className="mt-4 text-label-md text-mx-text-muted">
              {filtered.length} {filtered.length === 1 ? 'programa disponible' : 'programas disponibles'}
            </p>
          </div>
        </section>

        <section className="pb-24 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            {filtered.length === 0 ? (
              <p className="text-mx-text-muted">
                Aún no hay programas publicados en esta área. Vuelve pronto o explora el{' '}
                <Link href="/programas" className="text-mx-orange underline">catálogo completo</Link>.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
                {filtered.map((program, idx) => (
                  <ProgramCard key={program.documentId ?? program.slug} program={program} index={idx} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="pb-24 px-6 md:px-12">
          <div className="max-w-7xl mx-auto border-t border-mx-border pt-12">
            <h2 className="text-heading-sm md:text-heading-md font-bold text-mx-blue mb-6">
              Otras áreas formativas
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SUBJECT_AREAS.filter((a) => a.slug !== area.slug).map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/programas/area/${a.slug}`}
                    className="block p-4 rounded-xl border border-mx-border hover:border-mx-orange/30 transition-colors"
                  >
                    <span className="font-medium text-mx-text">{a.heading}</span>
                    <span className="block text-label-md text-mx-text-muted mt-1">{a.metaDescription}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </AreaLandingShell>
  );
}
