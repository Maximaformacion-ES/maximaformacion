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
    instOverline: 'Grandes instituciones',
    instTitle: 'Instituciones de referencia\n{Confían en nosotros}',
    instDesc:
      'Equipos y profesionales de organismos como el CSIC, el Servicio Andaluz de Salud, el Banco de España o el Departament de Salut de la Generalitat de Catalunya ya se han formado con Máxima Formación.',
    certOverline: 'Certificaciones',
    certTitle: 'Calidad Acreditada,\n{Confianza demostrada}',
    certDesc:
      'Certificaciones, valoraciones y reconocimientos que avalan nuestra forma de trabajar y la satisfacción de nuestros alumnos.',
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

const FEATURED_COUNT = 4;

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
      <span className="font-sans font-medium text-mx-orange text-[13px] md:text-[14px] tracking-[4px] uppercase leading-none">
        {overline}
      </span>
      <h2 className="font-sans font-black text-mx-blue text-[28px] md:text-[36px] leading-[1.15] tracking-tight uppercase mt-1">
        <StrokedTitle text={title} />
      </h2>
      <p className="font-body text-mx-text-muted text-[15px] md:text-[16px] leading-[1.4]">
        {description}
      </p>
    </div>
  );
}

/** Un sello con su nombre debajo (imagen 80×56 + etiqueta). */
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

  const featured = (institutions ?? []).slice(0, FEATURED_COUNT);
  const secondary = (institutions ?? []).slice(FEATURED_COUNT);

  // Reparte los sellos del curso en los 3 bloques fijos según su categoría.
  const certByBlock = useMemo(() => {
    return CERT_BLOCKS.map((block) => {
      const items = (certifications ?? []).filter((c) => {
        const cat = (c.category ?? '').toLowerCase();
        return cat && block.match.some((m) => cat.includes(m));
      });
      return { block, items };
    }).filter((b) => b.items.length > 0);
  }, [certifications]);

  if (!hasInst && !hasCert) return null;

  return (
    <section className="relative overflow-hidden bg-transparent py-10 md:py-20">
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

            {/* 4 destacadas, en tarjetas (muro de confianza) */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map((i) => (
                <div
                  key={i.name}
                  title={i.name}
                  className="flex items-center justify-center h-24 md:h-28 rounded-xl border border-mx-border bg-white px-5 hover:border-mx-orange/40 hover:shadow-[0_10px_28px_-14px_rgba(0,0,0,0.18)] transition-all duration-300"
                >
                  <Image
                    src={i.imageUrl}
                    alt={i.name}
                    width={200}
                    height={96}
                    unoptimized
                    className="max-h-12 md:max-h-16 w-auto object-contain"
                  />
                </div>
              ))}
            </div>

            {/* Resto, secundarias, en marquee continuo */}
            {secondary.length > 0 && (
              <div className="mt-10 relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
                <m.div
                  className="flex items-center gap-12 w-max opacity-60"
                  animate={{ x: ['0%', '-50%'] }}
                  transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
                >
                  {[...secondary, ...secondary].map((i, idx) => (
                    <div key={`${i.name}-${idx}`} title={i.name} className="relative h-8 md:h-9 shrink-0">
                      <Image src={i.imageUrl} alt={i.name} width={140} height={36} unoptimized className="h-8 md:h-9 w-auto object-contain grayscale" />
                    </div>
                  ))}
                </m.div>
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
              {certByBlock.map(({ block, items }) => (
                <div key={block.key}>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="font-sans font-black text-mx-text text-[16px] md:text-[18px] tracking-tight shrink-0 leading-tight">
                      {block[locale].title}
                    </span>
                    <div className="h-px flex-1 bg-mx-border" />
                  </div>
                  <p className="font-body text-mx-text-muted text-[14px] md:text-[15px] leading-[1.4] max-w-[760px] mb-6">
                    {block[locale].desc}
                  </p>
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
