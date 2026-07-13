import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { reprovision } from '@/lib/admin/provision';

/** POST → re-ejecutar el provisioning de Moodle. body: { documentId }. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ clerkId: string }> }
) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const { clerkId } = await params;
  const body = (await request.json().catch(() => ({}))) as { documentId?: string };
  if (!body.documentId) {
    return NextResponse.json({ error: 'documentId es obligatorio' }, { status: 400 });
  }

  const result = await reprovision(gate.userId, clerkId, body.documentId);
  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
