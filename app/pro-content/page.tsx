import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { getProResources } from '@/lib/strapi/queries';
import type { ProResourceCard } from '@/lib/strapi/types';
import { getServerUserState } from '@/lib/auth/server-user-state';
import ProContentClient from './ProContentClient';

export const metadata: Metadata = {
  title: 'Contenido PRO | Máxima Formación',
  description:
    'Recursos exclusivos para suscriptores PRO: apps web, HTML interactivo, bases de datos y plantillas.',
  alternates: { canonical: '/pro-content' },
};

export const revalidate = 60;

export default async function ProContentPage() {
  const { isEnabled: isDraft } = await draftMode();

  let resources: ProResourceCard[] = [];
  try {
    resources = await getProResources({ draft: isDraft });
  } catch {
    // Strapi unavailable
  }

  // Estado PRO del visitante (server-side) para el escaparate: si no es PRO, las
  // tarjetas muestran candado y el contenido real solo se sirve en la ruta
  // gateada /pro-content/[slug].
  const { hasPro } = await getServerUserState();

  return <ProContentClient resources={resources} hasPro={hasPro} />;
}
