import { draftMode } from 'next/headers';
import { getBlogPosts } from '@/lib/strapi/queries';
import { ALL_BLOG_POSTS } from '../data/blogs';
import BlogClient from './BlogClient';

export const revalidate = 60;

export default async function BlogPage() {
  const { isEnabled: isDraft } = await draftMode();

  let posts;

  try {
    // Try to fetch from Strapi
    const { posts: strapiPosts } = await getBlogPosts({ draft: isDraft });
    posts = strapiPosts;
  } catch {
    // Fallback to local data if Strapi is unavailable
    // Error already logged by strapiRequest
    posts = ALL_BLOG_POSTS.map(post => ({
      ...post,
      documentId: post.id.toString(),
    }));
  }

  return <BlogClient initialPosts={posts} />;
}
