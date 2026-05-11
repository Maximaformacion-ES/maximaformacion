import type { Metadata } from 'next';
import { getTeachers } from '@/lib/strapi/queries';
import ProfesoradoClient from './ProfesoradoClient';

export const metadata: Metadata = {
  title: 'Profesorado | Máxima Formación',
  description:
    'Conoce al equipo docente de Máxima Formación: especialistas en estadística, bioestadística, ciencia de datos, R, machine learning e investigación científica.',
  alternates: { canonical: '/profesorado' },
  openGraph: {
    title: 'Profesorado | Máxima Formación',
    description: 'Equipo docente especializado en estadística y ciencia de datos.',
    type: 'website',
  },
};

export const revalidate = 3600;

export default async function ProfesoradoPage() {
  const teachers = await getTeachers();
  return <ProfesoradoClient teachers={teachers} />;
}
