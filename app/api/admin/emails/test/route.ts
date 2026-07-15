import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { sendTestEmail } from '@/lib/email/campaign';

/** POST → envía un email de PRUEBA al propio admin. body: { subject, bodyHtml }. */
export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const body = (await request.json().catch(() => ({}))) as { subject?: string; bodyHtml?: string };
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const bodyHtml = typeof body.bodyHtml === 'string' ? body.bodyHtml : '';
  if (!subject || !bodyHtml || bodyHtml === '<p></p>') {
    return NextResponse.json({ error: 'Asunto y cuerpo son obligatorios' }, { status: 400 });
  }
  if (!gate.email) {
    return NextResponse.json({ error: 'Tu usuario admin no tiene email en Clerk' }, { status: 400 });
  }

  try {
    await sendTestEmail({ subject, bodyHtml, to: gate.email });
    return NextResponse.json({ ok: true, to: gate.email });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
