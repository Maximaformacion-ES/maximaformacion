import { draftMode } from 'next/headers';
import { getBlogPostById, getRelatedPosts, getAllBlogSlugs } from '@/lib/strapi/queries';
import { ALL_BLOG_POSTS, getRelatedPosts as getLocalRelatedPosts } from '../../data/blogs';
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
    // Fallback to local data IDs (error logged by strapiRequest)
    return ALL_BLOG_POSTS.map((p) => ({ id: p.id.toString() }));
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { isEnabled: isDraft } = await draftMode();
  const resolvedParams = await params;
  const id = resolvedParams.id;

  let post = null;
  let relatedPosts: Awaited<ReturnType<typeof getRelatedPosts>> = [];

  try {
    // First try to fetch by ID (for numeric IDs)
    const numericId = parseInt(id, 10);
    if (!isNaN(numericId)) {
      post = await getBlogPostById(numericId, isDraft);
    }

    // If not found by numeric ID, try by documentId or slug
    if (!post) {
      post = await getBlogPostById(id, isDraft);
    }

    // Fetch related posts
    if (post) {
      relatedPosts = await getRelatedPosts(post.id, 3);
    }
  } catch {
    // Error already logged by strapiRequest
  }

  // Fallback to local data if Strapi is unavailable or post not found
  if (!post) {
    const numericId = parseInt(id, 10);
    const localPost = ALL_BLOG_POSTS.find((p) => p.id === numericId);
    if (localPost) {
      post = {
        ...localPost,
        documentId: localPost.id.toString(),
      };
      // Get related posts from local data
      const localRelated = getLocalRelatedPosts(localPost.id, 3);
      relatedPosts = localRelated.map(p => ({
        ...p,
        documentId: p.id.toString(),
      }));
    }
  }

  return <BlogDetailClient post={post} relatedPosts={relatedPosts} />;
}
