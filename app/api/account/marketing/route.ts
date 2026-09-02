import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isOptedOut, setMarketingOptOut } from '@/lib/email/optout';

/** GET → estado de la preferencia de comunicaciones comerciales del usuario. */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  return NextResponse.json({ optedOut: await isOptedOut(userId) });
}

/** POST { optOut: boolean } → cambia la preferencia del propio usuario. */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { optOut?: boolean };
  if (typeof body.optOut !== 'boolean') {
    return NextResponse.json({ error: 'optOut requerido' }, { status: 400 });
  }

  try {
    await setMarketingOptOut(userId, body.optOut);
    return NextResponse.json({ ok: true, optedOut: body.optOut });
  } catch (e) {
    console.error('[account:marketing] failed:', e);
    return NextResponse.json({ error: 'No se pudo guardar la preferencia' }, { status: 500 });
  }
}
