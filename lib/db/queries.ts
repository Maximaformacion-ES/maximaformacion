import { eq, and, sql, avg, count, isNull, desc, inArray } from 'drizzle-orm';
import { db } from './client';
import { users, subscriptions, enrollments, lessonProgress, courseActivity, courseReviews, courseUpdates, courseUpdateReads, courseSnapshots } from './schema';

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
    // Going Pro (trial or subscription) latches hasBeenPro to true forever;
    // downgrades to 'free' never reset it. This is the single chokepoint the
    // webhook uses for every plan→pro transition.
    .set({ plan, updatedAt: new Date(), ...(plan === 'pro' ? { hasBeenPro: true } : {}) })
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
  extra?: {
    canceledAt?: Date;
    lastPaymentAt?: Date;
    paymentFailed?: boolean;
    // Pass a Date to start the grace period; null to clear it (e.g. when
    // a later payment succeeds).
    paymentFailedAt?: Date | null;
  }
) {
  await db
    .update(subscriptions)
    .set({
      status,
      plan,
      ...(extra?.canceledAt && { canceledAt: extra.canceledAt }),
      ...(extra?.lastPaymentAt && { lastPaymentAt: extra.lastPaymentAt }),
      ...(extra?.paymentFailed !== undefined && { paymentFailed: extra.paymentFailed }),
      ...(extra?.paymentFailedAt !== undefined && { paymentFailedAt: extra.paymentFailedAt }),
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
    progressPercent?: number;
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

  // Percent de progreso por UNIDAD, consistente en todas las superficies (perfil
  // "Mis Cursos", campus, "Continuar"…). Dos capas:
  //   1) Base: course_snapshots (DB, siempre disponible) — red de seguridad.
  //   2) Preferido: recalcular con la ESTRUCTURA VIVA del curso (Strapi), que es
  //      exactamente lo que hace el campus con getCourseProgressStats. La viva no
  //      se desfasa tras reimportar (los snapshots sí), así que gana cuando está.
  // Todo capado a 100 (el bug del 267% venía de dividir unidades ÷ lecciones).
  const docIds = Object.keys(progressMap);
  if (docIds.length > 0) {
    // (1) Base snapshot.
    const snapshots = await db
      .select({
        programDocumentId: courseSnapshots.programDocumentId,
        versions: courseSnapshots.versions,
      })
      .from(courseSnapshots)
      .where(inArray(courseSnapshots.programDocumentId, docIds));

    for (const snap of snapshots) {
      const entry = progressMap[snap.programDocumentId];
      if (!entry) continue;
      const unitKeys = Object.keys((snap.versions as Record<string, unknown>) ?? {});
      if (unitKeys.length === 0) continue;
      const unitSet = new Set(unitKeys);
      const completed = entry.completedLessons.filter((u) => unitSet.has(u)).length;
      entry.progressPercent = Math.min(100, Math.round((completed / unitKeys.length) * 100));
    }

    // (2) Recalcular con la estructura viva (misma fórmula que el campus). Si
    //     Strapi falla, se queda el % del snapshot de (1).
    try {
      const { getMaxymiaCoursesFromStrapi } = await import('@/lib/strapi/maxymia-queries');
      const { getCourseProgressStats } = await import('@/app/maxymia/data/queries');
      const byId = new Map(
        (await getMaxymiaCoursesFromStrapi()).map((c) => [c.id, c])
      );
      for (const docId of docIds) {
        const course = byId.get(docId);
        if (!course) continue; // no es curso Maxymia (o sin publicar) → deja el snapshot
        progressMap[docId].progressPercent = getCourseProgressStats(
          course,
          progressMap[docId].completedLessons
        ).percent;
      }
    } catch {
      // Strapi caído → nos quedamos con el % del snapshot (capa 1).
    }
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
