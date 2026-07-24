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

// Private / auth-gated surface that no crawler should index. Shared by the
// `*` group and the explicit AI-crawler group below so the two never drift.
const DISALLOW_PATHS = [
  '/api/',
  '/perfil/',
  '/cursos/',
  '/sign-in',
  '/sign-up',
  // Campus Maxymia: NO bloquear el área entera. Las fichas de curso
  // (/maxymia/campus/[slug]) son páginas públicas de marketing y deben
  // indexarse (SEO). Bloqueamos solo lo privado: las áreas personales con
  // login y el reproductor de lecciones de pago (ya protegido en servidor).
  '/maxymia/campus/mis-cursos',
  '/maxymia/campus/notas',
  '/maxymia/campus/*/lesson',
  '/verificar/',
];

// AI/LLM crawlers we explicitly ALLOW (decisión de negocio, MF-33).
// Máxima Formación es un negocio de captación: la visibilidad en respuestas
// de IA (ChatGPT, Perplexity, Gemini…) es un canal de adquisición, no una
// pérdida. Los listamos con su propia sección — misma política que `*`,
// mismas rutas privadas bloqueadas — como declaración de intención explícita,
// para que quede claro que NO están bloqueados. El contenido de pago ya está
// protegido en servidor (enrollment/Clerk), así que estos bots nunca alcanzan
// lo premium. Si algún scraper mete carga (p. ej. Bytespider), se mitiga por
// WAF, no aquí (robots.txt es voluntario y esos bots lo ignoran).
const AI_USER_AGENTS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'anthropic-ai',
  'Claude-Web',
  'ClaudeBot',
  'PerplexityBot',
  'Google-Extended',
  'CCBot',
  'Amazonbot',
  'Bytespider',
];

const disallowLines = DISALLOW_PATHS.map((p) => `Disallow: ${p}`).join('\n');
const aiAgentLines = AI_USER_AGENTS.map((ua) => `User-agent: ${ua}`).join('\n');

const PERMISSIVE_BODY = `User-agent: *
Allow: /
${disallowLines}

# AI/LLM crawlers — allowed on purpose (see MF-33)
${aiAgentLines}
Allow: /
${disallowLines}

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
