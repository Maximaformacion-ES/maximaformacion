import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/client';

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

  try {
    await sendEmail({
      to: CONTACT_NOTIFY_TO,
      subject: `Nuevo mensaje de contacto — ${lead.name}`,
      html: buildEmailHtml(lead),
      replyTo: lead.email,
    });
  } catch (err) {
    // A diferencia del stub anterior, aquí SÍ propagamos el fallo para que el
    // formulario muestre error en vez de un falso "enviado correctamente".
    console.error('Contact email failed:', err);
    return NextResponse.json({ error: 'No se pudo enviar el mensaje' }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
