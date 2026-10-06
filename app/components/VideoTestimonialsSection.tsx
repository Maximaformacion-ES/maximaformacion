'use client';

import React, { useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { m } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Quote } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import type { VideoTestimonial, VideoTestimonialsBlock } from '@/lib/strapi/types';

/**
 * Carrusel de testimonios en vídeo de la ficha, bajo "Nuestro compromiso".
 *
 * Dos fuentes, por prioridad:
 *  1. `block`: el apartado PROPIO de la ficha (componente
 *     `general.video-testimonials-section` en el programa / curso Maxymia):
 *     overline, título y descripción editables + vídeos subidos (sin nombre ni
 *     cita). Los campos de copy vacíos caen al texto por defecto.
 *  2. `testimonials`: el conjunto GLOBAL (colección `video-testimonial`), que se
 *     enseña cuando la ficha no tiene vídeos propios.
 * Sin ninguna de las dos, no pinta nada.
 *
 * Se enseñan como mucho MAX_VISIBLE vídeos, elegidos AL AZAR en cada visita
 * (el cliente carga ~30 por ficha). El sorteo se hace en el cliente tras
 * montar: el HTML del servidor (cacheado por ISR) lleva los primeros 10 y, en
 * cuanto hidrata, se sustituyen por 10 aleatorios. Los tiles miden lo mismo, así
 * que no hay salto de layout, y la sección está por debajo del pliegue.
 *
 * Cada vídeo arranca al pulsar (poster + play): YouTube/Vimeo por iframe;
 * archivos subidos con <video>. Solo puede sonar UNO a la vez: al reproducir
 * otro, el anterior vuelve a su portada (se desmonta su <video>/<iframe>).
 */

const MAX_VISIBLE = 10;

/** Store "vacío" para useSyncExternalStore: el valor nunca cambia por fuera. */
const subscribeNoop = () => () => {};

/** Fisher-Yates: copia barajada, sin tocar el array original. */
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Copy por defecto de la sección. Se usa cuando la ficha no trae el suyo (o lo
// deja en blanco) y siempre para el conjunto global de testimonios.
const COPY = {
  es: {
    overline: 'Testimonios en vídeo',
    title: 'Alumnos que ya lo {han vivido}',
    description:
      'Quienes ya han pasado por esta formación cuentan en primera persona qué aprendieron, cómo lo aplican en su trabajo y qué les aportó el acompañamiento del equipo docente.',
    play: 'Reproducir testimonio de',
    playNth: 'Reproducir testimonio',
  },
  en: {
    overline: 'Video testimonials',
    title: 'Students who have {been there}',
    description:
      'People who have already taken this course explain first-hand what they learned, how they apply it at work and what the teaching team\'s support meant to them.',
    play: 'Play testimonial from',
    playNth: 'Play testimonial',
  },
} as const;

function embedFor(url: string): { kind: 'iframe'; src: string; poster: string | null } | { kind: 'file'; src: string } | null {
  const yt = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=|shorts\/)|youtu\.be\/)([\w-]{6,})/i);
  if (yt) return { kind: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`, poster: `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg` };
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return { kind: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`, poster: null };
  if (url) return { kind: 'file', src: url };
  return null;
}

function VideoTile({
  t,
  label,
  index,
  playing,
  onPlay,
}: {
  t: VideoTestimonial;
  label: { play: string; playNth: string };
  index: number;
  /** Controlado por la sección: solo un tile puede estar reproduciendo. */
  playing: boolean;
  onPlay: () => void;
}) {
  // Los vídeos propios de la ficha no llevan nombre: se numeran.
  const accessibleName = t.name ? `${label.play} ${t.name}` : `${label.playNth} ${index + 1}`;
  const embed = embedFor(t.videoUrl);
  const poster = t.posterUrl || (embed?.kind === 'iframe' ? embed.poster : null);
  if (!embed) return null;
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-black">
      {playing ? (
        embed.kind === 'iframe' ? (
          <iframe
            src={embed.src}
            title={accessibleName}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <video src={embed.src} poster={poster ?? undefined} controls autoPlay playsInline className="absolute inset-0 h-full w-full object-cover" />
        )
      ) : (
        <button
          type="button"
          onClick={onPlay}
          aria-label={accessibleName}
          className="group absolute inset-0 flex items-center justify-center"
        >
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
          ) : embed.kind === 'file' ? (
            // Archivo subido sin póster: el primer fotograma hace de portada
            // (`#t=0.1` fuerza a Safari a pintar un frame sin reproducir). El
            // degradado queda debajo por si el navegador aún no ha pintado nada.
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-mx-blue to-[#0b1018]" />
              <video src={`${embed.src}#t=0.1`} preload="metadata" muted playsInline aria-hidden="true" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-mx-blue to-[#0b1018]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-mx-orange shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Play size={26} fill="currentColor" className="ml-1" />
          </span>
        </button>
      )}
    </div>
  );
}

export function VideoTestimonialsSection({
  block,
  testimonials: globalTestimonials,
  locale = 'es',
}: {
  /** Apartado propio de la ficha. Tiene prioridad sobre los globales. */
  block?: VideoTestimonialsBlock | null;
  /** Conjunto global (fallback cuando la ficha no trae los suyos). */
  testimonials?: VideoTestimonial[];
  locale?: 'es' | 'en';
}) {
  const defaults = COPY[locale];
  const pool = useMemo(
    () => (block?.items.length ? block.items : (globalTestimonials ?? [])),
    [block, globalTestimonials]
  );
  // Sorteo SOLO en cliente. useSyncExternalStore con snapshot de servidor es el
  // patrón de React para valores que difieren entre SSR y cliente: el servidor
  // (y la hidratación) usan los primeros N; después React re-renderiza con la
  // selección aleatoria, sin error de hidratación ni setState en un efecto.
  const serverSelection = useMemo(() => pool.slice(0, MAX_VISIBLE), [pool]);
  const clientSelection = useMemo(
    () => (pool.length > MAX_VISIBLE ? shuffle(pool).slice(0, MAX_VISIBLE) : pool),
    [pool]
  );
  const testimonials = useSyncExternalStore(
    subscribeNoop,
    () => clientSelection,
    () => serverSelection
  );
  // Tile que está reproduciendo (por posición): al arrancar otro, el anterior
  // vuelve a su portada y deja de sonar.
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const t = {
    overline: block?.overline || defaults.overline,
    title: block?.title || defaults.title,
    description: block?.description || defaults.description,
    play: defaults.play,
    playNth: defaults.playNth,
  };
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);
  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: (dir === 'left' ? -1 : 1) * Math.max(280, el.clientWidth * 0.8), behavior: 'smooth' });
  };

  if (!testimonials.length) return null;

  return (
    <section className="py-10 md:py-20" aria-label={t.overline}>
      <div className="max-w-[812px]">
        <SectionHeader overline={t.overline} title={t.title} description={t.description} />

        <m.div
          initial={{ y: 20 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mt-10"
        >
          {testimonials.length > 2 && (
            <>
              <button
                type="button"
                onClick={() => scroll('left')}
                disabled={!canLeft}
                aria-label={locale === 'es' ? 'Anterior' : 'Previous'}
                className="absolute -left-4 top-1/3 z-10 hidden h-10 w-10 items-center justify-center rounded-full border border-mx-border bg-mx-card shadow-md transition-colors hover:border-mx-orange/40 disabled:opacity-30 md:flex"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                disabled={!canRight}
                aria-label={locale === 'es' ? 'Siguiente' : 'Next'}
                className="absolute -right-4 top-1/3 z-10 hidden h-10 w-10 items-center justify-center rounded-full border border-mx-border bg-mx-card shadow-md transition-colors hover:border-mx-orange/40 disabled:opacity-30 md:flex"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          <div
            ref={scrollRef}
            onScroll={update}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 no-scrollbar"
          >
            {testimonials.map((item, index) => (
              <figure key={item.id} className="w-[260px] shrink-0 snap-start sm:w-[300px]">
                <VideoTile
                  t={item}
                  label={{ play: t.play, playNth: t.playNth }}
                  index={index}
                  playing={activeIndex === index}
                  onPlay={() => setActiveIndex(index)}
                />
                {(item.name || item.role || item.quote) && (
                <figcaption className="mt-3">
                  {item.name && <p className="text-body-sm font-semibold text-mx-text">{item.name}</p>}
                  {item.role && <p className="text-label-md text-mx-text-muted">{item.role}</p>}
                  {item.quote && (
                    <p className="mt-2 flex gap-1.5 text-label-md leading-relaxed text-mx-text-muted">
                      <Quote size={12} className="mt-0.5 shrink-0 text-mx-orange" aria-hidden="true" />
                      <span className="line-clamp-3">{item.quote}</span>
                    </p>
                  )}
                </figcaption>
                )}
              </figure>
            ))}
          </div>
        </m.div>
      </div>
    </section>
  );
}
