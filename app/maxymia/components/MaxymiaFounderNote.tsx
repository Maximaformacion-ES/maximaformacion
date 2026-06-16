'use client';

import React from 'react';
import { m } from 'framer-motion';
import { Quote } from 'lucide-react';
import { SectionHeader } from '@/app/components/SectionHeader';
import type { Locale } from '../types';

/** Fundador (fijo/global). Datos reales del author Alfonso Lara en Strapi
 *  (foto WP, rol). El mensaje es copy a medida y editable. */
const FOUNDER = {
  name: 'Alfonso Lara',
  role: 'Fundador y director de Máxima Formación',
  // Fallback (la foto real llega por prop desde Strapi). URL R2 del avatar actual.
  photo: 'https://pub-a3cc095f320346dca3aa9ded3eab6141.r2.dev/alfonso_ceo_073db6c23d.avif',
};

const COPY = {
  es: {
    overline: 'Nuestro compromiso',
    title: 'Atención al {alumnado}',
    message:
      'Cuando creé Máxima Formación lo hice con una idea clara: que nadie aprenda solo. Por eso, más allá del temario, te acompañamos de verdad: nuestros tutores resuelven tus dudas en menos de 24 horas, durante el curso y también cuando lo termines. Tu progreso nos importa tanto como a ti.',
  },
  en: {
    overline: 'Our commitment',
    title: 'Student {support}',
    message:
      'When I founded Máxima Formación I did it with one clear idea: that no one learns alone. That’s why, beyond the syllabus, we truly support you: our tutors answer your questions in under 24 hours, during the course and also after you finish it. Your progress matters to us as much as it does to you.',
  },
} as const;

/**
 * "Compromiso con la atención al alumnado": nota personal del fundador (foto +
 * mensaje + firma) sobre el acompañamiento durante y DESPUÉS del curso — el gran
 * diferenciador frente a marketplaces. Sección de marca (fija/global), se coloca
 * justo antes del bloque de Docente en la ficha.
 */
export function MaxymiaFounderNote({ locale = 'es', photo }: { locale?: Locale; photo?: string }) {
  const t = COPY[locale];
  const founderPhoto = photo || FOUNDER.photo;
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={founderPhoto}
            alt={FOUNDER.name}
            className="size-24 md:size-28 rounded-full object-cover"
          />
          <figcaption className="mt-4 font-sans">
            <div className="font-bold text-mx-text text-[16px]">{FOUNDER.name}</div>
            <div className="mt-0.5 text-mx-text-muted text-[13px]">{FOUNDER.role}</div>
          </figcaption>
          <Quote size={24} className="mt-6 text-mx-orange/60" />
          <blockquote className="mt-2 max-w-[640px] font-body text-mx-text text-[16px] md:text-[18px] leading-[1.6]">
            {t.message}
          </blockquote>
        </m.figure>
      </div>
    </section>
  );
}
