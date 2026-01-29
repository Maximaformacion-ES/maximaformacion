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
