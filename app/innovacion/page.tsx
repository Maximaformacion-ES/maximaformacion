import type { Metadata } from 'next';
import { getInnovacionSection } from '@/lib/strapi/queries';
import InnovacionClient from './InnovacionClient';

export const metadata: Metadata = {
  title: 'Innovación | Biomáxima | Máxima Formación',
  description: 'Descubre Biomáxima, nuestra división de innovación. Soluciones biotecnológicas y proyectos de investigación aplicada al servicio de la sociedad.',
};

// ISR: Revalidar cada hora
export const revalidate = 3600;

export default async function InnovacionPage() {
  const heroData = await getInnovacionSection();

  return <InnovacionClient heroData={heroData} />;
}
