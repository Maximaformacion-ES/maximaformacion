import { draftMode } from 'next/headers';
import { getBlogPosts } from '@/lib/strapi/queries';
import type { BlogPost } from '@/lib/strapi/types';
import BlogClient from './BlogClient';

export const revalidate = 60;

export default async function BlogPage() {
  const { isEnabled: isDraft } = await draftMode();

  let posts: BlogPost[] = [];

  try {
    const { posts: strapiPosts } = await getBlogPosts({ draft: isDraft });
    posts = strapiPosts;
  } catch {
    // Strapi unavailable
  }

  return <BlogClient initialPosts={posts} />;
}
