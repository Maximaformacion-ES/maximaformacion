import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { emailCampaigns, emailCampaignRecipients } from '@/lib/db/schema';
import { sendEmail } from '@/lib/email/client';
import { writeAudit } from '@/lib/admin/audit';
import {
  getListInfo,
  getNewsletterListId,
  isSkipped,
  sendListCampaign,
} from '@/lib/klaviyo/client';
import { buildAudience, type Segment } from './audiences';

const MAX_AUDIENCE = 2000;

// Resend solo envía desde un dominio VERIFICADO. El del proyecto es
// maximaformacion.es → el remitente elegido debe estar en ese dominio.
const VERIFIED_DOMAIN = 'maximaformacion.es';

// Logo alojado en R2 (URL pública permanente): los clientes de correo lo cargan
// desde cualquier sitio (dev y prod), a diferencia de /logo-maxima.png que en dev
// apuntaría a localhost. Subido a bucket "maxima" bajo email/logo-maxima.png.
const EMAIL_LOGO_URL = 'https://cdn.maximaformacion.es/email/logo-maxima.png';

/** Extrae el dominio del email de un remitente en formato "Nombre <a@b>" o "a@b". */
function fromDomain(from: string): string | null {
  const m = from.match(/<([^>]+)>/);
  const addr = (m ? m[1] : from).trim();
  const at = addr.lastIndexOf('@');
  return at >= 0 ? addr.slice(at + 1).toLowerCase().replace(/>$/, '') : null;
}

/** Valida que el remitente (si se indica) esté en el dominio verificado en Resend. */
export function assertVerifiedFrom(from?: string): void {
  if (!from || !from.trim()) return; // vacío → usa el default del cliente
  const domain = fromDomain(from);
  if (domain !== VERIFIED_DOMAIN) {
    throw new Error(
      `El remitente debe ser una dirección @${VERIFIED_DOMAIN} (el dominio verificado en Resend). Recibido: "${from}".`
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Envuelve el cuerpo (HTML del editor) en la plantilla de marca y sustituye
 *  `{nombre}` por el nombre del alumno (escapado). Devuelve html + texto plano. */
export function renderEmail({
  subject,
  bodyHtml,
  name,
  footerHtml,
}: {
  subject: string;
  bodyHtml: string;
  name: string;
  /** Pie legal alternativo (p.ej. suscriptores con enlace de baja de Klaviyo). */
  footerHtml?: string;
}): { html: string; text: string } {
  const body = bodyHtml.replaceAll('{nombre}', escapeHtml(name));
  const footer =
    footerHtml ??
    `Has recibido este email como alumno de <strong style="color:#6b6b6b;">Máxima Formación</strong>.`;
  const font = `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif`;

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escapeHtml(subject)}</title>
<style>
  .mx-body { font-size:16px; line-height:1.65; color:#2b2b2b; }
  .mx-body p { margin:0 0 16px; }
  .mx-body a { color:#F7A000; text-decoration:underline; }
  .mx-body h1,.mx-body h2 { font-size:20px; line-height:1.3; font-weight:700; color:#171717; margin:24px 0 12px; }
  .mx-body h3 { font-size:17px; line-height:1.35; font-weight:700; color:#171717; margin:20px 0 10px; }
  .mx-body ul,.mx-body ol { margin:0 0 16px; padding-left:22px; }
  .mx-body li { margin:4px 0; }
  .mx-body strong,.mx-body b { color:#171717; }
  .mx-body img { max-width:100%; height:auto; border-radius:8px; }
  .mx-body > :first-child { margin-top:0; }
  .mx-body > :last-child { margin-bottom:0; }
</style></head>
<body style="margin:0;padding:0;background:#f4f4f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;">
    <tr><td align="center" style="padding:32px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ececec;font-family:${font};">
        <tr><td style="padding:24px 36px 20px;border-bottom:3px solid #F7A000;">
          <img src="${EMAIL_LOGO_URL}" alt="Máxima Formación" height="30" style="height:30px;width:auto;display:block;border:0;outline:none;text-decoration:none;" />
        </td></tr>
        <tr><td style="padding:32px 36px;">
          <div class="mx-body">${body}</div>
        </td></tr>
        <tr><td style="padding:20px 36px;border-top:1px solid #f0f0f0;background:#fafafa;color:#9a9a9a;font-size:12px;line-height:1.5;font-family:${font};">
          ${footer}
        </td></tr>
      </table>
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
        <tr><td style="padding:14px 36px;text-align:center;color:#bfbfbf;font-size:11px;font-family:${font};">© Máxima Formación</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = body
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { html, text };
}

/** Envía UN email de prueba (al propio admin). Prefija "[PRUEBA]". */
export async function sendTestEmail({
  subject,
  bodyHtml,
  to,
  from,
  replyTo,
  name,
}: {
  subject: string;
  bodyHtml: string;
  to: string;
  from?: string;
  replyTo?: string;
  /** Nombre para sustituir {nombre} en la prueba (p.ej. el del propio admin). */
  name?: string;
}): Promise<void> {
  assertVerifiedFrom(from);
  const { html, text } = renderEmail({ subject, bodyHtml, name: name || 'alumno' });
  await sendEmail({ to, subject: `[PRUEBA] ${subject}`, html, text, from, replyTo });
}

/**
 * Envía la campaña a toda la audiencia del segmento. Registra la campaña y el
 * estado por destinatario, en lotes pequeños respetando el rate-limit de Resend.
 * Nunca aborta toda la campaña por un fallo individual.
 */
export async function sendCampaign({
  actor,
  subject,
  bodyHtml,
  segment,
  from,
  replyTo,
}: {
  actor: string;
  subject: string;
  bodyHtml: string;
  segment: Segment;
  from?: string;
  replyTo?: string;
}): Promise<{ campaignId: string | null; total: number; sent: number; failed: number }> {
  assertVerifiedFrom(from);

  // Los suscriptores del boletín se envían POR Klaviyo (13k perfiles: fuera del
  // alcance del bucle síncrono de Resend). Klaviyo gestiona bajas y entrega.
  if (segment.kind === 'newsletter') {
    return sendNewsletterCampaign({ actor, subject, bodyHtml, from, replyTo });
  }

  const audience = await buildAudience(segment);
  if (audience.length === 0) {
    throw new Error('La audiencia está vacía: no hay alumnos que coincidan con ese segmento.');
  }
  if (audience.length > MAX_AUDIENCE) {
    throw new Error(
      `Demasiados destinatarios (${audience.length} > ${MAX_AUDIENCE}) para el envío directo; requiere una cola de envío (fuera de alcance de esta versión).`
    );
  }

  const total = audience.length;

  // Registro de la campaña (defensivo: la BD puede ir por detrás de migraciones).
  let campaignId: string | null = null;
  try {
    const [row] = await db
      .insert(emailCampaigns)
      .values({
        clerkIdActor: actor,
        subject,
        bodyHtml,
        segment: segment as never,
        fromAddr: from ?? null,
        replyTo: replyTo ?? null,
        total,
        status: 'sending',
      })
      .returning({ id: emailCampaigns.id });
    campaignId = row?.id ?? null;
  } catch (e) {
    console.error('[campaign] insert email_campaigns failed:', e);
  }

  if (campaignId) {
    try {
      await db.insert(emailCampaignRecipients).values(
        audience.map((r) => ({
          campaignId: campaignId as string,
          clerkId: r.clerkId,
          email: r.email,
          status: 'pending',
        }))
      );
    } catch (e) {
      console.error('[campaign] insert recipients failed:', e);
    }
  }

  let sent = 0;
  let failed = 0;
  const BATCH = 2; // ~2/seg → respeta el rate-limit de Resend

  for (let i = 0; i < audience.length; i += BATCH) {
    const batch = audience.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (r) => {
        const { html, text } = renderEmail({ subject, bodyHtml, name: r.name });
        try {
          await sendEmail({ to: r.email, subject, html, text, from, replyTo });
          sent++;
          if (campaignId) {
            try {
              await db
                .update(emailCampaignRecipients)
                .set({ status: 'sent', sentAt: new Date() })
                .where(
                  and(
                    eq(emailCampaignRecipients.campaignId, campaignId),
                    eq(emailCampaignRecipients.clerkId, r.clerkId)
                  )
                );
            } catch {
              /* best-effort */
            }
          }
        } catch (e) {
          failed++;
          const msg = e instanceof Error ? e.message : String(e);
          if (campaignId) {
            try {
              await db
                .update(emailCampaignRecipients)
                .set({ status: 'failed', error: msg })
                .where(
                  and(
                    eq(emailCampaignRecipients.campaignId, campaignId),
                    eq(emailCampaignRecipients.clerkId, r.clerkId)
                  )
                );
            } catch {
              /* best-effort */
            }
          }
        }
      })
    );
    if (i + BATCH < audience.length) {
      await new Promise((res) => setTimeout(res, 600));
    }
  }

  if (campaignId) {
    try {
      await db
        .update(emailCampaigns)
        .set({ sent, failed, status: sent === 0 ? 'failed' : 'done', sentAt: new Date() })
        .where(eq(emailCampaigns.id, campaignId));
    } catch (e) {
      console.error('[campaign] update email_campaigns failed:', e);
    }
  }

  await writeAudit({
    actor,
    action: 'send_email_campaign',
    entityType: 'email_campaign',
    entityId: campaignId ?? undefined,
    diff: { subject, total, sent, failed, segment },
    source: 'panel',
  });

  return { campaignId, total, sent, failed };
}

// ─── Boletín (suscriptores Klaviyo) ────────────────────────────────────

/** "Nombre <a@b>" → { label, email }. */
function parseFrom(from: string): { label: string; email: string } {
  const m = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (m) return { label: m[1] || 'Máxima Formación', email: m[2].trim() };
  return { label: 'Máxima Formación', email: from.trim() };
}

const NEWSLETTER_FOOTER =
  `Has recibido este email porque estás suscrito al boletín de ` +
  `<strong style="color:#6b6b6b;">Máxima Formación</strong>. ` +
  `<a href="{% unsubscribe_link %}" style="color:#9a9a9a;text-decoration:underline;">Darte de baja</a>`;

/**
 * Envía la campaña a los suscriptores del boletín A TRAVÉS de Klaviyo
 * (plantilla + campaña + send job). El envío real, las bajas y la
 * entregabilidad los gestiona Klaviyo; aquí solo se registra el histórico.
 */
async function sendNewsletterCampaign({
  actor,
  subject,
  bodyHtml,
  from,
  replyTo,
}: {
  actor: string;
  subject: string;
  bodyHtml: string;
  from?: string;
  replyTo?: string;
}): Promise<{ campaignId: string | null; total: number; sent: number; failed: number }> {
  const listId = getNewsletterListId();
  if (!listId) {
    throw new Error('Falta KLAVIYO_LIST_NEWSLETTER_ID: no sé a qué lista de Klaviyo enviar.');
  }

  const { label: fromLabel, email: fromEmail } = parseFrom(
    from ?? 'Máxima Formación <cursos@maximaformacion.es>'
  );

  // {nombre} → variable de plantilla de Klaviyo (se personaliza por perfil).
  const body = bodyHtml.replaceAll('{nombre}', `{{ first_name|default:'' }}`);
  const { html, text } = renderEmail({
    subject,
    bodyHtml: body,
    name: '', // ya no queda {nombre} que sustituir
    footerHtml: NEWSLETTER_FOOTER,
  });

  const info = await getListInfo(listId);
  const total = isSkipped(info) ? 0 : info.profileCount;
  if (total === 0) {
    throw new Error(
      'La lista de suscriptores de Klaviyo está vacía o no se pudo leer; no se envía nada.'
    );
  }

  const result = await sendListCampaign({
    listId,
    name: `[panel] ${subject}`,
    subject,
    fromEmail,
    fromLabel,
    replyToEmail: replyTo,
    html,
    text,
  });
  if (isSkipped(result)) {
    throw new Error('Klaviyo no está configurado (KLAVIYO_PRIVATE_API_KEY).');
  }

  // Histórico local. sent = total: el envío real es asíncrono en Klaviyo y las
  // métricas finas (aperturas, bajas, rebotes) se consultan allí.
  let campaignId: string | null = null;
  try {
    const [row] = await db
      .insert(emailCampaigns)
      .values({
        clerkIdActor: actor,
        subject,
        bodyHtml,
        segment: { kind: 'newsletter', klaviyoCampaignId: result.campaignId } as never,
        fromAddr: from ?? null,
        replyTo: replyTo ?? null,
        total,
        sent: total,
        failed: 0,
        status: 'done',
        sentAt: new Date(),
      })
      .returning({ id: emailCampaigns.id });
    campaignId = row?.id ?? null;
  } catch (e) {
    console.error('[campaign] insert email_campaigns (newsletter) failed:', e);
  }

  await writeAudit({
    actor,
    action: 'send_email_campaign',
    entityType: 'email_campaign',
    entityId: campaignId ?? undefined,
    diff: { subject, total, segment: { kind: 'newsletter' }, klaviyoCampaignId: result.campaignId },
    source: 'panel',
  });

  return { campaignId, total, sent: total, failed: 0 };
}

/** Últimas campañas (defensivo). Para la tabla de historial. */
export async function listCampaigns(limit = 50): Promise<(typeof emailCampaigns.$inferSelect)[]> {
  try {
    return await db.select().from(emailCampaigns).orderBy(desc(emailCampaigns.createdAt)).limit(limit);
  } catch (e) {
    console.warn('[campaign] listCampaigns failed:', e);
    return [];
  }
}
