import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getPrograms } from '@/lib/strapi/queries';
import { getProgramWithLessons } from '@/lib/strapi/lesson-queries';
import { getMaxymiaCoursesFromStrapi } from '@/lib/strapi/maxymia-queries';
import { maxymiaCourseAsProgram } from '@/app/maxymia/data/adapters';
import { isDbConfigured } from '@/lib/db/client';
import type { PurchasedCourse, CourseProgress, UserCourseData } from '@/lib/strapi/types';
import type { MaxymiaCourse } from '@/app/maxymia/types';

async function safeFetchMaxymiaCourseMap(): Promise<Map<string, MaxymiaCourse>> {
  try {
    const list = await getMaxymiaCoursesFromStrapi();
    return new Map(list.map((c) => [c.id, c]));
  } catch {
    return new Map();
  }
}

async function safeFetchPrograms(isPro: boolean) {
  try {
    const { programs } = await getPrograms({ isPro, limit: 100 });
    return programs;
  } catch {
    return [];
  }
}

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

    let userHasPro = false;
    let purchasedList: { programId: number | null; programDocumentId: string; purchasedAt?: string }[] = [];
    let courseProgressMap: Record<string, { completedLessons: string[]; currentLessonId: string | null; lastAccessedAt: string | null; startedAt: string | null }> = {};

    // Try PostgreSQL first
    if (isDbConfigured()) {
      try {
        const { getUserByClerkId, getUserEnrollments, getAllCourseProgress } = await import('@/lib/db/queries');

        const dbUser = await getUserByClerkId(userId);
        userHasPro = dbUser?.plan === 'pro';

        const dbEnrollments = await getUserEnrollments(userId);
        purchasedList = dbEnrollments.map((e) => ({
          programId: e.programId,
          programDocumentId: e.programDocumentId,
          purchasedAt: e.purchasedAt?.toISOString(),
        }));

        courseProgressMap = await getAllCourseProgress(userId);
      } catch (dbError) {
        console.warn('Database unavailable for user/courses, falling back to Clerk:', dbError);
        // Reset and fall through to Clerk
        userHasPro = false;
        purchasedList = [];
        courseProgressMap = {};
      }
    }

    // Fallback: read from Clerk metadata if no DB data
    if (!isDbConfigured() || (purchasedList.length === 0 && !userHasPro)) {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const publicMetadata = user.publicMetadata || {};

        userHasPro = publicMetadata.plan === 'pro';
        const clerkPurchased = (publicMetadata.purchasedCourses as PurchasedCourse[]) || [];
        purchasedList = clerkPurchased.map((c) => ({
          programId: c.programId,
          programDocumentId: c.documentId,
          purchasedAt: c.purchasedAt,
        }));

        const clerkProgress = (publicMetadata.courseProgress as Record<string, CourseProgress>) || {};
        for (const [programDocId, progress] of Object.entries(clerkProgress)) {
          courseProgressMap[programDocId] = {
            completedLessons: progress.completedLessons || [],
            currentLessonId: progress.currentLessonId || null,
            lastAccessedAt: progress.lastAccessedAt || null,
            startedAt: progress.startedAt || null,
          };
        }
      } catch {
        // If Clerk also fails, continue with empty data
      }
    }

    const userCourses: UserCourseData[] = [];

    // If user has Pro, get all Pro courses
    if (userHasPro) {
      const programs = await safeFetchPrograms(true);

      for (const program of programs) {
        const progress = courseProgressMap[program.documentId];

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
            ? {
                startedAt: progress.startedAt || new Date().toISOString(),
                lastAccessedAt: progress.lastAccessedAt || new Date().toISOString(),
                completedLessons: progress.completedLessons,
                currentLessonId: progress.currentLessonId || undefined,
                progressPercent,
              }
            : undefined,
          accessType: 'pro',
        });
      }
    }

    // Maxymia courses live in a separate Strapi collection. Fetch them once
    // so purchases whose programDocumentId belongs to a Maxymia course (not a
    // regular Program) still surface in "Mis Cursos". Without this fallback
    // those rows silently disappeared from the user's list.
    const maxymiaById = await safeFetchMaxymiaCourseMap();

    // Add purchased courses
    for (const purchase of purchasedList) {
      const alreadyInList = userCourses.some(
        (c) =>
          c.program.id === purchase.programId ||
          c.program.documentId === purchase.programDocumentId
      );

      if (!alreadyInList) {
        const program = await safeGetProgramWithLessons(purchase.programDocumentId);

        if (program) {
          const progress = courseProgressMap[purchase.programDocumentId];

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
              ? {
                  startedAt: progress.startedAt || new Date().toISOString(),
                  lastAccessedAt: progress.lastAccessedAt || new Date().toISOString(),
                  completedLessons: progress.completedLessons,
                  currentLessonId: progress.currentLessonId || undefined,
                  progressPercent,
                }
              : undefined,
            accessType: 'purchased',
          });
        } else {
          // Not a regular program — try Maxymia.
          const maxymiaCourse = maxymiaById.get(purchase.programDocumentId);
          if (maxymiaCourse) {
            const progress = courseProgressMap[purchase.programDocumentId];
            const totalLessons = maxymiaCourse.blocks.reduce(
              (sum, b) => sum + b.lessons.length,
              0
            );
            let progressPercent = 0;
            if (progress && totalLessons > 0) {
              progressPercent = Math.round(
                (progress.completedLessons.length / totalLessons) * 100
              );
            }
            userCourses.push({
              program: maxymiaCourseAsProgram(maxymiaCourse),
              purchased: true,
              purchasedAt: purchase.purchasedAt,
              progress: progress
                ? {
                    startedAt: progress.startedAt || new Date().toISOString(),
                    lastAccessedAt: progress.lastAccessedAt || new Date().toISOString(),
                    completedLessons: progress.completedLessons,
                    currentLessonId: progress.currentLessonId || undefined,
                    progressPercent,
                  }
                : undefined,
              accessType: 'purchased',
            });
          }
        }
      } else {
        const existingIndex = userCourses.findIndex(
          (c) =>
            c.program.id === purchase.programId ||
            c.program.documentId === purchase.programDocumentId
        );
        if (existingIndex !== -1) {
          userCourses[existingIndex].purchased = true;
          userCourses[existingIndex].purchasedAt = purchase.purchasedAt;
        }
      }
    }

    // Sort by last accessed (most recent first)
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
