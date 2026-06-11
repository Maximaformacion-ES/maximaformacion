'use client';

import React from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { StyledTitle } from './StyledTitle';

type Logo = { name: string; imageUrl: string };

/**
 * Bloque de confianza UNIFICADO para la ficha (Maxymia y /programas): un solo
 * título y dos grupos diferenciados — instituciones/clientes (logos) arriba y
 * certificaciones (sellos CON su nombre) abajo, separados por un divisor. Evita
 * repetir dos secciones con la misma estructura. Estilo de la web (overline
 * naranja + StyledTitle azul + tema claro). Se oculta si no hay nada.
 */
export function TrustBlock({
  institutions,
  certifications,
  locale = 'es',
  overline,
  title,
}: {
  institutions?: Logo[];
  certifications?: Logo[];
  locale?: 'es' | 'en';
  overline?: string;
  title?: string;
}) {
  const hasInst = !!institutions?.length;
  const hasCert = !!certifications?.length;
  if (!hasInst && !hasCert) return null;

  const ol = overline ?? (locale === 'es' ? 'Confían en nosotros' : 'They trust us');
  const tt = title ?? (locale === 'es' ? 'POR QUÉ {CONFIAR}' : 'WHY {TRUST US}');

  return (
    <section className="relative py-8 md:py-32 overflow-hidden bg-transparent">
      <div className="max-w-[900px] px-6 md:px-12 relative">
        <m.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-mx-orange text-label-sm md:text-label-md xl:text-label-lg leading-label tracking-[0.3em] uppercase mb-6 text-left"
        >
          {ol}
        </m.p>

        <m.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-mx-blue text-heading-md md:text-heading-lg font-black tracking-tight leading-tight mb-10 text-left"
        >
          <StyledTitle text={tt} color="blue" />
        </m.h2>

        {/* Instituciones / clientes (solo logos) */}
        {hasInst && (
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-wrap items-center justify-start gap-8 md:gap-12"
          >
            {institutions!.map((i) => (
              <div
                key={i.name}
                title={i.name}
                className="relative h-14 w-20 md:h-16 md:w-24 hover:scale-[1.06] transition-transform duration-300"
              >
                <Image src={i.imageUrl} alt={i.name} fill unoptimized className="object-contain" sizes="96px" />
              </div>
            ))}
          </m.div>
        )}

        {/* Divisor con etiqueta "Certificaciones" (solo si hay ambos grupos) */}
        {hasInst && hasCert && (
          <div className="flex items-center gap-4 my-9 md:my-11">
            <span className="text-mx-text-muted text-label-sm tracking-[0.2em] uppercase shrink-0">
              {locale === 'es' ? 'Certificaciones' : 'Certifications'}
            </span>
            <div className="h-px flex-1 bg-mx-border" />
          </div>
        )}

        {/* Certificaciones (sello + nombre debajo) */}
        {hasCert && (
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={`flex flex-wrap items-start justify-start gap-x-8 gap-y-7 md:gap-x-12 ${hasInst ? '' : 'mt-10'}`}
          >
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
          </m.div>
        )}
      </div>
    </section>
  );
}
