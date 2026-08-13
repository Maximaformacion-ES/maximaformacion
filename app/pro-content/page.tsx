import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { getProResources, getPrograms } from '@/lib/strapi/queries';
import { fetchMaxymiaCourses } from '@/app/maxymia/data/queries';
import { maxymiaCourseAsProgram } from '@/app/maxymia/data/adapters';
import type { ProResourceCard, Program } from '@/lib/strapi/types';
import { getServerUserState } from '@/lib/auth/server-user-state';
import ProContentClient from './ProContentClient';

export const metadata: Metadata = {
  title: 'Contenido PRO | Máxima Formación',
  description:
    'Recursos exclusivos para suscriptores PRO: apps web, HTML interactivo, bases de datos y plantillas.',
  alternates: { canonical: '/pro-content' },
};

export const revalidate = 60;

export default async function ProContentPage() {
  const { isEnabled: isDraft } = await draftMode();

  let resources: ProResourceCard[] = [];
  try {
    resources = await getProResources({ draft: isDraft });
  } catch {
    // Strapi unavailable
  }

  // Cursos incluidos en PRO: TODOS los `isPro` (mini-cursos proOnly + cursos que
  // también se venden, tipo "Fraude de datos"). includeProOnly=true para que los
  // exclusivos PRO aparezcan aquí aunque no estén en el catálogo. Se unifican
  // programas + cursos Maxymia (vía el adaptador) en la forma Program.
  let proCourses: Program[] = [];
  try {
    const [programsRes, maxymiaCourses] = await Promise.all([
      getPrograms({ isPro: true, includeProOnly: true, limit: 100, draft: isDraft }).catch(() => ({ programs: [] as Program[] })),
      fetchMaxymiaCourses({ includeProOnly: true }).catch(() => []),
    ]);
    proCourses = [
      ...programsRes.programs,
      ...maxymiaCourses.filter((c) => c.isPro).map(maxymiaCourseAsProgram),
    ].sort((a, b) => a.title.localeCompare(b.title, 'es'));
  } catch {
    // Strapi unavailable
  }

  // Estado PRO del visitante (server-side) para el escaparate: si no es PRO, las
  // tarjetas muestran candado y el contenido real solo se sirve en la ruta
  // gateada /pro-content/[slug].
  const { hasPro } = await getServerUserState();

  return <ProContentClient resources={resources} proCourses={proCourses} hasPro={hasPro} />;
}
