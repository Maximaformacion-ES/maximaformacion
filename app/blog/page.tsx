import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { getBlogPosts } from '@/lib/strapi/queries';
import type { BlogPost } from '@/lib/strapi/types';
import BlogClient from './BlogClient';

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const { page } = await searchParams;
  const parsed = Math.max(1, parseInt(page || '1', 10) || 1);
  const isFirst = parsed === 1;
  return {
    title: isFirst
      ? 'Blog | Máxima Formación'
      : `Blog – Página ${parsed} | Máxima Formación`,
    description:
      'Artículos, guías y recursos sobre estadística, ciencia de datos, formación profesional e innovación.',
    alternates: {
      canonical: isFirst ? '/blog' : `/blog?page=${parsed}`,
    },
  };
}

export const revalidate = 60;

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { isEnabled: isDraft } = await draftMode();
  const { page } = await searchParams;
  const initialPage = Math.max(1, parseInt(page || '1', 10) || 1);

  let posts: BlogPost[] = [];

  try {
    const { posts: strapiPosts } = await getBlogPosts({ draft: isDraft, limit: 200 });
    posts = strapiPosts;
  } catch {
    // Strapi unavailable
  }

  return <BlogClient initialPosts={posts} initialPage={initialPage} />;
}
