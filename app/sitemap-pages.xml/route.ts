import { SITE_URL, emptyForPreview, isProductionEnv, renderUrlSet, xmlResponse, type SitemapEntry } from '@/lib/seo/sitemap';

export const dynamic = 'force-dynamic';

const PAGES: SitemapEntry[] = [
  { loc: '/', changefreq: 'weekly', priority: 1.0 },
  { loc: '/conocenos', changefreq: 'monthly', priority: 0.7 },
  { loc: '/programas', changefreq: 'weekly', priority: 0.9 },
  { loc: '/consultoria', changefreq: 'monthly', priority: 0.8 },
  { loc: '/innovacion', changefreq: 'monthly', priority: 0.7 },
  { loc: '/blog', changefreq: 'daily', priority: 0.8 },
  { loc: '/recursos', changefreq: 'weekly', priority: 0.8 },
  { loc: '/contacto', changefreq: 'yearly', priority: 0.4 },
  { loc: '/pricing', changefreq: 'monthly', priority: 0.6 },
  { loc: '/maxymia', changefreq: 'monthly', priority: 0.5 },
  { loc: '/politica-de-privacidad', changefreq: 'yearly', priority: 0.2 },
  { loc: '/aviso-legal', changefreq: 'yearly', priority: 0.2 },
  { loc: '/politica-de-cookies', changefreq: 'yearly', priority: 0.2 },
];

export async function GET() {
  if (!isProductionEnv()) return emptyForPreview('urlset');

  const now = new Date().toISOString();
  const entries: SitemapEntry[] = PAGES.map((p) => ({
    loc: `${SITE_URL}${p.loc}`,
    lastmod: now,
    changefreq: p.changefreq,
    priority: p.priority,
  }));
  return xmlResponse(renderUrlSet(entries));
}
