'use client';

import React from 'react';
import Image from 'next/image';

/**
 * Sellos de confianza ESPECÍFICOS de un curso/programa (relación `badges` en
 * Strapi). Diseño compacto en tema claro — distinto del mosaico grande de la
 * home (BadgesSection). Compartido por la ficha de Maxymia y la de /programas.
 * Se oculta si el curso/programa no tiene sellos asignados.
 */
export function TrustSeals({
  badges,
  locale = 'es',
}: {
  badges?: { name: string; imageUrl: string }[];
  locale?: 'es' | 'en';
}) {
  if (!badges || badges.length === 0) return null;
  return (
    // Bloque de columna (vive dentro del contenedor lg:col-span-2 del hero,
    // junto a las FAQ) — sin <section> full-width: la columna ya aporta ancho
    // y padding. Mismo espaciado superior que el bloque de FAQ.
    <div className="mt-12 md:mt-16 rounded-2xl border border-mx-border bg-black/[0.015] px-6 md:px-8 py-7 md:py-8 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
      <p className="text-mx-text-muted text-label-sm md:text-label-md tracking-[0.2em] uppercase shrink-0 sm:max-w-[160px] leading-snug">
        {locale === 'es' ? 'Certificaciones y reconocimientos' : 'Certifications & awards'}
      </p>
      <div className="flex flex-wrap items-center gap-6 md:gap-8">
        {badges.map((b) => (
          <div
            key={b.name}
            title={b.name}
            className="relative h-12 w-16 md:h-14 md:w-20 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
          >
            <Image
              src={b.imageUrl}
              alt={b.name}
              fill
              unoptimized
              className="object-contain"
              sizes="80px"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
