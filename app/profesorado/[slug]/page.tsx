import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllTeacherSlugs, getTeacherBySlug } from '@/lib/strapi/queries';
import { JsonLd } from '@/app/components/JsonLd';
import { breadcrumbSchema } from '@/lib/seo/jsonld';
import TeacherDetailClient from './TeacherDetailClient';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const teacher = await getTeacherBySlug(slug);
  if (!teacher) return { title: 'Profesorado | Máxima Formación' };

  const title = teacher.seoTitle || `${teacher.name} — Profesorado | Máxima Formación`;
  const description =
    teacher.seoDescription ||
    teacher.bio?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) ||
    `Conoce a ${teacher.name}, docente de Máxima Formación.`;
  return {
    title,
    description,
    alternates: { canonical: `/profesorado/${teacher.slug}` },
    openGraph: {
      title,
      description,
      type: 'profile',
      ...(teacher.avatarUrl ? { images: [{ url: teacher.avatarUrl }] } : {}),
    },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllTeacherSlugs();
  return slugs.map((slug) => ({ slug }));
}

const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://www.maximaformacion.es'
).replace(/\/$/, '');

export default async function TeacherDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const teacher = await getTeacherBySlug(slug);
  if (!teacher) notFound();

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: teacher.name,
    jobTitle: teacher.role,
    url: `${SITE_URL}/profesorado/${teacher.slug}`,
    ...(teacher.avatarUrl ? { image: teacher.avatarUrl } : {}),
    ...(teacher.bio ? { description: teacher.bio.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500) } : {}),
    ...(teacher.email ? { email: teacher.email } : {}),
    sameAs: [teacher.linkedin, teacher.twitter, teacher.websiteUrl, teacher.orcid].filter(Boolean),
    worksFor: { '@type': 'EducationalOrganization', name: 'Máxima Formación', '@id': `${SITE_URL}#organization` },
  };

  const breadcrumb = breadcrumbSchema([
    { name: 'Inicio', url: '/' },
    { name: 'Profesorado', url: '/profesorado' },
    { name: teacher.name, url: `/profesorado/${teacher.slug}` },
  ]);

  return (
    <>
      <JsonLd data={[personSchema, breadcrumb]} />
      <TeacherDetailClient teacher={teacher} />
    </>
  );
}
