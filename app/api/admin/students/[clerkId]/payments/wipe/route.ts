import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { wipePurchases } from '@/lib/admin/payments';

/** POST → borrar todas las compras y estado por-curso del alumno. body: { confirm }. */
export async function POST(request: Request, { params }: { params: Promise<{ clerkId: string }> }) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  const { clerkId } = await params;
  const body = (await request.json().catch(() => ({}))) as { confirm?: boolean };
  const result = await wipePurchases({ actor: gate.userId, clerkId, confirm: body.confirm === true });
  return NextResponse.json(result);
}
