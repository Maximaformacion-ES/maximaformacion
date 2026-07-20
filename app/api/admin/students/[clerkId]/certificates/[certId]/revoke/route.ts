import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { revokeCertificate } from '@/lib/admin/certificates';

/** POST → revocar un certificado. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ clerkId: string; certId: string }> }
) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  const { certId } = await params;
  const result = await revokeCertificate({ actor: gate.userId, certId });
  return NextResponse.json(result, { status: result.error ? 422 : 200 });
}
