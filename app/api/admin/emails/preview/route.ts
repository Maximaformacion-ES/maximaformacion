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
  const sample = audience[0] ? { name: audience[0].name, email: audience[0].email } : null;
  return NextResponse.json({ count: audience.length, sample });
}
