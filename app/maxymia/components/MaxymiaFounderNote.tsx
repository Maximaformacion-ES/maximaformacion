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
  photo: 'https://www.maximaformacion.es/wp-content/uploads/2021/02/Alfonso-Lara-Nunez-Maxima-Formacion-300x300.jpg',
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
export function MaxymiaFounderNote({ locale = 'es' }: { locale?: Locale }) {
  const t = COPY[locale];
  return (
    <section className="py-10 md:py-20">
      <div className="max-w-[812px]">
        <SectionHeader overline={t.overline} title={t.title} />

        <m.figure
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-8 rounded-2xl border border-mx-border bg-white p-6 md:p-8"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={FOUNDER.photo}
              alt={FOUNDER.name}
              className="size-16 md:size-20 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0">
              <Quote size={22} className="mb-2 text-mx-orange/70" />
              <blockquote className="font-body text-mx-text text-[15px] md:text-[17px] leading-[1.6]">
                {t.message}
              </blockquote>
              <figcaption className="mt-4 font-sans">
                <span className="font-bold text-mx-text text-[14px]">{FOUNDER.name}</span>
                <span className="text-mx-text-muted text-[13px]"> · {FOUNDER.role}</span>
              </figcaption>
            </div>
          </div>
        </m.figure>
      </div>
    </section>
  );
}
