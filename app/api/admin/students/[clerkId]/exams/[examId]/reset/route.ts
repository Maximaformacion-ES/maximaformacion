import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { resetExam } from '@/lib/admin/exams';

/** POST → resetear (borrar) el resultado de un examen para que el alumno lo repita. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ clerkId: string; examId: string }> }
) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  const { clerkId, examId } = await params;
  const result = await resetExam({ actor: gate.userId, clerkId, examId });
  return NextResponse.json(result, { status: result.error ? 422 : 200 });
}
