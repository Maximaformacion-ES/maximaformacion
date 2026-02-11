import { getConocenosSection, getTeamMembers } from '@/lib/strapi/queries';
import ConocenosClient from './ConocenosClient';

// ISR: Revalidar cada hora
export const revalidate = 3600;

export default async function ConocenosPage() {
  const [heroData, teamMembers] = await Promise.all([
    getConocenosSection(),
    getTeamMembers(),
  ]);

  return <ConocenosClient heroData={heroData} teamMembers={teamMembers} />;
}
