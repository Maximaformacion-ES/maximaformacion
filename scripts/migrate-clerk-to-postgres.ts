/**
 * One-time migration script: Clerk publicMetadata → PostgreSQL campus schema
 *
 * Usage:
 *   1. Ensure DATABASE_URL and CLERK_SECRET_KEY env vars are set
 *   2. Run: pnpm tsx scripts/migrate-clerk-to-postgres.ts
 *
 * This script reads all Clerk users and migrates their transactional data
 * (plan, subscriptions, purchased courses, lesson progress) from
 * publicMetadata into the campus PostgreSQL schema.
 *
 * Safe to run multiple times — all inserts use ON CONFLICT DO NOTHING.
 */

import { createClerkClient } from '@clerk/backend';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../lib/db/schema';
import {
  upsertUser,
  upsertSubscription,
  createEnrollment,
  markLessonComplete,
  upsertCourseActivity,
} from '../lib/db/queries';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://strapi:strapi_password@localhost:5432/strapi';

if (!CLERK_SECRET_KEY) {
  console.error('CLERK_SECRET_KEY is required');
  process.exit(1);
}

const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });

interface PurchasedCourse {
  programId: number;
  documentId: string;
  purchasedAt: string;
  stripePaymentId: string;
  price: number;
  title?: string;
}

interface CourseProgress {
  startedAt: string;
  lastAccessedAt: string;
  completedLessons: string[];
  currentLessonId?: string;
  progressPercent: number;
}

async function migrate() {
  console.log('Starting Clerk → PostgreSQL migration...\n');

  let offset = 0;
  const limit = 100;
  let totalUsers = 0;
  let migratedUsers = 0;
  let errors = 0;

  while (true) {
    const response = await clerk.users.getUserList({ limit, offset });
    const users = response.data;

    if (users.length === 0) break;

    for (const user of users) {
      totalUsers++;
      const meta = user.publicMetadata as Record<string, unknown>;

      if (!meta || Object.keys(meta).length === 0) {
        continue;
      }

      try {
        const email = user.emailAddresses[0]?.emailAddress;
        const plan = (meta.plan as string) || 'free';

        // 1. Upsert user
        await upsertUser(user.id, email);
        if (plan !== 'free') {
          const { updateUserPlan } = await import('../lib/db/queries');
          await updateUserPlan(user.id, plan);
        }

        // 2. Upsert subscription if present
        const stripeCustomerId = meta.stripeCustomerId as string | undefined;
        const stripeSubscriptionId = meta.stripeSubscriptionId as string | undefined;
        const subscribedAt = meta.subscribedAt as string | undefined;
        const subscriptionStatus = meta.subscriptionStatus as string | undefined;

        if (stripeCustomerId) {
          await upsertSubscription({
            clerkId: user.id,
            stripeCustomerId,
            stripeSubscriptionId: stripeSubscriptionId || `cust_${stripeCustomerId}`,
            status: subscriptionStatus || (plan === 'pro' ? 'active' : 'none'),
            plan,
            startedAt: subscribedAt ? new Date(subscribedAt) : undefined,
          });
        }

        // 3. Migrate purchased courses
        const purchasedCourses = (meta.purchasedCourses as PurchasedCourse[]) || [];
        for (const course of purchasedCourses) {
          await createEnrollment({
            clerkId: user.id,
            programId: course.programId,
            programDocumentId: course.documentId,
            accessType: 'purchased',
            stripePaymentId: course.stripePaymentId,
            price: course.price,
            title: course.title,
          });
        }

        // 4. Migrate course progress
        const courseProgress = (meta.courseProgress as Record<string, CourseProgress>) || {};
        for (const [programDocId, progress] of Object.entries(courseProgress)) {
          // Migrate completed lessons
          for (const lessonDocId of progress.completedLessons) {
            await markLessonComplete(user.id, programDocId, lessonDocId);
          }

          // Migrate course activity
          if (progress.currentLessonId || progress.startedAt) {
            await upsertCourseActivity(
              user.id,
              programDocId,
              progress.currentLessonId || progress.completedLessons[0] || ''
            );
          }
        }

        migratedUsers++;
        console.log(`  [${migratedUsers}] ${user.id} (${email || 'no email'}) — plan=${plan}, courses=${purchasedCourses.length}, progress=${Object.keys(courseProgress).length}`);
      } catch (err) {
        errors++;
        console.error(`  ERROR migrating ${user.id}:`, err);
      }
    }

    offset += limit;

    // Safety: Clerk paginates, stop if we got fewer than limit
    if (users.length < limit) break;
  }

  console.log(`\nMigration complete.`);
  console.log(`  Total users scanned: ${totalUsers}`);
  console.log(`  Users migrated: ${migratedUsers}`);
  console.log(`  Errors: ${errors}`);

  process.exit(errors > 0 ? 1 : 0);
}

migrate().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
