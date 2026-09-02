import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { setRefunded } from '@/lib/admin/purchases';
import { writeAudit } from '@/lib/admin/audit';

/**
 * POST → marca/desmarca una compra como reembolsada (solo la marca del panel;
 * NO toca Stripe — para el reembolso real está el flujo de la ficha de alumno).
 * body: { enrollmentId, refunded }. requireAdmin.
 */
export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const body = (await request.json().catch(() => ({}))) as {
    enrollmentId?: string;
    refunded?: boolean;
  };
  const enrollmentId = typeof body.enrollmentId === 'string' ? body.enrollmentId : '';
  const refunded = body.refunded === true;
  if (!enrollmentId) {
    return NextResponse.json({ error: 'enrollmentId requerido' }, { status: 400 });
  }

  try {
    const row = await setRefunded(enrollmentId, refunded);
    if (!row) {
      return NextResponse.json({ error: 'No existe esa compra.' }, { status: 404 });
    }
    await writeAudit({
      actor: gate.userId,
      action: refunded ? 'mark_refunded' : 'unmark_refunded',
      entityType: 'payment',
      entityId: enrollmentId,
      targetClerkId: row.clerkId,
      diff: { title: row.title, price: row.price },
      source: 'panel',
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
