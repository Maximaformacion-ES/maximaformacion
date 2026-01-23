import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getPrograms } from '@/lib/strapi/queries';
import { getProgramWithLessons } from '@/lib/strapi/lesson-queries';
import type { PurchasedCourse, CourseProgress, UserCourseData } from '@/lib/strapi/types';

// Helper to safely fetch from Strapi
async function safeFetchPrograms(isPro: boolean) {
  try {
    const { programs } = await getPrograms({ isPro, limit: 100 });
    return programs;
  } catch {
    // Strapi unavailable - return empty array
    return [];
  }
}

// Helper to safely get program with lessons
async function safeGetProgramWithLessons(documentId: string) {
  try {
    return await getProgramWithLessons(documentId);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const publicMetadata = user.publicMetadata || {};

    const userHasPro = publicMetadata.plan === 'pro';
    const purchasedCourses = (publicMetadata.purchasedCourses as PurchasedCourse[]) || [];
    const courseProgress = (publicMetadata.courseProgress as Record<string, CourseProgress>) || {};

    const userCourses: UserCourseData[] = [];

    // If user has Pro, get all Pro courses
    if (userHasPro) {
      const programs = await safeFetchPrograms(true);

      for (const program of programs) {
        const progress = courseProgress[program.documentId];

        // Calculate progress percentage
        let progressPercent = 0;
        if (progress) {
          const fullProgram = await safeGetProgramWithLessons(program.documentId);
          if (fullProgram && fullProgram.totalLessons > 0) {
            progressPercent = Math.round(
              (progress.completedLessons.length / fullProgram.totalLessons) * 100
            );
          }
        }

        userCourses.push({
          program,
          purchased: false,
          progress: progress
            ? { ...progress, progressPercent }
            : undefined,
          accessType: 'pro',
        });
      }
    }

    // Add purchased courses (even if user is Pro, they keep purchased courses permanently)
    for (const purchase of purchasedCourses) {
      // Check if course is already in the list (avoid duplicates if user is Pro)
      const alreadyInList = userCourses.some(
        (c) =>
          c.program.id === purchase.programId ||
          c.program.documentId === purchase.documentId
      );

      if (!alreadyInList) {
        // Fetch the program
        const program = await safeGetProgramWithLessons(purchase.documentId);

        if (program) {
          const progress = courseProgress[purchase.documentId];

          // Calculate progress percentage
          let progressPercent = 0;
          if (progress && program.totalLessons > 0) {
            progressPercent = Math.round(
              (progress.completedLessons.length / program.totalLessons) * 100
            );
          }

          userCourses.push({
            program,
            purchased: true,
            purchasedAt: purchase.purchasedAt,
            progress: progress
              ? { ...progress, progressPercent }
              : undefined,
            accessType: 'purchased',
          });
        }
      } else {
        // Update the existing entry to mark it as also purchased
        const existingIndex = userCourses.findIndex(
          (c) =>
            c.program.id === purchase.programId ||
            c.program.documentId === purchase.documentId
        );
        if (existingIndex !== -1) {
          userCourses[existingIndex].purchased = true;
          userCourses[existingIndex].purchasedAt = purchase.purchasedAt;
        }
      }
    }

    // Sort by last accessed (most recent first), then by purchased date
    userCourses.sort((a, b) => {
      const aDate = a.progress?.lastAccessedAt || a.purchasedAt || '';
      const bDate = b.progress?.lastAccessedAt || b.purchasedAt || '';
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

    return NextResponse.json({
      courses: userCourses,
      hasProAccess: userHasPro,
      totalCourses: userCourses.length,
    });
  } catch (error) {
    console.error('Error fetching user courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user courses' },
      { status: 500 }
    );
  }
}
