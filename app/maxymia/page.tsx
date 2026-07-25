import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMaxymiaHome } from '@/lib/strapi/queries';
import { fetchMaxymiaCourses, getFeaturedCourses } from './data/queries';
import MaxymiaClient from './MaxymiaClient';

export const metadata: Metadata = {
  title: 'Maxymia | Campus IA Aplicada a Ciencias',
  description: 'Maxymia es el campus de inteligencia artificial aplicada a ciencias de Máxima Formación. Formación avanzada en IA, machine learning y ciencia de datos.',
  alternates: { canonical: '/maxymia' },
};

export default async function MaxymiaPage() {
  const [maxymiaData, allCourses] = await Promise.all([
    getMaxymiaHome(),
    fetchMaxymiaCourses().catch(() => []),
  ]);

  // Si Strapi está caído (p. ej. un 503 transitorio DURANTE EL BUILD), maxymiaData
  // viene null. Antes se pasaba con `data={homeData!}` y MaxymiaClient crasheaba en
  // `hero`, tumbando TODO el deploy. notFound() es recuperable: la página revalida
  // (revalidate de la query) y se regenera cuando Strapi vuelve.
  if (!maxymiaData) notFound();

  const topCourses = getFeaturedCourses(allCourses, 8);

  return <MaxymiaClient data={maxymiaData} courses={topCourses} />;
}
