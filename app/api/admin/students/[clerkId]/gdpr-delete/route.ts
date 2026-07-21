import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { gdprDelete } from '@/lib/admin/gdpr';

/**
 * POST → borrado RGPD (derecho al olvido). Sin `confirm` = dry-run (informe de
 * qué se borraría). Con `confirm: true` = borra en todos los sistemas. requireAdmin.
 * La confirmación fuerte (escribir el email) la hace la UI.
 */
export async function POST(request: Request, { params }: { params: Promise<{ clerkId: string }> }) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const { clerkId } = await params;
  const body = (await request.json().catch(() => ({}))) as { confirm?: boolean };
  const result = await gdprDelete({ actor: gate.userId, clerkId, confirm: body.confirm === true });
  return NextResponse.json(result);
}
