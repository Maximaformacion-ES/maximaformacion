import type { Metadata } from 'next';
import { getConocenosSection, getTeamMembers } from '@/lib/strapi/queries';
import ConocenosClient from './ConocenosClient';

export const metadata: Metadata = {
  title: 'Conócenos | Máxima Formación',
  description: 'Conoce al equipo de Máxima Formación. Profesionales apasionados por la educación, la ciencia de datos y la innovación al servicio de tu desarrollo profesional.',
};

// ISR: Revalidar cada hora
export const revalidate = 3600;

export default async function ConocenosPage() {
  const [heroData, teamMembers] = await Promise.all([
    getConocenosSection(),
    getTeamMembers(),
  ]);

  return <ConocenosClient heroData={heroData} teamMembers={teamMembers} />;
}
