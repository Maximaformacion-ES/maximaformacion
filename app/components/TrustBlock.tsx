'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';

type Logo = { name: string; imageUrl: string; category?: string | null };

/* ── Copy fijo de las secciones (lo pasó el cliente) ─────────────────────── */
// Los títulos usan `\n` para el salto de línea y `{...}` para la parte hueca
// (stroke) en la MISMA línea — ver StrokedTitle.
const COPY = {
  es: {
    instOverline: 'Grandes Organizaciones Nacionales',
    instTitle: 'Instituciones de referencia\n{Confían en nosotros}',
    instDesc:
      'Equipos y profesionales de organismos como el CSIC, el Servicio Andaluz de Salud, el Banco de España o el Departament de Salut de la Generalitat de Catalunya ya se han formado con Máxima Formación.',
    certOverline: 'Certificaciones',
    certTitle: 'Calidad Acreditada,\n{Confianza demostrada}',
    certDesc:
      'Certificaciones, valoraciones y reconocimientos que avalan nuestra forma de trabajar y la satisfacción de nuestros alumnos.',
    certOtros: 'Otros sellos',
  },
  en: {
    instOverline: 'Leading institutions',
    instTitle: 'Leading institutions\n{that trust us}',
    instDesc:
      'Teams and professionals from organisations such as the CSIC, the Andalusian Health Service, the Bank of Spain or the Health Department of the Generalitat de Catalunya have already trained with Máxima Formación.',
    certOverline: 'Certifications',
    certTitle: 'Accredited quality,\n{proven trust}',
    certDesc:
      'Certifications, ratings and recognitions that back our way of working and our students’ satisfaction.',
    certOtros: 'Other badges',
  },
} as const;

/* Los 3 bloques fijos de la sección de certificaciones. Cada `match` agrupa los
   `badges` del curso cuyo `category` (en minúsculas) contenga alguno de esos
   términos, así el editor puede nombrar la categoría con libertad. */
const CERT_BLOCKS = [
  {
    key: 'iso',
    match: ['iso', 'gestion', 'gestión', 'certificad', 'sostenib', 'seguridad'],
    es: {
      title: 'Gestión, seguridad y sostenibilidad certificadas',
      desc: 'Contamos con certificaciones ISO 9001, ISO 27001 e ISO 14001, que acreditan nuestro compromiso con la calidad del servicio, la seguridad de la información y una gestión ambiental responsable.',
    },
    en: {
      title: 'Certified management, security and sustainability',
      desc: 'We hold ISO 9001, ISO 27001 and ISO 14001 certifications, proving our commitment to service quality, information security and responsible environmental management.',
    },
  },
  {
    key: 'valoraciones',
    match: ['valorac', 'reseñ', 'resen', 'opinion', 'google', 'emagister', 'dozencia'],
    es: {
      title: 'Valoraciones reales de alumnos',
      desc: 'Nuestra formación cuenta con una valoración de 5,0 en Google con más de 120 reseñas, 4,9 en Emagister con más de 1.000 opiniones de alumnos y 4,8 en Dozencia con cerca de 100 valoraciones.',
    },
    en: {
      title: 'Real student ratings',
      desc: 'Our training holds a 5.0 rating on Google with 120+ reviews, 4.9 on Emagister with 1,000+ student opinions and 4.8 on Dozencia with nearly 100 ratings.',
    },
  },
  {
    key: 'reconocimientos',
    match: ['reconoc', 'cum laude', 'confianza', 'excelencia', 'trayectoria'],
    es: {
      title: 'Reconocimientos a nuestra trayectoria formativa',
      desc: 'Máxima Formación cuenta con el sello Cum Laude de Emagister de forma ininterrumpida desde 2018, certificado de excelencia en Dozencia y certificado de Confianza Online.',
    },
    en: {
      title: 'Recognitions for our training track record',
      desc: 'Máxima Formación holds the Emagister Cum Laude seal uninterruptedly since 2018, a Dozencia excellence certificate and a Confianza Online certificate.',
    },
  },
] as const;

/* Las 4 instituciones que deben ir DESTACADAS (muro de confianza), en este
 * orden fijo. El resto van a los carruseles. Se casan por subcadena del nombre
 * (insensible a mayúsculas), así que da igual cómo estén escritas exactamente en
 * Strapi. 'salut' (catalán) no choca con 'salud' (Servicio Andaluz de Salud). */
const FEATURED_INSTITUTIONS: { match: string[] }[] = [
  { match: ['csic'] },
  { match: ['andaluz', 'sas'] }, // Servicio Andaluz de Salud
  { match: ['banco'] }, // Banco de España (robusto a "de"/ñ/espacios; es el único banco)
  { match: ['salut', 'departament'] }, // Departament de Salut (Generalitat de Catalunya)
];

/** Normaliza para casar: minúsculas, sin acentos, espacios colapsados. Así
 *  "Banco de España", "BANCO DE ESPAÑA" o "Banco  de  Espana" casan igual. */
function normName(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Título de sección "como antes": ZT Nature Black azul, dos líneas con parte
 *  hueca (text-stroke). Respeta `\n` (salto de línea) y `{...}` (hueco inline). */
function StrokedTitle({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, li) => (
        <React.Fragment key={li}>
          {li > 0 && <br />}
          {line.split(/(\{[^}]+\})/).map((seg, si) => {
            const stroke = seg.match(/^\{(.+)\}$/);
            return stroke ? (
              <span
                key={si}
                className="text-stroke"
                style={{ '--stroke-color': 'var(--color-mx-blue)' } as React.CSSProperties}
              >
                {stroke[1]}
              </span>
            ) : (
              <React.Fragment key={si}>{seg}</React.Fragment>
            );
          })}
        </React.Fragment>
      ))}
    </>
  );
}

function TrustHeader({ overline, title, description }: { overline: string; title: string; description: string }) {
  return (
    <div className="flex flex-col gap-2.5 max-w-[812px]">
      <span className="font-sans font-medium text-mx-orange text-[14px] tracking-[4px] uppercase leading-none">
        {overline}
      </span>
      <h2 className="font-sans font-black text-mx-blue text-[28px] md:text-[36px] leading-[1.15] tracking-tight uppercase mt-1">
        <StrokedTitle text={title} />
      </h2>
      <p className="font-body text-mx-text-muted text-[14px] md:text-[16px] leading-[1.4]">
        {description}
      </p>
    </div>
  );
}

/** Un sello con su nombre debajo (imagen 80×56 + etiqueta). */
function Seal({ logo }: { logo: Logo }) {
  return (
    <div className="flex flex-col items-center gap-3 w-32 md:w-40">
      <div className="relative h-20 w-28 md:h-24 md:w-36">
        <Image src={logo.imageUrl} alt={logo.name} fill unoptimized className="object-contain" sizes="144px" />
      </div>
      <span className="font-sans font-medium text-mx-text-muted text-[11px] md:text-[12px] text-center leading-tight">
        {logo.name}
      </span>
    </div>
  );
}

/** Hilera de logos secundarios en marquee continuo (lento). `reverse` invierte
 *  el sentido. Se pausa al pasar el ratón; cada logo recupera el color y muestra
 *  un tooltip con su nombre (mismo estilo que las destacadas). El `pt-10` deja
 *  sitio para que el tooltip no lo recorte el overflow del carrusel. */
function Marquee({ items, reverse = false }: { items: Logo[]; reverse?: boolean }) {
  if (!items.length) return null;
  return (
    <div className="group relative overflow-hidden pt-10 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div
        className={`flex w-max items-center gap-12 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} group-hover:[animation-play-state:paused]`}
      >
        {[...items, ...items].map((i, idx) => (
          <div key={`${i.name}-${idx}`} className="group/logo relative h-9 w-28 shrink-0">
            <Image
              src={i.imageUrl}
              alt={i.name}
              fill
              unoptimized
              sizes="140px"
              className="object-contain grayscale opacity-60 transition duration-300 group-hover/logo:grayscale-0 group-hover/logo:opacity-100 group-hover/logo:scale-110"
            />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-mx-text px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover/logo:opacity-100">
              {i.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

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

  // Destacadas: exactamente las 4 de FEATURED_INSTITUTIONS (en su orden),
  // casadas por nombre. El resto van a los carruseles. Si alguna no está en
  // los datos, simplemente no se muestra (no se rellena con otras).
  const allInst = institutions ?? [];
  const featured: Logo[] = [];
  const usedIdx = new Set<number>();
  for (const f of FEATURED_INSTITUTIONS) {
    const idx = allInst.findIndex(
      (inst, i) => !usedIdx.has(i) && f.match.some((m) => normName(inst.name).includes(m)),
    );
    if (idx >= 0) {
      featured.push(allInst[idx]);
      usedIdx.add(idx);
    }
  }
  const secondary = allInst.filter((_, i) => !usedIdx.has(i));

  // Reparte los sellos en los 3 bloques fijos según su categoría, y manda los
  // que NO tengan categoría (o no casen) a un bloque "Otros sellos", para que
  // SIEMPRE aparezcan todos aunque no estén categorizados en Strapi.
  const certByBlock = useMemo(() => {
    const all = certifications ?? [];
    const assigned = new Set<Logo>();
    const blocks: { key: string; title: string; desc?: string; items: Logo[] }[] = [];
    for (const block of CERT_BLOCKS) {
      const items = all.filter((c) => {
        const cat = (c.category ?? '').toLowerCase();
        return cat && block.match.some((m) => cat.includes(m));
      });
      items.forEach((i) => assigned.add(i));
      if (items.length > 0) {
        blocks.push({ key: block.key, title: block[locale].title, desc: block[locale].desc, items });
      }
    }
    const leftover = all.filter((c) => !assigned.has(c));
    if (leftover.length > 0) {
      blocks.push({ key: 'otros', title: t.certOtros, items: leftover });
    }
    return blocks;
  }, [certifications, locale, t]);

  if (!hasInst && !hasCert) return null;

  return (
    <section className="relative bg-transparent py-10 md:py-20">
      <div className="max-w-[812px]">
        {/* ── Instituciones / clientes ─────────────────────────────────── */}
        {hasInst && (
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <TrustHeader overline={t.instOverline} title={t.instTitle} description={t.instDesc} />

            {/* 4 destacadas, en tarjetas (muro de confianza). Caja interior fija
                para que todos los logos ocupen el mismo tamaño. */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map((i) => (
                <div
                  key={i.name}
                  className="group relative flex items-center justify-center h-24 md:h-28 rounded-xl border border-mx-border bg-white px-5 hover:border-mx-orange/40 hover:shadow-[0_10px_28px_-14px_rgba(0,0,0,0.18)] transition-all duration-300"
                >
                  <div className="relative w-full h-11 md:h-12">
                    <Image src={i.imageUrl} alt={i.name} fill unoptimized className="object-contain" sizes="200px" />
                  </div>
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-mx-text px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                    {i.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Resto, secundarias: dos hileras en sentidos opuestos, lentas */}
            {secondary.length > 0 && (
              <div className="mt-6 flex flex-col gap-1">
                <Marquee items={secondary.slice(0, Math.ceil(secondary.length / 2))} />
                <Marquee items={secondary.slice(Math.ceil(secondary.length / 2))} reverse />
              </div>
            )}
          </m.div>
        )}

        {/* ── Certificaciones / valoraciones / reconocimientos ─────────── */}
        {hasCert && (
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={hasInst ? 'mt-16 md:mt-24' : ''}
          >
            <TrustHeader overline={t.certOverline} title={t.certTitle} description={t.certDesc} />

            <div className="mt-10 flex flex-col gap-10">
              {certByBlock.map(({ key, title, desc, items }) => (
                <div key={key}>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="font-sans font-black text-mx-text text-[16px] tracking-tight shrink-0 leading-tight">
                      {title}
                    </span>
                    <div className="h-px flex-1 bg-mx-border" />
                  </div>
                  {desc && (
                    <p className="font-body text-mx-text-muted text-[14px] md:text-[16px] leading-[1.4] max-w-[760px] mb-6">
                      {desc}
                    </p>
                  )}
                  <div className="flex flex-wrap items-start justify-center gap-6">
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
