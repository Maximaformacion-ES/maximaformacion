import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { examResults } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { courseId, blockId, examId, score, passed, answers } = body;

  if (!courseId || !blockId || !examId || score === undefined) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    // Best-score wins: only overwrite when the new attempt scores strictly
    // higher than the previously stored result. A 0% retry never replaces
    // a higher previous score, but a 0% first-attempt is still recorded.
    await db
      .insert(examResults)
      .values({
        clerkId: userId,
        courseId,
        blockId,
        examId,
        score,
        passed: !!passed,
        answers,
        completedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [examResults.clerkId, examResults.examId],
        set: {
          score: sql`GREATEST(${examResults.score}, EXCLUDED.score)`,
          passed: sql`CASE WHEN EXCLUDED.score > ${examResults.score} THEN EXCLUDED.passed ELSE ${examResults.passed} END`,
          answers: sql`CASE WHEN EXCLUDED.score > ${examResults.score} THEN EXCLUDED.answers ELSE ${examResults.answers} END`,
          completedAt: sql`CASE WHEN EXCLUDED.score > ${examResults.score} THEN EXCLUDED.completed_at ELSE ${examResults.completedAt} END`,
        },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving exam result:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');

  try {
    const results = courseId
      ? await db
          .select()
          .from(examResults)
          .where(and(eq(examResults.clerkId, userId), eq(examResults.courseId, courseId)))
      : await db
          .select()
          .from(examResults)
          .where(eq(examResults.clerkId, userId));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching exam results:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
