import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { grantAccess, revokeAccess } from '@/lib/admin/access';

/**
 * POST   → conceder acceso a un curso/programa. body: { documentId, notify? }
 * DELETE → revocar acceso. query: ?documentId=...&confirm=true (sin confirm = dry-run)
 * Todos: requireAdmin() + auditoría dentro del caso de uso.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ clerkId: string }> }
) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const { clerkId } = await params;
  const body = (await request.json().catch(() => ({}))) as { documentId?: string; notify?: boolean };
  if (!body.documentId) {
    return NextResponse.json({ error: 'documentId es obligatorio' }, { status: 400 });
  }

  const result = await grantAccess({
    actor: gate.userId,
    targetClerkId: clerkId,
    documentId: body.documentId,
    notify: body.notify !== false,
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ clerkId: string }> }
) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const { clerkId } = await params;
  const url = new URL(request.url);
  const documentId = url.searchParams.get('documentId');
  const confirm = url.searchParams.get('confirm') === 'true';
  if (!documentId) {
    return NextResponse.json({ error: 'documentId (query) es obligatorio' }, { status: 400 });
  }

  const result = await revokeAccess({
    actor: gate.userId,
    targetClerkId: clerkId,
    documentId,
    confirm,
  });
  return NextResponse.json(result);
}
