import { headers } from 'next/headers';
import { getSiteUrl } from '@/lib/site-url';

/**
 * Per-host robots.txt:
 *
 *   - On any *.vercel.app host (the project's temporary alias before
 *     custom DNS is cut over), or any non-production VERCEL_ENV, return
 *     `Disallow: /` so search engines and crawlers don't index the
 *     preview URLs.
 *
 *   - On the production domain, return the permissive policy that lists
 *     the marketing surface and blocks the private/auth-gated areas.
 *
 * This route handler replaces the previous app/robots.ts. The static
 * variant couldn't read request headers, so it had to rely on VERCEL_ENV
 * alone — and Vercel marks the project alias maximaformacion.vercel.app
 * as production, which made the noindex policy never apply there. With
 * request-level access to `host` we cover the preview alias too.
 */

const SITE_URL = getSiteUrl();

const RESTRICTIVE_BODY = `User-agent: *\nDisallow: /\n`;

const PERMISSIVE_BODY = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /perfil/
Disallow: /cursos/
Disallow: /sign-in
Disallow: /sign-up
Disallow: /maxymia/campus/
Disallow: /verificar/

Host: ${SITE_URL}
Sitemap: ${SITE_URL}/sitemap.xml
`;

export async function GET() {
  const isProduction = process.env.VERCEL_ENV === 'production';
  const host = (await headers()).get('host') ?? '';
  const isVercelHost = host.endsWith('.vercel.app');
  const restrictive = !isProduction || isVercelHost;

  return new Response(restrictive ? RESTRICTIVE_BODY : PERMISSIVE_BODY, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      // Cache briefly — the policy depends on the request host, so we can't
      // CDN-cache aggressively, but a short edge cache is fine.
      'cache-control': 'public, max-age=60, s-maxage=60',
    },
  });
}
