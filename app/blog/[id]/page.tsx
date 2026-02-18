import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { getBlogPostBySlug, getRelatedPosts, getAllBlogSlugs } from '@/lib/strapi/queries';
import { markdownToHtml } from '@/lib/markdown';
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

  try {
    const post = await getBlogPostBySlug(slug, false);
    if (post) {
      title = `${post.title} | Blog | Máxima Formación`;
      description = post.excerpt || description;
    }
  } catch {
    // Strapi unavailable
  }

  return { title, description };
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
  } catch {
    // Strapi unavailable
  }

  // Parse markdown content to HTML
  if (post) {
    post = {
      ...post,
      content: await markdownToHtml(post.content),
    };
  }

  return <BlogDetailClient post={post} relatedPosts={relatedPosts} />;
}
