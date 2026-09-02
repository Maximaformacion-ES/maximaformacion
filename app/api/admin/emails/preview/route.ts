import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { resolveSegment, buildAudience } from '@/lib/email/audiences';
import {
  getListInfo,
  getListProfilesSample,
  getNewsletterListId,
  isSkipped,
} from '@/lib/klaviyo/client';

/** POST → resuelve el segmento y devuelve { count, sample }. NO envía nada. */
export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const body = (await request.json().catch(() => ({}))) as { segment?: unknown };
  const segment = resolveSegment(body.segment);
  if (!segment) {
    return NextResponse.json({ error: 'Segmento inválido' }, { status: 400 });
  }

  // Boletín (con o sin exclusión de registrados): el count y la muestra salen
  // de Klaviyo. Para los segmentos con exclusión el count es un MÁXIMO (los
  // registrados se restan en Klaviyo al enviar), marcado con estimated:true.
  if (segment.kind === 'nopro_all') {
    const listId = getNewsletterListId();
    if (!listId) {
      return NextResponse.json({ error: 'Falta KLAVIYO_LIST_NEWSLETTER_ID' }, { status: 500 });
    }
    try {
      const [registered, info] = await Promise.all([
        buildAudience({ kind: 'nopro_registered' }),
        getListInfo(listId),
      ]);
      if (isSkipped(info)) {
        return NextResponse.json({ error: 'Klaviyo no está configurado' }, { status: 500 });
      }
      const LIMIT = 2000;
      return NextResponse.json({
        count: registered.length + info.profileCount,
        recipients: registered.slice(0, LIMIT).map((r) => ({ name: r.name, email: r.email })),
        truncated: true,
        estimated: true,
      });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : String(e) },
        { status: 502 }
      );
    }
  }

  if (segment.kind === 'newsletter' || segment.kind === 'nopro_unregistered') {
    const listId = getNewsletterListId();
    if (!listId) {
      return NextResponse.json({ error: 'Falta KLAVIYO_LIST_NEWSLETTER_ID' }, { status: 500 });
    }
    try {
      const [info, sample] = await Promise.all([
        getListInfo(listId),
        getListProfilesSample(listId, 20),
      ]);
      if (isSkipped(info) || isSkipped(sample)) {
        return NextResponse.json({ error: 'Klaviyo no está configurado' }, { status: 500 });
      }
      return NextResponse.json({
        count: info.profileCount,
        recipients: sample.map((p) => ({ name: p.name, email: p.email ?? '(solo teléfono)' })),
        truncated: info.profileCount > sample.length,
        listName: info.name,
        estimated: segment.kind === 'nopro_unregistered',
      });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : String(e) },
        { status: 502 }
      );
    }
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
