import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
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
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

  const program = await getProgramBySlug(slug, false).catch(() => null);
  if (!program) {
    return NextResponse.json({ error: 'Program not found' }, { status: 404 });
  }
  if (!program.brochurePdfUrl) {
    return NextResponse.json({ error: 'No brochure available' }, { status: 404 });
  }

  // Identity & consent depend on whether the visitor is signed in:
  //   • Signed-in (consent-only modal): we already have their identity in
  //     Clerk, so we read name/email from the SESSION server-side (never
  //     trusting the client) and consent is optional.
  //   • Anonymous (full form): name/email/consent come from the body, and
  //     consent is required.
  const { userId } = await auth();
  let email: string | undefined;
  let name: string | null = null;
  let consent: boolean;
  let source: string;

  if (userId) {
    try {
      const cc = await clerkClient();
      const user = await cc.users.getUser(userId);
      email = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
      name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || null;
    } catch {
      return NextResponse.json({ error: 'Could not resolve account' }, { status: 500 });
    }
    consent = body.consent === true; // optional for signed-in users
    source = 'brochure_download_auth';
    if (!email) {
      return NextResponse.json({ error: 'No email on account' }, { status: 400 });
    }
  } else {
    // Option B: el email es obligatorio (hace falta para entregar el PDF),
    // pero el consentimiento de marketing es OPCIONAL — no se bloquea la
    // descarga por no marcarlo; solo condiciona la suscripción a newsletter.
    email = body.email?.trim().toLowerCase();
    name = body.name?.trim() || null;
    consent = body.consent === true;
    source = 'brochure_download';
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
  }

  // Both branches above guarantee a valid email (or already returned); this
  // also narrows the type from `string | undefined` to `string`.
  if (!email) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const ipPrefix = anonymizeIp(
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
  );
  const userAgent = request.headers.get('user-agent') || null;
  const utmSource = body.utmSource || null;
  const referer = body.referer || request.headers.get('referer') || null;

  // 1. Append-only safety net. Best-effort: a DB hiccup (connection error,
  //    missing table, etc.) must NEVER 500 the request and block the download —
  //    the user only needs the PDF URL, which is already resolved above.
  let logRow: { id: string } | undefined;
  try {
    [logRow] = await db
      .insert(leadCaptureLog)
      .values({
        source,
        email,
        name,
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
  } catch (err) {
    console.error('[lead-capture] db insert failed (brochure)', {
      email,
      slug,
      message: err instanceof Error ? err.message : String(err),
    });
  }

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
      // MF-18: solo suscribimos a newsletter cuando hay consentimiento
      // explícito (checkbox del formulario en anónimos; checkbox del
      // mini-modal en logueados). Sin consentimiento, el perfil + evento se
      // registran igual (para segmentar), pero NO se suscribe. La
      // segmentación de "descargaron temario" se hace por el evento.
      if (consent && LIST_ID) {
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
