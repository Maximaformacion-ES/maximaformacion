import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { issueCertificate } from '@/lib/admin/certificates';

/** POST → emitir certificado manual. body: { courseId, courseTitle, instructor? }. */
export async function POST(request: Request, { params }: { params: Promise<{ clerkId: string }> }) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  const { clerkId } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    courseId?: string;
    courseTitle?: string;
    instructor?: string;
  };
  if (!body.courseId || !body.courseTitle) {
    return NextResponse.json({ error: 'courseId y courseTitle son obligatorios' }, { status: 400 });
  }
  const result = await issueCertificate({
    actor: gate.userId,
    clerkId,
    courseId: body.courseId,
    courseTitle: body.courseTitle,
    instructor: body.instructor,
  });
  return NextResponse.json(result, { status: result.error ? 422 : 200 });
}
