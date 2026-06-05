import { pgSchema, uuid, text, timestamp, boolean, integer, decimal, jsonb, uniqueIndex, index } from 'drizzle-orm/pg-core';

export const campusSchema = pgSchema('campus');

const tz = { withTimezone: true, mode: 'date' as const };

// ─── Users ──────────────────────────────────────────────────────────────────
export const users = campusSchema.table('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email'),
  plan: text('plan').default('free').notNull(),
  // Durable "has the user ever been Pro (trial or subscription)?" flag. Set
  // true the first time they go Pro and never reset. Used to decide whether to
  // offer the 1€ trial — replaces the old heuristic (any subscription row),
  // which wrongly tripped on the placeholder rows created on single-course
  // purchases and hid the promo from users who were never Pro.
  hasBeenPro: boolean('has_been_pro').default(false).notNull(),
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
  // Set when invoice.payment_failed fires; cleared on payment_succeeded.
  // Used to enforce a 3-day grace period before downgrading plan to 'free'.
  paymentFailedAt: timestamp('payment_failed_at', tz),
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

// ─── Course Updates ────────────────────────────────────────────────────
export const courseUpdates = campusSchema.table('course_updates', {
  id: uuid('id').primaryKey().defaultRandom(),
  programDocumentId: text('program_document_id').notNull(),
  programTitle: text('program_title'),
  moduleDocumentId: text('module_document_id'),
  lessonDocumentId: text('lesson_document_id'),
  changeType: text('change_type').notNull(), // 'new_lesson' | 'updated_lesson' | 'new_module' | 'updated_content' | 'new_resource'
  title: text('title').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', tz).defaultNow().notNull(),
}, (table) => [
  index('idx_course_updates_program').on(table.programDocumentId),
]);

// ─── Course Update Reads ───────────────────────────────────────────────
export const courseUpdateReads = campusSchema.table('course_update_reads', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().references(() => users.clerkId),
  courseUpdateId: uuid('course_update_id').notNull().references(() => courseUpdates.id),
  readAt: timestamp('read_at', tz).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idx_course_update_reads_unique').on(table.clerkId, table.courseUpdateId),
]);

// ─── Lead Capture Log ──────────────────────────────────────────────────
// Resilience layer: every lead capture (resource download form, newsletter, …)
// gets a row here BEFORE Klaviyo is contacted. If Klaviyo sync fails we still
// have the lead and can resync via cron. Klaviyo is the marketing source of
// truth — this is just an append-only safety net.
export const leadCaptureLog = campusSchema.table('lead_capture_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  source: text('source').notNull(), // 'resource_download' | 'newsletter' | …
  email: text('email').notNull(),
  name: text('name'),
  resourceSlug: text('resource_slug'),
  resourceTitle: text('resource_title'),
  consent: boolean('consent').notNull(),
  utmSource: text('utm_source'),
  referer: text('referer'),
  ipPrefix: text('ip_prefix'), // first 3 octets of IPv4 (RGPD)
  userAgent: text('user_agent'),
  payload: jsonb('payload'), // raw request body for debugging/replay
  klaviyoSyncedAt: timestamp('klaviyo_synced_at', tz),
  klaviyoError: text('klaviyo_error'),
  createdAt: timestamp('created_at', tz).defaultNow().notNull(),
}, (table) => [
  index('idx_lead_capture_email').on(table.email),
  index('idx_lead_capture_unsynced').on(table.klaviyoSyncedAt),
  index('idx_lead_capture_source').on(table.source),
]);

// ─── Certificates ──────────────────────────────────────────────────────
// Public verification: /verificar/{id} returns this row (no auth).
// One certificate per (clerkId, courseId).
export const certificates = campusSchema.table('certificates', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().references(() => users.clerkId),
  courseId: text('course_id').notNull(),
  courseTitle: text('course_title').notNull(),
  studentName: text('student_name').notNull(),
  instructor: text('instructor'),
  issuedAt: timestamp('issued_at', tz).defaultNow().notNull(),
  completedAt: timestamp('completed_at', tz).notNull(),
  revokedAt: timestamp('revoked_at', tz),
}, (table) => [
  uniqueIndex('idx_certificates_unique').on(table.clerkId, table.courseId),
  index('idx_certificates_course').on(table.courseId),
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
