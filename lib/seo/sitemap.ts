/**
 * Shared helpers for sitemap route handlers (app/sitemap-*.xml/route.ts).
 *
 * The SEO team requested a sitemap index pointing at multiple sitemaps split
 * by content type:
 *   /sitemap.xml             ← index
 *   /sitemap-pages.xml       ← static marketing pages
 *   /sitemap-cursos.xml      ← /programas/<slug> (cursos + másters)
 *   /sitemap-blog.xml        ← /blog/<slug>
 *   /sitemap-recursos.xml    ← /recursos/<slug>
 *   /sitemap-profesorado.xml ← (pending content type)
 *
 * Each child sitemap must contain only URLs that are:
 *   - Publicly accessible (no login required)
 *   - HTTP 200 (no redirects/errors)
 *   - Indexable (no noindex / no robots disallow)
 *   - Self-canonical
 *   - Not paginated index pages
 */

import { getSiteUrl } from '@/lib/site-url';

export const SITE_URL = getSiteUrl();

export interface SitemapEntry {
  loc: string;
  lastmod?: string; // W3C date, YYYY-MM-DD (see toLastmod)
  changefreq?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority?: number;
}

/**
 * Format a value as a sitemap <lastmod> in the safe date-only W3C form
 * (YYYY-MM-DD). A full ISO timestamp (e.g. 2025-04-03T16:28:32.000Z) is
 * technically valid per the sitemaps spec, but several validators flag the
 * millisecond form as invalid, so we trim to the date. Accepts anything
 * `new Date()` understands (Date, ISO string, epoch ms).
 */
export function toLastmod(date: Date | string | number): string {
  return new Date(date).toISOString().slice(0, 10);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function renderUrlSet(entries: SitemapEntry[]): string {
  const lines = entries.map((e) => {
    const parts = [`    <loc>${escapeXml(e.loc)}</loc>`];
    if (e.lastmod) parts.push(`    <lastmod>${escapeXml(e.lastmod)}</lastmod>`);
    if (e.changefreq) parts.push(`    <changefreq>${e.changefreq}</changefreq>`);
    if (typeof e.priority === 'number') parts.push(`    <priority>${e.priority.toFixed(1)}</priority>`);
    return `  <url>\n${parts.join('\n')}\n  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${lines.join('\n')}
</urlset>`;
}

export interface SitemapIndexEntry {
  loc: string;
  lastmod?: string;
}

export function renderSitemapIndex(entries: SitemapIndexEntry[]): string {
  const lines = entries.map((e) => {
    const parts = [`    <loc>${escapeXml(e.loc)}</loc>`];
    if (e.lastmod) parts.push(`    <lastmod>${escapeXml(e.lastmod)}</lastmod>`);
    return `  <sitemap>\n${parts.join('\n')}\n  </sitemap>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${lines.join('\n')}
</sitemapindex>`;
}

export function xmlResponse(body: string): Response {
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

/** Hide everything from preview/staging — return empty index/urlset with noindex headers. */
export function emptyForPreview(kind: 'index' | 'urlset'): Response {
  const body =
    kind === 'index'
      ? `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</sitemapindex>`
      : `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`;
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'no-store',
    },
  });
}

export function isProductionEnv(): boolean {
  return process.env.VERCEL_ENV === 'production';
}
