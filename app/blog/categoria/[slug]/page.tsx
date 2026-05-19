import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import Link from 'next/link';
import { getBlogPosts } from '@/lib/strapi/queries';
import { BLOG_CATEGORIES_META, BLOG_CATEGORY_BY_SLUG } from '@/lib/blog-categories-meta';
import { BlogCard } from '@/app/components/BlogCard';
import { CategoryLandingShell } from './CategoryLandingShell';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return BLOG_CATEGORIES_META.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = BLOG_CATEGORY_BY_SLUG.get(slug);
  if (!category) return {};
  return {
    title: category.metaTitle,
    description: category.metaDescription,
    alternates: { canonical: `/blog/categoria/${category.slug}` },
    openGraph: {
      title: category.metaTitle,
      description: category.metaDescription,
      type: 'website',
      url: `/blog/categoria/${category.slug}`,
    },
  };
}

export default async function CategoryLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const category = BLOG_CATEGORY_BY_SLUG.get(slug);
  if (!category) notFound();

  const { isEnabled: isDraft } = await draftMode();
  const { posts } = await getBlogPosts({ draft: isDraft, limit: 200 }).catch(() => ({ posts: [], total: 0, pageCount: 0 }));
  const filtered = posts
    .filter((p) => p.category === category.key)
    .sort((a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime());

  return (
    <CategoryLandingShell>
      <main className="bg-mx-bg text-mx-text min-h-screen">
        <section className="pt-32 pb-16 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <nav aria-label="breadcrumb" className="mb-6 text-label-md text-mx-text-muted">
              <Link href="/" className="hover:text-mx-orange">Inicio</Link>
              <span className="mx-2">/</span>
              <Link href="/blog" className="hover:text-mx-orange">Blog</Link>
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
              {filtered.length} {filtered.length === 1 ? 'artículo publicado' : 'artículos publicados'}
            </p>
          </div>
        </section>

        <section className="pb-24 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            {filtered.length === 0 ? (
              <p className="text-mx-text-muted">
                Aún no hay artículos publicados en esta categoría. Vuelve pronto o explora el{' '}
                <Link href="/blog" className="text-mx-orange underline">blog completo</Link>.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
                {filtered.map((post) => (
                  <BlogCard key={post.id ?? post.slug} post={post} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="pb-24 px-6 md:px-12">
          <div className="max-w-7xl mx-auto border-t border-mx-border pt-12">
            <h2 className="text-heading-sm md:text-heading-md font-bold text-mx-blue mb-6">
              Otras categorías del blog
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {BLOG_CATEGORIES_META.filter((c) => c.slug !== category.slug).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/blog/categoria/${c.slug}`}
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
    </CategoryLandingShell>
  );
}
