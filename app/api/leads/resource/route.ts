import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { leadCaptureLog } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getResourceBySlug } from '@/lib/strapi/queries';
import { upsertProfile, trackEvent, subscribeToList, isKlaviyoConfigured } from '@/lib/klaviyo/client';
import { getSiteUrl } from '@/lib/site-url';

/**
 * Public endpoint. Captures an email in exchange for a resource download.
 *
 * Body: { slug, name, email, consent, utmSource?, referer? }
 * Returns: { downloads: [{ url, name, mime, sizeKB }], externalUrl: string | null }
 *
 * Flow:
 *   1. Validate input (consent must be true, email well-formed, slug exists).
 *   2. Insert a row in lead_capture_log (sync safety net).
 *   3. Best-effort: upsert profile + track `Resource Downloaded` in Klaviyo.
 *   4. Return the resource's download URLs so the client can trigger them.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIST_ID = process.env.KLAVIYO_LIST_NEWSLETTER_ID;

function anonymizeIp(raw: string | null): string | null {
  if (!raw) return null;
  const ip = raw.split(',')[0]?.trim();
  if (!ip) return null;
  // IPv4 — strip last octet for RGPD friendliness.
  const v4 = ip.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3})\.\d{1,3}$/);
  if (v4) return `${v4[1]}.0`;
  // IPv6 — keep first 64 bits.
  if (ip.includes(':')) return ip.split(':').slice(0, 4).join(':') + '::';
  return null;
}

export async function POST(request: NextRequest) {
  let body: {
    slug?: string;
    name?: string;
    email?: string;
    consent?: boolean;
    utmSource?: string;
    referer?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const slug = body.slug?.trim();
  const email = body.email?.trim().toLowerCase();
  const name = body.name?.trim();
  const consent = body.consent === true;

  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json({ error: 'Consent required' }, { status: 400 });
  }

  const resource = await getResourceBySlug(slug, false).catch(() => null);
  if (!resource) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
  }

  const ipPrefix = anonymizeIp(
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
  );
  const userAgent = request.headers.get('user-agent') || null;
  const utmSource = body.utmSource || null;
  const referer = body.referer || request.headers.get('referer') || null;

  // 1. Append-only safety net.
  const [logRow] = await db
    .insert(leadCaptureLog)
    .values({
      source: 'resource_download',
      email,
      name: name || null,
      resourceSlug: resource.slug,
      resourceTitle: resource.title,
      consent,
      utmSource,
      referer,
      ipPrefix,
      userAgent,
      payload: { name, email, slug, consent, utmSource, referer },
    })
    .returning({ id: leadCaptureLog.id });

  // 2. Best-effort Klaviyo sync. Failure must NOT block the download.
  // If no API key configured yet, leave klaviyo_synced_at NULL — a future cron
  // can replay these once the key is set.
  if (isKlaviyoConfigured()) {
    const [first, ...rest] = name ? name.split(/\s+/) : [];
    const firstName = first || undefined;
    const lastName = rest.length > 0 ? rest.join(' ') : undefined;

    try {
      await upsertProfile({
        email,
        firstName,
        lastName,
        properties: {
          lifecycle_stage: 'lead',
          last_resource_downloaded: resource.slug,
          last_resource_title: resource.title,
          last_resource_category: resource.category,
          last_resource_topic: resource.topic,
        },
      });
      const siteOrigin = getSiteUrl();
      const downloadUrl =
        resource.externalUrl ||
        resource.downloads[0]?.url ||
        `${siteOrigin}/recursos/${resource.slug}`;
      await trackEvent({
        email,
        metric: 'Resource Downloaded',
        properties: {
          resource_slug: resource.slug,
          resource_title: resource.title,
          category: resource.category,
          topic: resource.topic,
          resource_url: `${siteOrigin}/recursos/${resource.slug}`,
          download_url: downloadUrl,
        },
      });
      if (LIST_ID) {
        await subscribeToList({ email, listId: LIST_ID, consent: true });
      }
      if (logRow?.id) {
        await db
          .update(leadCaptureLog)
          .set({ klaviyoSyncedAt: new Date() })
          .where(eq(leadCaptureLog.id, logRow.id));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[lead-capture] klaviyo sync failed', { email, slug, message });
      if (logRow?.id) {
        await db
          .update(leadCaptureLog)
          .set({ klaviyoError: message.slice(0, 1000) })
          .where(eq(leadCaptureLog.id, logRow.id))
          .catch(() => {});
      }
    }
  }

  return NextResponse.json({
    downloads: resource.downloads,
    externalUrl: resource.externalUrl,
  });
}
