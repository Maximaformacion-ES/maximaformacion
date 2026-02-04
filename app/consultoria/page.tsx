import { getConsultoriaSection } from '@/lib/strapi/queries';
import ConsultoriaClient from './ConsultoriaClient';

// ISR: Revalidar cada hora
export const revalidate = 3600;

export default async function ConsultoriaPage() {
  const heroData = await getConsultoriaSection();

  return <ConsultoriaClient heroData={heroData} />;
}
