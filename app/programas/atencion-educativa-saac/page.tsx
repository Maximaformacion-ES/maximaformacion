import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTeachers, getPrograms, getBadges, getInstitutions, getVideoTestimonials } from '@/lib/strapi/queries';
import type { Program } from '@/lib/strapi/types';
import type { Docente } from '@/app/components/DocenteSection';
import { markdownToHtml } from '@/lib/markdown';
import { JsonLd } from '@/app/components/JsonLd';
import { breadcrumbSchema, courseSchema, faqSchema } from '@/lib/seo/jsonld';
import { getServerUserState } from '@/lib/auth/server-user-state';
import { getPackCourseByFichaSlug, courseFichaPath, type PackCourse } from '@/app/data/pack-cursos';
import ProgramDetailClient from '../[id]/ProgramDetailClient';
import type { ProgramRichHtml } from '../[id]/page';

// Ficha del Curso Universitario de Atención Educativa y SAAC (UCAV, 6 ECTS,
// 195 €). Es un curso del pack universitario: NO existe en Strapi ni en el
// campus, así que no puede salir por /programas/[id]. Esta ruta ESTÁTICA gana
// a la dinámica y pinta EXACTAMENTE la misma ficha (ProgramDetailClient) a
// partir de un `Program` construido con app/data/pack-cursos.ts. La única
// diferencia es la compra: sin cuenta, por /api/pack/checkout (modal
// nombre+email del pack). El cliente la pidió como landing de campaña: es la
// formación que se exige para una plaza de profesorado.

const SLUG = 'atencion-educativa-saac';
const DOCENTE_SLUG = 'jose-ant-lorente';

export const dynamic = 'force-dynamic';

/** Construye el `Program` que espera la ficha a partir del curso del pack. */
function toProgram(course: PackCourse & { ficha: NonNullable<PackCourse['ficha']> }): Program {
  const hoursPerModule = Math.round(course.hours / course.modules.length);
  const details = course.moduleDetails ?? [];
  return {
    id: 0,
    documentId: `pack-${course.id}`,
    type: 'Curso',
    title: course.title,
    slug: course.ficha.slug,
    duration: course.hours,
    durationLabel: `${course.hours} horas`,
    ects: course.ects,
    tags: ['Educación inclusiva', 'SAAC', 'Discapacidad motora'],
    topics: [],
    featured: false,
    description: course.summary,
    longDescription: course.ficha.longDescription,
    image: course.image ?? '/placeholder-course.svg',
    format: 'Online',
    language: 'Español',
    startDate: '5 de octubre de 2026',
    certification: 'Certificado Universitario UCAV',
    price: course.price,
    faqs: course.ficha.faqs,
    subjectArea: 'Educación',
    modules: course.modules.map((title) => {
      const d = details.find((x) => x.title === title);
      return {
        title,
        description: d?.theory ?? '',
        hours: hoursPerModule,
        units: d ? [{ title: `Teoría: ${d.theory}` }, { title: `Práctica: ${d.practice}` }] : [],
      };
    }),
    audience: course.ficha.audience,
    careers: course.ficha.careers,
    objectives: course.ficha.objectives,
    extraSections: course.ficha.extraSections,
    isPro: false,
    haveDiscount: false,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const course = getPackCourseByFichaSlug(SLUG);
  if (!course) return {};
  return {
    title: `${course.title} | Máxima Formación`,
    description: `${course.summary} Certificado Universitario UCAV, ${course.ects} ECTS (${course.hours} h), 100 % online, ${course.price} €.`,
    alternates: { canonical: `/programas/${SLUG}` },
  };
}

export default async function SaacProgramPage() {
  const course = getPackCourseByFichaSlug(SLUG);
  if (!course?.ficha) notFound();
  const program = toProgram(course as PackCourse & { ficha: NonNullable<PackCourse['ficha']> });

  // Mismas cargas que /programas/[id] para que la ficha sea idéntica
  // (equipo docente, recomendados, sellos, instituciones, testimonios).
  const [initialUserState, teachers, programsRes, allBadges, allInstitutions, videoTestimonials] =
    await Promise.all([
      getServerUserState(),
      getTeachers().catch(() => []),
      getPrograms({ limit: 100 }).catch(() => ({ programs: [] as Program[] })),
      getBadges().catch(() => []),
      getInstitutions().catch(() => []),
      getVideoTestimonials().catch(() => []),
    ]);

  const teacherAvatars = teachers
    .map((t) => t.avatarUrl)
    .filter((url): url is string => !!url);

  const teacher = teachers.find((t) => t.slug === DOCENTE_SLUG);
  const docentes: Docente[] = teacher
    ? [
        {
          documentId: teacher.documentId,
          slug: teacher.slug,
          name: teacher.name,
          role: teacher.role,
          roleDescription: teacher.role ?? null,
          avatar: teacher.avatarUrl,
          bio: teacher.bio,
          linkedin: teacher.linkedin,
          email: teacher.email,
        },
      ]
    : [];

  // Recomendados: primero el área de Moodle/eXe/H5P (los otros dos cursos del
  // pack son de eso) y Educación; luego el resto.
  const others = programsRes.programs;
  const related = others.filter(
    (p) => p.subjectArea === 'Moodle / Exelearning / H5P' || p.subjectArea === 'Educación',
  );
  const recommended = [...related, ...others.filter((p) => !related.includes(p))].slice(0, 4);

  const schemas = [
    courseSchema(program),
    breadcrumbSchema([
      { name: 'Inicio', url: '/' },
      { name: 'Programas', url: '/programas' },
      { name: program.title, url: `/programas/${program.slug}` },
    ]),
    ...(program.faqs && program.faqs.length > 0 ? [faqSchema(program.faqs)] : []),
  ];

  const richHtml: ProgramRichHtml = {
    longDescription: await markdownToHtml(program.longDescription),
    objectives: await markdownToHtml(program.objectives),
    audience: await markdownToHtml(program.audience),
    careers: await markdownToHtml(program.careers),
    extraSections: await Promise.all(
      (program.extraSections ?? []).map(async (x) => ({
        title: x.title,
        icon: x.icon ?? null,
        html: await markdownToHtml(x.content),
      })),
    ),
  };

  return (
    <>
      <JsonLd data={schemas} />
      <ProgramDetailClient
        program={program}
        richHtml={richHtml}
        initialUserState={initialUserState}
        docentes={docentes}
        teacherAvatars={teacherAvatars}
        recommended={recommended}
        allBadges={allBadges}
        allInstitutions={allInstitutions}
        videoTestimonials={videoTestimonials}
        guestPurchase={{ item: course.id, returnPath: courseFichaPath(course)! }}
      />
    </>
  );
}
