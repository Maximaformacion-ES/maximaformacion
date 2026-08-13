'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { Linkedin, Mail, User } from 'lucide-react';
import { SectionHeader } from '@/app/components/SectionHeader';
import { markdownToHtml } from '@/lib/markdown';
import { DocenteContactModal } from './DocenteContactModal';

type Locale = 'es' | 'en';

/** Forma común del docente compartida por Maxymia y /programas. */
export interface Docente {
  documentId: string;
  slug?: string | null;
  name: string;
  role?: string | null;
  roleDescription?: string | null;
  avatar?: string | null;
  bio?: string | null;
  linkedin?: string | null;
  email?: string | null;
}

const COPY = {
  es: { overline: 'Quién enseña', title: 'Docente', more: 'Ver más', less: 'Ver menos' },
  en: { overline: 'Who teaches', title: 'Instructor', more: 'Show more', less: 'Show less' },
} as const;

function DocenteCard({ docente, locale, courseTitle }: { docente: Docente; locale: Locale; courseTitle?: string }) {
  const t = COPY[locale];
  const [expanded, setExpanded] = useState(false);
  const [bioHtml, setBioHtml] = useState('');
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    // markdownToHtml('') → '' , así que llamarlo siempre evita el setBioHtml('')
    // síncrono del caso "sin bio": el único setState queda dentro del .then.
    let cancelled = false;
    markdownToHtml(docente.bio || '').then((html) => {
      if (!cancelled) setBioHtml(html);
    });
    return () => {
      cancelled = true;
    };
  }, [docente.bio]);

  const linkedinHref = docente.linkedin
    ? docente.linkedin.startsWith('http')
      ? docente.linkedin
      : `https://${docente.linkedin}`
    : null;

  // Nota: extraído a variable con `||` a propósito. El `docente.slug ?? undefined`
  // inline en el JSX dispara un artefacto de Turbopack ("_docente_slug is not defined").
  const docenteSlug = docente.slug || undefined;

  return (
    <>
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
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="flex items-center gap-3 rounded-[10px] border border-mx-border bg-white px-4 py-2.5 text-mx-text hover:border-mx-orange/40 transition-colors"
                >
                  <Mail size={16} className="text-mx-orange" />
                  <span className="font-sans font-medium text-[12px]">Email</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Derecha: nombre, rol, bio */}
        <div className="flex-1 min-w-0">
          <h3 className="font-sans font-black text-mx-text text-[20px] md:text-[24px] uppercase leading-tight">{docente.name}</h3>
          {(docente.roleDescription || docente.role) && (
            <p className="font-sans font-medium text-mx-text-muted text-[12px] mt-1.5">
              {docente.roleDescription || docente.role}
            </p>
          )}

          {bioHtml && (
            <div className="mt-4">
              <m.div
                initial={false}
                animate={{ height: expanded ? 'auto' : 150 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
                className="relative overflow-hidden"
              >
                <div
                  className="font-body text-mx-text-muted text-[14px] md:text-[16px] leading-[1.6] [&_p]:mb-3 [&_p:last-child]:mb-0"
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
                  className="font-sans font-medium text-mx-orange text-[14px] hover:underline cursor-pointer"
                >
                  {expanded ? t.less : t.more}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <DocenteContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        docenteSlug={docenteSlug}
        docenteName={docente.name}
        courseTitle={courseTitle}
        locale={locale}
      />
    </>
  );
}

/**
 * Sección "Docente" (diseño Figma): cabecera + tarjeta(s) del docente con bio
 * desplegable ("ver más" con peek), LinkedIn y botón Email → formulario de
 * contacto. Los docentes salen de la relación `author` en Strapi (perfil
 * completo). Compartida por Maxymia y /programas; `overline`/`title` permiten
 * adaptar la cabecera (p. ej. "Profesorado" cuando hay varios).
 */
export function DocenteSection({
  docentes,
  locale = 'es',
  courseTitle,
  overline,
  title,
}: {
  docentes?: Docente[];
  locale?: Locale;
  courseTitle?: string;
  overline?: string;
  title?: string;
}) {
  const t = COPY[locale];
  if (!docentes?.length) return null;

  return (
    <section className="py-10 md:py-20">
      <div className="max-w-[812px]">
        <SectionHeader overline={overline ?? t.overline} title={title ?? t.title} />

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 flex flex-col gap-12"
        >
          {docentes.map((d) => (
            <DocenteCard key={d.documentId} docente={d} locale={locale} courseTitle={courseTitle} />
          ))}
        </m.div>
      </div>
    </section>
  );
}
