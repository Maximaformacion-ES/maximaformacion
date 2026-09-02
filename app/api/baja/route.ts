import { NextRequest, NextResponse } from 'next/server';
import { setMarketingOptOut, verifyUnsubscribeToken } from '@/lib/email/optout';

/**
 * Baja/alta de comunicaciones comerciales SIN sesión, autenticada por el token
 * firmado del enlace del email.
 *
 * POST con query `?u=<clerkId>&t=<token>` (así llega el One-Click de RFC 8058
 * desde Gmail/Yahoo) o con body JSON { u, t, optOut } desde la página /baja.
 * Por defecto optOut = true (dar de baja); la página manda optOut:false para
 * volver a suscribirse.
 */
export async function POST(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  let u = sp.get('u') ?? '';
  let t = sp.get('t') ?? '';
  let optOut = true;

  // Body JSON opcional (página /baja). El One-Click de Gmail manda un body
  // urlencoded que ignoramos: los datos van en la query.
  try {
    const body = (await request.json()) as { u?: string; t?: string; optOut?: boolean };
    if (typeof body.u === 'string') u = body.u;
    if (typeof body.t === 'string') t = body.t;
    if (typeof body.optOut === 'boolean') optOut = body.optOut;
  } catch {
    /* sin body JSON: One-Click u otros */
  }

  if (!verifyUnsubscribeToken(u, t)) {
    return NextResponse.json({ error: 'Enlace no válido' }, { status: 400 });
  }

  try {
    await setMarketingOptOut(u, optOut);
    return NextResponse.json({ ok: true, optOut });
  } catch (e) {
    console.error('[baja] setMarketingOptOut failed:', e);
    return NextResponse.json({ error: 'No se pudo guardar la preferencia' }, { status: 500 });
  }
}
