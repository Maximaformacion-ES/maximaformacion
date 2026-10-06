import { buildFaviconPng, faviconResponse } from '@/lib/favicon';

// Los navegadores piden /favicon.ico por defecto: se sirve el mismo PNG de
// Strapi (todos los navegadores actuales aceptan PNG en esta ruta).
export const revalidate = 86400;

export async function GET() {
  return faviconResponse(await buildFaviconPng());
}
