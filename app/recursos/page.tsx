import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { getResources } from '@/lib/strapi/queries';
import type { Resource } from '@/lib/strapi/types';
import RecursosClient from './RecursosClient';

export const metadata: Metadata = {
  title: 'Recursos | Máxima Formación',
  description:
    'Guías rápidas, infografías, trabajos de investigación y videotutoriales en estadística, R, ciencia de datos y formación online. Descárgalos gratis.',
  alternates: { canonical: '/recursos' },
};

export const revalidate = 60;

export default async function RecursosPage() {
  const { isEnabled: isDraft } = await draftMode();

  let resources: Resource[] = [];

  try {
    const { resources: strapiResources } = await getResources({ draft: isDraft, limit: 100 });
    resources = strapiResources;
  } catch {
    // Strapi unavailable
  }

  return <RecursosClient initialResources={resources} />;
}
