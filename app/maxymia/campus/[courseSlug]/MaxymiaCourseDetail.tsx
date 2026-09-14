'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { m, AnimatePresence } from 'framer-motion';
import {
  Clock,
  BookOpen,
  Crown,
  ChevronDown,
  ShoppingCart,
  Loader2,
  ArrowRight,
  Monitor,
  Globe,
  BarChart3,
  FileQuestion,
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
import { maxymiaCategoryLabel } from '../../data/labels';
import { markdownToHtml } from '@/lib/markdown';
import { MaxymiaMobileCTA } from '../../components/MaxymiaMobileCTA';
import { FontStyles } from '@/app/components/FontStyles';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { ContactCourse } from '@/app/components/ContactCourseProvider';
import { Breadcrumb } from '@/app/components/Breadcrumb';
import { ProgramHeroSection, type HeroProgram } from '@/app/components/ProgramHeroSection';
import { ProgramCTASection } from '@/app/components/ProgramCTASection';
import { DocenteSection } from '@/app/components/DocenteSection';
import { TeamCommitment } from '@/app/components/TeamCommitment';
import { VideoTestimonialsSection } from '@/app/components/VideoTestimonialsSection';
import MaxymiaCourseCard from '../../components/MaxymiaCourseCard';
import { SectionHeader } from '@/app/components/SectionHeader';
import { useCampusTheme } from '../CampusShell';
import { TrustBlock } from '@/app/components/TrustBlock';
import { FAQSection } from '@/app/components/FAQSection';
import { Comos } from '@/app/components/Comos';
import type { MaxymiaCourse, Locale } from '../../types';
import type { Badge, Institution, VideoTestimonial } from '@/lib/strapi/types';
import { getEffectivePrice, getProSavings, isFreeWithPro, shouldApplyProDiscount, klarnaInstallment } from '@/lib/pricing';
import { trackBeginCheckout } from '@/lib/analytics';

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

export function CourseThumbnail({ course, locale }: { course: MaxymiaCourse; locale: Locale }) {
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
  /** Avatares del equipo docente para la sección de compromiso con el alumnado. */
  teacherAvatars?: string[];
  /** Cursos recomendados (relacionados) para la fila al pie de la ficha. */
  recommended?: MaxymiaCourse[];
  /** Set GLOBAL de sellos/instituciones: TODOS en todas las fichas. */
  allBadges?: Badge[];
  allInstitutions?: Institution[];
  /** Testimonios en vídeo (globales). Opcional: sin datos no hay sección. */
  videoTestimonials?: VideoTestimonial[];
  /**
   * `true` (lo normal): ficha PÚBLICA de venta fuera del campus. Pinta la
   * página completa con el Header/Footer del sitio, exactamente como
   * /programas/[id] (ProgramDetailClient). La decide en servidor
   * app/maxymia/campus/[courseSlug]/page.tsx cuando no hay matrícula.
   *
   * `false`: incrustada en el CampusShell. Solo ocurre como fallback en
   * cliente (el alumno pierde el acceso después de cargar la vista de
   * alumno); mantiene el comportamiento anterior (chrome del campus en claro).
   */
  standalone?: boolean;
}

/** Duración legible: horas manuales de Strapi o la suma de minutos de las lecciones. */
function formatDuration(course: MaxymiaCourse, totalMinutes: number): string {
  if (course.durationHours) return `${course.durationHours} horas`;
  const h = Math.floor(totalMinutes / 60);
  const min = totalMinutes % 60;
  return h > 0 ? `${h}h ${min}min` : `${min} min`;
}

export default function MaxymiaCourseDetail({
  course,
  teacherAvatars,
  recommended,
  allBadges,
  allInstitutions,
  videoTestimonials,
  standalone = true,
}: Props) {
  const { locale } = useLocale();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Incrustada en el campus (fallback): pinta el chrome del campus en claro
  // mientras se muestra y vuelve a oscuro al desmontar. En modo standalone
  // no hay CampusShell (el contexto es el default, no-op).
  const { setLight } = useCampusTheme();
  useEffect(() => {
    if (standalone) return;
    setLight(true);
    return () => setLight(false);
  }, [setLight, standalone]);

  const { totalLessons, totalMinutes, totalExams } = getCourseMeta(course);
  const title = course.title[locale];
  const durationLabel = formatDuration(course, totalMinutes);

  // Mismo hero que /programas (ProgramHeroSection): píldora de tipo = categoría
  // del curso, tags como "topics", duración + nº de bloques como pills.
  const heroProgram: HeroProgram = {
    image: course.image,
    title,
    description: course.description[locale],
    type: maxymiaCategoryLabel(course.category, locale),
    isPro: course.isPro,
    topics: course.tags.map((tag) => ({ id: tag, name: tag })),
    durationLabel,
    modules: course.blocks,
    modulesLabel: locale === 'es' ? 'bloques' : 'blocks',
  };

  const body = (
    <>
      {/* Mismo layout de 2 columnas que la ficha de /programas (MF-17):
          IZQUIERDA hero + pestañas + confianza + compromiso + docentes + FAQ,
          DERECHA panel de compra sticky. En móvil el panel se oculta y la
          barra fija inferior (MaxymiaMobileCTA) es el único CTA. */}
      <ProgramHeroSection
        program={heroProgram}
        breadcrumb={
          <Breadcrumb
            items={[
              { label: 'Maxymia', href: '/maxymia' },
              { label: title },
            ]}
            className=""
          />
        }
        sidebar={
          <CourseSidebar
            course={course}
            locale={locale}
            totalLessons={totalLessons}
            durationLabel={durationLabel}
            totalExams={totalExams}
          />
        }
        tabs={<CourseTabs course={course} locale={locale} totalLessons={totalLessons} />}
        belowContent={
          <>
            {/* Mismas secciones y mismo orden que /programas: confianza →
                compromiso con el alumnado → docentes → FAQ. */}
            <TrustBlock
              institutions={allInstitutions}
              certifications={allBadges}
              locale={locale}
            />
            <TeamCommitment locale={locale} avatars={teacherAvatars} />
            <VideoTestimonialsSection testimonials={videoTestimonials} locale={locale} />
            <DocenteSection
              docentes={course.docentes}
              locale={locale}
              courseTitle={title}
              {...(locale === 'es' ? { overline: 'Profesorado', title: 'Quién {imparte}' } : {})}
            />
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

      {/* CTA de cierre a ancho completo, compartido con /programas. */}
      <ProgramCTASection title={title} />

      {/* Fila de recomendados, igual que la ficha de /programas. */}
      {recommended && recommended.length > 0 && (
        <RecommendedCourses courses={recommended} locale={locale} />
      )}
    </>
  );

  if (!standalone) {
    return (
      <div>
        {/* El footer del campus enlaza a /contacto?curso=<este curso> */}
        <ContactCourse title={course.title.es || title} />
        {body}
        <MaxymiaMobileCTA course={course} />
        <div className="h-20 lg:hidden" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-clip">
      <FontStyles />
      {/* Header/footer/CTAs enlazan a /contacto?curso=<este curso> */}
      <ContactCourse title={course.title.es || title} />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10">{body}</main>

      <Footer />

      {/* Sticky mobile purchase bar */}
      <MaxymiaMobileCTA course={course} />
      {/* Bottom spacing so footer isn't hidden behind the sticky bar */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────
// Réplica 1:1 del ProgramSidebar de /programas (mismo contenedor, misma
// rejilla de datos, mismo bloque de precio y mismos dos botones), con la
// lógica de compra de Maxymia (checkout `maxymia-course`, acceso por
// matrícula/PRO vía useUserCampus, enlace a la primera lección).

interface SidebarProps {
  course: MaxymiaCourse;
  locale: Locale;
  totalLessons: number;
  durationLabel: string;
  totalExams: number;
}

function CourseSidebar({ course, locale, totalLessons, durationLabel, totalExams }: SidebarProps) {
  const { isSignedIn, isLoaded } = useUser();
  const { hasPro, hasAccess: checkAccess, isLoading: campusLoading } = useUserCampus();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userStateKnown = isLoaded && !campusLoading;
  const userHasPro = !!isSignedIn && hasPro;
  const hasAccess = userStateKnown && checkAccess(course.id, course.isPro);
  const includedInPro = isFreeWithPro(course, userHasPro);
  const proDiscount = !includedInPro && shouldApplyProDiscount(course, userHasPro);
  const effectivePrice = getEffectivePrice(course, userHasPro);
  const proSavings = getProSavings(course, userHasPro);
  // Visitante NO-PRO viendo un curso incluido en PRO:
  //  - proOnly (exclusivo PRO, no se vende) → SOLO "Gratis con PRO" y el CTA
  //    lleva a /pricing (no hay checkout posible).
  //  - isPro con precio (también a la venta) → precio normal + "Gratis para
  //    usuarios Pro" clicable a la derecha del precio (igual que /programas).
  const proOnlyCourse = !!course.proOnly;
  const showProFree = userStateKnown && !userHasPro && !!course.isPro && !proOnlyCourse;

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
    { icon: Clock, label: locale === 'es' ? 'Duración' : 'Duration', value: durationLabel },
    { icon: FileQuestion, label: locale === 'es' ? 'Exámenes' : 'Exams', value: String(totalExams) },
    { icon: BarChart3, label: locale === 'es' ? 'Nivel' : 'Level', value: LEVEL_LABELS[course.level]?.[locale] },
  ].filter((item) => item.value);

  const firstLessonHref = `/maxymia/campus/${course.slug}/lesson/${course.blocks[0]?.lessons[0]?.id}`;

  return (
    // top-32 (not top-24) so the pinned card keeps a margin below the fixed
    // header instead of butting right up against it (MF-17).
    <div className="sticky top-32">
      <div className="border border-mx-border bg-mx-card overflow-hidden rounded-lg shadow-sm">
        {/* Imagen de producto: la miniatura con branding de Maxymia (la misma
            que usan las cards del catálogo). */}
        <CourseThumbnail course={course} locale={locale} />

        <div className="p-6 space-y-6">
          {/* Info */}
          <div className="grid grid-cols-2 gap-4">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-start gap-2">
                <item.icon size={14} className="text-mx-orange shrink-0 mt-0.5" />
                <div>
                  <div className="text-label-sm text-mx-text-muted uppercase tracking-widest">
                    {item.label}
                  </div>
                  <div className="text-mx-text text-body-sm font-medium">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-mx-border" />

          {/* Pricing */}
          <div>
            <div className="flex items-baseline justify-between gap-x-3 gap-y-1 flex-wrap">
              <div className="flex items-baseline gap-3">
                {includedInPro ? (
                  <>
                    <span className="text-mx-text-muted text-body-sm md:text-body-md line-through">
                      {course.price}€
                    </span>
                    <span className="flex items-center gap-2 text-mx-orange text-heading-md md:text-heading-lg font-black">
                      <Crown size={20} /> {locale === 'es' ? 'Incluido en Pro' : 'Included in Pro'}
                    </span>
                  </>
                ) : userStateKnown && !userHasPro && proOnlyCourse ? (
                  <span className="flex items-center gap-2 text-mx-orange text-heading-md md:text-heading-lg font-black">
                    <Crown size={20} /> {locale === 'es' ? 'Gratis con PRO' : 'Free with PRO'}
                  </span>
                ) : proDiscount ? (
                  <>
                    <span className="text-mx-text-muted text-body-sm md:text-body-md line-through">
                      {course.price}€
                    </span>
                    <span className="text-mx-orange text-heading-md md:text-display-sm font-black">
                      {effectivePrice}€
                    </span>
                  </>
                ) : (
                  <>
                    {course.originalPrice != null && (
                      <span className="text-mx-text-muted text-body-sm md:text-body-md line-through">
                        {course.originalPrice}€
                      </span>
                    )}
                    <span className={`${course.originalPrice != null ? 'text-mx-orange' : 'text-mx-text'} text-heading-md md:text-display-sm font-black`}>
                      {course.price}€
                    </span>
                  </>
                )}
              </div>
              {/* A la derecha del precio: gratis con Pro (clicable) o ahorro -20%. */}
              {showProFree ? (
                <Link
                  href="/pricing"
                  title={locale === 'es' ? 'Suscríbete a Pro y accede gratis' : 'Subscribe to Pro and get free access'}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-mx-orange/40 bg-mx-orange/10 px-3 py-1 text-mx-orange text-label-md font-bold hover:bg-mx-orange/20 transition-colors"
                >
                  <Crown size={12} className="shrink-0" />
                  {locale === 'es' ? 'Gratis para usuarios Pro' : 'Free for Pro users'}
                  <ArrowRight size={11} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ) : userStateKnown && !userHasPro && proSavings > 0 ? (
                <p className="flex items-center gap-1.5 text-mx-orange text-label-md font-medium">
                  <span className="text-body-md font-bold">{course.price - proSavings}€</span>
                  <Crown size={11} /> {locale === 'es' ? `Ahorras ${proSavings}€ con Pro` : `Save ${proSavings}€ with Pro`}
                </p>
              ) : null}
            </div>
            {includedInPro ? (
              <div className="mt-1 text-mx-orange text-label-sm md:text-label-md font-bold flex items-center gap-1">
                <Crown size={12} /> {locale === 'es' ? 'Tu suscripción Pro cubre este curso' : 'Your Pro plan covers this course'}
              </div>
            ) : proDiscount ? (
              <div className="mt-1 text-mx-orange text-label-sm md:text-label-md font-bold flex items-center gap-1">
                <Crown size={12} /> {locale === 'es' ? 'Descuento Pro -20%' : 'Pro discount -20%'} ({course.price - effectivePrice}€)
              </div>
            ) : (
              course.originalPrice != null && !proOnlyCourse && (
                <div className="mt-1 text-mx-orange text-label-sm md:text-label-md font-bold">
                  {locale === 'es' ? 'Ahorra' : 'Save'} {course.originalPrice - course.price}€
                </div>
              )
            )}
            <p className="text-mx-text-muted text-label-sm md:text-label-md mt-1">
              {klarnaInstallment(effectivePrice) && !proOnlyCourse && !includedInPro ? (
                locale === 'es'
                  ? <>Pago único o <span className="text-mx-text font-medium">3 plazos de {klarnaInstallment(effectivePrice)} €</span> sin intereses con Klarna • Acceso permanente</>
                  : <>One-time payment or <span className="text-mx-text font-medium">3 × {klarnaInstallment(effectivePrice)} €</span> interest-free with Klarna • Lifetime access</>
              ) : (
                locale === 'es' ? 'Pago único • Acceso permanente' : 'One-time payment • Lifetime access'
              )}
            </p>
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-body-sm">{error}</p>}

          {/* CTA Buttons: exactamente dos, como en /programas (MF-17). */}
          <div className="space-y-3">
            {hasAccess ? (
              <Link
                href={firstLessonHref}
                className="group flex items-center justify-center gap-3 w-full bg-mx-orange text-white px-6 py-4 text-body-sm md:text-body-md font-medium rounded-lg hover:bg-mx-orange-dark transition-all duration-300"
              >
                {locale === 'es' ? 'Acceder al Curso' : 'Access Course'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : userStateKnown && !userHasPro && proOnlyCourse ? (
              <Link
                href="/pricing"
                className="group flex items-center justify-center gap-3 w-full bg-mx-orange text-white px-6 py-4 text-body-sm md:text-body-md font-medium rounded-lg hover:bg-mx-orange-dark transition-all duration-300"
              >
                <Crown size={18} />
                {locale === 'es' ? 'Hazte Pro y accede' : 'Go Pro and access'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <m.button
                onClick={handlePurchase}
                disabled={isLoading}
                className="group flex items-center justify-center gap-3 w-full bg-mx-orange text-white px-6 py-4 text-body-sm md:text-body-md font-medium rounded-lg hover:bg-mx-orange-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    {/* Siempre la misma etiqueta: sin sesión, handlePurchase
                        redirige a /sign-in antes del checkout. */}
                    {locale === 'es' ? 'Matricúlate ahora' : 'Enroll now'}
                  </>
                )}
              </m.button>
            )}

            {/* Secondary CTA: Pro upsell (mismo estilo que /programas). */}
            {userStateKnown && !userHasPro && !hasAccess && (
              <Link
                href="/pricing"
                className="flex items-center justify-center gap-2 w-full border border-mx-orange/50 text-mx-orange px-6 py-3 text-body-sm font-light rounded-lg hover:bg-mx-orange/10 transition-colors"
              >
                <Crown size={16} />
                {locale === 'es' ? 'O hazte Pro por €18/mes' : 'Or go Pro for €18/mo'}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
      <div className="relative flex border-b border-mx-border gap-1 md:gap-6 xl:gap-8 w-full overflow-x-auto scrollbar-hide -mx-2 px-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`relative px-2 md:px-3 py-3 text-label-sm md:text-label-md font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === tab.value ? 'text-mx-orange' : 'text-mx-text-muted hover:text-mx-orange'
            }`}
          >
            <span className="flex items-center gap-1 md:gap-2">
              <tab.icon className="size-3.5 md:size-4" />
              <span className="md:hidden">
                {tab.value === 'descripcion' && introLabel}
                {tab.value === 'contenido' && (locale === 'es' ? 'Temario' : 'Content')}
                {tab.value === 'objetivos' && (locale === 'es' ? 'Objetivos' : 'Goals')}
                {tab.value === 'audiencia' && (locale === 'es' ? 'Audiencia' : 'Audience')}
                {tab.value === 'salidas' && (locale === 'es' ? 'Salidas' : 'Careers')}
              </span>
              <span className="hidden md:inline">{tab.label}</span>
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
      <div className="pt-10 md:pt-4">
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


// ─── Recomendados ───────────────────────────────────────────────

/** "Otros alumnos también compraron": mismo contenedor y cabecera que la
 *  fila de recomendados de /programas (RecommendedPrograms). */
function RecommendedCourses({ courses, locale }: { courses: MaxymiaCourse[]; locale: Locale }) {
  return (
    <section className="py-16 md:py-24 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <SectionHeader
          overline={locale === 'es' ? 'También te puede interesar' : 'You might also like'}
          title={locale === 'es' ? 'Otros alumnos también {compraron}' : 'Other students also {bought}'}
          align="left"
        />
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((c, i) => (
            <MaxymiaCourseCard key={c.id} course={c} locale={locale} index={i} light />
          ))}
        </div>
      </div>
    </section>
  );
}
