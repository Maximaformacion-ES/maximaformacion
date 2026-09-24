import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTeacherBySlug } from '@/lib/strapi/queries';
import type { Docente } from '@/app/components/DocenteSection';
import { PACK_COURSES, courseLandingPath, getPackCourse } from '@/app/data/pack-cursos';
import CursoClient from './CursoClient';

// Ficha individual de cada curso del pack universitario (UCAV). Nace para el
// curso de Atención Educativa y SAAC, que se vende solo a 195 € y necesita una
// landing propia para campañas (es la formación que se pide para una plaza de
// profesorado); los otros dos cursos la tienen igual porque salen de los
// mismos datos. Se cobra por Stripe sin crear matrícula, como el pack.

// Mismo docente que el pack: José Antonio Lorente (ver /pack-cursos-universitarios).
const DOCENTE_SLUG = 'jose-ant-lorente';

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return PACK_COURSES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const course = getPackCourse(id);
  if (!course) return {};
  return {
    title: `${course.shortTitle} · Curso Universitario (${course.ects} ECTS) | Máxima Formación`,
    description: `${course.summary} Certificado Universitario de la UCAV, ${course.ects} ECTS (${course.hours} horas), 100 % online, por ${course.price} €.`,
    alternates: { canonical: courseLandingPath(course.id) },
  };
}

export default async function CursoUniversitarioPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const course = getPackCourse(id);
  if (!course) notFound();

  const teacher = await getTeacherBySlug(DOCENTE_SLUG).catch(() => null);
  const docentes: Docente[] | undefined = teacher
    ? [
        {
          documentId: teacher.documentId,
          slug: teacher.slug,
          name: teacher.name,
          role: teacher.role,
          avatar: teacher.avatarUrl,
          bio: teacher.bio,
          linkedin: teacher.linkedin,
          email: teacher.email,
        },
      ]
    : undefined;

  return <CursoClient course={course} docentes={docentes} />;
}
