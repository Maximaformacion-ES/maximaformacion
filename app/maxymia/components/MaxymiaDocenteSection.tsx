'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { Linkedin, Mail, LifeBuoy, User } from 'lucide-react';
import { SectionHeader } from '@/app/components/SectionHeader';
import { markdownToHtml } from '@/lib/markdown';
import type { MaxymiaDocente, Locale } from '../types';

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
          <>
            <div
              className={`font-body text-mx-text-muted text-[14px] md:text-[15px] leading-[1.6] mt-4 [&_p]:mb-3 [&_p:last-child]:mb-0 ${
                expanded ? '' : 'line-clamp-5'
              }`}
              dangerouslySetInnerHTML={{ __html: bioHtml }}
            />
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

        {/* Soporte de tutores — el gran argumento (callout destacado) */}
        <div className="mt-6 flex items-start gap-4 rounded-2xl border border-mx-orange/30 bg-mx-orange/[0.06] p-5 md:p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mx-orange/15 text-mx-orange">
            <LifeBuoy size={20} />
          </div>
          <p className="font-body text-mx-text text-[15px] md:text-[16px] leading-[1.5]">{t.support}</p>
        </div>

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
