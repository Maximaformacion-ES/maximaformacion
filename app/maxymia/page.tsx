import type { Metadata } from 'next';
import { getMaxymiaHome } from '@/lib/strapi/queries';
import { fetchMaxymiaCourses, getBestRatedCourses } from './data/queries';
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

  const homeData = maxymiaData;
  const topCourses = getBestRatedCourses(allCourses, 8);

  return <MaxymiaClient data={homeData!} courses={topCourses} />;
}
