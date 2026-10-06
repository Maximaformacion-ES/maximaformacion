import { getStrapiMediaUrl } from './client';
import type {
  StrapiVideoTestimonial,
  StrapiVideoTestimonialsSection,
  VideoTestimonial,
  VideoTestimonialsBlock,
} from './types';

// Transformadores de testimonios en vídeo, compartidos por las queries REST de
// programas (queries.ts) y las GraphQL de cursos Maxymia (maxymia-queries.ts).
// Viven aparte para que ninguno de los dos módulos tenga que importar al otro.

/** Un testimonio de la colección global → modelo de la web. `videoUrl`
 *  prioriza el enlace (YouTube/Vimeo) sobre el archivo subido; sin ninguno de
 *  los dos devuelve '' y el llamador lo descarta. */
export function transformVideoTestimonial(t: StrapiVideoTestimonial): VideoTestimonial {
  return {
    id: t.id,
    name: t.name,
    role: t.role ?? null,
    quote: t.quote ?? null,
    videoUrl: (t.videoUrl && t.videoUrl.trim()) || (t.video ? getStrapiMediaUrl(t.video) : ''),
    posterUrl: t.poster ? getStrapiMediaUrl(t.poster) : null,
  };
}

/** Apartado de testimonios PROPIO de una ficha (componente
 *  `general.video-testimonials-section`): solo vídeos subidos, sin nombre ni
 *  cita. `null` si la ficha no lo tiene o no tiene ningún vídeo: entonces la
 *  web enseña el conjunto global. */
export function transformVideoTestimonialsSection(
  section: StrapiVideoTestimonialsSection | null | undefined
): VideoTestimonialsBlock | null {
  if (!section) return null;
  const items: VideoTestimonial[] = (section.videos ?? [])
    .map((v) => getStrapiMediaUrl(v))
    .filter(Boolean)
    .map((videoUrl, i) => ({ id: i, name: null, role: null, quote: null, videoUrl, posterUrl: null }));
  if (items.length === 0) return null;
  return {
    overline: section.overline?.trim() || null,
    title: section.title?.trim() || null,
    description: section.description?.trim() || null,
    items,
  };
}
