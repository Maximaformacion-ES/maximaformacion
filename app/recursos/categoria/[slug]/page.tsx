import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import Link from 'next/link';
import { getResources } from '@/lib/strapi/queries';
import { RESOURCE_CATEGORIES_META, RESOURCE_CATEGORY_BY_SLUG } from '@/lib/resource-categories-meta';
import { ResourceCard } from '@/app/components/ResourceCard';
import { ResourceCategoryLandingShell } from './ResourceCategoryLandingShell';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return RESOURCE_CATEGORIES_META.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = RESOURCE_CATEGORY_BY_SLUG.get(slug);
  if (!category) return {};
  return {
    title: category.metaTitle,
    description: category.metaDescription,
    alternates: { canonical: `/recursos/categoria/${category.slug}` },
    openGraph: {
      title: category.metaTitle,
      description: category.metaDescription,
      type: 'website',
      url: `/recursos/categoria/${category.slug}`,
    },
  };
}

export default async function ResourceCategoryLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const category = RESOURCE_CATEGORY_BY_SLUG.get(slug);
  if (!category) notFound();

  const { isEnabled: isDraft } = await draftMode();
  const { resources } = await getResources({ draft: isDraft, limit: 200 }).catch(() => ({
    resources: [],
    total: 0,
    pageCount: 0,
  }));
  const filtered = resources
    .filter((r) => r.category === category.key)
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));

  return (
    <ResourceCategoryLandingShell>
      <main className="bg-mx-bg text-mx-text min-h-screen">
        <section className="pt-32 pb-16 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <nav aria-label="breadcrumb" className="mb-6 text-label-md text-mx-text-muted">
              <Link href="/" className="hover:text-mx-orange">Inicio</Link>
              <span className="mx-2">/</span>
              <Link href="/recursos" className="hover:text-mx-orange">Recursos</Link>
              <span className="mx-2">/</span>
              <span className="text-mx-text">{category.label}</span>
            </nav>
            <span className="text-mx-orange text-label-sm md:text-label-md font-medium tracking-[0.5em] uppercase mb-4 block">
              {category.label}
            </span>
            <h1 className="text-display-sm md:text-display-md font-black leading-heading mb-6 text-mx-blue">
              {category.heading}
            </h1>
            <p className="max-w-3xl text-mx-text-muted text-body-md md:text-body-lg font-light leading-relaxed">
              {category.intro}
            </p>
            <p className="mt-4 text-label-md text-mx-text-muted">
              {filtered.length} {filtered.length === 1 ? 'recurso disponible' : 'recursos disponibles'}
            </p>
          </div>
        </section>

        <section className="pb-24 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            {filtered.length === 0 ? (
              <p className="text-mx-text-muted">
                Aún no hay recursos publicados en esta categoría. Vuelve pronto o explora todos los{' '}
                <Link href="/recursos" className="text-mx-orange underline">recursos disponibles</Link>.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
                {filtered.map((resource) => (
                  <ResourceCard key={resource.documentId ?? resource.slug} resource={resource} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="pb-24 px-6 md:px-12">
          <div className="max-w-7xl mx-auto border-t border-mx-border pt-12">
            <h2 className="text-heading-sm md:text-heading-md font-bold text-mx-blue mb-6">
              Otras categorías de recursos
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {RESOURCE_CATEGORIES_META.filter((c) => c.slug !== category.slug).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/recursos/categoria/${c.slug}`}
                    className="block p-4 rounded-xl border border-mx-border hover:border-mx-orange/30 transition-colors"
                  >
                    <span className="font-medium text-mx-text">{c.heading}</span>
                    <span className="block text-label-md text-mx-text-muted mt-1">{c.metaDescription}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </ResourceCategoryLandingShell>
  );
}
