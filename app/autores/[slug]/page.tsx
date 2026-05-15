import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getAllAuthorSlugs,
  getAuthorBySlug,
  getBlogPostsByAuthor,
} from '@/lib/strapi/queries';
import { JsonLd } from '@/app/components/JsonLd';
import { breadcrumbSchema } from '@/lib/seo/jsonld';
import { AuthorArticlesList } from '@/app/components/AuthorArticlesList';
import TeacherDetailClient from '@/app/profesorado/[slug]/TeacherDetailClient';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://www.maximaformacion.es'
).replace(/\/$/, '');

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return { title: 'Autor | Máxima Formación' };

  const title = author.seoTitle || `${author.name} — Autor | Máxima Formación`;
  const description =
    author.seoDescription ||
    author.bio?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) ||
    `Conoce a ${author.name}, autor en Máxima Formación.`;
  return {
    title,
    description,
    alternates: { canonical: `/autores/${author.slug}` },
    openGraph: {
      title,
      description,
      type: 'profile',
      ...(author.avatarUrl ? { images: [{ url: author.avatarUrl }] } : {}),
    },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllAuthorSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function AuthorDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) notFound();

  const posts = await getBlogPostsByAuthor(author.documentId);

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    jobTitle: author.role,
    url: `${SITE_URL}/autores/${author.slug}`,
    ...(author.avatarUrl ? { image: author.avatarUrl } : {}),
    ...(author.bio ? { description: author.bio.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500) } : {}),
    ...(author.email ? { email: author.email } : {}),
    sameAs: [author.linkedin, author.twitter, author.websiteUrl, author.orcid].filter(Boolean),
  };

  const breadcrumb = breadcrumbSchema([
    { name: 'Inicio', url: '/' },
    { name: 'Autores', url: '/autores' },
    { name: author.name, url: `/autores/${author.slug}` },
  ]);

  return (
    <>
      <JsonLd data={[personSchema, breadcrumb]} />
      <TeacherDetailClient teacher={author} />
      <AuthorArticlesList
        posts={posts}
        heading={`Artículos de ${author.name}`}
      />
    </>
  );
}
