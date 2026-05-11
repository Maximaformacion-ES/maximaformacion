import { SITE_URL, emptyForPreview, isProductionEnv, renderUrlSet, xmlResponse, type SitemapEntry } from '@/lib/seo/sitemap';
import { getNonTeacherAuthors } from '@/lib/strapi/queries';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isProductionEnv()) return emptyForPreview('urlset');

  const authors = await getNonTeacherAuthors().catch(() => []);
  const entries: SitemapEntry[] = [
    { loc: `${SITE_URL}/autores`, changefreq: 'monthly', priority: 0.5 },
    ...authors
      .filter((a) => a.slug)
      .map<SitemapEntry>((a) => ({
        loc: `${SITE_URL}/autores/${a.slug}`,
        changefreq: 'monthly',
        priority: 0.4,
      })),
  ];

  return xmlResponse(renderUrlSet(entries));
}
