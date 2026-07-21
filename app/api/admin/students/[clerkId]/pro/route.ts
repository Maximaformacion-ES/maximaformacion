import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { setPro } from '@/lib/admin/pro';

/** POST → dar/quitar PRO. body: { isPro: boolean }. requireAdmin() + auditoría. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ clerkId: string }> }
) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const { clerkId } = await params;
  const body = (await request.json().catch(() => ({}))) as { isPro?: boolean };
  const result = await setPro(gate.userId, clerkId, body.isPro === true);
  return NextResponse.json(result);
}
