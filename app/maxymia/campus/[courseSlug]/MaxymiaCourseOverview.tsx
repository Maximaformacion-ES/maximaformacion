'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMounted } from '@/app/hooks/useMounted';
import { m, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Clock,
  CheckCircle,
  ChevronDown,
  FileQuestion,
  Play,
  User,
  Monitor,
  Globe,
  GraduationCap,
  ArrowRight,
  Target,
  Users,
  Briefcase,
  Trophy,
  MessageCircle,
  RotateCcw,
  Award,
  X,
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { trackPurchaseOnce, stripeCustomerToUserData } from '@/lib/analytics';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import { useExamResults, type ExamResult } from '@/app/hooks/useExamResults';
import { useLocale } from '../../i18n/LocaleProvider';
import { getCourseMeta, getCourseProgressStats, isLessonComplete } from '../../data/queries';
import MaxymiaCourseDetail from './MaxymiaCourseDetail';
import { ContactCourse } from '@/app/components/ContactCourseProvider';
import { FontStyles } from '@/app/components/FontStyles';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { Breadcrumb } from '@/app/components/Breadcrumb';
import { maxymiaCategoryLabel } from '../../data/labels';
import Certificate from '../../components/Certificate';
import TutorQuestionModal from '../../components/TutorQuestionModal';
import type { MaxymiaCourse, MaxymiaBlock, MaxymiaCourseProgress, Locale } from '../../types';
import type { Badge, Institution, VideoTestimonial } from '@/lib/strapi/types';

const LEVEL_LABELS: Record<string, Record<Locale, string>> = {
  beginner: { es: 'Principiante', en: 'Beginner' },
  intermediate: { es: 'Intermedio', en: 'Intermediate' },
  advanced: { es: 'Avanzado', en: 'Advanced' },
};

const LANGUAGE_LABELS: Record<string, Record<Locale, string>> = {
  es: { es: 'Español', en: 'Spanish' },
  en: { es: 'Inglés', en: 'English' },
  bilingual: { es: 'Bilingüe', en: 'Bilingual' },
};

type TabId = 'description' | 'objectives' | 'audience' | 'careers';

interface Props {
  course: MaxymiaCourse;
  /** Server-resolved access for the first paint. While the client campus
   *  profile is still loading we trust this so a non-buyer sees the purchase
   *  view immediately instead of the student view flashing. */
  initialHasAccess?: boolean;
  /** `true`: la página va DENTRO del campus (CampusChrome: sidebar + cabecera).
   *  La vista de alumno no pinta Header/Footer del sitio y el hero se adapta
   *  al contenedor. `false`: sin matrícula, ficha de venta con chrome del sitio. */
  embedded?: boolean;
  /** Avatares del equipo docente para la sección de compromiso con el alumnado. */
  teacherAvatars?: string[];
  /** Cursos recomendados (relacionados) para la fila al pie de la ficha. */
  recommended?: MaxymiaCourse[];
  /** Set GLOBAL de sellos/instituciones: TODOS en todas las fichas. */
  allBadges?: Badge[];
  allInstitutions?: Institution[];
  videoTestimonials?: VideoTestimonial[];
}

export default function MaxymiaCourseOverview({ course, initialHasAccess, embedded = false, teacherAvatars, recommended, allBadges, allInstitutions, videoTestimonials }: Props) {
  const { locale } = useLocale();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTutorModal, setShowTutorModal] = useState(false);
  const { user } = useUser();
  const { hasAccess: checkAccess, courseProgress, isLoading, refetch } = useUserCampus();
  const { byExamId: examResultsByExamId } = useExamResults(course.id);
  const { totalLessons, totalMinutes, totalExams } = getCourseMeta(course);
  const searchParams = useSearchParams();
  const hasDescription = !!course.description?.[locale]?.trim();
  // Objetivos como pestaña inicial (es lo que el alumno quiere ver primero).
  const [activeTab, setActiveTab] = useState<TabId>('objectives');
  const [showCertificate, setShowCertificate] = useState(false);
  // El portal solo puede montarse en cliente; useMounted() da false en SSR/
  // hidratación y true tras montar, sin setState en efecto.
  const portalReady = useMounted();
  const [issuedCertificate, setIssuedCertificate] = useState<{
    id: string;
    verifyUrl: string;
    issuedAt: string;
    completedAt: string;
  } | null>(null);

  useEffect(() => {
    if (!showCertificate) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showCertificate]);

  // Verify purchase after Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const sessionId = searchParams.get('session_id');
    if (success === 'true' && sessionId) {
      fetch('/api/checkout/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.enrolled) {
            // Conversión GA4 + datos de usuario para conversiones mejoradas.
            let userData = stripeCustomerToUserData(data.customer);
            if (!userData?.email) {
              const email = user?.primaryEmailAddress?.emailAddress;
              if (email) {
                userData = {
                  ...userData,
                  email,
                  address: {
                    ...userData?.address,
                    first_name: userData?.address?.first_name ?? user?.firstName ?? undefined,
                    last_name: userData?.address?.last_name ?? user?.lastName ?? undefined,
                  },
                };
              }
            }
            const value: number = data.amountTotal ?? course.price;
            trackPurchaseOnce(sessionId, {
              items: [
                {
                  item_id: course.slug,
                  item_name: course.title[locale],
                  item_category: 'maxymia-course',
                  price: value,
                },
              ],
              value,
              userData,
            });
            window.history.replaceState({}, '', window.location.pathname);
            refetch();
          }
        })
        .catch(console.error);
    }
  }, [searchParams, refetch, user, course, locale]);

  // Build progress from courseProgress
  const progress: MaxymiaCourseProgress | null = useMemo(() => {
    const data = courseProgress[course.id];
    if (!data) return null;
    return {
      courseId: course.id,
      completedLessons: data.completedLessons,
      currentLessonId: data.currentLessonId,
      examResults: {},
      startedAt: data.startedAt ?? '',
      lastAccessedAt: data.lastAccessedAt ?? '',
    };
  }, [courseProgress, course.id]);

  const { completed: completedValidCount, percent: progressPercent, isCompleted: isFullyCompleted } =
    useMemo(
      () => getCourseProgressStats(course, progress?.completedLessons),
      [course, progress]
    );

  const completedSet = useMemo(
    () => new Set(progress?.completedLessons ?? []),
    [progress]
  );

  // Issue (or fetch existing) certificate when the modal opens and the course is fully completed.
  useEffect(() => {
    if (!showCertificate || !isFullyCompleted || issuedCertificate) return;
    let cancelled = false;
    fetch('/api/maxymia/certificate/issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: course.id,
        courseTitle: course.title[locale],
        instructor: course.instructor.name,
        completedAt: progress?.lastAccessedAt || new Date().toISOString(),
      }),
    })
      .then(async (res) => {
        if (res.ok) return res.json();
        const errorBody = await res.json().catch(() => ({}));
        console.warn('[certificate/issue] failed', res.status, errorBody);
        return null;
      })
      .then((data) => {
        if (cancelled || !data) return;
        setIssuedCertificate({
          id: data.id,
          verifyUrl: data.verifyUrl,
          issuedAt: data.issuedAt,
          completedAt: data.completedAt,
        });
      })
      .catch((err) => {
        console.warn('[certificate/issue] network error', err);
      });
    return () => {
      cancelled = true;
    };
  }, [showCertificate, isFullyCompleted, issuedCertificate, course.id, course.title, course.instructor.name, locale, progress?.lastAccessedAt]);

  // Find first incomplete lesson for CTA
  const firstIncompleteLessonId = useMemo(() => {
    for (const block of course.blocks) {
      for (const lesson of block.lessons) {
        if (!isLessonComplete(lesson, completedSet)) return lesson.id;
      }
    }
    return course.blocks[0]?.lessons[0]?.id;
  }, [course, completedSet]);

  // Lección y bloque de "Continúa donde lo dejaste" (la primera incompleta).
  // Sin useMemo manual: el React Compiler lo memoiza por su cuenta.
  const resumeInfo = findResumeInfo(course.blocks, firstIncompleteLessonId);

  // Find next lesson (first incomplete after last completed)
  const nextLessonId = useMemo(() => {
    let foundCurrent = false;
    for (const block of course.blocks) {
      for (const lesson of block.lessons) {
        if (!isLessonComplete(lesson, completedSet)) {
          if (foundCurrent || completedSet.size === 0) return lesson.id;
          return lesson.id;
        }
        foundCurrent = true;
      }
    }
    return course.blocks[0]?.lessons[0]?.id;
  }, [course, completedSet]);

  // Access must come from a current enrollment, or from a Pro plan only when
  // the course is explicitly `isPro: true` in Strapi. courseProgress is sticky
  // — once a user has started a course, the row stays in their progress even
  // after enrollment expires/is revoked, so deriving `enrolled` from it gave
  // permanent access to anyone who ever opened the course.
  // While the client profile is still loading, trust the server-resolved
  // access (purchase view by default for non-buyers) so the student view
  // never flashes; once loaded, the hook is the source of truth.
  const hasAccess = isLoading ? !!initialHasAccess : checkAccess(course.id, course.isPro);

  // Sin chrome del campus (el servidor no vio matrícula) y el cliente acaba de
  // confirmar acceso (checkout verificado arriba): la vista de alumno vive
  // dentro del campus, que solo pinta el servidor → recarga una vez.
  // sessionStorage evita un bucle si servidor y cliente discreparan.
  useEffect(() => {
    if (embedded || !hasAccess || isLoading) return;
    const key = `maxymia-chrome-reload:${course.slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      /* sin sessionStorage: recarga igualmente */
    }
    window.location.replace(window.location.pathname);
  }, [embedded, hasAccess, isLoading, course.slug]);

  // Show product/detail (purchase) page whenever the user isn't entitled.
  // Defaulting to this during load means "Comprar" shows first and only
  // switches to the student view once we've confirmed a real purchase.
  // Fuera del campus también mientras dura la recarga de arriba.
  if (!hasAccess || !embedded) {
    return (
      <MaxymiaCourseDetail
        course={course}
        standalone={!embedded}
        teacherAvatars={teacherAvatars}
        recommended={recommended}
        allBadges={allBadges}
        allInstitutions={allInstitutions}
        videoTestimonials={videoTestimonials}
      />
    );
  }

  const tabs: { id: TabId; label: Record<Locale, string>; icon: React.ElementType }[] = [
    { id: 'objectives', label: { es: 'Objetivos', en: 'Objectives' }, icon: Target },
    ...(hasDescription
      ? [{ id: 'description' as const, label: { es: 'Descripción', en: 'Description' }, icon: BookOpen }]
      : []),
    { id: 'audience', label: { es: 'A quién va dirigido', en: 'Who is this for' }, icon: Users },
    { id: 'careers', label: { es: 'Salidas profesionales', en: 'Career paths' }, icon: Briefcase },
  ];

  const lessonHref = (id: string | undefined) => `/maxymia/campus/${course.slug}/lesson/${id}`;
  const durationLabel = course.durationHours
    ? `${course.durationHours} h`
    : `${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}min`;
  const primaryLabel = isFullyCompleted
    ? (locale === 'es' ? 'Repasar el curso' : 'Review course')
    : progress
      ? (locale === 'es' ? 'Continuar' : 'Continue')
      : (locale === 'es' ? 'Empezar el curso' : 'Start course');
  const primaryHref = isFullyCompleted ? lessonHref(course.blocks[0]?.lessons[0]?.id) : lessonHref(firstIncompleteLessonId);

  // Indicadores: minutos pendientes y exámenes (lista plana con su bloque y
  // el enlace al examen, que cuelga de la última lección del bloque).
  let remainingMinutes = 0;
  for (const block of course.blocks) {
    for (const lesson of block.lessons) {
      if (!isLessonComplete(lesson, completedSet)) remainingMinutes += lesson.estimatedMinutes;
    }
  }
  const exams = course.blocks.flatMap((block, bi) =>
    block.lessons.length
      ? block.exams.map((exam, ei) => ({
          exam,
          blockIndex: bi,
          href: `/maxymia/campus/${course.slug}/lesson/${block.lessons[block.lessons.length - 1].id}/exam?index=${ei}`,
          result: examResultsByExamId[exam.id],
        }))
      : [],
  );
  const examsPassed = exams.filter((e) => e.result?.passed).length;
  const fmtMinutes = (min: number) =>
    min >= 60 ? `${Math.floor(min / 60)}h ${min % 60 ? `${min % 60}min` : ''}`.trim() : `${min} min`;
  const ringR = 26;
  const ringC = 2 * Math.PI * ringR;

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay },
  });

  // Insignias y tarjeta "Retomar": en ≥sm van dentro del panel del hero; en
  // móvil el panel solo lleva título y descripción y estas piezas bajan.
  const badges = (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="inline-block px-3 py-1 text-label-sm font-black tracking-[0.2em] uppercase rounded-full bg-mx-orange text-white">
        {maxymiaCategoryLabel(course.category, locale)}
      </span>
      <span className="inline-block px-3 py-1 text-label-sm font-medium tracking-wider uppercase rounded-full bg-mx-card/80 backdrop-blur-sm border border-mx-border text-mx-text-muted">
        {LEVEL_LABELS[course.level]?.[locale]}
      </span>
      {isFullyCompleted && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-label-sm font-bold tracking-wider uppercase rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/30">
          <Trophy size={11} /> {locale === 'es' ? 'Completado' : 'Completed'}
        </span>
      )}
    </div>
  );
  const resumeCard = (
    <div
      className="rounded-2xl border border-mx-orange/30 bg-mx-orange/[0.06] p-4 sm:p-6 mb-5 md:mb-8"
      aria-label={locale === 'es' ? 'Retomar el curso' : 'Resume course'}
    >
      <p className="text-label-sm font-semibold uppercase tracking-[0.18em] text-mx-orange mb-1.5">
        {isFullyCompleted
          ? (locale === 'es' ? 'Curso completado' : 'Course completed')
          : progress
            ? (locale === 'es' ? 'Continúa donde lo dejaste' : 'Pick up where you left off')
            : (locale === 'es' ? 'Tu primera lección' : 'Your first lesson')}
      </p>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          {isFullyCompleted ? (
            <p className="text-body-md font-semibold text-mx-text">
              {locale === 'es' ? 'Enhorabuena, has completado todas las lecciones.' : 'Congratulations, you completed every lesson.'}
            </p>
          ) : resumeInfo ? (
            <>
              <p className="text-body-md md:text-body-lg font-semibold text-mx-text line-clamp-1">{resumeInfo.lesson.title[locale]}</p>
              <p className="text-label-md text-mx-text-muted mt-0.5">
                {locale === 'es' ? 'Bloque' : 'Block'} {resumeInfo.blockIndex + 1} · {resumeInfo.lesson.estimatedMinutes} min
              </p>
            </>
          ) : null}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
              <div className={`h-full rounded-full ${isFullyCompleted ? 'bg-amber-400' : 'bg-mx-orange'}`} style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="text-label-md font-semibold text-mx-orange whitespace-nowrap">{progressPercent}%</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {isFullyCompleted && (
            <button
              onClick={() => setShowCertificate(true)}
              className="inline-flex items-center justify-center gap-2 bg-mx-orange text-white px-5 py-3 rounded-lg text-body-sm font-medium hover:bg-mx-orange-dark transition-colors"
            >
              <Award size={16} /> {locale === 'es' ? 'Ver certificado' : 'View certificate'}
            </button>
          )}
          <Link
            href={primaryHref}
            className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-body-sm font-medium transition-colors ${
              isFullyCompleted
                ? 'border border-mx-orange/50 text-mx-orange hover:bg-mx-orange/10'
                : 'bg-mx-orange text-white hover:bg-mx-orange-dark'
            }`}
          >
            {isFullyCompleted ? <RotateCcw size={16} /> : <Play size={16} fill="currentColor" />}
            {primaryLabel}
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className={embedded ? 'w-full' : 'min-h-screen bg-mx-bg text-mx-text overflow-x-clip'}>
      {!embedded && <FontStyles />}
      {/* Header/footer enlazan a /contacto?curso=<este curso> */}
      <ContactCourse title={course.title.es || course.title[locale]} />
      {!embedded && <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />}

      <main className={embedded ? 'relative' : 'relative z-10 pb-16 md:pb-24'}>
        {/* ─── 1. Hero a sangre (estilo ficha del pack): la imagen del curso
            ocupa todo el hero y el contenido va abajo a la izquierda sobre
            el fundido hacia el fondo de la página. ─── */}
        {/* Altura algo menor que la ventana (≈86 %) para que el borde inferior
            del panel blanco y sus curvas queden a la vista sin hacer scroll. */}
        <section
          className={
            embedded
              // Dentro del campus: tarjeta a todo el ancho del contenido, con la
              // pestaña del breadcrumb colgando de su borde superior y el panel
              // saliendo del inferior (ambos hacia el fondo de la página).
              ? 'relative overflow-hidden rounded-2xl min-h-[calc(78dvh-56px)] flex flex-col'
              : 'relative overflow-hidden mt-[72px] sm:mt-[96px] min-h-[calc(86dvh-72px)] sm:min-h-[calc(86dvh-96px)] flex flex-col'
          }
        >
          {/* Imagen a sangre cubriendo TODO el hero, con fundidos para que el
              texto y la tarjeta de retomar (dentro del hero) se lean. */}
          <div className="absolute inset-0">
            <Image src={course.image} alt="" fill priority sizes="100vw" className="object-cover object-center" unoptimized />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-mx-bg/60 to-transparent" />
            <div className="absolute inset-0 bg-black/[0.06]" />
          </div>

          <div className={`relative flex-1 flex flex-col w-full ${embedded ? 'px-5 md:px-8' : 'max-w-[1400px] mx-auto px-6 md:px-12'}`}>
            {/* Breadcrumb arriba del todo: pestaña blanca que "cuelga" del
                header, con las esquinas inferiores redondeadas. */}
            <m.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="self-start max-w-full"
            >
              <div className="relative inline-block max-w-full rounded-b-2xl bg-mx-bg px-5 py-3 shadow-[0_8px_24px_-12px_rgba(26,26,26,0.25)]">
                <Fillet at="bl" className="top-0 -left-4" />
                <Fillet at="br" className="top-0 -right-4" />
                <Breadcrumb
                  items={[
                    { label: 'Campus', href: '/maxymia/campus' },
                    { label: locale === 'es' ? 'Mis cursos' : 'My courses', href: '/maxymia/campus/mis-cursos' },
                    { label: course.title[locale] },
                  ]}
                  className=""
                />
              </div>
            </m.div>

            {/* Contenido abajo a la izquierda: panel blanco que sale del borde
                inferior del hero, con las esquinas superiores redondeadas
                (espejo de la pestaña del breadcrumb). */}
            <m.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="relative mt-auto self-start w-full max-w-3xl rounded-t-2xl bg-mx-bg px-4 sm:px-6 md:px-8 pt-5 sm:pt-6 md:pt-8 shadow-[0_-8px_24px_-12px_rgba(26,26,26,0.25)]"
            >
              <Fillet at="tl" className="bottom-0 -left-4" />
              <Fillet at="tr" className="bottom-0 -right-4" />
              <div className="hidden sm:flex sm:flex-wrap sm:items-center">{badges}</div>
              <h1 className="text-[24px] sm:text-[30px] text-balance md:text-heading-lg lg:text-display-sm font-black tracking-tight leading-[1.05] text-mx-blue mb-3 max-w-3xl">
                {course.title[locale]}
              </h1>
              <p className="text-mx-text-muted text-label-md sm:text-body-sm md:text-body-md leading-relaxed line-clamp-2 max-w-2xl mb-5 sm:mb-5">
                {course.description[locale]}
              </p>
              <div className="hidden sm:block">{resumeCard}</div>
            </m.div>
          </div>
        </section>

        <div className={embedded ? 'mt-5 sm:mt-8 md:mt-10' : 'max-w-[1400px] mx-auto px-6 md:px-12 mt-6 sm:mt-10 md:mt-14'}>
          {/* Móvil: insignias y "Retomar" fuera del hero para que el panel no ocupe media pantalla */}
          <div className="sm:hidden">
            {badges}
            {resumeCard}
          </div>
          {/* ─── 2. Indicadores ─── */}
          <m.section {...fadeUp(0.08)} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="rounded-xl border border-mx-border bg-mx-card p-4 flex items-center gap-4">
              <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0 -rotate-90" aria-hidden="true">
                <circle cx="32" cy="32" r={ringR} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="6" />
                <circle
                  cx="32" cy="32" r={ringR} fill="none"
                  stroke={isFullyCompleted ? '#f59e0b' : '#F7A000'} strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={ringC} strokeDashoffset={ringC * (1 - progressPercent / 100)}
                  className="transition-[stroke-dashoffset] duration-700"
                />
              </svg>
              <div>
                <p className="text-label-sm uppercase tracking-widest text-mx-text-muted">{locale === 'es' ? 'Progreso' : 'Progress'}</p>
                <p className="text-heading-md font-black text-mx-text leading-none mt-1">{progressPercent}%</p>
              </div>
            </div>
            <StatTile icon={BookOpen} label={locale === 'es' ? 'Lecciones' : 'Lessons'} value={`${completedValidCount}/${totalLessons}`} hint={locale === 'es' ? 'completadas' : 'completed'} />
            <StatTile icon={FileQuestion} label={locale === 'es' ? 'Exámenes' : 'Exams'} value={`${examsPassed}/${totalExams}`} hint={locale === 'es' ? 'aprobados' : 'passed'} />
            <StatTile icon={Clock} label={locale === 'es' ? 'Te queda' : 'Remaining'} value={remainingMinutes > 0 ? fmtMinutes(remainingMinutes) : '0 min'} hint={`${locale === 'es' ? 'de' : 'of'} ${durationLabel}`} />
          </m.section>

          {/* ─── 3. Dos columnas: temario + panel lateral ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            <div className="lg:col-span-2 min-w-0">
              {/* Sobre el curso (objetivos, descripción, audiencia, salidas)
                  ANTES del temario. */}
              <m.section {...fadeUp(0.14)} className="mb-12">
                <h2 className="text-heading-md md:text-heading-lg font-black tracking-tight text-mx-blue mb-4">
                  {locale === 'es' ? 'Sobre el curso' : 'About the course'}
                </h2>
                <div className="relative flex border-b border-mx-border gap-1 md:gap-6 xl:gap-8 w-full overflow-x-auto scrollbar-hide -mx-2 px-2 mb-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative px-2 md:px-3 py-3 text-label-sm md:text-label-md font-medium transition-colors whitespace-nowrap shrink-0 ${
                          isActive ? 'text-mx-orange' : 'text-mx-text-muted hover:text-mx-orange'
                        }`}
                      >
                        <span className="flex items-center gap-1 md:gap-2">
                          <Icon className="size-3.5 md:size-4" />
                          {tab.label[locale]}
                        </span>
                        {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-mx-orange" />}
                      </button>
                    );
                  })}
                </div>
                <div className="max-w-full">
                  {activeTab === 'description' && hasDescription && <MarkdownBlock content={course.description[locale]} />}
                  {activeTab === 'objectives' && (
                    <MarkdownBlock content={course.objectives || (locale === 'es' ? 'Los objetivos de este curso se irán definiendo a medida que avances en el temario.' : 'Course objectives will be defined as you progress through the syllabus.')} />
                  )}
                  {activeTab === 'audience' && (
                    <MarkdownBlock content={course.audiences || (locale === 'es' ? 'Este curso está dirigido a cualquier persona interesada en esta temática.' : 'This course is aimed at anyone interested in this subject.')} />
                  )}
                  {activeTab === 'careers' && (
                    <MarkdownBlock content={course.careers || (locale === 'es' ? 'Las salidas profesionales relacionadas con este curso son amplias y diversas.' : 'Career opportunities related to this course are broad and diverse.')} />
                  )}
                </div>
              </m.section>
              <m.section {...fadeUp(0.2)}>
                <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
                  <h2 className="text-heading-md md:text-heading-lg font-black tracking-tight text-mx-blue">
                    {locale === 'es' ? 'Contenido del curso' : 'Course content'}
                  </h2>
                  <p className="text-label-md text-mx-text-muted">
                    {course.blocks.length} {locale === 'es' ? 'bloques' : 'blocks'} · {totalLessons} {locale === 'es' ? 'lecciones' : 'lessons'} · {durationLabel}
                  </p>
                </div>
                <div className="space-y-3">
                  {course.blocks.map((block, blockIdx) => (
                    <ModuleCard
                      key={block.id}
                      block={block}
                      blockIndex={blockIdx}
                      courseSlug={course.slug}
                      completedSet={completedSet}
                      firstIncompleteLessonId={firstIncompleteLessonId}
                      locale={locale}
                      examResultsByExamId={examResultsByExamId}
                    />
                  ))}
                </div>
              </m.section>

            </div>

            {/* Panel lateral: lo que NO está ya en la cabecera */}
            <aside className="lg:col-span-1">
              <div className={`lg:sticky space-y-4 ${embedded ? 'lg:top-20' : 'lg:top-32'}`}>
                {/* Siguiente lección */}
                {!isFullyCompleted && (
                  <m.div {...fadeUp(0.16)} className="rounded-xl border border-mx-border bg-mx-card p-5">
                    <p className="text-label-sm uppercase tracking-widest text-mx-text-muted mb-3">{locale === 'es' ? 'A continuación' : 'Up next'}</p>
                    {(() => {
                      const next = findResumeInfo(course.blocks, nextLessonId);
                      const target = next && nextLessonId !== firstIncompleteLessonId ? next : resumeInfo;
                      if (!target) return null;
                      return (
                        <Link href={lessonHref(target.lesson.id)} className="group block">
                          <p className="text-body-md font-semibold text-mx-text group-hover:text-mx-orange transition-colors line-clamp-2">{target.lesson.title[locale]}</p>
                          <p className="text-label-md text-mx-text-muted mt-1">
                            {locale === 'es' ? 'Bloque' : 'Block'} {target.blockIndex + 1} · {target.lesson.estimatedMinutes} min
                          </p>
                          <span className="mt-3 inline-flex items-center gap-1.5 text-label-md font-medium text-mx-orange">
                            {locale === 'es' ? 'Ir a la lección' : 'Go to lesson'} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </Link>
                      );
                    })()}
                  </m.div>
                )}

                {/* Exámenes */}
                {exams.length > 0 && (
                  <m.div {...fadeUp(0.2)} className="rounded-xl border border-mx-border bg-mx-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-label-sm uppercase tracking-widest text-mx-text-muted">{locale === 'es' ? 'Exámenes' : 'Exams'}</p>
                      <span className="text-label-md font-semibold text-mx-text">{examsPassed}/{exams.length}</span>
                    </div>
                    <ul className="space-y-1">
                      {exams.map(({ exam, blockIndex, href, result }) => (
                        <li key={exam.id}>
                          <Link href={href} className="flex items-center gap-3 rounded-lg -mx-2 px-2 py-2 hover:bg-black/[0.03] transition-colors">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${result ? (result.passed ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700') : 'bg-black/[0.04] text-mx-text-muted'}`}>
                              {result?.passed ? <CheckCircle size={13} /> : <FileQuestion size={13} />}
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block text-body-sm text-mx-text line-clamp-1">{exam.title[locale]}</span>
                              <span className="block text-label-sm text-mx-text-muted">{locale === 'es' ? 'Bloque' : 'Block'} {blockIndex + 1}</span>
                            </span>
                            <span className={`text-label-md font-semibold shrink-0 ${result ? (result.passed ? 'text-green-700' : 'text-red-700') : 'text-mx-text-muted'}`}>
                              {result ? `${result.score}%` : (locale === 'es' ? 'Pendiente' : 'Pending')}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </m.div>
                )}

                {/* Tutor */}
                <m.div {...fadeUp(0.24)} className="rounded-xl border border-mx-border bg-mx-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full bg-mx-blue/10 flex items-center justify-center overflow-hidden shrink-0">
                      {course.instructor.avatar ? (
                        <Image src={course.instructor.avatar} alt={course.instructor.name} width={44} height={44} unoptimized className="w-full h-full object-cover" />
                      ) : (
                        <User size={18} className="text-mx-blue" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-body-sm font-semibold text-mx-text truncate">{course.instructor.name}</p>
                      <p className="text-label-md text-mx-text-muted truncate">{course.instructor.role}</p>
                    </div>
                  </div>
                  <p className="text-label-md text-mx-text-muted mb-3">
                    {locale === 'es' ? '¿Tienes dudas? Te las resolvemos.' : 'Questions? We are here to help.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowTutorModal(true)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-mx-blue text-mx-blue px-4 py-2.5 text-label-md font-medium hover:bg-mx-blue hover:text-white transition-colors"
                  >
                    <MessageCircle size={15} /> {locale === 'es' ? 'Contactar con el tutor' : 'Contact the tutor'}
                  </button>
                </m.div>

                {/* Ficha rápida */}
                <m.div {...fadeUp(0.28)} className="rounded-xl border border-mx-border bg-mx-card p-5">
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-label-md text-mx-text-muted">
                    <MetaItem icon={Globe} label={(course.language && LANGUAGE_LABELS[course.language]?.[locale]) || 'Español'} />
                    <MetaItem icon={Monitor} label="Online" />
                    <MetaItem icon={GraduationCap} label={(course.level && LEVEL_LABELS[course.level]?.[locale]) || 'Principiante'} />
                    <MetaItem icon={Clock} label={durationLabel} />
                  </ul>
                  <Link href="/maxymia/campus/mis-cursos" className="mt-4 block text-label-md text-mx-text-muted hover:text-mx-orange transition-colors">
                    ← {locale === 'es' ? 'Volver a mis cursos' : 'Back to my courses'}
                  </Link>
                </m.div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {!embedded && <Footer />}

      <TutorQuestionModal open={showTutorModal} onClose={() => setShowTutorModal(false)} locale={locale} course={course} />

      {/* Certificate modal — portaled to body to escape any transformed ancestor */}
      {portalReady && createPortal(
        <AnimatePresence>
          {showCertificate && isFullyCompleted && (
            <m.div
              data-cert-portal="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-start md:items-center justify-center p-4 md:p-8 overflow-y-auto"
              onClick={() => setShowCertificate(false)}
            >
              <m.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-4xl my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowCertificate(false)}
                  aria-label={locale === 'es' ? 'Cerrar' : 'Close'}
                  className="absolute -top-12 right-0 text-white/70 hover:text-white p-2 print:hidden"
                >
                  <X size={24} />
                </button>
                <Certificate
                  studentName={user?.fullName || (locale === 'es' ? 'Alumno' : 'Student')}
                  courseTitle={course.title[locale]}
                  instructor={course.instructor.name}
                  completedAt={issuedCertificate?.completedAt || progress?.lastAccessedAt || new Date().toISOString()}
                  locale={locale}
                  certificateId={issuedCertificate?.id}
                  certificateUrl={issuedCertificate?.verifyUrl}
                />
              </m.div>
            </m.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

function findResumeInfo(blocks: MaxymiaBlock[], lessonId: string | undefined) {
  for (let b = 0; b < blocks.length; b++) {
    const lesson = blocks[b].lessons.find((l) => l.id === lessonId);
    if (lesson) return { lesson, blockIndex: b };
  }
  return null;
}

// ─── Stat Item ──────────────────────────────────────────────────────

/**
 * Esquina cóncava ("fillet"): cuadradito del color del fondo con un cuarto de
 * círculo transparente, colocado fuera del panel en la unión con el borde al
 * que está pegado. Hace que la pestaña se una con una curva, no en ángulo.
 * `at` = esquina del cuadradito donde está el centro del círculo.
 */
function Fillet({ className, at }: { className: string; at: 'tl' | 'tr' | 'bl' | 'br' }) {
  const cx = at.endsWith('l') ? '0%' : '100%';
  const cy = at.startsWith('t') ? '0%' : '100%';
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute size-4 ${className}`}
      style={{ background: `radial-gradient(circle at ${cx} ${cy}, transparent 15.5px, var(--color-mx-bg) 16px)` }}
    />
  );
}

function StatTile({ icon: Icon, label, value, hint }: { icon: React.ElementType; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-mx-border bg-mx-card p-4 flex items-center gap-4">
      <div className="w-11 h-11 rounded-full bg-mx-orange/10 text-mx-orange flex items-center justify-center shrink-0">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-label-sm uppercase tracking-widest text-mx-text-muted">{label}</p>
        <p className="text-heading-sm font-black text-mx-text leading-tight mt-0.5">{value}</p>
        {hint && <p className="text-label-sm text-mx-text-muted">{hint}</p>}
      </div>
    </div>
  );
}

function MetaItem({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <li className="inline-flex items-center gap-1.5">
      <Icon size={13} className="text-mx-orange shrink-0" aria-hidden="true" />
      {label}
    </li>
  );
}

// ─── Markdown Block (same renderer as product page) ─────────────────

function MarkdownBlock({ content }: { content: string }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (content) {
      import('@/lib/markdown').then(({ markdownToHtml }) =>
        markdownToHtml(content).then((result) => {
          if (!cancelled) setHtml(result);
        })
      );
    }
    return () => { cancelled = true; };
  }, [content]);

  if (!html) return null;

  return (
    <div
      // markdown-on-dark flips the globals.css color rule to white so
      // the body copy reads on Maxymia's dark theme; without it the
      // shared `.markdown-content { color: #000 !important }` rule used
      // by the program pages forces it to invisible black.
      // Bullet en absoluto (no flex+gap): si el <li> es flex, un <strong>
      // seguido de texto se parte en dos flex items y el `gap` mete el
      // hueco visible alrededor de la negrita. Mismo patrón que ProgramTabs.
      className="markdown-content text-body-sm sm:text-body-md text-mx-text-muted font-light [&_ul]:space-y-3 sm:[&_ul]:space-y-4 [&_li]:relative [&_li]:pl-5 sm:[&_li]:pl-6 [&_li]:before:content-[''] [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.55em] [&_li]:before:w-1.5 [&_li]:before:h-1.5 [&_li]:before:rounded-full [&_li]:before:bg-mx-orange [&_ul]:list-none [&_ul]:pl-0 [&_p]:mb-3 sm:[&_p]:mb-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ─── Module Card (same accordion pattern as product page) ───────────

interface ModuleCardProps {
  examResultsByExamId: Record<string, ExamResult>;
  block: MaxymiaBlock;
  blockIndex: number;
  courseSlug: string;
  completedSet: Set<string>;
  firstIncompleteLessonId: string | undefined;
  locale: Locale;
}

function ModuleCard({ block, blockIndex, courseSlug, completedSet, firstIncompleteLessonId, locale, examResultsByExamId }: ModuleCardProps) {
  const [expanded, setExpanded] = useState(blockIndex === 0);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const total = block.lessons.length;
  const completedInBlock = block.lessons.filter((l) => isLessonComplete(l, completedSet)).length;
  const blockCompleted = completedInBlock === total && total > 0;
  const blockProgress = total > 0 ? Math.round((completedInBlock / total) * 100) : 0;

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  return (
    <div className={`overflow-hidden rounded-lg border ${blockCompleted ? 'bg-amber-500/[0.04] border-amber-500/30' : 'bg-mx-card border-mx-border'}`}>
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full p-5 md:p-6 flex items-center justify-between text-left hover:bg-black/[0.02] duration-200 transition-colors group"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            {blockCompleted ? (
              <span className="flex items-center gap-1.5 text-amber-600 text-label-md font-bold">
                <CheckCircle size={12} />
                {locale === 'es' ? 'Bloque' : 'Block'} {blockIndex + 1}
              </span>
            ) : (
              <span className="text-mx-orange text-label-md font-bold">
                {locale === 'es' ? 'Bloque' : 'Block'} {blockIndex + 1}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-mx-text-muted text-label-md">
              {completedInBlock}/{total}
            </span>
            <div className="w-12 h-1.5 bg-black/[0.06] rounded-full overflow-hidden hidden sm:block">
              <div
                className={`h-full rounded-full transition-all duration-500 ${blockCompleted ? 'bg-amber-400' : 'bg-mx-orange'}`}
                style={{ width: `${blockProgress}%` }}
              />
            </div>
          </div>
          <h3 className="text-body-md md:text-body-lg font-bold text-mx-text group-hover:text-mx-orange transition-colors duration-300">
            {block.title[locale]}
          </h3>
        </div>
        <m.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="ml-4 shrink-0"
        >
          <ChevronDown size={20} className="text-mx-text-muted" />
        </m.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-5 md:pb-6 pt-3 border-t border-mx-border space-y-2">
              {block.lessons.map((lesson, lessonIndex) => {
                const isCompleted = isLessonComplete(lesson, completedSet);
                const isCurrent = lesson.id === firstIncompleteLessonId;
                const hasTopics = lesson.topics && lesson.topics.length > 0;
                const isLessonExpanded = expandedLessons.has(lesson.id);

                return (
                  <m.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: lessonIndex * 0.05 }}
                  >
                    {/* Lesson row — toggle only, not a link */}
                    <button
                      onClick={() => hasTopics ? toggleLesson(lesson.id) : undefined}
                      className={`w-full flex items-center justify-between py-2.5 group -mx-3 px-3 rounded-lg text-left ${
                        isCurrent
                          ? 'bg-mx-orange/5'
                          : isCompleted
                          ? 'bg-mx-orange/[0.03]'
                          : 'hover:bg-black/[0.03]'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {isCompleted ? (
                          <CheckCircle size={14} className="text-mx-orange shrink-0" />
                        ) : isCurrent ? (
                          <Play size={14} className="text-mx-orange shrink-0" fill="currentColor" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-mx-border shrink-0" />
                        )}
                        <span className={`text-body-sm ${
                          isCurrent
                            ? 'text-mx-text font-medium'
                            : isCompleted
                            ? 'text-mx-text-muted line-through decoration-mx-orange/40'
                            : 'text-mx-text-muted font-light group-hover:text-mx-text'
                        }`}>
                          {lesson.title[locale]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-4 shrink-0">
                        <span className={`text-label-md ${
                          isCurrent ? 'text-mx-orange' : isCompleted ? 'text-mx-orange/60' : 'text-mx-text-muted'
                        }`}>
                          {isCompleted ? '✓' : `${lesson.estimatedMinutes} min`}
                        </span>
                        {hasTopics && (
                          <m.div
                            animate={{ rotate: isLessonExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown size={14} className="text-mx-text-muted" />
                          </m.div>
                        )}
                      </div>
                    </button>

                    {/* Topics (third level) — these are the links */}
                    <AnimatePresence>
                      {hasTopics && isLessonExpanded && (
                        <m.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-7 pl-4 border-l border-mx-border py-1 space-y-0.5">
                            {lesson.topics!.map((topic, topicIdx) => (
                              <Link
                                key={topic.id}
                                href={`/maxymia/campus/${courseSlug}/lesson/${lesson.id}#${topic.anchorId}`}
                                className="flex items-center gap-2 py-1.5 px-2 rounded text-mx-text-muted hover:text-mx-text hover:bg-black/[0.03] transition-colors"
                              >
                                <span className="text-[10px] text-mx-text-muted/70 shrink-0">{topicIdx + 1}.</span>
                                <span className="text-label-md line-clamp-1">{topic.title[locale]}</span>
                              </Link>
                            ))}
                          </div>
                        </m.div>
                      )}
                    </AnimatePresence>
                  </m.div>
                );
              })}
              {block.lessons.length > 0 && block.exams.map((exam, examIdx) => {
                const examResult = examResultsByExamId[exam.id];
                return (
                  <Link
                    key={exam.id}
                    href={`/maxymia/campus/${courseSlug}/lesson/${block.lessons[block.lessons.length - 1].id}/exam?index=${examIdx}`}
                    className="flex items-center gap-3 py-3 -mx-3 px-3 rounded-lg hover:bg-black/[0.03] transition-colors group"
                  >
                    <FileQuestion size={14} className="shrink-0 text-purple-600" />
                    <span className="text-body-sm text-purple-700 group-hover:text-purple-900 flex-1">
                      {exam.title[locale]}
                    </span>
                    {examResult ? (
                      <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-semibold ${
                          examResult.passed
                            ? 'bg-green-500/10 text-green-700 border border-green-500/30'
                            : 'bg-red-500/10 text-red-700 border border-red-500/30'
                        }`}
                      >
                        {examResult.passed ? <CheckCircle size={12} /> : null}
                        {examResult.score}%
                      </span>
                    ) : (
                      <span className="text-mx-text-muted text-label-sm">
                        {locale === 'es' ? 'Pendiente' : 'Pending'}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
