import type { Metadata } from 'next';
import { getNonTeacherAuthors } from '@/lib/strapi/queries';
import AutoresClient from './AutoresClient';

export const metadata: Metadata = {
  title: 'Autores | Máxima Formación',
  description:
    'Conoce a las personas que firman los artículos, recursos y trabajos publicados en Máxima Formación: colaboradores, alumni, investigadores y profesionales del sector.',
  alternates: { canonical: '/autores' },
};

export const revalidate = 3600;

export default async function AutoresPage() {
  const authors = await getNonTeacherAuthors();
  return <AutoresClient authors={authors} />;
}
