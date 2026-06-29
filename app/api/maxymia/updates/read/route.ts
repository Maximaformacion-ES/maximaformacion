import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { markUnitUpdatesRead } from '@/lib/maxymia/course-updates';

/** Marca como leídas (para el usuario) las updates de una unidad que acaba de ver,
 *  para que el aviso "Contenido nuevo/actualizado" desaparezca. */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const ids = Array.isArray(body?.ids)
    ? (body.ids as unknown[]).filter((x): x is string => typeof x === 'string')
    : [];
  if (ids.length > 0) await markUnitUpdatesRead(userId, ids);
  return NextResponse.json({ ok: true });
}
