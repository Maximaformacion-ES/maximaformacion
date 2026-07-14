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
  const body = (await request.json().catch(() => ({}))) as {
    documentId?: string;
    documentIds?: string[];
    notify?: boolean;
  };

  // Acepta uno (documentId) o varios (documentIds). Se conceden SECUENCIALMENTE
  // para no pisar el metadata de Clerk (purchasedCourses es read-modify-write).
  const ids = (body.documentIds?.length ? body.documentIds : body.documentId ? [body.documentId] : [])
    .map((s) => s?.trim())
    .filter((s): s is string => !!s);
  if (ids.length === 0) {
    return NextResponse.json({ error: 'documentId(s) obligatorio(s)' }, { status: 400 });
  }

  const notify = body.notify !== false;
  const results = [];
  for (const documentId of ids) {
    results.push(await grantAccess({ actor: gate.userId, targetClerkId: clerkId, documentId, notify }));
  }
  const granted = results.filter((r) => r.ok).length;
  return NextResponse.json(
    { results, granted, total: ids.length },
    { status: granted === ids.length ? 200 : 207 }
  );
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
