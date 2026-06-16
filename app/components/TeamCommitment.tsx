'use client';

import React from 'react';
import { m } from 'framer-motion';
import { Quote } from 'lucide-react';
import { SectionHeader } from '@/app/components/SectionHeader';

type Locale = 'es' | 'en';

const MAX_AVATARS = 7;

const COPY = {
  es: {
    overline: 'Nuestro compromiso',
    title: 'Atención al {alumnado}',
    message:
      'En Máxima Formación no aprendes solo/a. Detrás de cada curso hay un equipo docente real que te acompaña: resolvemos tus dudas en menos de 24 horas, durante el curso y también cuando lo termines. Tu progreso nos importa tanto como a nosotros.',
    sign: 'Equipo docente de Máxima Formación',
  },
  en: {
    overline: 'Our commitment',
    title: 'Student {support}',
    message:
      'At Máxima Formación you don’t learn alone. Behind every course there’s a real teaching team that supports you: we answer your questions in under 24 hours, during the course and also after you finish it. Your progress matters to us as much as it does to you.',
    sign: 'The Máxima Formación teaching team',
  },
} as const;

/**
 * "Compromiso con la atención al alumnado": el acompañamiento personificado en
 * TODO el equipo docente (no en una sola persona), para que el alumno sienta que
 * le arropa el equipo. Cluster de avatares del equipo + mensaje en voz del
 * equipo + firma. Sección de marca (fija/global) compartida por las fichas de
 * Maxymia y de /programas.
 */
export function TeamCommitment({
  locale = 'es',
  avatars = [],
  totalTeachers,
}: {
  locale?: Locale;
  avatars?: string[];
  totalTeachers?: number;
}) {
  const t = COPY[locale];
  const shown = avatars.slice(0, MAX_AVATARS);
  const total = totalTeachers ?? avatars.length;
  const extra = Math.max(0, total - shown.length);

  return (
    <section className="py-10 md:py-20">
      <div className="max-w-[812px]">
        <SectionHeader overline={t.overline} title={t.title} align="center" />

        <m.figure
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-8 flex flex-col items-center text-center"
        >
          {shown.length > 0 && (
            <div className="flex items-center justify-center">
              {shown.map((src, i) => (
                <div
                  key={`${src}-${i}`}
                  className={`relative size-12 md:size-14 overflow-hidden rounded-full border-2 border-mx-bg shadow-sm ${i > 0 ? '-ml-3' : ''}`}
                  style={{ zIndex: shown.length - i }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
              {extra > 0 && (
                <div className="relative -ml-3 flex size-12 md:size-14 items-center justify-center rounded-full border-2 border-mx-bg bg-mx-blue/10 text-[12px] font-bold text-mx-blue">
                  +{extra}
                </div>
              )}
            </div>
          )}

          <Quote size={24} className="mt-6 text-mx-orange/60" />
          <blockquote className="mt-2 max-w-[800px] font-body text-[16px] leading-[1.6] text-mx-text italic text-balance">
            {t.message}
          </blockquote>
          <figcaption className="mt-4 font-sans text-[14px] font-bold text-mx-text">{t.sign}</figcaption>
        </m.figure>
      </div>
    </section>
  );
}
