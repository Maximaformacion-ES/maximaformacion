import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { reinstateCertificate } from '@/lib/admin/certificates';

/** POST → reinstaurar un certificado revocado. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ clerkId: string; certId: string }> }
) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  const { certId } = await params;
  const result = await reinstateCertificate({ actor: gate.userId, certId });
  return NextResponse.json(result, { status: result.error ? 422 : 200 });
}
