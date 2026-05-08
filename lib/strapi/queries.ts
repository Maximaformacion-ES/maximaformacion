import { strapiRequest, getStrapiMediaUrl } from './client';
import type {
  StrapiResponse,
  StrapiSingleResponse,
  StrapiProgram,
  StrapiTopic,
  StrapiBlogPost,
  StrapiBlogBodyBlock,
  StrapiResource,
  Resource,
  ResourceDownload,
  ResourceQueryOptions,
  StrapiHeroSection,
  StrapiSiteMetadata,
  StrapiLogo,
  StrapiBadge,
  StrapiHome,
  StrapiTeamMember,
  StrapiMaxymiaHome,
  Program,
  Topic,
  BlogPost,
  HeroSection,
  SiteMetadata,
  Logo,
  Badge,
  HomeData,
  MaxymiaHomeData,
  TeamMember,
  ProgramQueryOptions,
  BlogQueryOptions,
  ProgramModule,
  BlogAuthor,
} from './types';
import type { ContentBlock } from '@/app/maxymia/types';

// Default values for missing program data
const DEFAULT_PROGRAM_IMAGE = '/placeholder-course.svg';

// Transform Strapi Program to frontend Program
function transformProgram(strapi: StrapiProgram): Program {
  const imageUrl = strapi.image
    ? getStrapiMediaUrl(strapi.image)
    : strapi.imageUrl || DEFAULT_PROGRAM_IMAGE;

  const modules: ProgramModule[] = (strapi.modules || []).map((m) => ({
    title: m.title,
    description: m.description,
    hours: m.hours,
    units: (m.units || []).map((u) => ({ title: u.title })),
  }));

  const brochurePdfUrl = strapi.brochurePdf
    ? getStrapiMediaUrl(strapi.brochurePdf)
    : null;

  return {
    id: strapi.id,
    documentId: strapi.documentId,
    type: strapi.type,
    title: strapi.title,
    slug: strapi.slug,
    duration: strapi.duration,
    durationLabel: strapi.durationLabel ?? null,
    ects: strapi.ects,
    tags: strapi.tags || [],
    topics: (strapi.topics || []).map((t) => ({ id: t.id, documentId: t.documentId, name: t.name })),
    featured: strapi.featured,
    description: strapi.description,
    longDescription: strapi.longDescription || strapi.description,
    image: imageUrl,
    format: strapi.format || 'Online',
    language: strapi.language || 'Español',
    startDate: strapi.startDate || 'Próximamente',
    certification: strapi.certification || (strapi.type === 'Master' ? 'Título Propio Universidad' : 'Certificado de Experto'),
    price: strapi.price || 1499,
    priceLabel: strapi.priceLabel ?? null,
    brochurePdfUrl,
    originalPrice: strapi.originalPrice || undefined,
    modules: modules.length > 0 ? modules : [],
    audience: strapi.audiences || '',
    careers: strapi.careers || '',
    objectives: strapi.objectives || '',
    isPro: strapi.isPro,
    moodleCourseId: strapi.moodleCourseId ?? null,
    moodle: strapi.moodle ?? null,
  };
}

function transformBlogBody(blocks: StrapiBlogBodyBlock[] | null | undefined): ContentBlock[] {
  if (!blocks || !Array.isArray(blocks)) return [];
  const out: ContentBlock[] = [];
  for (const block of blocks) {
    switch (block.__component) {
      case 'maxymia.text-block':
        out.push({ type: 'text', html: block.html });
        break;
      case 'maxymia.image-block':
        if (block.image) {
          out.push({
            type: 'image',
            src: getStrapiMediaUrl(block.image),
            alt: block.alt,
            caption: block.caption ?? undefined,
          });
        }
        break;
      case 'maxymia.video-block':
        out.push({
          type: 'video',
          provider: block.provider ?? (block.youtubeId ? 'youtube' : 'vimeo'),
          vimeoId: block.vimeoId ?? undefined,
          youtubeId: block.youtubeId ?? undefined,
          videoHash: block.videoHash ?? undefined,
          title: block.title ?? undefined,
        });
        break;
      case 'maxymia.code-block':
        out.push({
          type: 'code',
          language: block.language,
          code: block.code,
          fileName: block.fileName ?? undefined,
        });
        break;
      case 'maxymia.callout-block':
        out.push({
          type: 'callout',
          variant: block.variant,
          title: block.title ?? undefined,
          content: block.content,
        });
        break;
      case 'maxymia.download-block':
        out.push({
          type: 'download',
          title: block.title ?? undefined,
          description: block.description ?? undefined,
          files: (block.files ?? [])
            .filter((f) => f.file)
            .map((f) => ({
              label: f.label,
              description: f.description ?? undefined,
              url: getStrapiMediaUrl(f.file!),
              name: f.file!.name,
              mime: f.file!.mime,
              sizeKB: f.file!.size,
            })),
        });
        break;
      case 'blog.embed-block':
        out.push({ type: 'embed', html: block.html, provider: block.provider ?? undefined });
        break;
    }
  }
  return out;
}

// Transform Strapi BlogPost to frontend BlogPost
function transformBlogPost(strapi: StrapiBlogPost): BlogPost {
  const imageUrl = strapi.image
    ? getStrapiMediaUrl(strapi.image)
    : strapi.imageUrl || '/placeholder-course.svg';

  const author: BlogAuthor = strapi.author
    ? {
        name: strapi.author.name,
        role: strapi.author.role,
        roleDescription: strapi.author.roleDescription || '',
        avatar: strapi.author.avatar
          ? getStrapiMediaUrl(strapi.author.avatar)
          : '',
        email: strapi.author.email || '',
        linkedin: strapi.author.linkedin || '',
      }
    : {
        name: '',
        role: '',
        roleDescription: '',
        avatar: '',
        email: '',
        linkedin: '',
      };

  return {
    id: strapi.id,
    documentId: strapi.documentId,
    title: strapi.title,
    slug: strapi.slug,
    excerpt: strapi.excerpt,
    body: transformBlogBody(strapi.body),
    image: imageUrl,
    category: strapi.category,
    author,
    publishedAt: strapi.originalPostDate || strapi.publishedAt || strapi.createdAt,
    readTime: strapi.readTime || '5 min',
    tags: strapi.tags || [],
    featured: strapi.featured,
  };
}

// Build query string for Strapi API
function buildProgramQuery(options: ProgramQueryOptions = {}): string {
  const params = new URLSearchParams();

  // Populate relations
  params.set('populate[image]', 'true');
  params.set('populate[brochurePdf]', 'true');
  params.set('populate[modules][populate][units]', 'true');
  params.set('populate[topics][fields][0]', 'name');
  params.set('populate[topics][fields][1]', 'documentId');

  // Filters
  const filters: string[] = [];
  if (options.type) {
    filters.push(`filters[type][$eq]=${options.type}`);
  }
  if (options.featured !== undefined) {
    filters.push(`filters[featured][$eq]=${options.featured}`);
  }
  if (options.isPro !== undefined) {
    filters.push(`filters[isPro][$eq]=${options.isPro}`);
  }

  // Pagination
  if (options.limit) {
    params.set('pagination[pageSize]', options.limit.toString());
  }
  if (options.page) {
    params.set('pagination[page]', options.page.toString());
  }

  // Sorting
  if (options.sort) {
    params.set('sort', options.sort);
  } else {
    params.set('sort', 'createdAt:desc');
  }

  let query = params.toString();
  if (filters.length > 0) {
    query += '&' + filters.join('&');
  }

  return query;
}

// REST populate string for the blog-post `body` dynamic zone.
// Using the `populate[body][on][<component>]` form so each block type
// pulls its own nested relations (image, files, etc).
const BLOG_BODY_POPULATE = [
  'populate[body][on][maxymia.text-block][populate]=*',
  'populate[body][on][maxymia.image-block][populate][image]=true',
  'populate[body][on][maxymia.video-block][populate]=*',
  'populate[body][on][maxymia.code-block][populate]=*',
  'populate[body][on][maxymia.callout-block][populate]=*',
  'populate[body][on][maxymia.download-block][populate][files][populate][file]=true',
  'populate[body][on][blog.embed-block][populate]=*',
].join('&');

function buildBlogQuery(options: BlogQueryOptions = {}): string {
  const params = new URLSearchParams();

  // Populate relations with nested author avatar
  params.set('populate[image]', 'true');
  params.set('populate[author][populate][avatar]', 'true');

  // Filters
  const filters: string[] = [];
  if (options.category) {
    filters.push(`filters[category][$eq]=${encodeURIComponent(options.category)}`);
  }
  if (options.featured !== undefined) {
    filters.push(`filters[featured][$eq]=${options.featured}`);
  }

  // Pagination
  if (options.limit) {
    params.set('pagination[pageSize]', options.limit.toString());
  }
  if (options.page) {
    params.set('pagination[page]', options.page.toString());
  }

  // Sorting
  if (options.sort) {
    params.set('sort', options.sort);
  } else {
    params.set('sort', 'publishedAt:desc');
  }

  let query = params.toString();
  if (filters.length > 0) {
    query += '&' + filters.join('&');
  }

  return query;
}

// ============ Program Queries ============

export async function getPrograms(
  options: ProgramQueryOptions = {}
): Promise<{ programs: Program[]; total: number; pageCount: number }> {
  const query = buildProgramQuery(options);
  const response = await strapiRequest<StrapiResponse<StrapiProgram[]>>(
    `/api/programs?${query}`,
    {
      revalidate: 60,
      tags: ['programs'],
      draft: options.draft,
    }
  );

  return {
    programs: response.data.map(transformProgram),
    total: response.meta.pagination?.total || 0,
    pageCount: response.meta.pagination?.pageCount || 1,
  };
}

export async function getProgramById(
  id: number | string,
  draft = false
): Promise<Program | null> {
  try {
    const response = await strapiRequest<StrapiSingleResponse<StrapiProgram>>(
      `/api/programs/${id}?populate[image]=true&populate[brochurePdf]=true&populate[modules][populate][units]=true&populate[topics][fields][0]=name&populate[topics][fields][1]=documentId`,
      {
        revalidate: 60,
        tags: ['programs', `program-${id}`],
        draft,
      }
    );

    if (!response.data) {
      return null;
    }

    return transformProgram(response.data);
  } catch (error) {
    console.error(`Error fetching program ${id}:`, error);
    return null;
  }
}

export async function getProgramBySlug(
  slug: string,
  draft = false
): Promise<Program | null> {
  try {
    const response = await strapiRequest<StrapiResponse<StrapiProgram[]>>(
      `/api/programs?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[image]=true&populate[brochurePdf]=true&populate[modules][populate][units]=true&populate[topics][fields][0]=name&populate[topics][fields][1]=documentId`,
      {
        revalidate: 60,
        tags: ['programs', `program-slug-${slug}`],
        draft,
      }
    );

    if (!response.data || response.data.length === 0) {
      return null;
    }

    return transformProgram(response.data[0]);
  } catch (error) {
    console.error(`Error fetching program by slug ${slug}:`, error);
    return null;
  }
}

export async function getAllProgramSlugs(): Promise<string[]> {
  const response = await strapiRequest<StrapiResponse<StrapiProgram[]>>(
    '/api/programs?fields[0]=slug&pagination[pageSize]=100',
    {
      revalidate: 3600,
      tags: ['programs'],
    }
  );

  return response.data.map((p) => p.slug);
}

// ============ Topic Queries ============

export async function getTopics(): Promise<Topic[]> {
  try {
    const response = await strapiRequest<StrapiResponse<StrapiTopic[]>>(
      '/api/topics?fields[0]=name&sort=name:asc&pagination[pageSize]=100',
      {
        revalidate: 3600,
        tags: ['topics'],
      }
    );

    return response.data.map((t) => ({
      id: t.id,
      documentId: t.documentId,
      name: t.name,
    }));
  } catch (error) {
    console.error('Error fetching topics:', error);
    return [];
  }
}

// ============ Blog Post Queries ============

export async function getBlogPosts(
  options: BlogQueryOptions = {}
): Promise<{ posts: BlogPost[]; total: number; pageCount: number }> {
  const query = buildBlogQuery(options);
  const response = await strapiRequest<StrapiResponse<StrapiBlogPost[]>>(
    `/api/blog-posts?${query}`,
    {
      revalidate: 60,
      tags: ['blog-posts'],
      draft: options.draft,
    }
  );

  return {
    posts: response.data.map(transformBlogPost),
    total: response.meta.pagination?.total || 0,
    pageCount: response.meta.pagination?.pageCount || 1,
  };
}

async function getBlogPostById(
  id: number | string,
  draft = false
): Promise<BlogPost | null> {
  try {
    const response = await strapiRequest<StrapiSingleResponse<StrapiBlogPost>>(
      `/api/blog-posts/${id}?populate[image]=true&populate[author][populate][avatar]=true&${BLOG_BODY_POPULATE}`,
      {
        revalidate: 60,
        tags: ['blog-posts', `blog-post-${id}`],
        draft,
      }
    );

    if (!response.data) {
      return null;
    }

    return transformBlogPost(response.data);
  } catch (error) {
    console.error(`Error fetching blog post ${id}:`, error);
    return null;
  }
}

export async function getBlogPostBySlug(
  slug: string,
  draft = false
): Promise<BlogPost | null> {
  try {
    const response = await strapiRequest<StrapiResponse<StrapiBlogPost[]>>(
      `/api/blog-posts?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[image]=true&populate[author][populate][avatar]=true&${BLOG_BODY_POPULATE}`,
      {
        revalidate: 60,
        tags: ['blog-posts', `blog-post-slug-${slug}`],
        draft,
      }
    );

    if (!response.data || response.data.length === 0) {
      return null;
    }

    return transformBlogPost(response.data[0]);
  } catch (error) {
    console.error(`Error fetching blog post by slug ${slug}:`, error);
    return null;
  }
}

export async function getRelatedPosts(
  currentPost: BlogPost,
  limit = 3
): Promise<BlogPost[]> {
  try {
    // Fetch posts from the same category, excluding current
    const response = await strapiRequest<StrapiResponse<StrapiBlogPost[]>>(
      `/api/blog-posts?filters[documentId][$ne]=${currentPost.documentId}&filters[category][$eq]=${encodeURIComponent(currentPost.category)}&populate[image]=true&populate[author][populate][avatar]=true&pagination[pageSize]=${limit}&sort=publishedAt:desc`,
      {
        revalidate: 60,
        tags: ['blog-posts', 'related-posts'],
      }
    );

    let relatedPosts = response.data.map(transformBlogPost);

    // If not enough posts from same category, fetch more by tags
    if (relatedPosts.length < limit && currentPost.tags.length > 0) {
      const tagFilter = currentPost.tags
        .slice(0, 3)
        .map((tag) => `filters[tags][$containsi]=${encodeURIComponent(tag)}`)
        .join('&');

      const moreResponse = await strapiRequest<StrapiResponse<StrapiBlogPost[]>>(
        `/api/blog-posts?filters[documentId][$ne]=${currentPost.documentId}&${tagFilter}&populate[image]=true&populate[author][populate][avatar]=true&pagination[pageSize]=${limit - relatedPosts.length}`,
        {
          revalidate: 60,
          tags: ['blog-posts', 'related-posts'],
        }
      );

      const morePosts = moreResponse.data.map(transformBlogPost);
      const existingIds = new Set(relatedPosts.map((p) => p.id));
      relatedPosts = [
        ...relatedPosts,
        ...morePosts.filter((p) => !existingIds.has(p.id)),
      ].slice(0, limit);
    }

    return relatedPosts;
  } catch (error) {
    console.error(`Error fetching related posts for ${currentPost.documentId}:`, error);
    return [];
  }
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const response = await strapiRequest<StrapiResponse<StrapiBlogPost[]>>(
    '/api/blog-posts?fields[0]=slug&pagination[pageSize]=100',
    {
      revalidate: 3600,
      tags: ['blog-posts'],
    }
  );

  return response.data.map((p) => p.slug);
}

// ============ Resource Queries ============

function transformResource(strapi: StrapiResource): Resource {
  const imageUrl = strapi.image
    ? getStrapiMediaUrl(strapi.image)
    : strapi.imageUrl || '/placeholder-course.svg';

  const author: BlogAuthor = strapi.author
    ? {
        name: strapi.author.name,
        role: strapi.author.role,
        roleDescription: strapi.author.roleDescription || '',
        avatar: strapi.author.avatar
          ? getStrapiMediaUrl(strapi.author.avatar)
          : '',
        email: strapi.author.email || '',
        linkedin: strapi.author.linkedin || '',
      }
    : { name: '', role: '', roleDescription: '', avatar: '', email: '', linkedin: '' };

  const downloads: ResourceDownload[] = (strapi.downloads || []).map((d) => ({
    id: d.id,
    url: getStrapiMediaUrl(d),
    name: d.name,
    mime: d.mime,
    sizeKB: Math.round(d.size),
  }));

  return {
    id: strapi.id,
    documentId: strapi.documentId,
    title: strapi.title,
    slug: strapi.slug,
    excerpt: strapi.excerpt || '',
    body: strapi.body || '',
    category: strapi.category,
    topic: strapi.topic || 'R-Software',
    image: imageUrl,
    downloads,
    externalUrl: strapi.externalUrl,
    publishedAt: strapi.originalPostDate || strapi.publishedAt || strapi.createdAt,
    tags: strapi.tags || [],
    featured: strapi.featured,
    license: strapi.license || 'CC BY-NC-ND',
    author,
  };
}

function buildResourceQuery(options: ResourceQueryOptions = {}): string {
  const params = new URLSearchParams();

  params.set('populate[image]', 'true');
  params.set('populate[downloads]', 'true');
  params.set('populate[author][populate][avatar]', 'true');

  const filters: string[] = [];
  if (options.category) {
    filters.push(`filters[category][$eq]=${encodeURIComponent(options.category)}`);
  }
  if (options.featured !== undefined) {
    filters.push(`filters[featured][$eq]=${options.featured}`);
  }

  if (options.limit) params.set('pagination[pageSize]', options.limit.toString());
  if (options.page) params.set('pagination[page]', options.page.toString());
  params.set('sort', options.sort || 'publishedAt:desc');

  let query = params.toString();
  if (filters.length > 0) query += '&' + filters.join('&');
  return query;
}

export async function getResources(
  options: ResourceQueryOptions = {}
): Promise<{ resources: Resource[]; total: number; pageCount: number }> {
  try {
    const query = buildResourceQuery(options);
    const response = await strapiRequest<StrapiResponse<StrapiResource[]>>(
      `/api/resources?${query}`,
      { revalidate: 60, tags: ['resources'], draft: options.draft }
    );
    return {
      resources: response.data.map(transformResource),
      total: response.meta.pagination?.total || 0,
      pageCount: response.meta.pagination?.pageCount || 1,
    };
  } catch (error) {
    console.error('Error fetching resources:', error);
    return { resources: [], total: 0, pageCount: 0 };
  }
}

export async function getResourceBySlug(
  slug: string,
  draft = false
): Promise<Resource | null> {
  try {
    const response = await strapiRequest<StrapiResponse<StrapiResource[]>>(
      `/api/resources?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[image]=true&populate[downloads]=true&populate[author][populate][avatar]=true`,
      {
        revalidate: 60,
        tags: ['resources', `resource-slug-${slug}`],
        draft,
      }
    );
    if (!response.data || response.data.length === 0) return null;
    return transformResource(response.data[0]);
  } catch (error) {
    console.error(`Error fetching resource by slug ${slug}:`, error);
    return null;
  }
}

export async function getRelatedResources(
  current: Resource,
  limit = 3
): Promise<Resource[]> {
  try {
    const response = await strapiRequest<StrapiResponse<StrapiResource[]>>(
      `/api/resources?filters[documentId][$ne]=${current.documentId}&filters[category][$eq]=${encodeURIComponent(current.category)}&populate[image]=true&populate[downloads]=true&populate[author][populate][avatar]=true&pagination[pageSize]=${limit}&sort=publishedAt:desc`,
      { revalidate: 60, tags: ['resources', 'related-resources'] }
    );
    return response.data.map(transformResource);
  } catch (error) {
    console.error(`Error fetching related resources for ${current.documentId}:`, error);
    return [];
  }
}

export async function getAllResourceSlugs(): Promise<string[]> {
  try {
    const response = await strapiRequest<StrapiResponse<StrapiResource[]>>(
      '/api/resources?fields[0]=slug&pagination[pageSize]=200',
      { revalidate: 3600, tags: ['resources'] }
    );
    return response.data.map((p) => p.slug);
  } catch {
    return [];
  }
}

// ============ Hero Section Queries (Single Types) ============

// Transform Strapi Hero Section to frontend HeroSection
function transformHeroSection(strapi: StrapiHeroSection): HeroSection {
  const imageUrl = strapi.heroImage
    ? getStrapiMediaUrl(strapi.heroImage)
    : '';

  return {
    heroImage: imageUrl,
    heroOverline: strapi.heroOverline,
    heroTitle: strapi.heroTitle,
    heroDescription: strapi.heroDescription || '',
  };
}

export async function getConocenosSection(): Promise<HeroSection | null> {
  try {
    const response = await strapiRequest<StrapiSingleResponse<StrapiHeroSection>>(
      '/api/conocenos-section?populate=*',
      {
        revalidate: 60,
        tags: ['conocenos-section'],
      }
    );

    if (!response.data) {
      return null;
    }

    return transformHeroSection(response.data);
  } catch (error) {
    console.error('Error fetching conocenos section:', error);
    return null;
  }
}

export async function getConsultoriaSection(): Promise<HeroSection | null> {
  try {
    const response = await strapiRequest<StrapiSingleResponse<StrapiHeroSection>>(
      '/api/consultoria-section?populate=*',
      {
        revalidate: 60,
        tags: ['consultoria-section'],
      }
    );

    if (!response.data) {
      return null;
    }

    return transformHeroSection(response.data);
  } catch (error) {
    console.error('Error fetching consultoria section:', error);
    return null;
  }
}

export async function getInnovacionSection(): Promise<HeroSection | null> {
  try {
    const response = await strapiRequest<StrapiSingleResponse<StrapiHeroSection>>(
      '/api/innovacion-section?populate=*',
      {
        revalidate: 60,
        tags: ['innovacion-section'],
      }
    );

    if (!response.data) {
      return null;
    }

    return transformHeroSection(response.data);
  } catch (error) {
    console.error('Error fetching innovacion section:', error);
    return null;
  }
}

// ============ Site Metadata Query (Single Type) ============

function transformSiteMetadata(strapi: StrapiSiteMetadata): SiteMetadata {
  return {
    metaTitle: strapi.metaTitle,
    metaDescription: strapi.metaDescription || '',
    keywords: strapi.keywords || '',
    canonicalUrl: strapi.canonicalUrl || '',
    ogTitle: strapi.ogTitle || strapi.metaTitle,
    ogDescription: strapi.ogDescription || strapi.metaDescription || '',
    ogImage: strapi.ogImage ? getStrapiMediaUrl(strapi.ogImage) : '',
    ogType: (strapi.ogType || 'website').toLowerCase(),
    twitterCard: (strapi.twitterCard || 'summary_large_image').toLowerCase(),
    noIndex: strapi.noIndex,
    favicon: strapi.favicon ? getStrapiMediaUrl(strapi.favicon) : '',
    logoMaximaformacion: strapi.logoMaximaformacion ? getStrapiMediaUrl(strapi.logoMaximaformacion) : '',
    logoMaxymia: strapi.logoMaxymia ? getStrapiMediaUrl(strapi.logoMaxymia) : '',
  };
}

export async function getSiteMetadata(): Promise<SiteMetadata | null> {
  try {
    const response = await strapiRequest<StrapiSingleResponse<StrapiSiteMetadata>>(
      '/api/metadata?populate=*',
      {
        revalidate: false,
        tags: ['site-metadata'],
      }
    );

    if (!response.data) {
      return null;
    }

    return transformSiteMetadata(response.data);
  } catch (error) {
    console.error('Error fetching site metadata:', error);
    return null;
  }
}

// ============ Logo Queries ============

export async function getLogos(limit = 100): Promise<Logo[]> {
  try {
    const response = await strapiRequest<StrapiResponse<StrapiLogo[]>>(
      `/api/logos?populate[image]=true&pagination[pageSize]=${limit}&sort=companyName:asc`,
      {
        revalidate: 3600,
        tags: ['logos'],
      }
    );

    return response.data
      .filter((logo) => logo.image)
      .map((logo) => ({
        id: logo.id,
        companyName: logo.companyName,
        imageUrl: getStrapiMediaUrl(logo.image!),
      }));
  } catch (error) {
    console.error('Error fetching logos:', error);
    return [];
  }
}

// ============ Badge Queries ============

export async function getBadges(): Promise<Badge[]> {
  try {
    const response = await strapiRequest<StrapiResponse<StrapiBadge[]>>(
      '/api/badges?populate[badge]=true&fields[0]=name&fields[1]=importance&pagination[pageSize]=100&sort=name:asc',
      {
        revalidate: 600,
        tags: ['badges'],
      }
    );

    return response.data
      .filter((b) => b.badge)
      .map((b) => ({
        id: b.id,
        name: b.name,
        imageUrl: getStrapiMediaUrl(b.badge!),
        importance: b.importance ?? 'Medium',
      }));
  } catch (error) {
    console.error('[getBadges] Error:', error);
    return [];
  }
}

// ============ Home Single Type Query ============

function transformHome(strapi: StrapiHome): HomeData {
  return {
    heroOverline: strapi.heroOverline || '',
    heroTitle: strapi.heroTitle,
    heroDescription: strapi.heroDescription || '',
    numericSection: {
      students: strapi.numericSection?.students || '',
      bussiness: strapi.numericSection?.bussiness || '',
      activePrograms: strapi.numericSection?.activePrograms || '',
      mediaRating: strapi.numericSection?.mediaRating || '',
    },
    programsSection: {
      programsOverline: strapi.programsSection?.programsOverline || '',
      programsTitle: strapi.programsSection?.programsTitle || '',
    },
    partnersSection: {
      partnersOverline: strapi.partnersSection?.partnersOverline || '',
      partnersTitle: strapi.partnersSection?.partnersTitle || '',
      partnersLogos: (strapi.partnersSection?.partnersLogos || []).map((media) => ({
        url: getStrapiMediaUrl(media),
        alt: media.alternativeText || media.name || '',
      })),
      partnersDescription: strapi.partnersSection?.partnersDescription || '',
    },
    testimonialsSection: {
      testimonialsOverline: strapi.testimonialsSection?.testimonialsOverline || '',
      testimonialsTitle: strapi.testimonialsSection?.testimonialsTitle || '',
      testimonials: (strapi.testimonialsSection?.testimonial || []).map((t) => ({
        text: t.text,
        name: t.name,
        role: t.role || '',
      })),
    },
    badgesSection: {
      badgesOverline: strapi.badgesSection?.badgesOverline || '',
      badgesTitle: strapi.badgesSection?.badgesTitle || '',
      badgesDescription: strapi.badgesSection?.badgesDescription || '',
    },
    faqSection: {
      faqOverline: strapi.faqSection?.faqOverline || '',
      faqTitle: strapi.faqSection?.faqTitle || '',
      faqDescription: strapi.faqSection?.faqDescription || '',
      faqs: (strapi.faqSection?.faq || []).map((f) => ({
        question: f.question,
        answer: f.answer,
      })),
    },
    ctaSection: {
      ctaOverline: strapi.ctaSection?.ctaOverline || '',
      ctaTitle: strapi.ctaSection?.ctaTitle || '',
      ctaDescription: strapi.ctaSection?.ctaDescription || '',
    },
  };
}

// ============ Team Member Queries ============

export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const response = await strapiRequest<StrapiResponse<StrapiTeamMember[]>>(
      '/api/team-members?populate[avatar]=true&pagination[pageSize]=100&sort=name:asc',
      {
        revalidate: 3600,
        tags: ['team-members'],
      }
    );

    return response.data
      .filter((m) => m.avatar)
      .map((m) => ({
        id: m.id,
        name: m.name,
        avatar: getStrapiMediaUrl(m.avatar!),
        linkedin: m.linkedin || '',
        email: m.email || '',
        role: m.role || 'Docencia',
      }));
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
}

export async function getHomeData(): Promise<HomeData | null> {
  try {
    const response = await strapiRequest<StrapiSingleResponse<StrapiHome>>(
      '/api/home?populate[numericSection]=*&populate[programsSection]=*&populate[partnersSection][populate]=partnersLogos&populate[testimonialsSection][populate]=testimonial&populate[badgesSection]=*&populate[faqSection][populate]=faq&populate[ctaSection][populate]=logoMaxymia',
      {
        revalidate: 60,
        tags: ['home'],
      }
    );

    if (!response.data) {
      return null;
    }

    return transformHome(response.data);
  } catch (error) {
    // Expected when Home single type is not yet created in Strapi
    console.error('Error fetching home data:', error);
    return null;
  }
}

// ============ Maxymia Home Query (Single Type) ============

function transformMaxymiaHome(strapi: StrapiMaxymiaHome): MaxymiaHomeData {
  const transformCards = (cards: StrapiMaxymiaHome['whatIsSection']) => {
    if (!cards) return { overline: '', title: '', description: '', cards: [] };
    return {
      overline: cards.overline || '',
      title: cards.title,
      description: cards.description || '',
      cards: (cards.card || []).map((c) => ({
        title: c.title || '',
        description: c.description || '',
        image: c.image ? getStrapiMediaUrl(c.image) : '',
      })),
    };
  };

  return {
    hero: {
      overline: strapi.hero?.overline || '',
      title: strapi.hero?.title || '',
      description: strapi.hero?.description || '',
    },
    whatIsSection: transformCards(strapi.whatIsSection),
    coursesSection: {
      overline: strapi.Courses?.programsOverline || '',
      title: strapi.Courses?.programsTitle || '',
      description: strapi.Courses?.programsDescription || '',
    },
    whyMaxymia: transformCards(strapi.whyMaxymia),
    ctaSection: {
      overline: strapi.ctaSection?.ctaOverline || '',
      title: strapi.ctaSection?.ctaTitle || '',
      description: strapi.ctaSection?.ctaDescription || '',
      logo: strapi.ctaSection?.logoMaxymia ? getStrapiMediaUrl(strapi.ctaSection.logoMaxymia) : '',
    },
  };
}

export async function getMaxymiaHome(): Promise<MaxymiaHomeData | null> {
  try {
    const response = await strapiRequest<StrapiSingleResponse<StrapiMaxymiaHome>>(
      '/api/maxymia-home?populate[hero]=*&populate[whatIsSection][populate][card][populate]=*&populate[Courses]=*&populate[whyMaxymia][populate][card][populate]=*&populate[ctaSection][populate]=*&status=published',
      {
        revalidate: 60,
        tags: ['maxymia-home'],
      }
    );

    if (!response.data) {
      return null;
    }

    return transformMaxymiaHome(response.data);
  } catch (error) {
    console.error('Error fetching maxymia home data:', error);
    return null;
  }
}
