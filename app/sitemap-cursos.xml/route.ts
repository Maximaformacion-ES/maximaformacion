import { SITE_URL, emptyForPreview, isProductionEnv, renderUrlSet, xmlResponse, type SitemapEntry } from '@/lib/seo/sitemap';
import { getPrograms } from '@/lib/strapi/queries';
import { SUBJECT_AREAS } from '@/lib/subject-areas';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isProductionEnv()) return emptyForPreview('urlset');

  const { programs } = await getPrograms({ limit: 500 }).catch(() => ({ programs: [], total: 0, pageCount: 0 }));
  const programEntries: SitemapEntry[] = programs
    .filter((p) => p.slug)
    .map((p) => ({
      loc: `${SITE_URL}/programas/${p.slug}`,
      changefreq: 'weekly',
      priority: 0.8,
    }));

  const areaEntries: SitemapEntry[] = SUBJECT_AREAS.map((a) => ({
    loc: `${SITE_URL}/programas/area/${a.slug}`,
    changefreq: 'weekly',
    priority: 0.7,
  }));

  return xmlResponse(renderUrlSet([...areaEntries, ...programEntries]));
}
