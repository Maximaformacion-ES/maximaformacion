/**
 * The public origin of the site (e.g. https://maximaformacion.es), with any
 * trailing slash stripped. Use this anywhere we'd otherwise concat
 * `NEXT_PUBLIC_APP_URL + '/foo'` so a stray trailing slash in the env var
 * doesn't produce `//foo`.
 *
 * Pass `fallback` when the calling code needs a different default than the
 * public production URL — e.g. server-side endpoints that should stay on
 * localhost during local dev.
 */
export function getSiteUrl(fallback = 'https://www.maximaformacion.es'): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL || fallback;
  return raw.replace(/\/$/, '');
}
