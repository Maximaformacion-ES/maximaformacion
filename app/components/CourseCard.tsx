'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';
import { ArrowRight, Crown, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  getEffectivePrice,
  getProSavings,
  isFreeWithPro,
  shouldApplyProDiscount,
} from '@/lib/pricing';

/**
 * Tarjeta de curso ÚNICA para todo el sitio: programas de Máxima (catálogo,
 * home, áreas, recomendados) y cursos de Maxymia (landing, ficha, campus).
 * Los adaptadores <ProgramCardView> y <MaxymiaCourseCard> convierten cada
 * tipo de dato en `CourseCardData`; aquí solo hay presentación.
 *
 * Anatomía (fija y en el mismo orden en todas las tarjetas):
 *   1. Media 16:9 con la píldora de tipo (arriba-izq.) y PRO (arriba-dcha.).
 *   2. Contenido: área (overline) → título (2 líneas) → descripción (2 líneas)
 *      → metadatos con icono (duración · nivel/ECTS · lecciones/módulos).
 *   3. Acción: precio (o progreso si el alumno ya está matriculado) + CTA
 *      explícito ("Ver curso", "Continuar"…).
 *
 * UX: un solo enlace por tarjeta (una parada de tabulador), anillo de foco
 * visible, hover con elevación + zoom de imagen + título en naranja; sin
 * tooltips al pasar el ratón (no funcionan en táctil). Tema claro u oscuro
 * (campus) por prop.
 */

export type CourseCardKind = 'master' | 'course' | 'maxymia';
export type CourseCardTheme = 'light' | 'dark';
export type CourseCardLocale = 'es' | 'en';

export interface CourseCardMeta {
  icon: LucideIcon;
  label: string;
}

export interface CourseCardProgress {
  percent: number;
  completed: number;
  total: number;
  isCompleted: boolean;
}

export interface CourseCardPricing {
  price: number | null;
  originalPrice?: number | null;
  isPro?: boolean | null;
  haveDiscount?: boolean | null;
  type?: 'Master' | 'Curso';
  /** Sin precio público: "Consultar precio" (másteres). */
  consult?: boolean;
  /** Exclusivo PRO (no se vende suelto). */
  proOnly?: boolean;
}

export interface CourseCardData {
  href: string;
  title: string;
  description?: string;
  image: string;
  kind: CourseCardKind;
  isPro?: boolean;
  /** Área temática / categoría, como overline. */
  area?: string | null;
  meta: CourseCardMeta[];
  pricing: CourseCardPricing;
  /** Progreso del alumno (campus). Si existe, sustituye al precio. */
  progress?: CourseCardProgress;
  /** Matriculado sin progreso aún. */
  enrolled?: boolean;
}

interface CourseCardProps {
  data: CourseCardData;
  index?: number;
  userHasPro?: boolean;
  locale?: CourseCardLocale;
  theme?: CourseCardTheme;
  /** Carga la imagen con prioridad (primeras tarjetas sobre el pliegue). */
  priority?: boolean;
}

const COPY = {
  es: {
    master: 'Máster',
    course: 'Curso',
    maxymia: 'Maxymia',
    consult: 'Consultar precio',
    includedInPro: 'Incluido en Pro',
    freeWithPro: 'Gratis con PRO',
    save: (n: number) => `Ahorras ${n}€ con Pro`,
    view: 'Ver curso',
    viewMaster: 'Ver máster',
    consultCta: 'Consultar',
    start: 'Empezar',
    resume: 'Continuar',
    review: 'Repasar',
    completed: 'Completado',
    lessons: 'lecciones',
    purchased: 'Matriculado',
  },
  en: {
    master: 'Master',
    course: 'Course',
    maxymia: 'Maxymia',
    consult: 'Ask for price',
    includedInPro: 'Included in Pro',
    freeWithPro: 'Free with PRO',
    save: (n: number) => `Save ${n}€ with Pro`,
    view: 'View course',
    viewMaster: 'View master',
    consultCta: 'Enquire',
    start: 'Start',
    resume: 'Continue',
    review: 'Review',
    completed: 'Completed',
    lessons: 'lessons',
    purchased: 'Enrolled',
  },
} as const;

const THEME = {
  light: {
    card: 'bg-mx-card border-mx-border hover:border-mx-orange/50 hover:shadow-[0_12px_32px_-12px_rgba(26,26,26,0.18)]',
    title: 'text-mx-text',
    text: 'text-mx-text-muted',
    faint: 'text-mx-text-muted/80',
    divider: 'border-mx-border',
    track: 'bg-black/[0.06]',
    price: 'text-mx-text',
    ring: 'focus-visible:ring-offset-mx-bg',
  },
  dark: {
    card: 'bg-[#171c24] border-[#2e3339] hover:border-mx-orange/50 hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.6)]',
    title: 'text-white',
    text: 'text-white/60',
    faint: 'text-white/40',
    divider: 'border-white/10',
    track: 'bg-white/10',
    price: 'text-white',
    ring: 'focus-visible:ring-offset-[#0b1018]',
  },
} as const;

export function CourseCard({
  data,
  index = 0,
  userHasPro = false,
  locale = 'es',
  theme = 'light',
  priority = false,
}: CourseCardProps) {
  const t = COPY[locale];
  const c = THEME[theme];
  const { pricing, progress } = data;

  const isMaster = data.kind === 'master';
  const consult = !!pricing.consult || pricing.price == null;
  const product = { price: pricing.price ?? 0, isPro: pricing.isPro, haveDiscount: pricing.haveDiscount, type: pricing.type };
  const includedInPro = !consult && isFreeWithPro(product, userHasPro);
  const proDiscount = !consult && !includedInPro && shouldApplyProDiscount(product, userHasPro);
  const effectivePrice = consult ? 0 : getEffectivePrice(product, userHasPro);
  const proSavings = consult ? 0 : getProSavings(product, userHasPro);
  const proOnlyLocked = !!pricing.proOnly && !userHasPro;
  const hasOriginal = pricing.originalPrice != null && pricing.price != null && pricing.originalPrice > pricing.price;

  const showProgress = !!progress || !!data.enrolled;
  const ctaLabel = showProgress
    ? progress?.isCompleted
      ? t.review
      : progress && progress.completed > 0
        ? t.resume
        : t.start
    : consult
      ? t.consultCta
      : isMaster
        ? t.viewMaster
        : t.view;

  const badgeLabel = t[data.kind];
  const badgeClass =
    data.kind === 'course'
      ? 'bg-mx-orange text-white'
      : 'bg-mx-blue text-white';

  return (
    <m.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: Math.min(index, 5) * 0.06, duration: 0.45 }}
      className="group relative h-full"
    >
      <Link
        href={data.href}
        aria-label={data.title}
        className={`flex flex-col h-full overflow-hidden rounded-xl border transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mx-orange focus-visible:ring-offset-2 ${c.card} ${c.ring}`}
      >
        {/* 1. Media 16:9 */}
        <div className="relative aspect-video overflow-hidden bg-black/[0.04]">
          <Image
            src={data.image}
            alt=""
            fill
            sizes="(min-width: 1536px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            unoptimized={data.image.startsWith('http')}
          />
          <div className="absolute inset-x-0 top-0 p-3 flex items-start justify-between gap-2">
            <span className={`px-3 py-1 rounded-full text-label-sm font-black tracking-[0.18em] uppercase shadow-sm ${badgeClass}`}>
              {badgeLabel}
            </span>
            <span className="flex items-center gap-1.5">
              {progress?.isCompleted && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-sm font-bold uppercase tracking-wider bg-black/55 text-amber-300 backdrop-blur-sm">
                  <Trophy size={10} /> {t.completed}
                </span>
              )}
              {data.isPro && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-sm font-black tracking-wider uppercase text-white bg-gradient-to-r from-[#f7a000] via-[#f7c948] to-[#f7a000] shadow-lg shadow-[#f7a000]/30">
                  <Crown size={10} /> PRO
                </span>
              )}
            </span>
          </div>
        </div>

        {/* 2. Contenido */}
        <div className="flex flex-col flex-grow gap-2 p-4 2xl:p-5">
          {data.area && (
            <span className={`text-label-sm font-semibold uppercase tracking-[0.18em] ${c.faint}`}>
              {data.area}
            </span>
          )}
          <h3 className={`text-body-md 2xl:text-body-lg font-semibold leading-snug line-clamp-2 min-h-[2.6em] transition-colors group-hover:text-mx-orange ${c.title}`}>
            {data.title}
          </h3>
          {data.description && (
            <p className={`text-body-sm font-light leading-normal line-clamp-2 ${c.text}`}>
              {data.description}
            </p>
          )}
          {data.meta.length > 0 && (
            <ul className={`mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-label-md ${c.text}`}>
              {data.meta.slice(0, 3).map((item) => (
                <li key={item.label} className="inline-flex items-center gap-1.5">
                  <item.icon size={13} className="text-mx-orange shrink-0" aria-hidden="true" />
                  {item.label}
                </li>
              ))}
            </ul>
          )}

          {/* 3. Acción */}
          <div className={`mt-auto pt-3 border-t ${c.divider}`}>
            {showProgress && progress && !progress.isCompleted && (
              <div className="mb-3">
                <div className={`flex items-center justify-between mb-1.5 text-label-md ${c.text}`}>
                  <span className="text-mx-orange font-semibold">{progress.percent}%</span>
                  <span>
                    {progress.completed}/{progress.total} {t.lessons}
                  </span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${c.track}`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-mx-orange to-amber-400 transition-[width] duration-500"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>
            )}
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                {showProgress ? (
                  <span className={`text-body-sm font-medium ${progress?.isCompleted ? 'text-amber-500' : c.text}`}>
                    {progress?.isCompleted ? (
                      <span className="inline-flex items-center gap-1.5"><Trophy size={14} /> {t.completed}</span>
                    ) : (
                      t.purchased
                    )}
                  </span>
                ) : consult ? (
                  <span className={`text-body-sm font-medium ${c.price}`}>{t.consult}</span>
                ) : includedInPro ? (
                  <span className="flex items-baseline gap-2">
                    <span className={`text-body-sm line-through ${c.faint}`}>{pricing.price}€</span>
                    <span className="inline-flex items-center gap-1 text-mx-orange text-body-md font-bold">
                      <Crown size={13} /> {t.includedInPro}
                    </span>
                  </span>
                ) : proOnlyLocked ? (
                  <span className="inline-flex items-center gap-1 text-mx-orange text-body-md font-bold">
                    <Crown size={13} /> {t.freeWithPro}
                  </span>
                ) : proDiscount ? (
                  <span className="flex flex-col">
                    <span className="flex items-baseline gap-2">
                      <span className={`text-body-sm line-through ${c.faint}`}>{pricing.price}€</span>
                      <span className="text-mx-orange text-heading-sm font-bold">{effectivePrice}€</span>
                      <span className="inline-flex items-center gap-0.5 text-label-sm font-bold text-mx-orange">
                        <Crown size={10} /> -20%
                      </span>
                    </span>
                  </span>
                ) : (
                  <span className="flex flex-col">
                    <span className="flex items-baseline gap-2">
                      {hasOriginal && (
                        <span className={`text-body-sm line-through ${c.faint}`}>{pricing.originalPrice}€</span>
                      )}
                      <span className={`text-heading-sm font-bold ${hasOriginal ? 'text-mx-orange' : c.price}`}>
                        {pricing.price}€
                      </span>
                    </span>
                    {proSavings > 0 && (
                      <span className="inline-flex items-center gap-1 text-label-sm font-medium text-mx-orange">
                        <Crown size={10} /> {t.save(proSavings)}
                      </span>
                    )}
                  </span>
                )}
              </div>
              <span
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-mx-orange/60 text-mx-orange px-3.5 py-1.5 text-label-md font-medium transition-colors duration-300 group-hover:bg-mx-orange group-hover:text-white"
                aria-hidden="true"
              >
                {ctaLabel}
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </m.article>
  );
}

export default CourseCard;
