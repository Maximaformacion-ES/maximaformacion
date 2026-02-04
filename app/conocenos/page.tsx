import { getConocenosSection } from '@/lib/strapi/queries';
import ConocenosClient from './ConocenosClient';

// ISR: Revalidar cada hora
export const revalidate = 3600;

export default async function ConocenosPage() {
  const heroData = await getConocenosSection();

  return <ConocenosClient heroData={heroData} />;
}
