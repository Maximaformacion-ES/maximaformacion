import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { emailCampaigns, emailCampaignRecipients } from '@/lib/db/schema';
import { sendEmail } from '@/lib/email/client';
import { getSiteUrl } from '@/lib/site-url';
import { writeAudit } from '@/lib/admin/audit';
import { buildAudience, type Segment } from './audiences';

const MAX_AUDIENCE = 2000;

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
}: {
  subject: string;
  bodyHtml: string;
  name: string;
}): { html: string; text: string } {
  const body = bodyHtml.replaceAll('{nombre}', escapeHtml(name));
  const logo = `${getSiteUrl()}/logo-maxima.png`;

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;background:#f5f5f5;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
    <div style="padding:20px 24px;border-bottom:1px solid #eeeeee;">
      <img src="${logo}" alt="Máxima Formación" style="height:28px;width:auto;display:block;" />
    </div>
    <div style="padding:24px;font-size:15px;line-height:1.65;">${body}</div>
    <div style="padding:16px 24px;border-top:1px solid #eeeeee;color:#999999;font-size:12px;line-height:1.5;">
      Máxima Formación · Has recibido este email como alumno de la plataforma.
    </div>
  </div>
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
}: {
  subject: string;
  bodyHtml: string;
  to: string;
}): Promise<void> {
  const { html, text } = renderEmail({ subject, bodyHtml, name: 'Nombre' });
  await sendEmail({ to, subject: `[PRUEBA] ${subject}`, html, text });
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
  replyTo,
}: {
  actor: string;
  subject: string;
  bodyHtml: string;
  segment: Segment;
  replyTo?: string;
}): Promise<{ campaignId: string | null; total: number; sent: number; failed: number }> {
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
          await sendEmail({ to: r.email, subject, html, text, replyTo });
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

/** Últimas campañas (defensivo). Para la tabla de historial. */
export async function listCampaigns(limit = 50): Promise<(typeof emailCampaigns.$inferSelect)[]> {
  try {
    return await db.select().from(emailCampaigns).orderBy(desc(emailCampaigns.createdAt)).limit(limit);
  } catch (e) {
    console.warn('[campaign] listCampaigns failed:', e);
    return [];
  }
}
