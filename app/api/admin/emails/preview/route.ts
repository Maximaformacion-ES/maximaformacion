import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { resolveSegment, buildAudience } from '@/lib/email/audiences';

/** POST → resuelve el segmento y devuelve { count, sample }. NO envía nada. */
export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const body = (await request.json().catch(() => ({}))) as { segment?: unknown };
  const segment = resolveSegment(body.segment);
  if (!segment) {
    return NextResponse.json({ error: 'Segmento inválido' }, { status: 400 });
  }

  const audience = await buildAudience(segment);
  // Devolvemos la lista (ordenada) de destinatarios; el cliente pagina de 10 en 10.
  // Cap = tope de envío (2000); `count` es el total real y `truncated` avisa si hay más.
  const LIMIT = 2000;
  const recipients = audience.slice(0, LIMIT).map((r) => ({ name: r.name, email: r.email }));
  return NextResponse.json({
    count: audience.length,
    recipients,
    truncated: audience.length > LIMIT,
  });
}
