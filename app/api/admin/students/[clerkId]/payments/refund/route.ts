import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { refund } from '@/lib/admin/payments';

/** POST → reembolsar (Stripe). body: { documentId, confirm }. Sin confirm = dry-run. */
export async function POST(request: Request, { params }: { params: Promise<{ clerkId: string }> }) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  const { clerkId } = await params;
  const body = (await request.json().catch(() => ({}))) as { documentId?: string; confirm?: boolean };
  if (!body.documentId) {
    return NextResponse.json({ error: 'documentId es obligatorio' }, { status: 400 });
  }
  const result = await refund({
    actor: gate.userId,
    clerkId,
    documentId: body.documentId,
    confirm: body.confirm === true,
  });
  return NextResponse.json(result, { status: result.error ? 422 : 200 });
}
