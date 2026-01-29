import { draftMode } from 'next/headers';
import { getBlogPosts } from '@/lib/strapi/queries';
import { isStrapiConfigured } from '@/lib/strapi/client';
import { ALL_BLOG_POSTS } from '../data/blogs';
import BlogClient from './BlogClient';

export const revalidate = 60;

export default async function BlogPage() {
  const { isEnabled: isDraft } = await draftMode();

  let posts;

  if (isStrapiConfigured()) {
    try {
      const { posts: strapiPosts } = await getBlogPosts({ draft: isDraft });
      if (strapiPosts.length > 0) {
        posts = strapiPosts;
      } else {
        posts = ALL_BLOG_POSTS.map(post => ({
          ...post,
          documentId: post.id.toString(),
        }));
      }
    } catch {
      // Fallback to local data if Strapi is unavailable
      posts = ALL_BLOG_POSTS.map(post => ({
        ...post,
        documentId: post.id.toString(),
      }));
    }
  } else {
    posts = ALL_BLOG_POSTS.map(post => ({
      ...post,
      documentId: post.id.toString(),
    }));
  }

  return <BlogClient initialPosts={posts} />;
}
