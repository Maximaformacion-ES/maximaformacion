import type { Metadata } from 'next';
import { getMaxymiaHome } from '@/lib/strapi/queries';
import { getPrograms } from '@/lib/strapi/queries';
import { MAXYMIA_HOME_FALLBACK } from '@/app/data/maxymia-fallback';
import MaxymiaClient from './MaxymiaClient';

export const metadata: Metadata = {
  title: 'Maxymia | Campus IA Aplicada a Ciencias',
  description: 'Maxymia es el campus de inteligencia artificial aplicada a ciencias de Máxima Formación. Formación avanzada en IA, machine learning y ciencia de datos.',
};

export default async function MaxymiaPage() {
  const [maxymiaData, programsResult] = await Promise.all([
    getMaxymiaHome(),
    getPrograms({ featured: true, limit: 4 }).catch(() => ({ programs: [], total: 0, pageCount: 0 })),
  ]);

  const homeData = maxymiaData || MAXYMIA_HOME_FALLBACK;
  const programs = programsResult.programs;

  return <MaxymiaClient data={homeData} programs={programs} />;
}
