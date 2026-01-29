import { getConsultoriaSection } from '@/lib/strapi/queries';
import ConsultoriaClient from './ConsultoriaClient';

export default async function ConsultoriaPage() {
  const heroData = await getConsultoriaSection();

  return <ConsultoriaClient heroData={heroData} />;
}
