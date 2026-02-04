import { getInnovacionSection } from '@/lib/strapi/queries';
import InnovacionClient from './InnovacionClient';

// ISR: Revalidar cada hora
export const revalidate = 3600;

export default async function InnovacionPage() {
  const heroData = await getInnovacionSection();

  return <InnovacionClient heroData={heroData} />;
}
