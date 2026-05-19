import { SITE_URL, emptyForPreview, isProductionEnv, renderUrlSet, xmlResponse, type SitemapEntry } from '@/lib/seo/sitemap';
import { getBlogPosts } from '@/lib/strapi/queries';
import { BLOG_CATEGORIES_META } from '@/lib/blog-categories-meta';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isProductionEnv()) return emptyForPreview('urlset');

  const { posts } = await getBlogPosts({ limit: 500 }).catch(() => ({ posts: [], total: 0, pageCount: 0 }));
  const postEntries: SitemapEntry[] = posts
    .filter((p) => p.slug)
    .map((p) => ({
      loc: `${SITE_URL}/blog/${p.slug}`,
      lastmod: p.publishedAt ? new Date(p.publishedAt).toISOString() : undefined,
      changefreq: 'monthly',
      priority: 0.6,
    }));

  const categoryEntries: SitemapEntry[] = BLOG_CATEGORIES_META.map((c) => ({
    loc: `${SITE_URL}/blog/categoria/${c.slug}`,
    changefreq: 'weekly',
    priority: 0.7,
  }));

  return xmlResponse(renderUrlSet([...categoryEntries, ...postEntries]));
}
