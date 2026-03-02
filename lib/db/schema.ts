import { pgSchema, uuid, text, timestamp, boolean, integer, decimal, jsonb, uniqueIndex, index } from 'drizzle-orm/pg-core';

export const campusSchema = pgSchema('campus');

const tz = { withTimezone: true, mode: 'date' as const };

// ─── Users ──────────────────────────────────────────────────────────────────
export const users = campusSchema.table('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email'),
  plan: text('plan').default('free').notNull(),
  createdAt: timestamp('created_at', tz).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', tz).defaultNow().notNull(),
});

// ─── Subscriptions ──────────────────────────────────────────────────────────
export const subscriptions = campusSchema.table('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().references(() => users.clerkId),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  status: text('status').notNull().default('active'),
  plan: text('plan').notNull().default('pro'),
  startedAt: timestamp('started_at', tz).defaultNow(),
  canceledAt: timestamp('canceled_at', tz),
  currentPeriodEnd: timestamp('current_period_end', tz),
  lastPaymentAt: timestamp('last_payment_at', tz),
  paymentFailed: boolean('payment_failed').default(false),
}, (table) => [
  index('idx_subscriptions_stripe_customer').on(table.stripeCustomerId),
  index('idx_subscriptions_clerk_id').on(table.clerkId),
]);

// ─── Enrollments ────────────────────────────────────────────────────────────
export const enrollments = campusSchema.table('enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().references(() => users.clerkId),
  programId: integer('program_id'),
  programDocumentId: text('program_document_id').notNull(),
  accessType: text('access_type').notNull().default('purchased'),
  purchasedAt: timestamp('purchased_at', tz).defaultNow(),
  stripePaymentId: text('stripe_payment_id'),
  price: decimal('price', { precision: 10, scale: 2 }),
  title: text('title'),
}, (table) => [
  uniqueIndex('idx_enrollments_unique').on(table.clerkId, table.programDocumentId),
]);

// ─── Lesson Progress ────────────────────────────────────────────────────────
export const lessonProgress = campusSchema.table('lesson_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().references(() => users.clerkId),
  programDocumentId: text('program_document_id').notNull(),
  lessonDocumentId: text('lesson_document_id').notNull(),
  completedAt: timestamp('completed_at', tz).defaultNow().notNull(),
  watchTimeSeconds: integer('watch_time_seconds'),
}, (table) => [
  uniqueIndex('idx_lesson_progress_unique').on(table.clerkId, table.lessonDocumentId),
  index('idx_lesson_progress_course').on(table.clerkId, table.programDocumentId),
]);

// ─── Course Activity ────────────────────────────────────────────────────────
export const courseActivity = campusSchema.table('course_activity', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().references(() => users.clerkId),
  programDocumentId: text('program_document_id').notNull(),
  currentLessonId: text('current_lesson_id'),
  startedAt: timestamp('started_at', tz).defaultNow().notNull(),
  lastAccessedAt: timestamp('last_accessed_at', tz).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idx_course_activity_unique').on(table.clerkId, table.programDocumentId),
]);

// ─── Course Reviews (Maxymia) ──────────────────────────────────────────
export const courseReviews = campusSchema.table('course_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().references(() => users.clerkId),
  courseId: text('course_id').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at', tz).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', tz).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idx_course_reviews_unique').on(table.clerkId, table.courseId),
  index('idx_course_reviews_course').on(table.courseId),
]);

// ─── Exam Results (Maxymia) ────────────────────────────────────────────
export const examResults = campusSchema.table('exam_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().references(() => users.clerkId),
  courseId: text('course_id').notNull(),
  blockId: text('block_id').notNull(),
  examId: text('exam_id').notNull(),
  score: integer('score').notNull(),
  passed: boolean('passed').notNull(),
  answers: jsonb('answers'),
  completedAt: timestamp('completed_at', tz).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idx_exam_results_unique').on(table.clerkId, table.examId),
  index('idx_exam_results_course').on(table.clerkId, table.courseId),
]);
