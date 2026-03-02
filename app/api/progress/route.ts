import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db/client';
import type { CourseProgress } from '@/lib/strapi/types';

interface ProgressRequestBody {
  programId: string;
  lessonId: string;
  action: 'start' | 'complete' | 'update';
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: ProgressRequestBody = await request.json();
    const { programId, lessonId, action } = body;

    if (!programId || !lessonId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: programId, lessonId, action' },
        { status: 400 }
      );
    }

    // Try PostgreSQL first
    if (isDbConfigured()) {
      try {
        const {
          markLessonComplete,
          upsertCourseActivity,
          getLessonProgress,
          getCourseActivity,
        } = await import('@/lib/db/queries');

        switch (action) {
          case 'complete':
            await markLessonComplete(userId, programId, lessonId);
            await upsertCourseActivity(userId, programId, lessonId);
            break;
          case 'start':
          case 'update':
            await upsertCourseActivity(userId, programId, lessonId);
            break;
        }

        const lessons = await getLessonProgress(userId, programId);
        const activity = await getCourseActivity(userId, programId);
        const singleActivity = Array.isArray(activity) ? activity[0] : activity;

        return NextResponse.json({
          success: true,
          progress: {
            startedAt: singleActivity?.startedAt?.toISOString() || new Date().toISOString(),
            lastAccessedAt: singleActivity?.lastAccessedAt?.toISOString() || new Date().toISOString(),
            completedLessons: lessons.map((l) => l.lessonDocumentId),
            currentLessonId: singleActivity?.currentLessonId || lessonId,
            progressPercent: 0,
          },
        });
      } catch (dbError) {
        console.warn('Database unavailable for progress write, falling back to Clerk:', dbError);
      }
    }

    // Fallback: write to Clerk metadata (original behavior)
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const currentMetadata = user.publicMetadata || {};

    const courseProgress = (currentMetadata.courseProgress as Record<string, CourseProgress>) || {};
    const existingProgress = courseProgress[programId] || {
      startedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      completedLessons: [],
      currentLessonId: lessonId,
      progressPercent: 0,
    };

    const completedLessons = new Set(existingProgress.completedLessons);

    switch (action) {
      case 'start':
        existingProgress.lastAccessedAt = new Date().toISOString();
        existingProgress.currentLessonId = lessonId;
        break;
      case 'complete':
        completedLessons.add(lessonId);
        existingProgress.completedLessons = Array.from(completedLessons);
        existingProgress.lastAccessedAt = new Date().toISOString();
        break;
      case 'update':
        existingProgress.lastAccessedAt = new Date().toISOString();
        existingProgress.currentLessonId = lessonId;
        break;
    }

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...currentMetadata,
        courseProgress: { ...courseProgress, [programId]: existingProgress },
      },
    });

    return NextResponse.json({
      success: true,
      progress: existingProgress,
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');

    // Try PostgreSQL first
    if (isDbConfigured()) {
      try {
        const { getLessonProgress, getCourseActivity, getAllCourseProgress } = await import('@/lib/db/queries');

        if (programId) {
          const lessons = await getLessonProgress(userId, programId);
          const activity = await getCourseActivity(userId, programId);
          const singleActivity = Array.isArray(activity) ? activity[0] : activity;

          if (lessons.length === 0 && !singleActivity) {
            return NextResponse.json({ progress: null });
          }

          return NextResponse.json({
            progress: {
              startedAt: singleActivity?.startedAt?.toISOString() || null,
              lastAccessedAt: singleActivity?.lastAccessedAt?.toISOString() || null,
              completedLessons: lessons.map((l) => l.lessonDocumentId),
              currentLessonId: singleActivity?.currentLessonId || null,
              progressPercent: 0,
            },
          });
        }

        const courseProgress = await getAllCourseProgress(userId);
        const formatted: Record<string, {
          startedAt: string;
          lastAccessedAt: string;
          completedLessons: string[];
          currentLessonId: string | null;
          progressPercent: number;
        }> = {};

        for (const [programDocId, data] of Object.entries(courseProgress)) {
          formatted[programDocId] = {
            startedAt: data.startedAt || new Date().toISOString(),
            lastAccessedAt: data.lastAccessedAt || new Date().toISOString(),
            completedLessons: data.completedLessons,
            currentLessonId: data.currentLessonId,
            progressPercent: 0,
          };
        }

        return NextResponse.json({ courseProgress: formatted });
      } catch (dbError) {
        console.warn('Database unavailable for progress read, falling back to Clerk:', dbError);
      }
    }

    // Fallback: read from Clerk metadata
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const courseProgress = (user.publicMetadata?.courseProgress as Record<string, CourseProgress>) || {};

    if (programId) {
      const progress = courseProgress[programId] || null;
      return NextResponse.json({ progress });
    }

    return NextResponse.json({ courseProgress });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
