import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { getBlogPosts } from '@/lib/strapi/queries';
import type { BlogPost } from '@/lib/strapi/types';
import BlogClient from './BlogClient';

export const metadata: Metadata = {
  title: 'Blog | Máxima Formación',
  description: 'Artículos, guías y recursos sobre estadística, ciencia de datos, formación profesional e innovación. Mantente al día con las últimas tendencias del sector.',
};

export const revalidate = 60;

export default async function BlogPage() {
  const { isEnabled: isDraft } = await draftMode();

  let posts: BlogPost[] = [];

  try {
    const { posts: strapiPosts } = await getBlogPosts({ draft: isDraft, limit: 200 });
    posts = strapiPosts;
  } catch {
    // Strapi unavailable
  }

  return <BlogClient initialPosts={posts} />;
}
