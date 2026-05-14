import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import {
  getResourceBySlug,
  getRelatedResources,
  getAllResourceSlugs,
} from '@/lib/strapi/queries';
import { markdownToHtml } from '@/lib/markdown';
import RecursoDetailClient from './RecursoDetailClient';

export const revalidate = 60;

interface ResourcePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ResourcePageProps): Promise<Metadata> {
  const { slug } = await params;
  let title = 'Recurso | Máxima Formación';
  let description =
    'Descarga este recurso de Máxima Formación: estadística, ciencia de datos, R y formación online.';

  try {
    const r = await getResourceBySlug(slug, false);
    if (r) {
      title = `${r.title} | Recursos | Máxima Formación`;
      description = r.excerpt || description;
    }
  } catch {
    // Strapi unavailable
  }

  return {
    title,
    description,
    alternates: { canonical: `/recursos/${slug}` },
  };
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllResourceSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { isEnabled: isDraft } = await draftMode();
  const { slug } = await params;

  let resource = null;
  let relatedResources: Awaited<ReturnType<typeof getRelatedResources>> = [];
  let bodyHtml = '';

  try {
    const strapiResource = await getResourceBySlug(slug, isDraft);
    if (strapiResource) {
      resource = strapiResource;
      bodyHtml = strapiResource.body ? await markdownToHtml(strapiResource.body) : '';
      relatedResources = await getRelatedResources(strapiResource, 3);
    }
  } catch {
    // Strapi unavailable
  }

  return (
    <RecursoDetailClient
      resource={resource}
      bodyHtml={bodyHtml}
      relatedResources={relatedResources}
    />
  );
}
