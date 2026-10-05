import { notFound, redirect } from 'next/navigation';
import { fetchMaxymiaCourseOverviewBySlug } from '@/app/maxymia/data/queries';
import { getServerUserState } from '@/lib/auth/server-user-state';
import type { PurchaseItem } from '../../types';
import ComprarClient from '../../ComprarClient';

export const dynamic = 'force-dynamic';

// Mismas etiquetas que la ficha (MaxymiaCourseDetail), solo en castellano.
const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};
const LANGUAGE_LABELS: Record<string, string> = {
  es: 'Español',
  en: 'English',
  bilingual: 'Bilingüe',
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Compra directa de un curso Maxymia (misma pantalla que /comprar/[slug]). */
export default async function ComprarMaxymiaPage({ params }: PageProps) {
  const { slug } = await params;
  const [course, initialUserState] = await Promise.all([
    fetchMaxymiaCourseOverviewBySlug(slug),
    getServerUserState(),
  ]);

  if (!course) notFound();

  const fichaHref = `/maxymia/campus/${course.slug}`;
  if (course.proOnly) redirect('/pricing');
  if (!course.price || course.price <= 0) redirect(fichaHref);

  const item: PurchaseItem = {
    kind: 'maxymia',
    slug: course.slug,
    title: course.title.es || course.title.en || 'Curso',
    image: course.image || null,
    price: course.price,
    originalPrice: course.originalPrice ?? null,
    isPro: !!course.isPro,
    haveDiscount: course.haveDiscount === true,
    accessId: course.id,
    checkoutBody: {
      type: 'maxymia-course',
      documentId: course.id,
      slug: course.slug,
    },
    fichaHref,
    accesoHref: fichaHref,
    selfPath: `/comprar/maxymia/${course.slug}`,
    details: [
      { label: 'Modalidad', value: 'Online' },
      { label: 'Idioma', value: LANGUAGE_LABELS[course.language] || course.language },
      { label: 'Nivel', value: LEVEL_LABELS[course.level] ?? '' },
      { label: 'Duración', value: course.durationHours ? `${course.durationHours} horas` : '' },
    ].filter((d) => !!d.value),
  };

  return <ComprarClient item={item} initialUserState={initialUserState} />;
}
