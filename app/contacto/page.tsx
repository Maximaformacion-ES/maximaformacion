import type { Metadata } from 'next';
import { listCourses } from '@/lib/admin/courses';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contacto | Máxima Formación',
  description: 'Contacta con Máxima Formación. Resuelve dudas sobre nuestras formaciones online en ciencia de datos, IA, salud o Moodle, o consulta sobre programas a medida para empresas.',
  alternates: { canonical: '/contacto' },
};

export default async function ContactoPage({
  searchParams,
}: {
  searchParams: Promise<{ curso?: string }>;
}) {
  // El selector de curso evita el eterno "¿a qué curso te refieres?": la lista
  // sale de Strapi (programas + Maxymia) y `?curso=` permite que las fichas de
  // curso lleguen con el curso ya preseleccionado.
  const [sp, courses] = await Promise.all([searchParams, listCourses().catch(() => [])]);
  return (
    <ContactClient
      courses={courses.map((c) => c.title)}
      initialCourse={sp.curso?.trim() || undefined}
    />
  );
}
