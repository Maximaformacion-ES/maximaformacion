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

interface StrapiRedirectRow {
  source?: string;
  destination?: string;
  statusCode?: number;
}

interface StrapiPaginatedResponse {
  data?: StrapiRedirectRow[];
  meta?: { pagination?: { page?: number; pageCount?: number; total?: number } };
}

const PAGE_SIZE = 100;

async function fetchRedirects(): Promise<Map<string, RedirectRule>> {
  // Strapi v5 caps pageSize internally (default max 100, configurable to a
  // few hundred); just asking for 500 silently returned 250 in our case,
  // which left ~76 of the SEO team's 326 rules unloaded. Page properly
  // until pageCount is exhausted.
  const map = new Map<string, RedirectRule>();
  try {
    let page = 1;
    while (true) {
      const url =
        `${STRAPI_URL}/api/redirects?filters[active][$eq]=true` +
        `&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}` +
        `&fields[0]=source&fields[1]=destination&fields[2]=statusCode`;
      const res = await fetch(url, {
        headers: STRAPI_API_TOKEN ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {},
        cache: 'no-store',
      });
      if (!res.ok) break;
      const json = (await res.json()) as StrapiPaginatedResponse;
      const rows = json.data ?? [];
      for (const r of rows) {
        if (!r.source) continue;
        // 410 is "gone" — no destination needed. Everything else (3xx) is
        // a redirect and must have one.
        const rawStatus = Number(r.statusCode) || 301;
        const isGone = rawStatus === 410;
        if (!isGone && !r.destination) continue;
        const source = normalizePath(r.source);
        const statusCode =
          isGone ? 410 :
          rawStatus >= 300 && rawStatus <= 308 ? rawStatus :
          301;
        map.set(source, {
          source,
          destination: r.destination ?? '',
          statusCode,
        });
      }
      const pageCount = json.meta?.pagination?.pageCount ?? 1;
      if (page >= pageCount || rows.length === 0) break;
      page += 1;
      // Defensive cap so a misconfigured pageCount can't spin forever.
      if (page > 50) break;
    }
    return map;
  } catch {
    return map;
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

/**
 * Namespace-level fallback for legacy WooCommerce `/product/<slug>` URLs.
 *
 * The old WordPress store exposed every course at `/product/<slug>`. The
 * migration mapped `/curso/` and `/masters/` but never captured `/product/`,
 * so that whole namespace 404s today. Course slugs carried over 1:1 to
 * `/programas/<slug>`, so we 301 the entire namespace with a single rule.
 *
 * This is a wildcard the exact-match Strapi engine (a `Map.get`) can't
 * express, which is why it lives in code. It is intentionally consulted
 * ONLY AFTER `lookupRedirect` misses, so the Strapi Redirect collection
 * stays the source of truth and can override any individual `/product/...`
 * path — e.g. a discontinued product mapped to a 410, or one whose slug
 * changed — without touching code.
 *
 * Matches a single path segment only (`/product/foo`, not `/product/foo/bar`
 * nor `/product-category/...`).
 */
export function legacyNamespaceRedirect(
  pathname: string,
): { destination: string; statusCode: number } | null {
  const m = pathname.toLowerCase().match(/^\/product\/([^/]+)\/?$/);
  if (m && m[1]) {
    return { destination: `/programas/${m[1]}`, statusCode: 301 };
  }
  return null;
}
