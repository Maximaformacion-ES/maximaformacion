import sharp from 'sharp';
import { getSiteMetadata } from '@/lib/strapi/queries';

/**
 * Favicon del sitio: el que el cliente sube en Strapi (single type Metadata,
 * campo `favicon`), normalizado a lo que Google exige para pintarlo en los
 * resultados: PNG cuadrado múltiplo de 48 px, servido desde el propio dominio.
 * El archivo de Strapi puede ser WebP de 140 px (como ahora) o cualquier
 * imagen: aquí se convierte y se escala con sharp. Sin favicon en Strapi → null.
 */
export const FAVICON_SIZE = 192;

export async function buildFaviconPng(): Promise<Buffer | null> {
  const meta = await getSiteMetadata();
  const url = meta?.favicon?.trim();
  if (!url) return null;
  const res = await fetch(url, { next: { revalidate: 86400, tags: ['site-metadata'] } });
  if (!res.ok) return null;
  const input = Buffer.from(await res.arrayBuffer());
  return sharp(input)
    .resize(FAVICON_SIZE, FAVICON_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

export function faviconResponse(png: Buffer | null): Response {
  if (!png) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      // Un día en CDN/navegador; el webhook de Strapi (site-metadata) invalida
      // la copia del servidor antes si el cliente cambia el favicon.
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
