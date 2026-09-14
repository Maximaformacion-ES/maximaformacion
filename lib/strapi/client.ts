const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || '';

// Timeout de las llamadas a Strapi. Sin esto, si Strapi/Cloudflare se cuelga
// (524), cada fetch de SSG esperaba hasta el límite de la plataforma (>60s) y el
// BUILD DE VERCEL FALLABA por timeout de página. Con un tope corto, la petición
// aborta rápido → los callers caen a datos de fallback → el deploy termina.
const STRAPI_TIMEOUT_MS = Number(process.env.STRAPI_TIMEOUT_MS) || 12000;

/**
 * Strapi no disponible (caído, lento, gateway 5xx/52x de Cloudflare, timeout o
 * red). Es DISTINTO de "no existe" (404) o "petición mal formada" (400): esos
 * son deterministas y el caller puede caer a fallback / notFound() sin miedo.
 *
 * Con este error los fetchers de detalle y listados lo RELANZAN en runtime
 * (ver `rethrowIfStrapiUnavailable`). Al lanzar durante una revalidación ISR,
 * Next conserva la última versión buena de la página en vez de cachear un
 * 404 o una página vacía durante 60s. En el primer render tras un deploy (sin
 * versión previa) se sirve la página de error, que la CDN no cachea, así que
 * la siguiente petición vuelve a intentarlo.
 */
export class StrapiUnavailableError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'StrapiUnavailableError';
    this.status = status;
  }
}

const UNAVAILABLE_STATUSES = new Set([429, 500, 502, 503, 504, 520, 521, 522, 523, 524]);

export function isStrapiUnavailable(error: unknown): error is StrapiUnavailableError {
  return error instanceof StrapiUnavailableError;
}

/**
 * Relanza el error si Strapi no está disponible, salvo durante `next build`:
 * ahí preferimos degradar (fallback/notFound) a tumbar el deploy entero por un
 * transitorio; la página se regenera sola con `revalidate`.
 */
export function rethrowIfStrapiUnavailable(error: unknown): void {
  if (!isStrapiUnavailable(error)) return;
  if (process.env.NEXT_PHASE === 'phase-production-build') return;
  throw error;
}

async function fetchOrUnavailable(input: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (e) {
    // Red caída, DNS, timeout (AbortSignal.timeout) → no hay respuesta.
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`Strapi unreachable - ${msg}`);
    throw new StrapiUnavailableError(`Strapi unreachable: ${msg}`);
  }
}

// Check if Strapi is properly configured
export function isStrapiConfigured(): boolean {
  return Boolean(STRAPI_API_TOKEN && STRAPI_URL);
}

interface FetchOptions {
  cache?: RequestCache;
  revalidate?: number | false;
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

  const fetchOptions: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
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

  const response = await fetchOrUnavailable(url.toString(), {
    ...fetchOptions,
    signal: AbortSignal.timeout(STRAPI_TIMEOUT_MS),
  });

  if (!response.ok) {
    // Caída/transitorio (Strapi lento/caído, gateway 5xx/52x, rate limit): error
    // tipado para que el caller conserve la versión anterior en vez de cachear
    // un fallback. 400/401/404 son deterministas → error genérico, el caller
    // cae a fallback / notFound().
    if (UNAVAILABLE_STATUSES.has(response.status)) {
      console.warn(`Strapi unavailable (${response.status}) - keeping last good data if any`);
      throw new StrapiUnavailableError(`Strapi unavailable: ${response.status}`, response.status);
    }
    if ([400, 401, 404].includes(response.status)) {
      console.warn(`Strapi request failed (${response.status}) - using fallback data if available`);
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
  const fetchOptions: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
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
  const response = await fetchOrUnavailable(url, {
    ...fetchOptions,
    signal: AbortSignal.timeout(STRAPI_TIMEOUT_MS),
  });
  if (!response.ok) {
    if (UNAVAILABLE_STATUSES.has(response.status)) {
      console.warn(`Strapi GraphQL unavailable (${response.status}) - keeping last good data if any`);
      throw new StrapiUnavailableError(`Strapi GraphQL unavailable: ${response.status}`, response.status);
    }
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

// El bucket R2 servía por el endpoint de PRUEBAS (pub-*.r2.dev: sin caché, HTTP/1.1,
// rate-limited). Ahora tiene dominio propio cacheado en el edge. Reruteamos el host al
// vuelo para que TODAS las imágenes (las URLs viejas guardadas en la BD y las nuevas)
// salgan por el CDN, sin necesidad de migrar la base de datos.
const R2_DEV_HOST = 'pub-a3cc095f320346dca3aa9ded3eab6141.r2.dev';
// Host del Strapi Cloud ANTIGUO (ya muerto). Algunas referencias en la BD (los
// sellos ISO) apuntan aquí; hemos re-subido esos objetos a R2 con la MISMA clave,
// así que rerutar este host al CDN los recupera sin tocar la BD.
const LEGACY_STRAPI_HOST = 'sincere-beef-7072b60a10.media.strapiapp.com';
const R2_CDN_HOST = 'cdn.maximaformacion.es';

export function getStrapiMediaUrl(media: { url: string } | null | undefined): string {
  if (!media?.url) {
    return '';
  }

  // If URL is already absolute, return as-is (rerouting el bucket R2 / el Strapi
  // Cloud viejo a su CDN).
  if (media.url.startsWith('http://') || media.url.startsWith('https://')) {
    return media.url
      .replace(`//${R2_DEV_HOST}`, `//${R2_CDN_HOST}`)
      .replace(`//${LEGACY_STRAPI_HOST}`, `//${R2_CDN_HOST}`);
  }

  // Otherwise prepend Strapi URL
  return `${STRAPI_URL}${media.url}`;
}

