import { SITE_URL, emptyForPreview, isProductionEnv, renderSitemapIndex, xmlResponse } from '@/lib/seo/sitemap';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isProductionEnv()) return emptyForPreview('index');

  const now = new Date().toISOString();
  const body = renderSitemapIndex([
    { loc: `${SITE_URL}/sitemap-pages.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemap-cursos.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemap-blog.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemap-recursos.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemap-profesorado.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemap-autores.xml`, lastmod: now },
  ]);
  return xmlResponse(body);
}
