import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { getProgramBySlug, getTeachers, getPrograms, getBadges, getInstitutions } from '@/lib/strapi/queries';
import type { Docente } from '@/app/components/DocenteSection';
import { markdownToHtml } from '@/lib/markdown';
import { JsonLd } from '@/app/components/JsonLd';
import { breadcrumbSchema, courseSchema, faqSchema } from '@/lib/seo/jsonld';
import { getServerUserState } from '@/lib/auth/server-user-state';
import ProgramDetailClient from './ProgramDetailClient';

export interface ProgramRichHtml {
  longDescription: string;
  objectives: string;
  audience: string;
  careers: string;
}

// Page becomes dynamic the moment we read auth() inside the server
// component. The Strapi queries below still use their own revalidate
// (60s) so we don't hit the CMS per request — auth check is the only
// per-request work.
export const dynamic = 'force-dynamic';

interface ProgramPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ProgramPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.id;

  const program = await getProgramBySlug(slug, false);

  if (program) {
    return {
      title: `${program.title} | Máxima Formación`,
      description: program.description,
      alternates: { canonical: `/programas/${program.slug}` },
      ...(program.noIndex && {
        robots: { index: false, follow: false },
      }),
    };
  }

  return {
    title: 'Programa | Máxima Formación',
    description: 'Descubre este programa formativo de Máxima Formación. Formación de calidad en estadística, ciencia de datos e innovación.',
    alternates: { canonical: `/programas/${slug}` },
  };
}

// generateStaticParams removed: the page is now `force-dynamic` so we
// can read auth() per request. Strapi fetches inside getProgramBySlug
// keep their own revalidate=60 cache, so we don't hit the CMS per
// request — just one DB round-trip for getServerUserState.

export default async function ProgramPage({ params }: ProgramPageProps) {
  const { isEnabled: isDraft } = await draftMode();
  const resolvedParams = await params;
  const slug = resolvedParams.id;

  // Fetch the program and the visitor's auth state in parallel — the
  // Strapi call is cached (revalidate=60) so this only adds one DB
  // round-trip per request, not a full Strapi fetch.
  // El equipo docente (avatares para la sección de compromiso + perfil
  // completo para enriquecer los docentes del programa) y el catálogo de
  // programas (para los recomendados) también van cacheados (revalidate=60).
  const [program, initialUserState, teachers, programsRes, allBadges, allInstitutions] =
    await Promise.all([
      getProgramBySlug(slug, isDraft),
      getServerUserState(),
      getTeachers(),
      getPrograms({ limit: 100 }),
      // Set GLOBAL de sellos e instituciones: se muestran TODOS en todas las
      // fichas (no por relación del programa en Strapi).
      getBadges(),
      getInstitutions(),
    ]);

  // Avatares del equipo docente completo (sección "Atención al alumnado").
  const teacherAvatars = teachers
    .map((t) => t.avatarUrl)
    .filter((url): url is string => !!url);

  // Enriquecer los docentes del programa con el perfil completo del author
  // (bio, email, LinkedIn) cruzando por slug — `getTeachers()` los trae todos
  // de una sola consulta, así que esto no añade round-trips extra.
  const teacherBySlug = new Map(teachers.map((t) => [t.slug, t]));
  const docentes: Docente[] = (program?.docentes ?? []).map((d) => {
    const full = d.slug ? teacherBySlug.get(d.slug) : undefined;
    return {
      documentId: d.documentId,
      slug: d.slug,
      name: d.name,
      role: d.role,
      roleDescription: full?.role ?? d.role ?? null,
      avatar: d.avatar || full?.avatarUrl || null,
      bio: full?.bio ?? null,
      linkedin: full?.linkedin ?? null,
      email: full?.email ?? null,
    };
  });

  // Recomendados: misma área temática primero, luego el resto; excluye el actual.
  const otherPrograms = programsRes.programs.filter((p) => p.slug !== program?.slug);
  const sameArea = otherPrograms.filter(
    (p) => !!program?.subjectArea && p.subjectArea === program.subjectArea,
  );
  const recommended = [
    ...sameArea,
    ...otherPrograms.filter((p) => !(!!program?.subjectArea && p.subjectArea === program.subjectArea)),
  ].slice(0, 4);

  const schemas = program
    ? [
        courseSchema(program),
        breadcrumbSchema([
          { name: 'Inicio', url: '/' },
          { name: 'Programas', url: '/programas' },
          { name: program.title, url: `/programas/${program.slug}` },
        ]),
        ...(program.faqs && program.faqs.length > 0 ? [faqSchema(program.faqs)] : []),
      ]
    : [];

  // Pre-render the long-form markdown server-side so the bot sees the
  // full body of the program in the initial HTML. Without this each
  // markdown field stayed empty until JS hydration finished (the old
  // MarkdownContent client component returned null on first paint),
  // burying 500-1000 words per page from the SEO crawler.
  const richHtml: ProgramRichHtml = program
    ? {
        longDescription: program.longDescription
          ? await markdownToHtml(program.longDescription)
          : '',
        objectives: program.objectives ? await markdownToHtml(program.objectives) : '',
        audience: program.audience ? await markdownToHtml(program.audience) : '',
        careers: program.careers ? await markdownToHtml(program.careers) : '',
      }
    : { longDescription: '', objectives: '', audience: '', careers: '' };

  return (
    <>
      {schemas.length > 0 && <JsonLd data={schemas} />}
      <ProgramDetailClient
        program={program}
        richHtml={richHtml}
        initialUserState={initialUserState}
        docentes={docentes}
        teacherAvatars={teacherAvatars}
        recommended={recommended}
        allBadges={allBadges}
        allInstitutions={allInstitutions}
      />
    </>
  );
}
