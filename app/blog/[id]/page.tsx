import { draftMode } from 'next/headers';
import { getBlogPostBySlug, getRelatedPosts, getAllBlogSlugs } from '@/lib/strapi/queries';
import { isStrapiConfigured } from '@/lib/strapi/client';
import { ALL_BLOG_POSTS, getBlogPostBySlug as getLocalBlogPostBySlug, getRelatedPosts as getLocalRelatedPosts } from '../../data/blogs';
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
  // Only try Strapi if configured
  if (isStrapiConfigured()) {
    try {
      const slugs = await getAllBlogSlugs();
      if (slugs.length > 0) {
        return slugs.map((slug) => ({ id: slug }));
      }
    } catch {
      // Strapi unavailable, use local data
    }
  }
  // Fallback to local data slugs
  return ALL_BLOG_POSTS.map((p) => ({ id: p.slug }));
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { isEnabled: isDraft } = await draftMode();
  const resolvedParams = await params;
  const slug = resolvedParams.id;

  let post = null;
  let relatedPosts: Awaited<ReturnType<typeof getRelatedPosts>> = [];

  // Only try Strapi if configured
  if (isStrapiConfigured()) {
    try {
      const strapiPost = await getBlogPostBySlug(slug, isDraft);
      if (strapiPost) {
        post = strapiPost;
        // Fetch related posts passing the full post
        const strapiRelated = await getRelatedPosts(strapiPost, 3);
        if (strapiRelated.length > 0) {
          relatedPosts = strapiRelated;
        }
      }
    } catch {
      // Strapi unavailable, will use local fallback below
    }
  }

  // Fallback to local data if Strapi is unavailable or post not found
  if (!post) {
    const localPost = getLocalBlogPostBySlug(slug);
    if (localPost) {
      post = {
        ...localPost,
        documentId: localPost.id.toString(),
      };
    }
  }

  // Get related posts from local data if we don't have them yet
  if (post && relatedPosts.length === 0) {
    const localPost = getLocalBlogPostBySlug(slug);
    if (localPost) {
      const localRelated = getLocalRelatedPosts(localPost.id, 3);
      relatedPosts = localRelated.map(p => ({
        ...p,
        documentId: p.id.toString(),
      }));
    }
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
