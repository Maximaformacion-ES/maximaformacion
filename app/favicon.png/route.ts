import { buildFaviconPng, faviconResponse } from '@/lib/favicon';

// /favicon.png → favicon de Strapi normalizado a PNG 192×192 (ver lib/favicon.ts).
export const revalidate = 86400;

export async function GET() {
  return faviconResponse(await buildFaviconPng());
}
