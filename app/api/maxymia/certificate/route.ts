import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { examResults, lessonProgress } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');

  if (!courseId) {
    return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
  }

  try {
    // Get lesson completions for this course
    const completions = await db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.clerkId, userId),
          eq(lessonProgress.programDocumentId, courseId)
        )
      );

    // Get exam results for this course
    const exams = await db
      .select()
      .from(examResults)
      .where(
        and(
          eq(examResults.clerkId, userId),
          eq(examResults.courseId, courseId)
        )
      );

    // Check all exams passed
    const allExamsPassed = exams.length > 0 && exams.every((e) => e.passed);

    // Get user info
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const studentName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.emailAddresses[0]?.emailAddress || 'Student';

    return NextResponse.json({
      eligible: completions.length > 0 && allExamsPassed,
      completedLessons: completions.length,
      examsPassed: exams.filter((e) => e.passed).length,
      totalExams: exams.length,
      studentName,
    });
  } catch (error) {
    console.error('Error checking certificate eligibility:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
