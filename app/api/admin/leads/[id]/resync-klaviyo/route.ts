import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { resyncKlaviyo } from '@/lib/admin/leads';

/** POST → reintenta la sincronización a Klaviyo de un lead de captación. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const { id } = await params;
  const result = await resyncKlaviyo({ actor: gate.userId, leadId: id });
  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
