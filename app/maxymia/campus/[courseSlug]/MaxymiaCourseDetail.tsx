'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { m, AnimatePresence } from 'framer-motion';
import {
  Clock,
  BookOpen,
  Crown,
  ChevronDown,
  ShoppingCart,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Mail,
  Phone,
  Lock,
  Check,
  Sparkles,
  Monitor,
  Globe,
  BarChart3,
  FileQuestion,
  User,
  ListOrdered,
  Target,
  Users,
  Briefcase,
  FileText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import { useLocale } from '../../i18n/LocaleProvider';
import { getCourseMeta } from '../../data/queries';
import { markdownToHtml } from '@/lib/markdown';
import { MaxymiaMobileCTA } from '../../components/MaxymiaMobileCTA';
import { MaxymiaDocenteSection } from '../../components/MaxymiaDocenteSection';
import { MaxymiaFounderNote } from '../../components/MaxymiaFounderNote';
import MaxymiaCourseCard from '../../components/MaxymiaCourseCard';
import { SectionHeader } from '@/app/components/SectionHeader';
import { useCampusTheme } from '../CampusShell';
import { TrustBlock } from '@/app/components/TrustBlock';
import { FAQSection } from '@/app/components/FAQSection';
import { Comos } from '@/app/components/Comos';
import type { MaxymiaCourse, Locale } from '../../types';
import { getEffectivePrice, getProSavings, isFreeWithPro, shouldApplyProDiscount } from '@/lib/pricing';
import { trackBeginCheckout } from '@/lib/analytics';

const CATEGORY_LABELS: Record<string, Record<Locale, string>> = {
  ia: { es: 'Inteligencia Artificial', en: 'Artificial Intelligence' },
  'data-science': { es: 'Data Science', en: 'Data Science' },
  'machine-learning': { es: 'Machine Learning', en: 'Machine Learning' },
  nlp: { es: 'Procesamiento del Lenguaje', en: 'Language Processing' },
  'computer-vision': { es: 'Visión por Computador', en: 'Computer Vision' },
};

const LEVEL_LABELS: Record<string, Record<Locale, string>> = {
  beginner: { es: 'Principiante', en: 'Beginner' },
  intermediate: { es: 'Intermedio', en: 'Intermediate' },
  advanced: { es: 'Avanzado', en: 'Advanced' },
};

const LANGUAGE_LABELS: Record<string, string> = {
  es: 'Español',
  en: 'English',
  bilingual: 'Bilingüe',
};

// ─── Course Thumbnail (replicates card style) ───────────────────

function CourseThumbnail({ course, locale }: { course: MaxymiaCourse; locale: Locale }) {
  const title = course.thumbnailTitle?.[locale] || course.title[locale];
  const lines = title.split('\n');

  return (
    <div className="relative aspect-video bg-[#527be7] overflow-hidden flex items-center justify-center">
      {/* Background image faded */}
      <img
        src={course.image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      />
      {/* Dark glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full h-[60%] bg-[#0b1018]/50 blur-[30px]" />
      </div>
      {/* Left chevron */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
        <img src="/iconBlue.svg" alt="" className="w-12 h-auto" />
      </div>
      {/* Right chevron */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
        <img src="/iconOrange.svg" alt="" className="w-12 h-auto" />
      </div>
      {/* Title */}
      <div className="relative z-10 text-center px-12">
        {lines.length > 1 ? (
          <>
            <p className="text-white/70 text-label-md tracking-widest uppercase font-medium">{lines[0]}</p>
            <p className="text-white text-heading-md font-black tracking-tight leading-tight">{lines.slice(1).join(' ')}</p>
          </>
        ) : (
          <p className="text-white text-heading-sm font-black tracking-tight leading-tight uppercase">{lines[0]}</p>
        )}
      </div>
    </div>
  );
}

interface Props {
  course: MaxymiaCourse;
  /** Foto del fundador (author Alfonso Lara) para la nota de compromiso. */
  founderPhoto?: string;
  /** Cursos recomendados (relacionados) para la fila al pie de la ficha. */
  recommended?: MaxymiaCourse[];
}

export default function MaxymiaCourseDetail({ course, founderPhoto, recommended }: Props) {
  const { locale } = useLocale();
  // This is the public course *sales* ficha — paint the whole campus chrome
  // (header, footer, page bg) light + black logo while it's shown, and revert
  // to dark when it unmounts (e.g. the user buys and the student view loads).
  const { setLight } = useCampusTheme();
  useEffect(() => {
    setLight(true);
    return () => setLight(false);
  }, [setLight]);
  const { totalLessons, totalMinutes, totalExams } = getCourseMeta(course);

  return (
    <div>
      {/* Hero Section */}
      <CourseHeroSection
        course={course}
        locale={locale}
        totalLessons={totalLessons}
        totalMinutes={totalMinutes}
        sidebar={
          <CourseSidebar
            course={course}
            locale={locale}
            totalLessons={totalLessons}
            totalMinutes={totalMinutes}
            totalExams={totalExams}
          />
        }
        mobileSidebar={
          <CourseSidebar
            course={course}
            locale={locale}
            totalLessons={totalLessons}
            totalMinutes={totalMinutes}
            totalExams={totalExams}
          />
        }
        tabs={
          <CourseTabs course={course} locale={locale} totalLessons={totalLessons} />
        }
        belowContent={
          <>
            {/* Confianza primero, FAQ después. Mismo contenedor lg:col-span-2.
                Componente compartido con la ficha de /programas. */}
            <TrustBlock
              institutions={course.institutions}
              certifications={course.badges}
              locale={locale}
            />
            <MaxymiaFounderNote locale={locale} photo={founderPhoto} />
            <MaxymiaDocenteSection docentes={course.docentes} locale={locale} courseTitle={course.title[locale]} />
            {course.faqs && course.faqs.length > 0 && (
              <FAQSection
                compact
                overline={locale === 'es' ? 'Resuelve tus dudas' : 'Got questions?'}
                title={locale === 'es' ? 'PREGUNTAS {FRECUENTES}' : 'FREQUENTLY {ASKED}'}
                faqs={course.faqs}
              />
            )}
          </>
        }
      />

      {/* Fila de cursos recomendados (sustituye al CTA "Listo para comenzar"). */}
      {recommended && recommended.length > 0 ? (
        <RecommendedCourses courses={recommended} locale={locale} />
      ) : (
        <CourseCTASection locale={locale} />
      )}

      {/* Sticky mobile purchase bar */}
      <MaxymiaMobileCTA course={course} />
      <div className="h-20 lg:hidden" />
    </div>
  );
}

// ─── Hero Section ───────────────────────────────────────────────

interface HeroProps {
  course: MaxymiaCourse;
  locale: Locale;
  totalLessons: number;
  totalMinutes: number;
  sidebar?: React.ReactNode;
  mobileSidebar?: React.ReactNode;
  tabs?: React.ReactNode;
  /** Extra content stacked in the LEFT column below the tabs (e.g. FAQ).
   *  Lives inside the left column so the sticky sidebar spans its height,
   *  matching the Máxima program ficha. */
  belowContent?: React.ReactNode;
}

function CourseHeroSection({ course, locale, totalLessons, totalMinutes, sidebar, mobileSidebar, tabs, belowContent }: HeroProps) {
  // overflow-visible on the <section> (clipping moved to the background
  // wrapper below) so the right-column sidebar's position: sticky works — an
  // overflow-hidden ancestor turns into the sticky scroll container and the
  // card never pins as you scroll. Mirrors the Máxima ProgramHeroSection.
  return (
    <section className="relative pt-0 pb-12 md:pb-16 overflow-visible">
      {/* Background image with dark overlays — clipped here, not on the
          <section>, so it doesn't break the sidebar's sticky. */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-mx-bg/95 via-mx-bg/85 to-mx-bg/70 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-mx-bg via-mx-bg/40 to-transparent z-10" />
        <img
          src={course.image}
          alt={course.title[locale]}
          className="w-full  object-cover opacity-40"
        />
      </div>

      <div className="relative z-20 max-w-[1800px] mx-auto px-6 md:px-[128px] pt-12 md:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left: Hero content */}
          <div className="lg:col-span-2">
            {/* Breadcrumb (como en las fichas de /programas) */}
            <nav aria-label="breadcrumb" className="mb-5 font-body text-label-md text-mx-text-muted">
              <Link href="/" className="hover:text-mx-orange transition-colors">Inicio</Link>
              <span className="mx-2">/</span>
              <Link href="/maxymia" className="hover:text-mx-orange transition-colors">Maxymia</Link>
              <span className="mx-2">/</span>
              <span className="text-mx-text-muted">{course.title[locale]}</span>
            </nav>

            {/* Badges */}
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 flex items-center gap-3 flex-wrap"
            >
              <span className="inline-block px-3 py-1 text-label-sm font-black tracking-[0.2em] uppercase rounded-full bg-mx-orange text-white">
                {CATEGORY_LABELS[course.category]?.[locale] ?? course.category}
              </span>
              <span className="inline-block px-3 py-1 text-label-sm font-medium tracking-wider uppercase rounded-full bg-black/[0.04] text-mx-text-muted">
                {LEVEL_LABELS[course.level]?.[locale]}
              </span>
              {course.isPro && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-label-sm font-black tracking-wider uppercase bg-gradient-to-r from-[#f7a000] via-[#f7c948] to-[#f7a000] text-white rounded-full shadow-lg shadow-[#f7a000]/30">
                  <Crown size={10} /> PRO
                </span>
              )}
            </m.div>

            {/* Title */}
            <m.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-heading-md md:text-heading-lg lg:text-display-sm font-black tracking-tight mb-3 max-w-3xl leading-tight text-mx-text"
            >
              {course.title[locale]}
            </m.h1>

            {/* Tags */}
            {course.tags.length > 0 && (
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="flex flex-wrap gap-2 mb-4"
              >
                {course.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-black/[0.04] backdrop-blur-md text-mx-text-muted text-label-md font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </m.div>
            )}

            {/* Description */}
            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="font-body text-body-md 2xl:text-body-lg text-mx-text-muted font-light mb-6 max-w-2xl"
            >
              {course.description[locale]}
            </m.p>

            {/* Instructor */}
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-10 h-10 rounded-full bg-black/[0.04] flex items-center justify-center overflow-hidden">
                {course.instructor.avatar ? (
                  <Image
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    width={40}
                    height={40}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={18} className="text-mx-text-muted" />
                )}
              </div>
              <div>
                <p className="text-mx-text text-body-sm font-medium">{course.instructor.name}</p>
                <p className="font-body text-mx-text-muted text-label-md">{course.instructor.role}</p>
              </div>
            </m.div>

            {/* Mobile Sidebar — before tabs so purchase is visible early */}
            {mobileSidebar && (
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="lg:hidden mb-8"
              >
                {mobileSidebar}
              </m.div>
            )}

            {/* Tabs */}
            {tabs && (
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {tabs}
              </m.div>
            )}

            {/* Extra content (e.g. FAQ) below the tabs, inside the left
                column so the sticky sidebar spans its full height. */}
            {belowContent}
          </div>

          {/* Right: Sidebar (desktop) */}
          {sidebar && (
            <div className="lg:col-span-1 hidden lg:block">{sidebar}</div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────

interface SidebarProps {
  course: MaxymiaCourse;
  locale: Locale;
  totalLessons: number;
  totalMinutes: number;
  totalExams: number;
}

function CourseSidebar({ course, locale, totalLessons, totalMinutes, totalExams }: SidebarProps) {
  const { isSignedIn, isLoaded } = useUser();
  const { hasPro, hasAccess: checkAccess, isLoading: campusLoading } = useUserCampus();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userHasPro = !!isSignedIn && hasPro;
  const hasAccess = checkAccess(course.id, course.isPro);
  const includedInPro = isFreeWithPro(course, userHasPro);
  const proDiscount = !includedInPro && shouldApplyProDiscount(course, userHasPro);
  const effectivePrice = getEffectivePrice(course, userHasPro);
  const proSavings = getProSavings(course, userHasPro);

  const handlePurchase = async () => {
    if (!isSignedIn) {
      window.location.href = `/sign-in?redirect_url=/maxymia/campus/${course.slug}`;
      return;
    }

    setIsLoading(true);
    setError(null);

    trackBeginCheckout([
      {
        item_id: course.slug,
        item_name: course.title.es,
        item_category: 'maxymia-course',
        price: effectivePrice,
      },
    ]);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'maxymia-course',
          documentId: course.id,
          slug: course.slug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el pago');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago');
      setIsLoading(false);
    }
  };

  const infoItems = [
    { icon: Monitor, label: locale === 'es' ? 'Modalidad' : 'Format', value: 'Online' },
    { icon: Globe, label: locale === 'es' ? 'Idioma' : 'Language', value: LANGUAGE_LABELS[course.language] || course.language },
    { icon: BookOpen, label: locale === 'es' ? 'Lecciones' : 'Lessons', value: String(totalLessons) },
    { icon: Clock, label: locale === 'es' ? 'Duración' : 'Duration', value: course.durationHours ? `${course.durationHours}h` : `${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}min` },
    { icon: FileQuestion, label: locale === 'es' ? 'Exámenes' : 'Exams', value: String(totalExams) },
    { icon: BarChart3, label: locale === 'es' ? 'Nivel' : 'Level', value: LEVEL_LABELS[course.level]?.[locale] },
  ];

  return (
    <div className="lg:sticky lg:top-24">
      <div className="border border-mx-border bg-white overflow-hidden rounded-lg">
        {/* Course Thumbnail */}
        <CourseThumbnail course={course} locale={locale} />

        <div className="p-6 space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-start gap-2">
                <item.icon size={14} className="text-mx-orange shrink-0 mt-0.5" />
                <div>
                  <div className="text-label-sm text-mx-text-muted uppercase tracking-widest">{item.label}</div>
                  <div className="text-mx-text text-body-sm font-medium">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-mx-border" />

          {/* Pricing */}
          <div>
            <div className="flex items-baseline gap-3">
              {includedInPro ? (
                <>
                  <span className="text-mx-text-muted text-body-lg line-through">{course.price}€</span>
                  <span className="flex items-center gap-2 text-mx-orange text-heading-md font-black">
                    <Crown size={20} /> {locale === 'es' ? 'Incluido en Pro' : 'Included in Pro'}
                  </span>
                </>
              ) : proDiscount ? (
                <>
                  <span className="text-mx-text-muted text-body-lg line-through">{course.price}€</span>
                  <span className="text-mx-orange text-display-sm font-black">{effectivePrice}€</span>
                </>
              ) : (
                <>
                  {course.originalPrice != null && (
                    <span className="text-mx-text-muted text-body-lg line-through">{course.originalPrice}€</span>
                  )}
                  <span className={`${course.originalPrice != null ? 'text-mx-orange' : 'text-mx-text'} text-display-sm font-black`}>
                    {course.price}€
                  </span>
                </>
              )}
            </div>
            {includedInPro ? (
              <div className="mt-1 text-mx-orange text-label-md font-bold flex items-center gap-1">
                <Crown size={12} />
                {locale === 'es' ? 'Tu suscripción Pro cubre este curso' : 'Your Pro plan covers this course'}
              </div>
            ) : proDiscount ? (
              <div className="mt-1 text-mx-orange text-label-md font-bold flex items-center gap-1">
                <Crown size={12} /> {locale === 'es' ? 'Descuento Pro -20%' : 'Pro discount -20%'} ({course.price - effectivePrice}€)
              </div>
            ) : (
              course.originalPrice != null && (
                <div className="mt-1 text-mx-orange text-label-md font-bold">
                  {locale === 'es' ? 'Ahorra' : 'Save'} {course.originalPrice - course.price}€
                </div>
              )
            )}
            <p className="text-mx-text-muted text-label-md mt-1">
              {locale === 'es' ? 'Pago único • Acceso permanente' : 'One-time payment • Lifetime access'}
            </p>
          </div>

          {error && <p className="text-red-500 text-body-sm">{error}</p>}

          {/* CTA Buttons */}
          <div className="space-y-3">
            {isLoaded && !campusLoading && hasAccess ? (
              <Link
                href={`/maxymia/campus/${course.slug}/lesson/${course.blocks[0]?.lessons[0]?.id}`}
                className="group flex items-center justify-center gap-3 w-full bg-mx-orange text-white px-6 py-4 text-body-md font-medium rounded-lg hover:bg-mx-orange-dark transition-all duration-300"
              >
                {locale === 'es' ? 'Acceder al Curso' : 'Access Course'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <m.button
                onClick={handlePurchase}
                disabled={isLoading}
                className="group flex items-center justify-center gap-3 w-full bg-mx-orange text-white px-6 py-4 text-body-md font-medium rounded-lg hover:bg-mx-orange-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    {locale === 'es' ? 'Procesando...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    {locale === 'es' ? 'Matricúlate ahora' : 'Enroll now'}
                  </>
                )}
              </m.button>
            )}

            {isLoaded && !campusLoading && !userHasPro && proSavings > 0 && (
              <Link
                href="/pricing"
                className="flex items-center justify-between gap-2 w-full rounded-lg border border-mx-orange/30 bg-mx-orange/10 px-3 py-2.5 hover:bg-mx-orange/15 hover:border-mx-orange/50 transition-colors group"
              >
                <span className="flex items-center gap-2 text-mx-orange text-label-md font-medium">
                  <Crown size={14} />
                  {includedInPro
                    ? (locale === 'es'
                        ? `Sería gratis con Pro · ahorras ${proSavings}€`
                        : `Free with Pro · save ${proSavings}€`)
                    : (locale === 'es'
                        ? `Con Pro pagarías ${course.price - proSavings}€ · ahorras ${proSavings}€`
                        : `With Pro you'd pay ${course.price - proSavings}€ · save ${proSavings}€`)}
                </span>
                <ArrowRight size={14} className="text-mx-orange shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Markdown Renderer ──────────────────────────────────────────

function MarkdownContent({ content, className = '' }: { content: string; className?: string }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (content) {
      markdownToHtml(content).then((result) => {
        if (!cancelled) setHtml(result);
      });
    }
    return () => { cancelled = true; };
  }, [content]);

  if (!html) return null;

  return (
    <div
      // Light theme (MF-38): the ficha now matches the rest of the site, so
      // markdown uses the default globals.css color rule (#000 over the light
      // background) — no markdown-on-dark override.
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ─── Tabs ───────────────────────────────────────────────────────

interface TabDef {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface TabsProps {
  course: MaxymiaCourse;
  locale: Locale;
  totalLessons: number;
}

function CourseTabs({ course, locale, totalLessons }: TabsProps) {
  const hasComos = !!course.comos?.length;
  const hasDescription = !!course.description?.[locale]?.trim();
  // Los "Cómos" sustituyen al contenido de la pestaña de Descripción (MF-41).
  const hasIntro = hasComos || hasDescription;
  const introLabel = hasComos
    ? (locale === 'es' ? 'Cómo te ayuda' : 'How it helps')
    : (locale === 'es' ? 'Descripción' : 'Description');
  const [activeTab, setActiveTab] = useState(hasIntro ? 'descripcion' : 'contenido');
  const [expandedBlock, setExpandedBlock] = useState<number | null>(0);

  const tabs = useMemo<TabDef[]>(() => {
    const t: TabDef[] = [];
    if (hasIntro)
      t.push({ value: 'descripcion', label: introLabel, icon: FileText });
    t.push({ value: 'contenido', label: locale === 'es' ? 'Temario' : 'Syllabus', icon: ListOrdered });
    if (course.objectives)
      t.push({ value: 'objetivos', label: locale === 'es' ? 'Objetivos' : 'Objectives', icon: Target });
    if (course.audiences)
      t.push({ value: 'audiencia', label: locale === 'es' ? 'A quién va dirigido' : 'Target audience', icon: Users });
    if (course.careers)
      t.push({ value: 'salidas', label: locale === 'es' ? 'Salidas profesionales' : 'Career paths', icon: Briefcase });
    return t;
  }, [locale, hasIntro, introLabel, course.objectives, course.audiences, course.careers]);

  const markdownTabClasses =
    // Bullet posicionado en absoluto (no flex) para que un <strong> seguido
    // de texto dentro del <li> no se parta en dos flex items con `gap` —
    // eso era lo que metía el hueco visible alrededor de la negrita. Mismo
    // patrón que ProgramTabs (BULLET_MARKDOWN_CLASS).
    'text-body-sm sm:text-body-md text-mx-text-muted font-light [&_ul]:space-y-3 sm:[&_ul]:space-y-4 [&_li]:relative [&_li]:pl-5 sm:[&_li]:pl-6 [&_li]:before:content-[\'\'] [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.55em] [&_li]:before:w-1.5 [&_li]:before:h-1.5 [&_li]:before:rounded-full [&_li]:before:bg-mx-orange [&_ul]:list-none [&_ul]:pl-0 [&_p]:mb-3 sm:[&_p]:mb-4';

  return (
    <div>
      {/* Tab bar */}
      <div className="relative flex border-b border-mx-border gap-1 sm:gap-6 lg:gap-8 w-full overflow-x-auto no-scrollbar -mx-2 px-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`relative px-2 sm:px-3 py-3 text-label-md sm:text-body-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === tab.value ? 'text-mx-orange' : 'text-mx-text-muted hover:text-mx-orange'
            }`}
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <tab.icon className="size-3.5 sm:size-4" />
              <span className="sm:hidden">
                {tab.value === 'descripcion' && introLabel}
                {tab.value === 'contenido' && (locale === 'es' ? 'Temario' : 'Content')}
                {tab.value === 'objetivos' && (locale === 'es' ? 'Objetivos' : 'Goals')}
                {tab.value === 'audiencia' && (locale === 'es' ? 'Audiencia' : 'Audience')}
                {tab.value === 'salidas' && (locale === 'es' ? 'Salidas' : 'Careers')}
              </span>
              <span className="hidden sm:inline">{tab.label}</span>
            </span>
            {activeTab === tab.value && (
              <m.div
                layoutId="maxymia-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-mx-orange"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="pt-6 md:pt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'descripcion' && hasIntro && (
            <m.div
              key="descripcion"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {hasComos ? (
                <Comos comos={course.comos!} />
              ) : (
                <MarkdownContent content={course.description[locale]} className={markdownTabClasses} />
              )}
            </m.div>
          )}

          {activeTab === 'contenido' && (
            <m.div
              key="contenido"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-4 text-mx-text-muted text-body-sm">
                {course.blocks.length} {locale === 'es' ? 'bloques' : 'blocks'} •{' '}
                {totalLessons} {locale === 'es' ? 'lecciones' : 'lessons'}
              </div>
              <div className="space-y-3">
                {course.blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="bg-black/[0.02] border border-mx-border overflow-hidden rounded-lg"
                  >
                    <button
                      onClick={() => setExpandedBlock(expandedBlock === index ? null : index)}
                      className="w-full p-5 md:p-6 flex items-center justify-between text-left hover:bg-black/[0.03] duration-200 transition-colors group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-mx-orange text-label-md font-bold">
                            {locale === 'es' ? 'Bloque' : 'Block'} {index + 1}
                          </span>
                          <span className="flex items-center gap-1.5 text-mx-text-muted text-label-md">
                            <BookOpen size={12} />
                            {block.lessons.length} {locale === 'es' ? 'lecciones' : 'lessons'}
                          </span>
                        </div>
                        <h3 className="text-body-md md:text-body-lg font-bold text-mx-text group-hover:text-mx-orange transition-colors duration-300">
                          {block.title[locale]}
                        </h3>
                      </div>
                      <m.div
                        animate={{ rotate: expandedBlock === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-4 shrink-0"
                      >
                        <ChevronDown size={20} className="text-mx-text-muted" />
                      </m.div>
                    </button>

                    <AnimatePresence>
                      {expandedBlock === index && (
                        <m.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 md:px-6 pb-5 md:pb-6 pt-3 border-t border-mx-border">
                            {block.lessons.map((lesson, lessonIndex) => (
                              <m.div
                                key={lesson.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: lessonIndex * 0.05 }}
                                className="flex items-center justify-between py-3 border-b last:border-0 border-mx-border"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-1 h-1 rounded-full bg-mx-orange mt-2 shrink-0" />
                                  <span className="font-light text-body-sm text-mx-text-muted">
                                    {lesson.title[locale]}
                                  </span>
                                </div>
                                <span className="text-mx-text-muted text-label-md ml-4 shrink-0">
                                  {lesson.estimatedMinutes} min
                                </span>
                              </m.div>
                            ))}
                            {block.exams.map((exam) => (
                              <div key={exam.id} className="flex items-center gap-3 py-3 text-purple-600">
                                <FileQuestion size={14} className="shrink-0" />
                                <span className="text-body-sm">{exam.title[locale]}</span>
                              </div>
                            ))}
                          </div>
                        </m.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </m.div>
          )}

          {activeTab === 'objetivos' && course.objectives && (
            <m.div
              key="objetivos"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <MarkdownContent content={course.objectives} className={markdownTabClasses} />
            </m.div>
          )}

          {activeTab === 'audiencia' && course.audiences && (
            <m.div
              key="audiencia"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <MarkdownContent content={course.audiences} className={markdownTabClasses} />
            </m.div>
          )}

          {activeTab === 'salidas' && course.careers && (
            <m.div
              key="salidas"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <MarkdownContent content={course.careers} className={markdownTabClasses} />
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


// ─── Access Gate ─────────────────────────────────────────────────

interface AccessGateProps {
  course: MaxymiaCourse;
  locale: Locale;
}

function CourseAccessGate({ course, locale }: AccessGateProps) {
  const { isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const proFeatures =
    locale === 'es'
      ? [
          'Acceso ilimitado a todos los cursos',
          'Certificados descargables',
          'Soporte prioritario 24/7',
          'Recursos y materiales descargables',
          'Sesiones de mentoría grupales',
          'Comunidad exclusiva',
        ]
      : [
          'Unlimited access to all courses',
          'Downloadable certificates',
          '24/7 priority support',
          'Downloadable resources & materials',
          'Group mentoring sessions',
          'Exclusive community',
        ];

  const courseFeatures =
    locale === 'es'
      ? [
          'Acceso permanente al curso',
          'Certificado de finalización',
          'Materiales del curso descargables',
          'Actualizaciones gratuitas',
        ]
      : [
          'Lifetime course access',
          'Completion certificate',
          'Downloadable course materials',
          'Free updates',
        ];

  const handlePurchase = async () => {
    if (!isSignedIn) {
      window.location.href = `/sign-in?redirect_url=/maxymia/campus/${course.slug}`;
      return;
    }

    setIsLoading(true);
    setError(null);

    trackBeginCheckout([
      {
        item_id: course.slug,
        item_name: course.title.es,
        item_category: 'maxymia-course',
        price: course.price,
      },
    ]);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'maxymia-course',
          documentId: course.id,
          slug: course.slug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el pago');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al procesar el pago'
      );
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);

  return (
    <section className="py-12 md:py-20 px-6 md:px-[128px] bg-mx-bg">
      <div className="max-w-4xl mx-auto">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center">
            <Lock className="text-amber-500" size={22} />
          </div>

          <span className="inline-flex items-center gap-2 text-amber-500 text-label-md font-medium tracking-[0.3em] uppercase mb-3">
            <Crown size={14} />
            {locale === 'es' ? 'Contenido Premium' : 'Premium Content'}
          </span>
          <h2 className="text-heading-md md:text-heading-lg font-bold text-mx-text mb-4">
            {locale === 'es' ? 'Accede a' : 'Access'} &quot;{course.title[locale]}&quot;
          </h2>
          <p className="text-mx-text-muted font-light text-body-sm md:text-body-md mb-8 max-w-xl mx-auto">
            {locale === 'es'
              ? 'Este curso es exclusivo. Elige la opción que mejor se adapte a ti.'
              : 'This course is exclusive. Choose the option that suits you best.'}
          </p>
        </m.div>

        {/* Two Options */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Buy Course */}
          <m.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="p-6 bg-black/[0.02] border border-mx-border hover:border-mx-border rounded-xl transition-all"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <ShoppingCart className="text-mx-text" size={18} />
              <span className="text-mx-text font-semibold text-body-sm">
                {locale === 'es' ? 'Comprar este curso' : 'Buy this course'}
              </span>
            </div>

            <div className="flex items-baseline justify-center gap-1 mb-1">
              {course.originalPrice != null && course.originalPrice > course.price && (
                <span className="text-mx-text-muted text-body-md line-through mr-2">
                  {formatPrice(course.originalPrice)}
                </span>
              )}
              <span className="text-heading-md font-black text-mx-text">{formatPrice(course.price)}</span>
            </div>
            <p className="text-mx-text-muted text-label-md mb-5 text-center">
              {locale === 'es' ? 'Pago único • Acceso permanente' : 'One-time payment • Lifetime access'}
            </p>

            <div className="space-y-2.5 mb-6">
              {courseFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <Check className="text-green-500 flex-shrink-0" size={16} />
                  <span className="text-mx-text-muted text-body-sm">{feature}</span>
                </div>
              ))}
            </div>

            {error && <p className="text-red-400 text-body-sm mb-4 text-center">{error}</p>}

            <button
              onClick={handlePurchase}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-mx-orange hover:bg-mx-orange-dark text-white px-5 py-3 rounded-full text-body-sm font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  {locale === 'es' ? 'Procesando...' : 'Processing...'}
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  {locale === 'es' ? 'Matricúlate ahora' : 'Enroll now'}
                </>
              )}
            </button>
          </m.div>

          {/* Pro Subscription */}
          <m.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="p-6 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 rounded-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-amber-500 text-black text-label-sm font-bold px-3 py-0.5 rounded-bl-lg">
              {locale === 'es' ? 'RECOMENDADO' : 'RECOMMENDED'}
            </div>

            <div className="flex items-center justify-center gap-2 mb-3">
              <Crown className="text-amber-500" size={18} />
              <span className="text-amber-500 font-semibold text-body-sm">
                {locale === 'es' ? 'Suscripción Pro' : 'Pro Subscription'}
              </span>
            </div>

            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-heading-md font-black text-mx-text">€18</span>
              <span className="text-mx-text-muted text-body-sm">/{locale === 'es' ? 'mes' : 'mo'}</span>
            </div>
            <p className="text-mx-text-muted text-label-md mb-5 text-center">
              {locale === 'es' ? 'Cancela cuando quieras' : 'Cancel anytime'}
            </p>

            <div className="space-y-2.5 mb-6">
              {proFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <Sparkles className="text-amber-500 flex-shrink-0" size={16} />
                  <span className="text-mx-text-muted text-body-sm">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/pricing"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-5 py-3 rounded-full text-body-sm font-bold transition-all duration-300 shadow-lg shadow-amber-500/30"
            >
              <Crown size={18} />
              {locale === 'es' ? 'Hazte Pro' : 'Go Pro'}
              <ArrowRight size={18} />
            </Link>

            <p className="text-center text-mx-text-muted text-label-md mt-4">
              {locale === 'es' ? 'Acceso a +50 cursos y masters' : 'Access to 50+ courses and masters'}
            </p>
          </m.div>
        </div>

        {/* Back Link */}
        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <Link
            href="/maxymia/campus/cursos"
            className="text-mx-text-muted hover:text-amber-500 transition-colors text-body-sm"
          >
            ← {locale === 'es' ? 'Volver al catálogo de cursos' : 'Back to course catalog'}
          </Link>
        </m.div>
      </div>
    </section>
  );
}

// ─── CTA Section ────────────────────────────────────────────────

function RecommendedCourses({ courses, locale }: { courses: MaxymiaCourse[]; locale: Locale }) {
  return (
    <section className="px-6 md:px-[128px] py-16 md:py-24">
      <div className="max-w-[1800px] mx-auto">
        <SectionHeader
          overline={locale === 'es' ? 'Sigue aprendiendo' : 'Keep learning'}
          title={locale === 'es' ? 'Cursos {recomendados}' : 'Recommended {courses}'}
          align="center"
        />
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((c, i) => (
            <MaxymiaCourseCard key={c.id} course={c} locale={locale} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CourseCTASection({ locale }: { locale: Locale }) {
  return (
    <section className="py-16 md:py-32 px-6 md:px-[128px]">
      <div className="max-w-[1200px] mx-auto text-center">
        <m.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-[#527be7] text-heading-lg md:text-display-sm lg:text-display-md font-black tracking-tight mb-6 md:mb-8">
            {locale === 'es' ? '¿LISTO PARA ' : 'READY TO '}
            <span className="text-stroke" style={{ WebkitTextFillColor: '#0b1018' }}>
              {locale === 'es' ? 'COMENZAR?' : 'START?'}
            </span>
          </h2>
          <p className="text-body-md md:text-heading-sm text-mx-text-muted font-light mb-8 md:mb-12 max-w-2xl mx-auto">
            {locale === 'es'
              ? 'Únete a cientos de profesionales que ya están transformando su carrera con este curso.'
              : 'Join hundreds of professionals already transforming their careers with this course.'}
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-8 text-mx-text-muted"
        >
          <a
            href="mailto:cursos@maximaformacion.es"
            className="flex items-center gap-3 hover:text-mx-orange transition-colors"
          >
            <Mail size={18} />
            cursos@maximaformacion.es
          </a>
          <a
            href="tel:+34635659391"
            className="flex items-center gap-3 hover:text-mx-orange transition-colors"
          >
            <Phone size={18} />
            +34 635 65 93 91
          </a>
        </m.div>
      </div>
    </section>
  );
}
