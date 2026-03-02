const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || '';

// Check if Strapi is properly configured
export function isStrapiConfigured(): boolean {
  return Boolean(STRAPI_API_TOKEN && STRAPI_URL);
}

interface FetchOptions {
  cache?: RequestCache;
  revalidate?: number;
  tags?: string[];
  draft?: boolean;
}

export async function strapiRequest<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { cache, revalidate, tags, draft = false } = options;

  const url = new URL(path, STRAPI_URL);

  // Add draft mode parameter for preview
  if (draft) {
    url.searchParams.set('publicationState', 'preview');
  }

  const fetchOptions: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_API_TOKEN && { Authorization: `Bearer ${STRAPI_API_TOKEN}` }),
    },
  };

  // Configure caching strategy
  if (cache) {
    fetchOptions.cache = cache;
  } else if (revalidate !== undefined) {
    fetchOptions.next = { revalidate };
    if (tags) {
      fetchOptions.next.tags = tags;
    }
  } else if (tags) {
    fetchOptions.next = { tags };
  }

  const response = await fetch(url.toString(), fetchOptions);

  if (!response.ok) {
    // Only log as warning for common issues (Strapi down/no auth/missing content type)
    if (response.status === 400 || response.status === 401 || response.status === 404 || response.status === 503) {
      console.warn(`Strapi unavailable (${response.status}) - using fallback data if available`);
    } else {
      console.error(`Strapi API error: ${response.status} ${response.statusText}`);
    }
    throw new Error(`Failed to fetch from Strapi: ${response.status}`);
  }

  return response.json();
}

export async function strapiGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  options: { revalidate?: number; tags?: string[] } = {}
): Promise<T> {
  const url = `${STRAPI_URL}/graphql`;
  const fetchOptions: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_API_TOKEN && { Authorization: `Bearer ${STRAPI_API_TOKEN}` }),
    },
    body: JSON.stringify({ query, variables }),
  };
  if (options.revalidate !== undefined || options.tags) {
    fetchOptions.next = {};
    if (options.revalidate !== undefined) fetchOptions.next.revalidate = options.revalidate;
    if (options.tags) fetchOptions.next.tags = options.tags;
  }
  const response = await fetch(url, fetchOptions);
  if (!response.ok) {
    console.warn(`Strapi GraphQL error (${response.status}) - using fallback data if available`);
    throw new Error(`GraphQL error: ${response.status}`);
  }
  const json = await response.json();
  if (json.errors) {
    console.error('GraphQL errors:', json.errors);
    throw new Error('GraphQL query failed');
  }
  return json.data;
}

export function getStrapiMediaUrl(media: { url: string } | null | undefined): string {
  if (!media?.url) {
    return '';
  }

  // If URL is already absolute, return as-is
  if (media.url.startsWith('http://') || media.url.startsWith('https://')) {
    return media.url;
  }

  // Otherwise prepend Strapi URL
  return `${STRAPI_URL}${media.url}`;
}

