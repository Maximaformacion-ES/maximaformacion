import { NextResponse } from 'next/server';
import { getAuthorBySlug } from '@/lib/strapi/queries';
import { sendEmail } from '@/lib/email/client';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Envía la consulta de un alumno al docente. El destinatario (email del docente)
 * se resuelve EN EL SERVIDOR a partir de su `slug` en Strapi —nunca desde el
 * cliente— para que el endpoint no pueda usarse como relé hacia direcciones
 * arbitrarias. El remitente es el dominio verificado (EMAIL_FROM); el reply-to
 * es el email del alumno, para que el docente le responda directamente.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const docenteSlug = String(body.docenteSlug ?? '').trim();
    const name = String(body.name ?? '').trim();
    const email = String(body.email ?? '').trim();
    const message = String(body.message ?? '').trim();
    const courseTitle = String(body.courseTitle ?? '').trim();

    if (!docenteSlug || !name || !email || !message) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'El email no es válido.' }, { status: 400 });
    }
    if (message.length > 5000 || name.length > 200) {
      return NextResponse.json({ error: 'Contenido demasiado largo.' }, { status: 400 });
    }

    const docente = await getAuthorBySlug(docenteSlug);
    if (!docente?.email) {
      return NextResponse.json({ error: 'Este docente no tiene contacto disponible.' }, { status: 404 });
    }

    const safeMsg = escapeHtml(message).replace(/\n/g, '<br/>');
    const html = `
      <div style="font-family:Arial,sans-serif;font-size:15px;color:#1a1a1a;line-height:1.6">
        <p>Has recibido una consulta de un alumno${courseTitle ? ` sobre <strong>${escapeHtml(courseTitle)}</strong>` : ''}:</p>
        <p><strong>Nombre:</strong> ${escapeHtml(name)}<br/>
           <strong>Email:</strong> ${escapeHtml(email)}</p>
        <p style="border-left:3px solid #F7A000;padding-left:12px;color:#444">${safeMsg}</p>
        <p style="color:#888;font-size:13px">Responde directamente a este correo para contestar a ${escapeHtml(name)}.</p>
      </div>`;
    const text = `Consulta de ${name} (${email})${courseTitle ? ` sobre ${courseTitle}` : ''}:\n\n${message}`;

    await sendEmail({
      to: docente.email,
      subject: `Consulta de ${name}${courseTitle ? ` · ${courseTitle}` : ''}`,
      replyTo: email,
      html,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('docente-contact error:', error);
    return NextResponse.json({ error: 'No se pudo enviar el mensaje.' }, { status: 500 });
  }
}
