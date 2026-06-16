'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { Linkedin, Mail, LifeBuoy, User } from 'lucide-react';
import { SectionHeader } from '@/app/components/SectionHeader';
import type { MaxymiaInstructor, Locale } from '../types';

const COPY = {
  es: {
    overline: 'Quién enseña',
    title: 'Docente',
    support:
      'No estarás solo/a: contarás con soporte de tutores en menos de 24 horas para resolver dudas durante el curso y también después de terminarlo.',
    more: 'Ver más',
    less: 'Ver menos',
  },
  en: {
    overline: 'Who teaches',
    title: 'Instructor',
    support:
      'You won’t be on your own: you’ll have tutor support in under 24 hours to resolve questions during the course and also after finishing it.',
    more: 'Show more',
    less: 'Show less',
  },
} as const;

/**
 * Sección "Docente" de la ficha Maxymia (diseño Figma): cabecera + un callout
 * destacado con el soporte de tutores (durante y DESPUÉS del curso — el gran
 * argumento de venta) + tarjeta del docente (foto, enlaces, bio con "Ver más").
 */
export function MaxymiaDocenteSection({
  instructor,
  locale = 'es',
}: {
  instructor?: MaxymiaInstructor;
  locale?: Locale;
}) {
  const [expanded, setExpanded] = useState(false);
  const t = COPY[locale];

  if (!instructor?.name) return null;

  const linkedinHref = instructor.linkedin
    ? instructor.linkedin.startsWith('http')
      ? instructor.linkedin
      : `https://${instructor.linkedin}`
    : null;

  return (
    <section className="py-10 md:py-20">
      <div className="max-w-[812px]">
        <SectionHeader overline={t.overline} title={t.title} />

        {/* Soporte de tutores — el gran argumento (callout destacado) */}
        <div className="mt-6 flex items-start gap-4 rounded-2xl border border-mx-orange/30 bg-mx-orange/[0.06] p-5 md:p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mx-orange/15 text-mx-orange">
            <LifeBuoy size={20} />
          </div>
          <p className="font-body text-mx-text text-[15px] md:text-[16px] leading-[1.5]">{t.support}</p>
        </div>

        {/* Tarjeta del docente */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row gap-6 md:gap-8"
        >
          {/* Izquierda: foto + enlaces */}
          <div className="w-full sm:w-[181px] shrink-0">
            <div className="relative aspect-square w-full sm:size-[181px] overflow-hidden rounded-[18px] border border-mx-border bg-black/[0.03]">
              {instructor.avatar ? (
                <Image src={instructor.avatar} alt={instructor.name} fill unoptimized className="object-cover" sizes="181px" />
              ) : (
                <div className="flex h-full items-center justify-center text-mx-text-muted">
                  <User size={40} />
                </div>
              )}
            </div>

            {(linkedinHref || instructor.email) && (
              <div className="mt-5 flex flex-col gap-2">
                {linkedinHref && (
                  <a
                    href={linkedinHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-[10px] border border-mx-border bg-white px-4 py-2.5 text-mx-text hover:border-mx-orange/40 transition-colors"
                  >
                    <Linkedin size={16} className="text-mx-orange" />
                    <span className="font-sans font-medium text-[12px]">LinkedIn</span>
                  </a>
                )}
                {instructor.email && (
                  <a
                    href={`mailto:${instructor.email}`}
                    className="flex items-center gap-3 rounded-[10px] border border-mx-border bg-white px-4 py-2.5 text-mx-text hover:border-mx-orange/40 transition-colors"
                  >
                    <Mail size={16} className="text-mx-orange" />
                    <span className="font-sans font-medium text-[12px]">Email</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Derecha: nombre, rol, bio */}
          <div className="flex-1 min-w-0">
            <h3 className="font-sans font-black text-mx-text text-[22px] md:text-[24px] uppercase leading-tight">
              {instructor.name}
            </h3>
            <p className="font-sans font-medium text-mx-text-muted text-[12px] mt-1.5">{instructor.role}</p>

            {instructor.bio && (
              <>
                <p
                  className={`font-body text-mx-text-muted text-[14px] md:text-[15px] leading-[1.6] mt-4 whitespace-pre-line ${
                    expanded ? '' : 'line-clamp-5'
                  }`}
                >
                  {instructor.bio}
                </p>
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-3 font-sans font-medium text-mx-orange text-[15px] hover:underline"
                >
                  {expanded ? t.less : t.more}
                </button>
              </>
            )}
          </div>
        </m.div>
      </div>
    </section>
  );
}
