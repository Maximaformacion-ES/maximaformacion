import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { certificates, examResults, lessonProgress } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

/**
 * Issues a certificate for the authenticated user + course if eligible.
 * Idempotent: if a certificate already exists for (clerkId, courseId) it's returned.
 *
 * Body: { courseId: string, courseTitle: string, instructor?: string, completedAt?: string }
 * Returns: { id, studentName, courseTitle, instructor, issuedAt, completedAt, verifyUrl }
 */
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { courseId?: string; courseTitle?: string; instructor?: string; completedAt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const courseId = body.courseId?.trim();
  const courseTitle = body.courseTitle?.trim();
  if (!courseId || !courseTitle) {
    return NextResponse.json({ error: 'Missing courseId or courseTitle' }, { status: 400 });
  }

  // Verify eligibility: at least one completed lesson + all exams passed.
  const [completions, exams] = await Promise.all([
    db
      .select()
      .from(lessonProgress)
      .where(and(eq(lessonProgress.clerkId, userId), eq(lessonProgress.programDocumentId, courseId))),
    db
      .select()
      .from(examResults)
      .where(and(eq(examResults.clerkId, userId), eq(examResults.courseId, courseId))),
  ]);

  // Eligibility: at least some lesson progress in this course, and — if the course
  // has exams — all must be passed. Courses without exams are fine.
  const allExamsPassed = exams.length === 0 || exams.every((e) => e.passed);
  if (completions.length === 0 || !allExamsPassed) {
    return NextResponse.json(
      { error: 'Not eligible: complete all lessons and pass all exams first' },
      { status: 403 },
    );
  }

  // Already issued? Return existing.
  const existing = await db
    .select()
    .from(certificates)
    .where(and(eq(certificates.clerkId, userId), eq(certificates.courseId, courseId)))
    .limit(1);

  if (existing[0]) {
    return NextResponse.json(buildPayload(request, existing[0]));
  }

  // Resolve student name from Clerk.
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const studentName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.emailAddresses[0]?.emailAddress ||
    'Alumno';

  const completedAt = body.completedAt ? new Date(body.completedAt) : new Date();

  const [inserted] = await db
    .insert(certificates)
    .values({
      clerkId: userId,
      courseId,
      courseTitle,
      studentName,
      instructor: body.instructor || null,
      completedAt,
    })
    .returning();

  return NextResponse.json(buildPayload(request, inserted), { status: 201 });
}

function buildPayload(request: NextRequest, cert: typeof certificates.$inferSelect) {
  const origin = new URL(request.url).origin;
  return {
    id: cert.id,
    studentName: cert.studentName,
    courseTitle: cert.courseTitle,
    instructor: cert.instructor,
    issuedAt: cert.issuedAt.toISOString(),
    completedAt: cert.completedAt.toISOString(),
    verifyUrl: `${origin}/verificar/${cert.id}`,
  };
}
