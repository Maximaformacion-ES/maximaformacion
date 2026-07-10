/**
 * Purga la caché de Cloudflare del Strapi self-hosted (el edge cache del Worker
 * en infra/cloudflare/strapi-graphql-cache.worker.js). Se llama desde el webhook
 * de Strapi para invalidar AL INSTANTE cualquier cambio de contenido (edición en
 * el admin o reimport), de modo que el TTL largo (1h) solo sea red de seguridad.
 *
 * Purga por HOSTNAME (`maxima-strapi.atlansec.es`) → solo ese subdominio, no el
 * resto de atlansec.es. Best-effort: si falta config o falla, no rompe nada.
 *
 * Env (en Vercel):
 *   CLOUDFLARE_API_TOKEN   token con permiso "Cache Purge" sobre la zona
 *   CLOUDFLARE_ZONE_ID     id de la zona atlansec.es
 * Opcionales:
 *   CLOUDFLARE_PURGE_HOST         (default: maxima-strapi.atlansec.es)
 *   CLOUDFLARE_PURGE_EVERYTHING   "true" → purga toda la zona (si el plan no
 *                                  permite purgar por host)
 */
export async function purgeStrapiEdgeCache(): Promise<{ ok: boolean; message: string }> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const host = process.env.CLOUDFLARE_PURGE_HOST || 'maxima-strapi.atlansec.es';
  const everything = process.env.CLOUDFLARE_PURGE_EVERYTHING === 'true';

  if (!token || !zoneId) {
    return { ok: false, message: 'purge omitido (sin CLOUDFLARE_API_TOKEN/ZONE_ID)' };
  }

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(everything ? { purge_everything: true } : { hosts: [host] }),
      }
    );
    const json = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      errors?: Array<{ message?: string }>;
    };
    if (res.ok && json.success) {
      return { ok: true, message: everything ? 'purge zona OK' : `purge host ${host} OK` };
    }
    const err = json.errors?.map((e) => e.message).join('; ') || `HTTP ${res.status}`;
    return { ok: false, message: `purge FALLÓ (${err})` };
  } catch (e) {
    return { ok: false, message: `purge FALLÓ (${e instanceof Error ? e.message : String(e)})` };
  }
}
