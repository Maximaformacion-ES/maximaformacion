import { SITE_URL, emptyForPreview, isProductionEnv, renderUrlSet, xmlResponse, type SitemapEntry } from '@/lib/seo/sitemap';
import { getTeachers } from '@/lib/strapi/queries';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isProductionEnv()) return emptyForPreview('urlset');

  const teachers = await getTeachers().catch(() => []);
  const entries: SitemapEntry[] = [
    { loc: `${SITE_URL}/profesorado`, changefreq: 'monthly', priority: 0.7 },
    ...teachers
      .filter((t) => t.slug)
      .map<SitemapEntry>((t) => ({
        loc: `${SITE_URL}/profesorado/${t.slug}`,
        changefreq: 'monthly',
        priority: 0.6,
      })),
  ];

  return xmlResponse(renderUrlSet(entries));
}
