const STRAPI_URL = process.env.STRAPI_URL || '';
const strapiHost = STRAPI_URL ? new URL(STRAPI_URL).hostname : null;

export function isAllowedDownloadHost(hostname: string): boolean {
  if (hostname.endsWith('.r2.dev')) return true;
  if (hostname.endsWith('.r2.cloudflarestorage.com')) return true;
  if (hostname.endsWith('.strapiapp.com')) return true;
  if (hostname.endsWith('.supabase.co')) return true;
  if (strapiHost && hostname === strapiHost) return true;
  return false;
}

export function sanitizeDownloadName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim() || 'archivo';
}
