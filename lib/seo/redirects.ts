/**
 * Server-side redirect rules fetched from Strapi (`/api/redirects`).
 *
 * The SEO team adds rules from Strapi admin (Content Manager → Redirect). At
 * request time, `proxy.ts` (Clerk middleware) consults this module to decide
 * whether to short-circuit with a 301/302 before any other logic runs.
 *
 * Caching: in-memory with TTL so we don't hammer Strapi per request. Edge:
 * works without DB connection; if Strapi is unreachable we degrade silently
 * (no redirect, request continues).
 */

const STRAPI_URL = (process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || '';

export interface RedirectRule {
  source: string;       // canonical, lowercased, leading slash, no trailing slash
  destination: string;  // absolute URL or path starting with '/'
  statusCode: number;
}

interface CacheState {
  rules: Map<string, RedirectRule>;
  fetchedAt: number;
  inFlight: Promise<Map<string, RedirectRule>> | null;
}

const TTL_MS = 60_000; // 1 minute

const cache: CacheState = {
  rules: new Map(),
  fetchedAt: 0,
  inFlight: null,
};

function normalizePath(p: string): string {
  if (!p) return '/';
  const trimmed = p.split('?')[0].split('#')[0];
  const lower = trimmed.toLowerCase();
  if (lower.length > 1 && lower.endsWith('/')) return lower.slice(0, -1);
  return lower.startsWith('/') ? lower : `/${lower}`;
}

async function fetchRedirects(): Promise<Map<string, RedirectRule>> {
  const url = `${STRAPI_URL}/api/redirects?filters[active][$eq]=true&pagination[pageSize]=500&fields[0]=source&fields[1]=destination&fields[2]=statusCode`;
  try {
    const res = await fetch(url, {
      headers: STRAPI_API_TOKEN ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {},
      // Middleware runs at edge — avoid Next data cache.
      cache: 'no-store',
    });
    if (!res.ok) return new Map();
    const json = (await res.json()) as { data?: { source?: string; destination?: string; statusCode?: number }[] };
    const rows = json.data || [];
    const map = new Map<string, RedirectRule>();
    for (const r of rows) {
      if (!r.source || !r.destination) continue;
      const source = normalizePath(r.source);
      const status = Number(r.statusCode) || 301;
      map.set(source, {
        source,
        destination: r.destination,
        statusCode: status >= 300 && status <= 308 ? status : 301,
      });
    }
    return map;
  } catch {
    return new Map();
  }
}

async function getRules(): Promise<Map<string, RedirectRule>> {
  const now = Date.now();
  if (now - cache.fetchedAt < TTL_MS && cache.rules.size >= 0) {
    return cache.rules;
  }
  if (cache.inFlight) return cache.inFlight;
  cache.inFlight = fetchRedirects()
    .then((rules) => {
      cache.rules = rules;
      cache.fetchedAt = Date.now();
      cache.inFlight = null;
      return rules;
    })
    .catch(() => {
      cache.inFlight = null;
      return cache.rules;
    });
  return cache.inFlight;
}

/**
 * Look up a redirect for the given path. Returns null if no rule matches.
 * Used by `proxy.ts` to short-circuit a request.
 */
export async function lookupRedirect(pathname: string): Promise<RedirectRule | null> {
  const key = normalizePath(pathname);
  const rules = await getRules();
  return rules.get(key) || null;
}
