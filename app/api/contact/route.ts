import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/client';
import { db } from '@/lib/db/client';
import { contactMessages } from '@/lib/db/schema';

/** Primeros 3 octetos de una IPv4 (RGPD: no guardamos la IP completa). */
function anonymizeIp(raw: string | null): string | null {
  if (!raw) return null;
  const ip = raw.split(',')[0].trim();
  const m = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.\d{1,3}$/);
  return m ? `${m[1]}.${m[2]}.${m[3]}.x` : null;
}

// Destinatario(s) de los mensajes del formulario de /contacto. Coma-separado en
// la env para poder añadir buzones sin tocar código. Por defecto, el correo que
// ya se muestra en la propia página de contacto.
const CONTACT_NOTIFY_TO = (process.env.CONTACT_NOTIFY_TO || 'cursos@maximaformacion.es')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

interface ContactBody {
  name: string;
  email: string;
  phone?: string;
  message: string;
  subject?: string;
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function validate(body: unknown): { ok: true; data: ContactBody } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid body' };
  const b = body as Record<string, unknown>;

  const name = typeof b.name === 'string' ? b.name.trim() : '';
  if (!name) return { ok: false, error: 'Nombre requerido' };

  const email = typeof b.email === 'string' ? b.email.trim() : '';
  if (!isEmail(email)) return { ok: false, error: 'Email inválido' };

  const message = typeof b.message === 'string' ? b.message.trim() : '';
  if (!message) return { ok: false, error: 'Mensaje requerido' };

  return {
    ok: true,
    data: {
      name,
      email,
      message,
      phone: typeof b.phone === 'string' ? b.phone.trim() || undefined : undefined,
      subject: typeof b.subject === 'string' ? b.subject.trim() || undefined : undefined,
    },
  };
}

function buildEmailHtml(lead: ContactBody): string {
  const row = (label: string, value: string | undefined) =>
    !value
      ? ''
      : `<tr><td style="padding:6px 12px;color:#666;background:#f5f5f5;font-weight:600">${label}</td><td style="padding:6px 12px">${escapeHtml(value)}</td></tr>`;

  return `
    <div style="font-family:system-ui,sans-serif;color:#111;max-width:640px;margin:0 auto">
      <h2 style="color:#f59e0b;margin:0 0 16px">Nuevo mensaje de contacto</h2>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden">
        ${row('Nombre', lead.name)}
        ${row('Email', lead.email)}
        ${row('Teléfono', lead.phone)}
        ${row('Asunto', lead.subject)}
        ${row('Mensaje', lead.message)}
      </table>
    </div>
  `;
}

// Email de confirmación (auto-respuesta) para el usuario que rellena el
// formulario: le avisa de que su mensaje ha llegado y de que le contactarán.
function buildConfirmationHtml(lead: ContactBody): string {
  const firstName = escapeHtml(lead.name.split(/\s+/)[0] || lead.name);
  return `
    <div style="font-family:system-ui,sans-serif;color:#111;max-width:560px;margin:0 auto;padding:8px">
      <h2 style="color:#f59e0b;margin:0 0 12px">¡Hemos recibido tu mensaje!</h2>
      <p style="font-size:15px;line-height:1.6;margin:0 0 12px">Hola ${firstName},</p>
      <p style="font-size:15px;line-height:1.6;margin:0 0 12px">
        Gracias por escribirnos. Tu mensaje ha llegado correctamente y
        <strong>un docente te contactará lo antes posible</strong> para ayudarte.
      </p>
      <div style="border-left:3px solid #f59e0b;background:#faf7f2;padding:10px 14px;margin:0 0 16px;border-radius:4px">
        <p style="font-size:13px;color:#666;margin:0 0 4px;font-weight:600">Tu mensaje:</p>
        <p style="font-size:14px;line-height:1.5;color:#333;margin:0;white-space:pre-wrap">${escapeHtml(lead.message)}</p>
      </div>
      <p style="font-size:14px;line-height:1.6;color:#555;margin:0 0 12px">
        Mientras tanto, si es urgente puedes escribirnos a
        <a href="mailto:cursos@maximaformacion.es" style="color:#f59e0b">cursos@maximaformacion.es</a>
        o llamarnos al <a href="tel:+34635659391" style="color:#f59e0b">+34 635 65 93 91</a>.
      </p>
      <p style="font-size:14px;line-height:1.6;color:#555;margin:0">
        Un saludo,<br/><strong>Equipo de Máxima Formación</strong>
      </p>
    </div>
  `;
}

export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const result = validate(raw);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const lead = result.data;

  const ipPrefix = anonymizeIp(
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
  );
  const referer = request.headers.get('referer');
  const userAgent = request.headers.get('user-agent');

  // 1. Persistir en Neon = fuente de verdad para el panel admin. Best-effort:
  //    si el email falla, el mensaje sigue guardado (y viceversa).
  let saved = false;
  try {
    await db.insert(contactMessages).values({
      name: lead.name,
      email: lead.email,
      phone: lead.phone ?? null,
      subject: lead.subject ?? null,
      message: lead.message,
      ipPrefix,
      userAgent: userAgent ?? null,
      referer: referer ?? null,
    });
    saved = true;
  } catch (err) {
    console.error('Contact message DB insert failed:', err);
  }

  // 2. Notificar por email.
  let emailed = false;
  try {
    await sendEmail({
      to: CONTACT_NOTIFY_TO,
      subject: `Nuevo mensaje de contacto — ${lead.name}${lead.subject && lead.subject !== 'general' ? ` · ${lead.subject}` : ''}`,
      html: buildEmailHtml(lead),
      replyTo: lead.email,
    });
    emailed = true;
  } catch (err) {
    console.error('Contact email failed:', err);
  }

  // Solo es un error real si NO se pudo ni guardar ni enviar: en ese caso el
  // mensaje se habría perdido, así que el formulario debe mostrar error.
  if (!saved && !emailed) {
    return NextResponse.json({ error: 'No se pudo enviar el mensaje' }, { status: 502 });
  }

  // 3. Confirmación al remitente (auto-respuesta). Best-effort: nunca debe hacer
  //    fallar el envío del formulario si este email no sale. replyTo al buzón del
  //    equipo para que, si responde, le llegue a quien gestiona las consultas.
  try {
    await sendEmail({
      to: lead.email,
      subject: 'Hemos recibido tu mensaje — Máxima Formación',
      html: buildConfirmationHtml(lead),
      replyTo: CONTACT_NOTIFY_TO[0],
    });
  } catch (err) {
    console.error('Contact confirmation email failed:', err);
  }

  return NextResponse.json({ success: true });
}
