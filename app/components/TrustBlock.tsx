'use client';

import React from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';

type Logo = { name: string; imageUrl: string };

/** Etiqueta de grupo grande y "hueca" (text-stroke azul, relleno = fondo). */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-stroke text-heading-md md:text-heading-lg font-black tracking-tight uppercase shrink-0 leading-none"
      style={{ '--stroke-color': 'var(--color-mx-blue)' } as React.CSSProperties}
    >
      {children}
    </span>
  );
}

/**
 * Bloque de confianza UNIFICADO para la ficha (Maxymia y /programas): dos
 * grupos —instituciones/clientes (logos) y certificaciones (sellos CON su
 * nombre)— cada uno encabezado por una barra divisoria con su etiqueta en
 * azul. Sin título ni overline; el peso visual lo llevan las separaciones.
 * Tema claro, estilo de la web. Se oculta si no hay nada.
 */
export function TrustBlock({
  institutions,
  certifications,
  locale = 'es',
}: {
  institutions?: Logo[];
  certifications?: Logo[];
  locale?: 'es' | 'en';
}) {
  const hasInst = !!institutions?.length;
  const hasCert = !!certifications?.length;
  if (!hasInst && !hasCert) return null;

  return (
    <section className="relative py-8 md:py-32 overflow-hidden bg-transparent">
      <div className="max-w-[900px] relative">
        {/* Instituciones / clientes */}
        {hasInst && (
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-7 md:mb-9">
              <SectionLabel>{locale === 'es' ? 'Instituciones' : 'Institutions'}</SectionLabel>
              <div className="h-px flex-1 bg-mx-border" />
            </div>
            <div className="flex flex-wrap items-center justify-start gap-8 md:gap-12">
              {institutions!.map((i) => (
                <div
                  key={i.name}
                  title={i.name}
                  className="relative h-14 w-20 md:h-16 md:w-24 hover:scale-[1.06] transition-transform duration-300"
                >
                  <Image src={i.imageUrl} alt={i.name} fill unoptimized className="object-contain" sizes="96px" />
                </div>
              ))}
            </div>
          </m.div>
        )}

        {/* Certificaciones (sello + nombre debajo) */}
        {hasCert && (
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={hasInst ? 'mt-10 md:mt-14' : ''}
          >
            <div className="flex items-center gap-4 mb-7 md:mb-9">
              <SectionLabel>{locale === 'es' ? 'Certificaciones' : 'Certifications'}</SectionLabel>
              <div className="h-px flex-1 bg-mx-border" />
            </div>
            <div className="flex flex-wrap items-start justify-start gap-x-8 gap-y-7 md:gap-x-12">
              {certifications!.map((c) => (
                <div key={c.name} className="flex flex-col items-center gap-2.5 w-20 md:w-24">
                  <div className="relative h-12 w-16 md:h-14 md:w-20">
                    <Image src={c.imageUrl} alt={c.name} fill unoptimized className="object-contain" sizes="80px" />
                  </div>
                  <span className="text-mx-text-muted text-label-sm text-center leading-tight">
                    {c.name}
                  </span>
                </div>
              ))}
            </div>
          </m.div>
        )}
      </div>
    </section>
  );
}
