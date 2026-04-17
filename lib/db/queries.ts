import { eq, and, sql, avg, count, isNull, desc, inArray } from 'drizzle-orm';
import { db } from './client';
import { users, subscriptions, enrollments, lessonProgress, courseActivity, courseReviews, courseUpdates, courseUpdateReads } from './schema';

// ─── Users ──────────────────────────────────────────────────────────────────

export async function upsertUser(clerkId: string, email?: string) {
  const [user] = await db
    .insert(users)
    .values({ clerkId, email })
    .onConflictDoUpdate({
      target: users.clerkId,
      set: {
        email: email ?? sql`${users.email}`,
        updatedAt: new Date(),
      },
    })
    .returning();
  return user;
}

export async function getUserByClerkId(clerkId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  return user ?? null;
}

export async function updateUserPlan(clerkId: string, plan: string) {
  await db
    .update(users)
    .set({ plan, updatedAt: new Date() })
    .where(eq(users.clerkId, clerkId));
}

// ─── Subscriptions ──────────────────────────────────────────────────────────

export async function upsertSubscription(data: {
  clerkId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status?: string;
  plan?: string;
  startedAt?: Date;
  currentPeriodEnd?: Date;
}) {
  const [sub] = await db
    .insert(subscriptions)
    .values({
      clerkId: data.clerkId,
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      status: data.status || 'active',
      plan: data.plan || 'pro',
      startedAt: data.startedAt || new Date(),
      currentPeriodEnd: data.currentPeriodEnd,
    })
    .onConflictDoUpdate({
      target: subscriptions.stripeSubscriptionId,
      set: {
        stripeCustomerId: data.stripeCustomerId ?? sql`${subscriptions.stripeCustomerId}`,
        status: data.status ?? sql`${subscriptions.status}`,
        plan: data.plan ?? sql`${subscriptions.plan}`,
        currentPeriodEnd: data.currentPeriodEnd ?? sql`${subscriptions.currentPeriodEnd}`,
      },
    })
    .returning();
  return sub;
}

export async function getSubscriptionByClerkId(clerkId: string) {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.clerkId, clerkId))
    .limit(1);
  return sub ?? null;
}

export async function getSubscriptionByStripeCustomer(stripeCustomerId: string) {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeCustomerId, stripeCustomerId))
    .limit(1);
  return sub ?? null;
}

export async function updateSubscriptionStatus(
  clerkId: string,
  status: string,
  plan: string,
  extra?: { canceledAt?: Date; lastPaymentAt?: Date; paymentFailed?: boolean }
) {
  await db
    .update(subscriptions)
    .set({
      status,
      plan,
      ...(extra?.canceledAt && { canceledAt: extra.canceledAt }),
      ...(extra?.lastPaymentAt && { lastPaymentAt: extra.lastPaymentAt }),
      ...(extra?.paymentFailed !== undefined && { paymentFailed: extra.paymentFailed }),
    })
    .where(eq(subscriptions.clerkId, clerkId));
}

// ─── Enrollments ────────────────────────────────────────────────────────────

export async function createEnrollment(data: {
  clerkId: string;
  programId?: number;
  programDocumentId: string;
  accessType?: string;
  stripePaymentId?: string;
  price?: number;
  title?: string;
}) {
  const [enrollment] = await db
    .insert(enrollments)
    .values({
      clerkId: data.clerkId,
      programId: data.programId,
      programDocumentId: data.programDocumentId,
      accessType: data.accessType || 'purchased',
      stripePaymentId: data.stripePaymentId,
      price: data.price?.toString(),
      title: data.title,
    })
    .onConflictDoNothing()
    .returning();
  return enrollment ?? null;
}

export async function getUserEnrollments(clerkId: string) {
  return db
    .select()
    .from(enrollments)
    .where(eq(enrollments.clerkId, clerkId));
}

export async function hasEnrollment(clerkId: string, programDocumentId: string) {
  const [result] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.clerkId, clerkId),
        eq(enrollments.programDocumentId, programDocumentId)
      )
    )
    .limit(1);
  return !!result;
}

// ─── Lesson Progress ────────────────────────────────────────────────────────

export async function markLessonComplete(
  clerkId: string,
  programDocumentId: string,
  lessonDocumentId: string,
  watchTimeSeconds?: number
) {
  await db
    .insert(lessonProgress)
    .values({
      clerkId,
      programDocumentId,
      lessonDocumentId,
      completedAt: new Date(),
      watchTimeSeconds,
    })
    .onConflictDoNothing();
}

export async function getLessonProgress(clerkId: string, programDocumentId: string) {
  return db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.clerkId, clerkId),
        eq(lessonProgress.programDocumentId, programDocumentId)
      )
    );
}

export async function getAllCourseProgress(clerkId: string) {
  const lessons = await db
    .select()
    .from(lessonProgress)
    .where(eq(lessonProgress.clerkId, clerkId));

  const activities = await db
    .select()
    .from(courseActivity)
    .where(eq(courseActivity.clerkId, clerkId));

  // Group by programDocumentId
  const progressMap: Record<string, {
    completedLessons: string[];
    currentLessonId: string | null;
    lastAccessedAt: string | null;
    startedAt: string | null;
  }> = {};

  for (const lesson of lessons) {
    if (!progressMap[lesson.programDocumentId]) {
      progressMap[lesson.programDocumentId] = {
        completedLessons: [],
        currentLessonId: null,
        lastAccessedAt: null,
        startedAt: null,
      };
    }
    progressMap[lesson.programDocumentId].completedLessons.push(lesson.lessonDocumentId);
  }

  for (const activity of activities) {
    if (!progressMap[activity.programDocumentId]) {
      progressMap[activity.programDocumentId] = {
        completedLessons: [],
        currentLessonId: null,
        lastAccessedAt: null,
        startedAt: null,
      };
    }
    progressMap[activity.programDocumentId].currentLessonId = activity.currentLessonId;
    progressMap[activity.programDocumentId].lastAccessedAt = activity.lastAccessedAt.toISOString();
    progressMap[activity.programDocumentId].startedAt = activity.startedAt.toISOString();
  }

  return progressMap;
}

// ─── Course Activity ────────────────────────────────────────────────────────

export async function upsertCourseActivity(
  clerkId: string,
  programDocumentId: string,
  currentLessonId: string
) {
  await db
    .insert(courseActivity)
    .values({
      clerkId,
      programDocumentId,
      currentLessonId,
      startedAt: new Date(),
      lastAccessedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [courseActivity.clerkId, courseActivity.programDocumentId],
      set: {
        currentLessonId,
        lastAccessedAt: new Date(),
      },
    });
}

export async function getCourseActivity(clerkId: string, programDocumentId?: string) {
  if (programDocumentId) {
    const [activity] = await db
      .select()
      .from(courseActivity)
      .where(
        and(
          eq(courseActivity.clerkId, clerkId),
          eq(courseActivity.programDocumentId, programDocumentId)
        )
      )
      .limit(1);
    return activity ?? null;
  }
  return db
    .select()
    .from(courseActivity)
    .where(eq(courseActivity.clerkId, clerkId));
}

// ─── Course Reviews (Maxymia) ──────────────────────────────────────────

export async function upsertCourseReview(
  clerkId: string,
  courseId: string,
  rating: number,
  comment?: string
) {
  const [review] = await db
    .insert(courseReviews)
    .values({ clerkId, courseId, rating, comment })
    .onConflictDoUpdate({
      target: [courseReviews.clerkId, courseReviews.courseId],
      set: {
        rating,
        comment: comment ?? sql`${courseReviews.comment}`,
        updatedAt: new Date(),
      },
    })
    .returning();
  return review;
}

export async function deleteCourseReview(clerkId: string, courseId: string) {
  const [deleted] = await db
    .delete(courseReviews)
    .where(
      and(
        eq(courseReviews.clerkId, clerkId),
        eq(courseReviews.courseId, courseId)
      )
    )
    .returning();
  return deleted ?? null;
}

export async function getCourseReview(clerkId: string, courseId: string) {
  const [review] = await db
    .select()
    .from(courseReviews)
    .where(
      and(
        eq(courseReviews.clerkId, clerkId),
        eq(courseReviews.courseId, courseId)
      )
    )
    .limit(1);
  return review ?? null;
}

export async function getCourseReviews(courseId: string) {
  return db
    .select()
    .from(courseReviews)
    .where(eq(courseReviews.courseId, courseId));
}

export async function getCourseRatingStats(courseId: string) {
  const [stats] = await db
    .select({
      averageRating: avg(courseReviews.rating),
      reviewCount: count(),
    })
    .from(courseReviews)
    .where(eq(courseReviews.courseId, courseId));
  return {
    averageRating: stats?.averageRating ? parseFloat(stats.averageRating) : 0,
    reviewCount: stats?.reviewCount ?? 0,
  };
}

export async function getAllCourseRatings() {
  return db
    .select({
      courseId: courseReviews.courseId,
      averageRating: avg(courseReviews.rating),
      reviewCount: count(),
    })
    .from(courseReviews)
    .groupBy(courseReviews.courseId);
}

// ─── Course Updates ────────────────────────────────────────────────────

export async function createCourseUpdate(data: {
  programDocumentId: string;
  programTitle?: string;
  moduleDocumentId?: string;
  lessonDocumentId?: string;
  changeType: string;
  title: string;
  description?: string;
}) {
  const [update] = await db
    .insert(courseUpdates)
    .values({
      programDocumentId: data.programDocumentId,
      programTitle: data.programTitle,
      moduleDocumentId: data.moduleDocumentId,
      lessonDocumentId: data.lessonDocumentId,
      changeType: data.changeType,
      title: data.title,
      description: data.description,
    })
    .returning();
  return update;
}

export async function getCourseUpdatesForProgram(programDocumentId: string) {
  return db
    .select()
    .from(courseUpdates)
    .where(eq(courseUpdates.programDocumentId, programDocumentId))
    .orderBy(desc(courseUpdates.createdAt));
}

export async function getUnreadUpdatesForUser(clerkId: string, programDocumentIds: string[]) {
  if (programDocumentIds.length === 0) return [];

  return db
    .select({
      id: courseUpdates.id,
      programDocumentId: courseUpdates.programDocumentId,
      programTitle: courseUpdates.programTitle,
      moduleDocumentId: courseUpdates.moduleDocumentId,
      lessonDocumentId: courseUpdates.lessonDocumentId,
      changeType: courseUpdates.changeType,
      title: courseUpdates.title,
      description: courseUpdates.description,
      createdAt: courseUpdates.createdAt,
    })
    .from(courseUpdates)
    .leftJoin(
      courseUpdateReads,
      and(
        eq(courseUpdateReads.courseUpdateId, courseUpdates.id),
        eq(courseUpdateReads.clerkId, clerkId)
      )
    )
    .where(
      and(
        inArray(courseUpdates.programDocumentId, programDocumentIds),
        isNull(courseUpdateReads.id)
      )
    )
    .orderBy(desc(courseUpdates.createdAt));
}

export async function markUpdateAsRead(clerkId: string, courseUpdateId: string) {
  await db
    .insert(courseUpdateReads)
    .values({ clerkId, courseUpdateId })
    .onConflictDoNothing();
}

export async function markAllUpdatesAsRead(clerkId: string, programDocumentId: string) {
  const unreadUpdates = await getUnreadUpdatesForUser(clerkId, [programDocumentId]);
  if (unreadUpdates.length === 0) return;

  await db
    .insert(courseUpdateReads)
    .values(unreadUpdates.map((u) => ({ clerkId, courseUpdateId: u.id })))
    .onConflictDoNothing();
}

export async function getEnrolledUsersWithEmail(programDocumentId: string) {
  return db
    .select({
      clerkId: enrollments.clerkId,
      email: users.email,
    })
    .from(enrollments)
    .innerJoin(users, eq(users.clerkId, enrollments.clerkId))
    .where(eq(enrollments.programDocumentId, programDocumentId));
}
