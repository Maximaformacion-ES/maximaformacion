import { SITE_URL, emptyForPreview, isProductionEnv, renderUrlSet, xmlResponse, type SitemapEntry } from '@/lib/seo/sitemap';
import { getPrograms } from '@/lib/strapi/queries';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isProductionEnv()) return emptyForPreview('urlset');

  const { programs } = await getPrograms({ limit: 500 }).catch(() => ({ programs: [], total: 0, pageCount: 0 }));
  const entries: SitemapEntry[] = programs
    .filter((p) => p.slug)
    .map((p) => ({
      loc: `${SITE_URL}/programas/${p.slug}`,
      changefreq: 'weekly',
      priority: 0.8,
    }));

  return xmlResponse(renderUrlSet(entries));
}
