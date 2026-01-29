import { strapiRequest, getStrapiMediaUrl } from './client';
import type {
  StrapiResponse,
  StrapiSingleResponse,
  StrapiProgram,
  StrapiBlogPost,
  Program,
  BlogPost,
  ProgramQueryOptions,
  BlogQueryOptions,
  ProgramModule,
  BlogAuthor,
} from './types';

// Default values for missing program data
const DEFAULT_PROGRAM_IMAGE = 'placeholder-image-programs.webp';

// Transform Strapi Program to frontend Program
function transformProgram(strapi: StrapiProgram): Program {
  const imageUrl = strapi.image
    ? getStrapiMediaUrl(strapi.image)
    : strapi.imageUrl || DEFAULT_PROGRAM_IMAGE;

  const modules: ProgramModule[] = (strapi.modules || []).map((m) => ({
    title: m.title,
    description: m.description,
    hours: m.hours,
    topics: m.topics || [],
  }));

  return {
    id: strapi.id,
    documentId: strapi.documentId,
    type: strapi.type,
    title: strapi.title,
    slug: strapi.slug,
    duration: strapi.duration,
    ects: strapi.ects,
    tags: strapi.tags || [],
    featured: strapi.featured,
    description: strapi.description,
    longDescription: strapi.longDescription || strapi.description,
    image: imageUrl,
    format: strapi.format || 'Online',
    language: strapi.language || 'Español',
    startDate: strapi.startDate || 'Próximamente',
    certification: strapi.certification || (strapi.type === 'Master' ? 'Título Propio Universidad' : 'Certificado de Experto'),
    price: strapi.price || 1499,
    originalPrice: strapi.originalPrice || undefined,
    modules: modules.length > 0 ? modules : [{ title: 'Módulo 1', description: 'Contenido del módulo', hours: 100, topics: ['Tema 1', 'Tema 2', 'Tema 3'] }],
    audience: strapi.audience || ['Profesionales del sector', 'Recién graduados', 'Personas en transición profesional'],
    careers: strapi.careers || ['Especialista', 'Consultor', 'Manager'],
    objectives: strapi.objectives || ['Adquirir conocimientos especializados', 'Desarrollar habilidades prácticas', 'Aplicar en proyectos reales'],
    isPro: strapi.isPro,
  };
}

// Transform Strapi BlogPost to frontend BlogPost
function transformBlogPost(strapi: StrapiBlogPost): BlogPost {
  const imageUrl = strapi.image
    ? getStrapiMediaUrl(strapi.image)
    : strapi.imageUrl || 'placeholder-image-programs.webp';

  const author: BlogAuthor = strapi.author
    ? {
        name: strapi.author.name,
        role: strapi.author.role,
        avatar: strapi.author.avatar
          ? getStrapiMediaUrl(strapi.author.avatar)
          : 'https://i.pravatar.cc/150',
      }
    : {
        name: 'Equipo Máxima',
        role: 'Autor',
        avatar: 'https://i.pravatar.cc/150',
      };

  return {
    id: strapi.id,
    documentId: strapi.documentId,
    title: strapi.title,
    slug: strapi.slug,
    excerpt: strapi.excerpt,
    content: strapi.content,
    image: imageUrl,
    category: strapi.category,
    author,
    publishedAt: strapi.publishedAt || strapi.createdAt,
    readTime: strapi.readTime || '5 min',
    tags: strapi.tags || [],
    featured: strapi.featured,
  };
}

// Build query string for Strapi API
function buildProgramQuery(options: ProgramQueryOptions = {}): string {
  const params = new URLSearchParams();

  // Populate relations
  params.set('populate', '*');

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

function buildBlogQuery(options: BlogQueryOptions = {}): string {
  const params = new URLSearchParams();

  // Populate relations
  params.set('populate', '*');

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
      `/api/programs/${id}?populate=*`,
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
      `/api/programs?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`,
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

export async function getBlogPostById(
  id: number | string,
  draft = false
): Promise<BlogPost | null> {
  try {
    const response = await strapiRequest<StrapiSingleResponse<StrapiBlogPost>>(
      `/api/blog-posts/${id}?populate=*`,
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
      `/api/blog-posts?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`,
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
      `/api/blog-posts?filters[documentId][$ne]=${currentPost.documentId}&filters[category][$eq]=${encodeURIComponent(currentPost.category)}&populate=*&pagination[pageSize]=${limit}&sort=publishedAt:desc`,
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
        `/api/blog-posts?filters[documentId][$ne]=${currentPost.documentId}&${tagFilter}&populate=*&pagination[pageSize]=${limit - relatedPosts.length}`,
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
