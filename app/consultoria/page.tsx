import type { Metadata } from 'next';
import { getConsultoriaSection, getLogos } from '@/lib/strapi/queries';
import ConsultoriaClient from './ConsultoriaClient';

export const metadata: Metadata = {
  title: 'Consultoría | Máxima Formación',
  description: 'Servicios de consultoría especializada en estadística, ciencia de datos y análisis. Soluciones a medida para empresas e instituciones.',
};

// ISR: Revalidar cada hora
export const revalidate = 3600;

export default async function ConsultoriaPage() {
  const [heroData, logos] = await Promise.all([
    getConsultoriaSection(),
    getLogos(6),
  ]);

  return <ConsultoriaClient heroData={heroData} logos={logos} />;
}
