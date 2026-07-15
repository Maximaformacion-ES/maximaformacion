import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { requireAdmin } from '@/lib/admin-auth';
import { sendTestEmail } from '@/lib/email/campaign';

/** POST → envía un email de PRUEBA al propio admin. body: { subject, bodyHtml }. */
export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const body = (await request.json().catch(() => ({}))) as {
    subject?: string;
    bodyHtml?: string;
    from?: string;
    replyTo?: string;
  };
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const bodyHtml = typeof body.bodyHtml === 'string' ? body.bodyHtml : '';
  const from = typeof body.from === 'string' && body.from.trim() ? body.from.trim() : undefined;
  const replyTo = typeof body.replyTo === 'string' && body.replyTo.trim() ? body.replyTo.trim() : undefined;
  if (!subject || !bodyHtml || bodyHtml === '<p></p>') {
    return NextResponse.json({ error: 'Asunto y cuerpo son obligatorios' }, { status: 400 });
  }
  if (!gate.email) {
    return NextResponse.json({ error: 'Tu usuario admin no tiene email en Clerk' }, { status: 400 });
  }

  // Nombre del propio admin (para que {nombre} en la PRUEBA salga personalizado).
  let name = gate.email.split('@')[0];
  try {
    const cc = await clerkClient();
    const u = await cc.users.getUser(gate.userId);
    name = u.firstName || u.fullName || name;
  } catch {
    /* si falla, usamos el prefijo del email */
  }

  try {
    await sendTestEmail({ subject, bodyHtml, to: gate.email, from, replyTo, name });
    return NextResponse.json({ ok: true, to: gate.email });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
