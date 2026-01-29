import { draftMode } from 'next/headers';
import { getBlogPostBySlug, getRelatedPosts, getAllBlogSlugs } from '@/lib/strapi/queries';
import { ALL_BLOG_POSTS, getBlogPostBySlug as getLocalBlogPostBySlug, getRelatedPosts as getLocalRelatedPosts } from '../../data/blogs';
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
    // Fallback to local data slugs (error logged by strapiRequest)
    return ALL_BLOG_POSTS.map((p) => ({ id: p.slug }));
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { isEnabled: isDraft } = await draftMode();
  const resolvedParams = await params;
  const slug = resolvedParams.id;

  let post = null;
  let relatedPosts: Awaited<ReturnType<typeof getRelatedPosts>> = [];

  try {
    // Fetch by slug
    post = await getBlogPostBySlug(slug, isDraft);

    // Fetch related posts
    if (post) {
      relatedPosts = await getRelatedPosts(post.id, 3);
    }
  } catch {
    // Error already logged by strapiRequest
  }

  // Fallback to local data if Strapi is unavailable or post not found
  if (!post) {
    const localPost = getLocalBlogPostBySlug(slug);
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
