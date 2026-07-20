import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getPayments } from '@/lib/admin/payments';

/** GET → compras (enrollments) + suscripción del alumno. requireAdmin. */
export async function GET(_request: Request, { params }: { params: Promise<{ clerkId: string }> }) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  const { clerkId } = await params;
  return NextResponse.json(await getPayments(clerkId));
}
