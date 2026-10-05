import { notFound, redirect } from 'next/navigation';
import { getProgramBySlug } from '@/lib/strapi/queries';
import { getServerUserState } from '@/lib/auth/server-user-state';
import { getPackCourseByFichaSlug } from '@/app/data/pack-cursos';
import type { PurchaseItem } from '../types';
import ComprarClient from '../ComprarClient';

// Lee auth() → dinámica por petición (el fetch a Strapi sigue cacheado 60 s).
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Compra directa de un programa de /programas. Aquí llega el botón
 * "Matricúlate ahora" cuando el visitante no tiene sesión: en la misma
 * pantalla ve el resumen del curso, el botón de comprar y el formulario para
 * crear cuenta o iniciar sesión (sin tener que volver a la ficha).
 */
export default async function ComprarProgramaPage({ params }: PageProps) {
  const { slug } = await params;
  const [program, initialUserState] = await Promise.all([
    getProgramBySlug(slug, false),
    getServerUserState(),
  ]);

  if (!program) notFound();

  const fichaHref = `/programas/${program.slug}`;
  // Casos sin checkout propio: el máster se consulta por formulario, el
  // exclusivo PRO solo con suscripción y los cursos del pack UCAV se compran
  // sin cuenta desde su ficha. En todos, de vuelta a donde sí se puede.
  if (program.proOnly) redirect('/pricing');
  if (program.type === 'Master' || !program.price || program.price <= 0) redirect(fichaHref);
  if (getPackCourseByFichaSlug(program.slug)) redirect(fichaHref);

  const durationDisplay = program.durationLabel
    ? program.durationLabel
    : program.duration
      ? `${program.duration} horas`
      : null;

  const item: PurchaseItem = {
    kind: 'program',
    slug: program.slug,
    title: program.title,
    image: program.image && program.image !== '/placeholder-course.svg' ? program.image : null,
    price: program.price,
    originalPrice: program.originalPrice ?? null,
    isPro: !!program.isPro,
    haveDiscount: program.haveDiscount === true,
    type: program.type,
    accessId: program.documentId,
    checkoutBody: {
      type: 'course',
      documentId: program.documentId || String(program.id),
      programId: String(program.id),
    },
    fichaHref,
    accesoHref: `/cursos/${program.documentId || program.id}`,
    selfPath: `/comprar/${program.slug}`,
    details: [
      { label: 'Modalidad', value: program.format },
      { label: 'Duración', value: durationDisplay ?? '' },
      { label: 'Certificación', value: program.certification },
      { label: 'Créditos', value: program.ects ? `${program.ects} ECTS` : '' },
      { label: 'Inicio', value: program.startDate },
    ].filter((d) => !!d.value),
  };

  return <ComprarClient item={item} initialUserState={initialUserState} />;
}
