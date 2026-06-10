'use client';

import React from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { StyledTitle } from './StyledTitle';

/**
 * Sellos de confianza ESPECÍFICOS de un curso/programa (relación `badges` en
 * Strapi). Misma estructura de sección que el FAQSection (overline + título
 * estilizado + contenido centrado) para que case visualmente con las FAQ,
 * dentro del mismo contenedor lg:col-span-2. Compartido por la ficha de
 * Maxymia y la de /programas. Se oculta si no hay sellos asignados.
 */
export function TrustSeals({
  badges,
  locale = 'es',
  overline,
  title,
}: {
  badges?: { name: string; imageUrl: string }[];
  locale?: 'es' | 'en';
  overline?: string;
  title?: string;
}) {
  if (!badges || badges.length === 0) return null;

  const ol = overline ?? (locale === 'es' ? 'Certificaciones y reconocimientos' : 'Certifications & awards');
  const tt = title ?? (locale === 'es' ? 'CALIDAD {ACREDITADA}' : 'ACCREDITED {QUALITY}');

  return (
    <section className="relative py-8 md:py-12 overflow-hidden bg-transparent">
      <div className="max-w-[900px] mx-auto px-6 md:px-12 relative">
        <m.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-mx-orange text-label-sm md:text-label-md xl:text-label-lg leading-label tracking-[0.3em] uppercase mb-6 text-center"
        >
          {ol}
        </m.p>

        <m.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-mx-blue text-heading-md md:text-heading-lg font-black tracking-tight leading-tight mb-10 text-center"
        >
          <StyledTitle text={tt} color="blue" />
        </m.h2>

        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-12"
        >
          {badges.map((b) => (
            <div
              key={b.name}
              title={b.name}
              className="relative h-16 w-24 md:h-20 md:w-28 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            >
              <Image
                src={b.imageUrl}
                alt={b.name}
                fill
                unoptimized
                className="object-contain"
                sizes="112px"
              />
            </div>
          ))}
        </m.div>
      </div>
    </section>
  );
}
