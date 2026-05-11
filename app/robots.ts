import type { MetadataRoute } from 'next';

/**
 * Robots policy:
 *   - Production (VERCEL_ENV === 'production'): allow indexing of public marketing
 *     pages, block private/API routes.
 *   - Any other environment (preview / development / unset): disallow everything.
 *
 * The X-Robots-Tag header is also emitted from next.config.ts for non-production
 * environments — robots.txt + header combo is robust against crawlers that ignore
 * one but not the other.
 */

const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.maximaformacion.es').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.VERCEL_ENV === 'production';

  if (!isProduction) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
      // No sitemap for non-prod — we don't want preview indexed via sitemap discovery either.
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/perfil/',
          '/cursos/',
          '/sign-in',
          '/sign-up',
          '/maxymia/campus/',
          '/verificar/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
