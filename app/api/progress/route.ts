import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
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

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const currentMetadata = user.publicMetadata || {};

    // Get existing course progress data
    const courseProgress = (currentMetadata.courseProgress as Record<string, CourseProgress>) || {};
    const existingProgress = courseProgress[programId] || {
      startedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      completedLessons: [],
      currentLessonId: lessonId,
      progressPercent: 0,
    };

    const completedLessons = new Set(existingProgress.completedLessons);

    // Handle different actions
    switch (action) {
      case 'start':
        // Mark course as started and set current lesson
        existingProgress.lastAccessedAt = new Date().toISOString();
        existingProgress.currentLessonId = lessonId;
        break;

      case 'complete':
        // Add lesson to completed list
        completedLessons.add(lessonId);
        existingProgress.completedLessons = Array.from(completedLessons);
        existingProgress.lastAccessedAt = new Date().toISOString();
        break;

      case 'update':
        // Just update the current position
        existingProgress.lastAccessedAt = new Date().toISOString();
        existingProgress.currentLessonId = lessonId;
        break;
    }

    // Update progress in Clerk metadata
    const updatedCourseProgress = {
      ...courseProgress,
      [programId]: existingProgress,
    };

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...currentMetadata,
        courseProgress: updatedCourseProgress,
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

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const courseProgress = (user.publicMetadata?.courseProgress as Record<string, CourseProgress>) || {};

    if (programId) {
      // Return progress for specific course
      const progress = courseProgress[programId] || null;
      return NextResponse.json({ progress });
    }

    // Return all course progress
    return NextResponse.json({ courseProgress });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
