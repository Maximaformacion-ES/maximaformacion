import { getConocenosSection } from '@/lib/strapi/queries';
import ConocenosClient from './ConocenosClient';

export default async function ConocenosPage() {
  const heroData = await getConocenosSection();

  return <ConocenosClient heroData={heroData} />;
}
