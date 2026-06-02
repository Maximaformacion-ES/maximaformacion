import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { leadCaptureLog } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getProgramBySlug } from '@/lib/strapi/queries';
import { upsertProfile, trackEvent, subscribeToList, isKlaviyoConfigured } from '@/lib/klaviyo/client';

/**
 * Public endpoint (MF-18). Captures an email in exchange for a program's
 * brochure / temario PDF — the course-page equivalent of
 * /api/leads/resource.
 *
 * Body: { slug, name, email, consent, utmSource?, referer? }  (slug = program slug)
 * Returns: { downloads: [], externalUrl: <brochurePdfUrl> }    (LeadFormResult shape,
 *          so the shared LeadFormModal can consume it unchanged).
 *
 * Flow mirrors the resource endpoint:
 *   1. Validate (consent true, email valid, program + brochure exist).
 *   2. Insert lead_capture_log (source 'brochure_download') — sync safety net.
 *   3. Best-effort Klaviyo: upsert profile + subscribe to the newsletter list
 *      + track `Temario Descargado`. Failure must NEVER block the download;
 *      if the key isn't set the row stays unsynced for a later replay.
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

  const program = await getProgramBySlug(slug, false).catch(() => null);
  if (!program) {
    return NextResponse.json({ error: 'Program not found' }, { status: 404 });
  }
  if (!program.brochurePdfUrl) {
    return NextResponse.json({ error: 'No brochure available' }, { status: 404 });
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
      source: 'brochure_download',
      email,
      name: name || null,
      resourceSlug: program.slug,
      resourceTitle: program.title,
      consent,
      utmSource,
      referer,
      ipPrefix,
      userAgent,
      payload: { name, email, slug, consent, utmSource, referer, kind: 'brochure' },
    })
    .returning({ id: leadCaptureLog.id });

  // 2. Best-effort Klaviyo sync. Failure must NOT block the download. If no
  // API key is configured yet, leave klaviyo_synced_at NULL so a future cron
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
          last_temario_slug: program.slug,
          last_temario_title: program.title,
          last_temario_type: program.type,
        },
      });
      await trackEvent({
        email,
        metric: 'Temario Descargado',
        properties: {
          course_slug: program.slug,
          course_title: program.title,
          course_type: program.type,
          download_url: program.brochurePdfUrl,
        },
      });
      // MF-18: el consentimiento del formulario cubre la suscripción a la
      // newsletter (mismo criterio que /recursos). La segmentación de
      // "descargaron temario" se hace por el evento, no por una lista aparte.
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
      console.error('[lead-capture] klaviyo sync failed (brochure)', { email, slug, message });
      if (logRow?.id) {
        await db
          .update(leadCaptureLog)
          .set({ klaviyoError: message.slice(0, 1000) })
          .where(eq(leadCaptureLog.id, logRow.id))
          .catch(() => {});
      }
    }
  }

  return NextResponse.json({ downloads: [], externalUrl: program.brochurePdfUrl });
}
