'use client';

import React, { useCallback, useRef, useState } from 'react';
import { m } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Quote } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import type { VideoTestimonial } from '@/lib/strapi/types';

/**
 * Carrusel de testimonios en vídeo. Conjunto GLOBAL (colección
 * `video-testimonial` de Strapi): sale en todas las fichas, bajo "Nuestro
 * compromiso". Si no hay ninguno, no pinta nada. Cada vídeo arranca al pulsar
 * (poster + play): YouTube/Vimeo por iframe; archivos subidos con <video>.
 */

const COPY = {
  es: { overline: 'Testimonios', title: 'Lo que dicen {nuestros alumnos}', play: 'Reproducir testimonio de' },
  en: { overline: 'Testimonials', title: 'What {our students} say', play: 'Play testimonial from' },
} as const;

function embedFor(url: string): { kind: 'iframe'; src: string; poster: string | null } | { kind: 'file'; src: string } | null {
  const yt = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=|shorts\/)|youtu\.be\/)([\w-]{6,})/i);
  if (yt) return { kind: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`, poster: `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg` };
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return { kind: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`, poster: null };
  if (url) return { kind: 'file', src: url };
  return null;
}

function VideoTile({ t, label }: { t: VideoTestimonial; label: string }) {
  const [playing, setPlaying] = useState(false);
  const embed = embedFor(t.videoUrl);
  const poster = t.posterUrl || (embed?.kind === 'iframe' ? embed.poster : null);
  if (!embed) return null;
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-black">
      {playing ? (
        embed.kind === 'iframe' ? (
          <iframe
            src={embed.src}
            title={`${label} ${t.name}`}
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
          onClick={() => setPlaying(true)}
          aria-label={`${label} ${t.name}`}
          className="group absolute inset-0 flex items-center justify-center"
        >
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
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

export function VideoTestimonialsSection({ testimonials, locale = 'es' }: { testimonials?: VideoTestimonial[]; locale?: 'es' | 'en' }) {
  const t = COPY[locale];
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

  if (!testimonials?.length) return null;

  return (
    <section className="py-10 md:py-20" aria-label={t.overline}>
      <div className="max-w-[812px]">
        <SectionHeader overline={t.overline} title={t.title} align="center" />

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
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
            {testimonials.map((item) => (
              <figure key={item.id} className="w-[260px] shrink-0 snap-start sm:w-[300px]">
                <VideoTile t={item} label={t.play} />
                <figcaption className="mt-3">
                  <p className="text-body-sm font-semibold text-mx-text">{item.name}</p>
                  {item.role && <p className="text-label-md text-mx-text-muted">{item.role}</p>}
                  {item.quote && (
                    <p className="mt-2 flex gap-1.5 text-label-md leading-relaxed text-mx-text-muted">
                      <Quote size={12} className="mt-0.5 shrink-0 text-mx-orange" aria-hidden="true" />
                      <span className="line-clamp-3">{item.quote}</span>
                    </p>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        </m.div>
      </div>
    </section>
  );
}
