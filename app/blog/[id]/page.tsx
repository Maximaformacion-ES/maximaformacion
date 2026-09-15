import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { getBlogPostBySlug, getRelatedPosts, getAllBlogSlugs } from '@/lib/strapi/queries';
import { rethrowIfStrapiUnavailable } from '@/lib/strapi/client';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/app/components/JsonLd';
import { blogPostSchema, breadcrumbSchema } from '@/lib/seo/jsonld';
import BlogDetailClient from './BlogDetailClient';

export const revalidate = 60;

interface BlogPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Dynamic metadata based on blog post
export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.id;

  let title = 'Blog | Máxima Formación';
  let description = 'Lee este artículo en el blog de Máxima Formación. Contenido especializado en estadística, ciencia de datos y formación profesional.';
  let noIndex = false;

  try {
    const post = await getBlogPostBySlug(slug, false);
    if (post) {
      title = `${post.title} | Blog | Máxima Formación`;
      description = post.excerpt || description;
      noIndex = !!post.noIndex;
    }
  } catch {
    // Strapi unavailable
  }

  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}

// Generate static params for SSG
export async function generateStaticParams() {
  try {
    const slugs = await getAllBlogSlugs();
    return slugs.map((slug) => ({ id: slug }));
  } catch {
    return [];
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { isEnabled: isDraft } = await draftMode();
  const resolvedParams = await params;
  const slug = resolvedParams.id;

  let post = null;
  let relatedPosts: Awaited<ReturnType<typeof getRelatedPosts>> = [];

  try {
    const strapiPost = await getBlogPostBySlug(slug, isDraft);
    if (strapiPost) {
      post = strapiPost;
      relatedPosts = await getRelatedPosts(strapiPost, 3);
    }
  } catch (e) {
    // Strapi caído → relanzar: ISR conserva la última versión buena en vez de
    // cachear un 404. Otros errores → seguimos con post = null.
    rethrowIfStrapiUnavailable(e);
  }

  // Slug inexistente → 404 real. Antes se devolvía 200 con una vista "404",
  // y Google indexaba como páginas válidas cualquier URL mal escrita del blog.
  if (!post) notFound();

  const schemas = post
    ? [
        blogPostSchema(post),
        breadcrumbSchema([
          { name: 'Inicio', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: post.title, url: `/blog/${post.slug}` },
        ]),
      ]
    : [];

  return (
    <>
      {schemas.length > 0 && <JsonLd data={schemas} />}
      <BlogDetailClient post={post} relatedPosts={relatedPosts} />
    </>
  );
}
