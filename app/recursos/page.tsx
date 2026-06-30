import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { getResources, getProResources } from '@/lib/strapi/queries';
import type { Resource, ProResourceCard } from '@/lib/strapi/types';
import { getServerUserState } from '@/lib/auth/server-user-state';
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
  let proResources: ProResourceCard[] = [];

  try {
    const [{ resources: strapiResources }, pro] = await Promise.all([
      getResources({ draft: isDraft, limit: 100 }),
      getProResources({ draft: isDraft }),
    ]);
    resources = strapiResources;
    proResources = pro;
  } catch {
    // Strapi unavailable
  }

  // Estado PRO del visitante (server-side) para el escaparate: si no es PRO,
  // las tarjetas muestran candado y el contenido real solo se sirve en la ruta
  // gateada /recursos/pro/[slug].
  const { hasPro } = await getServerUserState();

  return (
    <RecursosClient initialResources={resources} proResources={proResources} hasPro={hasPro} />
  );
}
