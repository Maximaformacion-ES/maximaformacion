import { getInnovacionSection } from '@/lib/strapi/queries';
import InnovacionClient from './InnovacionClient';

export default async function InnovacionPage() {
  const heroData = await getInnovacionSection();

  return <InnovacionClient heroData={heroData} />;
}
