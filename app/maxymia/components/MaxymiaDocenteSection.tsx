'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { Linkedin, Mail, Quote, User } from 'lucide-react';
import { SectionHeader } from '@/app/components/SectionHeader';
import { markdownToHtml } from '@/lib/markdown';
import type { MaxymiaDocente, Locale } from '../types';

/** Fundador (fijo/global) para la nota de acompañamiento. Datos reales del
 *  `author` Alfonso Lara en Strapi (foto WP, rol). El mensaje es copy a medida. */
const FOUNDER = {
  name: 'Alfonso Lara',
  role: 'Fundador y director de Máxima Formación',
  photo: 'https://www.maximaformacion.es/wp-content/uploads/2021/02/Alfonso-Lara-Nunez-Maxima-Formacion-300x300.jpg',
};

const COPY = {
  es: {
    overline: 'Quién enseña',
    title: 'Docente',
    founder:
      'Cuando creé Máxima Formación lo hice con una idea clara: que nadie aprenda solo. Por eso, más allá del temario, te acompañamos de verdad: nuestros tutores resuelven tus dudas en menos de 24 horas, durante el curso y también cuando lo termines. Tu progreso nos importa tanto como a ti.',
    more: 'Ver más',
    less: 'Ver menos',
  },
  en: {
    overline: 'Who teaches',
    title: 'Instructor',
    founder:
      'When I founded Máxima Formación I did it with one clear idea: that no one learns alone. That’s why, beyond the syllabus, we truly support you: our tutors answer your questions in under 24 hours, during the course and also after you finish it. Your progress matters to us as much as it does to you.',
    more: 'Show more',
    less: 'Show less',
  },
} as const;

function DocenteCard({ docente, locale }: { docente: MaxymiaDocente; locale: Locale }) {
  const t = COPY[locale];
  const [expanded, setExpanded] = useState(false);
  const [bioHtml, setBioHtml] = useState('');

  useEffect(() => {
    if (docente.bio) markdownToHtml(docente.bio).then(setBioHtml);
    else setBioHtml('');
  }, [docente.bio]);

  const linkedinHref = docente.linkedin
    ? docente.linkedin.startsWith('http')
      ? docente.linkedin
      : `https://${docente.linkedin}`
    : null;

  return (
    <div className="flex flex-col sm:flex-row gap-6 md:gap-8">
      {/* Izquierda: foto + enlaces */}
      <div className="w-full sm:w-[181px] shrink-0">
        <div className="relative aspect-square w-full sm:size-[181px] overflow-hidden rounded-[18px] border border-mx-border bg-black/[0.03]">
          {docente.avatar ? (
            <Image src={docente.avatar} alt={docente.name} fill unoptimized className="object-cover" sizes="181px" />
          ) : (
            <div className="flex h-full items-center justify-center text-mx-text-muted">
              <User size={40} />
            </div>
          )}
        </div>

        {(linkedinHref || docente.email) && (
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
            {docente.email && (
              <a
                href={`mailto:${docente.email}`}
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
        <h3 className="font-sans font-black text-mx-text text-[22px] md:text-[24px] uppercase leading-tight">{docente.name}</h3>
        <p className="font-sans font-medium text-mx-text-muted text-[12px] mt-1.5">
          {docente.roleDescription || docente.role}
        </p>

        {bioHtml && (
          <div className="mt-4">
            <m.div
              initial={false}
              animate={{ height: expanded ? 'auto' : 150 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className="relative overflow-hidden"
            >
              <div
                className="font-body text-mx-text-muted text-[14px] md:text-[15px] leading-[1.6] [&_p]:mb-3 [&_p:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: bioHtml }}
              />
              {/* "Peek": degradado que deja entrever el texto que falta */}
              {!expanded && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-mx-bg to-transparent" />
              )}
            </m.div>
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="font-sans font-medium text-mx-orange text-[15px] hover:underline cursor-pointer"
              >
                {expanded ? t.less : t.more}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Sección "Docente" de la ficha Maxymia (diseño Figma): cabecera + callout con
 * el soporte de tutores (durante y DESPUÉS del curso — gran argumento de venta)
 * + tarjeta(s) del docente. Los docentes salen de la relación `author` en Strapi
 * (perfil completo: bio, rol, foto, LinkedIn, email).
 */
export function MaxymiaDocenteSection({
  docentes,
  locale = 'es',
}: {
  docentes?: MaxymiaDocente[];
  locale?: Locale;
}) {
  const t = COPY[locale];
  if (!docentes?.length) return null;

  return (
    <section className="py-10 md:py-20">
      <div className="max-w-[812px]">
        <SectionHeader overline={t.overline} title={t.title} />

        {/* Nota del fundador — compromiso de acompañamiento (cara + firma). */}
        <figure className="mt-6 rounded-2xl border border-mx-border bg-white p-6 md:p-8">
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
                {t.founder}
              </blockquote>
              <figcaption className="mt-4 font-sans">
                <span className="font-bold text-mx-text text-[14px]">{FOUNDER.name}</span>
                <span className="text-mx-text-muted text-[13px]"> · {FOUNDER.role}</span>
              </figcaption>
            </div>
          </div>
        </figure>

        {/* Tarjeta(s) del docente */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 flex flex-col gap-12"
        >
          {docentes.map((d) => (
            <DocenteCard key={d.documentId} docente={d} locale={locale} />
          ))}
        </m.div>
      </div>
    </section>
  );
}
