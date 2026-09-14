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
  // Si Strapi está caído en runtime, los fetchers LANZAN (StrapiUnavailableError):
  // en una revalidación ISR Next conserva la última versión buena de la página y
  // en un primer render se sirve la página de error (no cacheable) en vez de un
  // 404 cacheado. Durante `next build` degradan a null/[] para no tumbar el
  // deploy; entonces notFound() es recuperable porque la página revalida sola.
  const [maxymiaData, allCourses] = await Promise.all([getMaxymiaHome(), fetchMaxymiaCourses()]);
  if (!maxymiaData) notFound();

  const topCourses = getFeaturedCourses(allCourses, 8);

  return <MaxymiaClient data={maxymiaData} courses={topCourses} />;
}
