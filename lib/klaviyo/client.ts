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

async function klaviyoFetch<T>(
  path: string,
  init: RequestInit = {},
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
      Revision: REVISION,
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
