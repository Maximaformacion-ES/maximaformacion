import { SITE_URL, emptyForPreview, isProductionEnv, renderUrlSet, toLastmod, xmlResponse, type SitemapEntry } from '@/lib/seo/sitemap';
import { getResources } from '@/lib/strapi/queries';
import { RESOURCE_CATEGORIES_META } from '@/lib/resource-categories-meta';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isProductionEnv()) return emptyForPreview('urlset');

  const { resources } = await getResources({ limit: 500 }).catch(() => ({ resources: [], total: 0, pageCount: 0 }));
  const resourceEntries: SitemapEntry[] = resources
    .filter((r) => r.slug)
    .map((r) => ({
      loc: `${SITE_URL}/recursos/${r.slug}`,
      lastmod: r.publishedAt ? toLastmod(r.publishedAt) : undefined,
      changefreq: 'monthly',
      priority: 0.6,
    }));

  const categoryEntries: SitemapEntry[] = RESOURCE_CATEGORIES_META.map((c) => ({
    loc: `${SITE_URL}/recursos/categoria/${c.slug}`,
    changefreq: 'weekly',
    priority: 0.7,
  }));

  return xmlResponse(renderUrlSet([...categoryEntries, ...resourceEntries]));
}
