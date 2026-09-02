/**
 * Klaviyo server-side client.
 *
 * Degrades gracefully: if KLAVIYO_PRIVATE_API_KEY is not set, calls log a
 * warning and resolve with `{ skipped: true }` so callers can stay simple
 * while the account is being set up.
 *
 * Docs: https://developers.klaviyo.com/en/reference/api_overview
 */

const REVISION = process.env.KLAVIYO_REVISION || '2024-10-15';
const KEY = process.env.KLAVIYO_PRIVATE_API_KEY;

export function isKlaviyoConfigured(): boolean {
  return Boolean(KEY);
}

type SkipResult = { skipped: true; reason: string };

export function isSkipped(r: unknown): r is SkipResult {
  return !!r && typeof r === 'object' && (r as SkipResult).skipped === true;
}

async function klaviyoFetch<T>(
  path: string,
  init: RequestInit = {},
  /** Algunas llamadas (campañas) necesitan una revision concreta: el shape del
   *  body cambia entre revisiones, así que se fija por llamada y no por env. */
  revision: string = REVISION,
): Promise<T | SkipResult> {
  if (!KEY) {
    console.warn(`[klaviyo] skipped ${path} — KLAVIYO_PRIVATE_API_KEY not set`);
    return { skipped: true, reason: 'no_api_key' };
  }
  const res = await fetch(`https://a.klaviyo.com${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Revision: revision,
      Authorization: `Klaviyo-API-Key ${KEY}`,
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Klaviyo ${res.status} ${path}: ${text.slice(0, 500)}`);
  }
  // 202 / 204 responses have no body.
  if (res.status === 202 || res.status === 204) return {} as T;
  return (await res.json()) as T;
}

export interface ProfileInput {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  properties?: Record<string, unknown>;
}

/**
 * Upsert a profile by email. Uses profile-import which is idempotent on email.
 * https://developers.klaviyo.com/en/reference/spawn_bulk_profile_import_job
 */
export async function upsertProfile(p: ProfileInput) {
  return klaviyoFetch('/api/profile-import', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'profile',
        attributes: {
          email: p.email,
          ...(p.firstName ? { first_name: p.firstName } : {}),
          ...(p.lastName ? { last_name: p.lastName } : {}),
          ...(p.phone ? { phone_number: p.phone } : {}),
          ...(p.properties ? { properties: p.properties } : {}),
        },
      },
    }),
  });
}

export interface EventInput {
  email: string;
  metric: string;
  properties?: Record<string, unknown>;
  /** ISO timestamp; defaults to now */
  time?: string;
  /** Optional monetary value associated with this event */
  value?: number;
}

/**
 * Track a custom event by metric name. Klaviyo auto-creates the metric on
 * first use. Returns 202 with no body on success.
 * https://developers.klaviyo.com/en/reference/create_event
 */
export async function trackEvent(input: EventInput) {
  return klaviyoFetch('/api/events', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'event',
        attributes: {
          properties: input.properties || {},
          ...(input.time ? { time: input.time } : {}),
          ...(typeof input.value === 'number' ? { value: input.value } : {}),
          metric: {
            data: { type: 'metric', attributes: { name: input.metric } },
          },
          profile: {
            data: { type: 'profile', attributes: { email: input.email } },
          },
        },
      },
    }),
  });
}

/**
 * Subscribe a profile to a Klaviyo list. Useful for the welcome flow.
 * https://developers.klaviyo.com/en/reference/subscribe_profiles
 */
export async function subscribeToList(input: {
  email: string;
  listId: string;
  consent?: boolean;
}) {
  const consented = input.consent !== false;
  return klaviyoFetch('/api/profile-subscription-bulk-create-jobs', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'profile-subscription-bulk-create-job',
        attributes: {
          profiles: {
            data: [
              {
                type: 'profile',
                attributes: {
                  email: input.email,
                  subscriptions: {
                    email: {
                      marketing: {
                        consent: consented ? 'SUBSCRIBED' : 'UNSUBSCRIBED',
                      },
                    },
                  },
                },
              },
            ],
          },
        },
        relationships: {
          list: { data: { type: 'list', id: input.listId } },
        },
      },
    }),
  });
}

// ─── Newsletter (lista de suscriptores importada) ──────────────────────
// La lista viene de KLAVIYO_LIST_NEWSLETTER_ID (la lista a la que se importó
// el CSV de suscriptores). Las campañas usan una revision fija: el shape del
// body de /api/campaigns cambia entre revisiones.

const CAMPAIGN_REVISION = '2026-07-15';

export function getNewsletterListId(): string | null {
  return process.env.KLAVIYO_LIST_NEWSLETTER_ID || null;
}

export interface ListInfo {
  id: string;
  name: string;
  profileCount: number;
}

/** Nombre + nº de perfiles de una lista. OJO: profile_count tiene un rate
 *  limit muy bajo (1/s); no llamar en bucle. */
export async function getListInfo(listId: string): Promise<ListInfo | SkipResult> {
  const res = await klaviyoFetch<{
    data: { id: string; attributes: { name: string; profile_count: number } };
  }>(`/api/lists/${listId}?additional-fields[list]=profile_count`, {}, CAMPAIGN_REVISION);
  if (isSkipped(res)) return res;
  return {
    id: res.data.id,
    name: res.data.attributes.name,
    profileCount: res.data.attributes.profile_count ?? 0,
  };
}

export interface ListProfileSample {
  email: string | null;
  name: string;
}

/** Muestra de perfiles de la lista (para la vista previa del composer). */
export async function getListProfilesSample(
  listId: string,
  size = 20,
): Promise<ListProfileSample[] | SkipResult> {
  const res = await klaviyoFetch<{
    data: {
      attributes: { email: string | null; first_name: string | null; last_name: string | null };
    }[];
  }>(`/api/lists/${listId}/profiles?page[size]=${size}`, {}, CAMPAIGN_REVISION);
  if (isSkipped(res)) return res;
  return res.data.map((p) => ({
    email: p.attributes.email,
    name:
      [p.attributes.first_name, p.attributes.last_name].filter(Boolean).join(' ') ||
      p.attributes.email?.split('@')[0] ||
      '(sin nombre)',
  }));
}

export interface ListCampaignInput {
  listId: string;
  /** Nombre interno de la campaña en Klaviyo. */
  name: string;
  subject: string;
  previewText?: string;
  fromEmail: string;
  fromLabel: string;
  replyToEmail?: string;
  html: string;
  text: string;
}

/**
 * Crea y ENVÍA una campaña de email a una lista de Klaviyo:
 * template (HTML) → campaign (audiencia = lista) → asignar template → send job.
 * Klaviyo gestiona el envío real, las bajas y la entregabilidad.
 */
export async function sendListCampaign(
  input: ListCampaignInput,
): Promise<{ campaignId: string } | SkipResult> {
  // 1. Plantilla HTML.
  const tpl = await klaviyoFetch<{ data: { id: string } }>(
    '/api/templates',
    {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'template',
          attributes: {
            name: `[panel] ${input.name}`.slice(0, 100),
            editor_type: 'html',
            html: input.html,
            text: input.text,
          },
        },
      }),
    },
    CAMPAIGN_REVISION,
  );
  if (isSkipped(tpl)) return tpl;

  // 2. Campaña en borrador con la lista como audiencia.
  const campaign = await klaviyoFetch<{
    data: {
      id: string;
      relationships?: { 'campaign-messages'?: { data?: { id: string }[] } };
    };
    included?: { type: string; id: string }[];
  }>(
    '/api/campaigns',
    {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'campaign',
          attributes: {
            name: input.name.slice(0, 100),
            audiences: { included: [input.listId] },
            send_strategy: { method: 'immediate' },
            send_options: { use_smart_sending: false },
            'campaign-messages': {
              data: [
                {
                  type: 'campaign-message',
                  attributes: {
                    definition: {
                      channel: 'email',
                      label: input.subject.slice(0, 100),
                      content: {
                        subject: input.subject,
                        ...(input.previewText ? { preview_text: input.previewText } : {}),
                        from_email: input.fromEmail,
                        from_label: input.fromLabel,
                        ...(input.replyToEmail ? { reply_to_email: input.replyToEmail } : {}),
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      }),
    },
    CAMPAIGN_REVISION,
  );
  if (isSkipped(campaign)) return campaign;

  const messageId =
    campaign.data.relationships?.['campaign-messages']?.data?.[0]?.id ??
    campaign.included?.find((i) => i.type === 'campaign-message')?.id;
  if (!messageId) {
    throw new Error('Klaviyo no devolvió el id del campaign-message al crear la campaña.');
  }

  // 3. Asignar la plantilla al mensaje.
  const assign = await klaviyoFetch(
    '/api/campaign-message-assign-template',
    {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'campaign-message',
          id: messageId,
          relationships: { template: { data: { type: 'template', id: tpl.data.id } } },
        },
      }),
    },
    CAMPAIGN_REVISION,
  );
  if (isSkipped(assign)) return assign;

  // 4. Disparar el envío (asíncrono en Klaviyo; responde 202).
  const job = await klaviyoFetch(
    '/api/campaign-send-jobs',
    {
      method: 'POST',
      body: JSON.stringify({ data: { type: 'campaign-send-job', id: campaign.data.id } }),
    },
    CAMPAIGN_REVISION,
  );
  if (isSkipped(job)) return job;

  return { campaignId: campaign.data.id };
}
