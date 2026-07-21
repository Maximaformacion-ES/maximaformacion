import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { resolveSegment } from '@/lib/email/audiences';
import { sendCampaign } from '@/lib/email/campaign';

/**
 * POST → envía la campaña a la audiencia del segmento.
 * body: { subject, bodyHtml, segment, replyTo? }. requireAdmin.
 * La confirmación explícita se hace en la UI (AlertDialog).
 */
export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const body = (await request.json().catch(() => ({}))) as {
    subject?: string;
    bodyHtml?: string;
    segment?: unknown;
    from?: string;
    replyTo?: string;
  };
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const bodyHtml = typeof body.bodyHtml === 'string' ? body.bodyHtml : '';
  const from = typeof body.from === 'string' && body.from.trim() ? body.from.trim() : undefined;
  const replyTo = typeof body.replyTo === 'string' && body.replyTo.trim() ? body.replyTo.trim() : undefined;
  const segment = resolveSegment(body.segment);

  if (!subject || !bodyHtml || bodyHtml === '<p></p>') {
    return NextResponse.json({ error: 'Asunto y cuerpo son obligatorios' }, { status: 400 });
  }
  if (!segment) {
    return NextResponse.json({ error: 'Segmento inválido' }, { status: 400 });
  }

  try {
    const result = await sendCampaign({ actor: gate.userId, subject, bodyHtml, segment, from, replyTo });
    // 200 si envió algo; 500 si no se envió ninguno.
    return NextResponse.json(result, { status: result.sent === 0 ? 500 : 200 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}
