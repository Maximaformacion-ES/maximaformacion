'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { SectionHeader } from './SectionHeader';

type Logo = { name: string; imageUrl: string; category?: string | null };

const COPY = {
  es: {
    instOverline: 'Grandes instituciones',
    instTitle: 'Confían en {Nosotros}',
    instDesc: 'Contamos con la confianza de grandes instituciones nacionales que aprueban nuestra metodología de trabajo.',
    certOverline: 'Certificaciones',
    certTitle: 'Calidad {Acreditada}',
    certDesc: 'Contamos con certificaciones ISO 9001, ISO 14001 e ISO 27001, el sello Cum Laude de Emagister desde 2018 y una valoración de 5.0 en Google con más de 120 reseñas.',
  },
  en: {
    instOverline: 'Leading institutions',
    instTitle: 'They trust {Us}',
    instDesc: 'We have the trust of major national institutions that endorse our methodology.',
    certOverline: 'Certifications',
    certTitle: 'Accredited {Quality}',
    certDesc: 'We hold ISO 9001, ISO 14001 and ISO 27001 certifications, the Cum Laude seal from Emagister since 2018 and a 5.0 rating on Google with 120+ reviews.',
  },
} as const;

/** Un sello con su nombre debajo (Figma: imagen 80×56 + etiqueta ZT Nature 10px). */
function Seal({ logo }: { logo: Logo }) {
  return (
    <div className="flex flex-col items-center gap-2.5 w-24">
      <div className="relative h-14 w-20">
        <Image src={logo.imageUrl} alt={logo.name} fill unoptimized className="object-contain" sizes="80px" />
      </div>
      <span className="font-sans font-medium text-mx-text-muted text-[10px] text-center leading-[12.5px]">
        {logo.name}
      </span>
    </div>
  );
}

/**
 * Bloque de confianza UNIFICADO para la ficha (Maxymia y /programas), según el
 * frame de Figma: dos secciones con cabecera completa (overline + título
 * sólido/hueco + descripción) —Instituciones y Certificaciones—. Las
 * certificaciones se agrupan por `category` (p. ej. Ciberseguridad, Docencia),
 * cada grupo con su subtítulo y una línea divisoria. Se oculta si no hay nada.
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
  const t = COPY[locale];
  const hasInst = !!institutions?.length;
  const hasCert = !!certifications?.length;

  // Agrupar certificaciones por categoría, conservando el orden de aparición.
  // Los sellos sin categoría van a un grupo sin subtítulo.
  const certGroups = useMemo(() => {
    const map = new Map<string, Logo[]>();
    for (const c of certifications ?? []) {
      const key = c.category?.trim() || '';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    return Array.from(map.entries());
  }, [certifications]);

  if (!hasInst && !hasCert) return null;

  return (
    <section className="relative overflow-hidden bg-transparent py-10 md:py-20">
      <div className="max-w-[812px]">
        {/* Instituciones / clientes */}
        {hasInst && (
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <SectionHeader overline={t.instOverline} title={t.instTitle} description={t.instDesc} />
            <div className="mt-9 flex flex-wrap items-center justify-start gap-x-12 gap-y-7">
              {institutions!.map((i) => (
                <div key={i.name} title={i.name} className="relative h-10 md:h-12 hover:scale-[1.06] transition-transform duration-300">
                  <Image
                    src={i.imageUrl}
                    alt={i.name}
                    width={160}
                    height={48}
                    unoptimized
                    className="h-10 md:h-12 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </m.div>
        )}

        {/* Certificaciones (agrupadas por categoría) */}
        {hasCert && (
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={hasInst ? 'mt-16 md:mt-24' : ''}
          >
            <SectionHeader overline={t.certOverline} title={t.certTitle} description={t.certDesc} />
            <div className="mt-10 flex flex-col gap-10">
              {certGroups.map(([category, items]) => (
                <div key={category || '_'}>
                  {category && (
                    <div className="flex items-center gap-4 mb-7">
                      <span className="font-sans font-black text-mx-text text-[18px] md:text-[20px] tracking-[0.18em] uppercase shrink-0 leading-none">
                        {category}
                      </span>
                      <div className="h-px flex-1 bg-mx-border" />
                    </div>
                  )}
                  <div className="flex flex-wrap items-start justify-start gap-6">
                    {items.map((c) => (
                      <Seal key={c.name} logo={c} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </m.div>
        )}
      </div>
    </section>
  );
}
