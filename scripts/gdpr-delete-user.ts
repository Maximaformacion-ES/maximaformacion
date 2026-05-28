#!/usr/bin/env tsx
/**
 * GDPR right-to-erasure script.
 *
 * Removes a user from every system where we hold personal data:
 *
 *   Postgres (campus schema)
 *     subscriptions, enrollments, lesson_progress, course_activity,
 *     course_reviews, course_update_reads, certificates, exam_results,
 *     and finally the `users` row itself. Lead-capture rows are matched
 *     by email (they aren't keyed by clerkId).
 *
 *   Clerk
 *     The auth account.
 *
 *   Stripe
 *     The customer object. Invoices and charges remain attached to a
 *     "deleted customer" sentinel — Spanish tax law (LGT 2003, art. 70)
 *     requires invoice retention for 4 years, so Stripe correctly keeps
 *     the financial trail while removing the PII.
 *
 *   Klaviyo
 *     The marketing profile and all its event history.
 *
 * The script never deletes anything on its own. Default is dry-run; pass
 * --apply to execute. Each system can be skipped individually with
 * --no-db / --no-clerk / --no-stripe / --no-klaviyo, which is useful when
 * a previous run partially succeeded.
 *
 * Required env (process env or .env.production exported beforehand):
 *   DATABASE_URL                — Postgres
 *   CLERK_SECRET_KEY            — Clerk
 *   STRIPE_SECRET_KEY           — Stripe
 *   KLAVIYO_PRIVATE_API_KEY     — Klaviyo (skipped if missing)
 *
 * Usage:
 *   # Dry-run, full report — always do this first.
 *   npx tsx scripts/gdpr-delete-user.ts marcosrgfd2000@gmail.com
 *
 *   # Apply after you've checked the dry-run output.
 *   npx tsx scripts/gdpr-delete-user.ts marcosrgfd2000@gmail.com --apply
 *
 *   # Skip a system that already ran or isn't relevant.
 *   npx tsx scripts/gdpr-delete-user.ts <email> --apply --no-stripe
 *
 * To target production from your machine:
 *   vercel env pull .env.production --environment=production
 *   set -a; source .env.production; set +a
 *   npx tsx scripts/gdpr-delete-user.ts <email>
 */

import { eq } from 'drizzle-orm';
import { db } from '../lib/db/client';
import {
  users,
  subscriptions,
  enrollments,
  lessonProgress,
  courseActivity,
  courseReviews,
  courseUpdateReads,
  certificates,
  examResults,
  leadCaptureLog,
} from '../lib/db/schema';
import Stripe from 'stripe';

// ─── CLI parsing ──────────────────────────────────────────────────────────

interface Flags {
  email: string;
  apply: boolean;
  skipDb: boolean;
  skipClerk: boolean;
  skipStripe: boolean;
  skipKlaviyo: boolean;
}

function parseArgs(): Flags {
  const argv = process.argv.slice(2);
  const positional = argv.filter((a) => !a.startsWith('--'));
  const email = positional[0];
  if (!email || !email.includes('@')) {
    console.error(
      'Usage: tsx scripts/gdpr-delete-user.ts <email> ' +
        '[--apply] [--no-db] [--no-clerk] [--no-stripe] [--no-klaviyo]',
    );
    process.exit(1);
  }
  return {
    email: email.toLowerCase().trim(),
    apply: argv.includes('--apply'),
    skipDb: argv.includes('--no-db'),
    skipClerk: argv.includes('--no-clerk'),
    skipStripe: argv.includes('--no-stripe'),
    skipKlaviyo: argv.includes('--no-klaviyo'),
  };
}

// ─── Logging helpers ──────────────────────────────────────────────────────

const log = {
  section: (title: string) => console.log(`\n─── ${title} ───`),
  info: (msg: string) => console.log(`  ${msg}`),
  found: (msg: string) => console.log(`  ✓ ${msg}`),
  missing: (msg: string) => console.log(`  · ${msg}`),
  warn: (msg: string) => console.log(`  ⚠ ${msg}`),
  done: (msg: string) => console.log(`  ✔ ${msg}`),
  fail: (msg: string) => console.error(`  ✗ ${msg}`),
};

// ─── Clerk API (direct fetch — no extra dependency) ──────────────────────

interface ClerkUser {
  id: string;
  created_at: number;
  email_addresses: Array<{ email_address: string }>;
}

async function clerkFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const key = process.env.CLERK_SECRET_KEY;
  if (!key) throw new Error('CLERK_SECRET_KEY missing');
  const res = await fetch(`https://api.clerk.com/v1${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Clerk ${res.status} ${path}: ${(await res.text()).slice(0, 400)}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

async function lookupClerkUser(email: string): Promise<ClerkUser | null> {
  const list = await clerkFetch<ClerkUser[]>(
    `/users?email_address=${encodeURIComponent(email)}&limit=1`,
  );
  return list?.[0] ?? null;
}

async function deleteClerkUser(userId: string): Promise<void> {
  await clerkFetch(`/users/${userId}`, { method: 'DELETE' });
}

// ─── DB inventory ─────────────────────────────────────────────────────────

interface DbInventory {
  userRow: { id: string; clerkId: string; email: string | null } | null;
  counts: Record<string, number>;
  leadCaptureCount: number;
}

const CHILD_TABLES = [
  { name: 'subscriptions', table: subscriptions },
  { name: 'enrollments', table: enrollments },
  { name: 'lesson_progress', table: lessonProgress },
  { name: 'course_activity', table: courseActivity },
  { name: 'course_reviews', table: courseReviews },
  { name: 'course_update_reads', table: courseUpdateReads },
  { name: 'certificates', table: certificates },
  { name: 'exam_results', table: examResults },
] as const;

/**
 * Treat "relation does not exist" (Postgres 42P01) as "table absent in
 * this database" rather than fatal. Schema drift between environments
 * is common — a fresh dev DB may lack tables that prod has, and vice
 * versa. We log it and move on so the rest of the GDPR sweep still
 * runs.
 */
function isMissingRelation(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { code?: string; cause?: { code?: string } };
  return e.code === '42P01' || e.cause?.code === '42P01';
}

async function inventoryDb(clerkId: string | null, email: string): Promise<DbInventory> {
  let userRow: { id: string; clerkId: string; email: string | null } | null = null;
  try {
    const userRows = clerkId
      ? await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1)
      : email
        ? await db.select().from(users).where(eq(users.email, email)).limit(1)
        : [];
    const first = userRows[0];
    if (first) userRow = { id: first.id, clerkId: first.clerkId, email: first.email };
  } catch (e) {
    if (isMissingRelation(e)) log.warn('campus.users table missing — skipping user lookup');
    else throw e;
  }

  const effectiveClerkId = clerkId ?? userRow?.clerkId ?? null;

  const counts: Record<string, number> = {};
  for (const { name, table } of CHILD_TABLES) {
    if (!effectiveClerkId) {
      counts[name] = 0;
      continue;
    }
    try {
      const col = (table as unknown as { clerkId: typeof users.clerkId }).clerkId;
      const rows = await db
        .select({ id: (table as unknown as { id: typeof users.id }).id })
        .from(table as unknown as typeof users)
        .where(eq(col, effectiveClerkId));
      counts[name] = rows.length;
    } catch (e) {
      if (isMissingRelation(e)) {
        log.warn(`campus.${name} table missing — skipping`);
        counts[name] = -1; // sentinel: "table absent"
      } else {
        throw e;
      }
    }
  }

  let leadCaptureCount = 0;
  try {
    const leadRows = await db
      .select({ id: leadCaptureLog.id })
      .from(leadCaptureLog)
      .where(eq(leadCaptureLog.email, email));
    leadCaptureCount = leadRows.length;
  } catch (e) {
    if (isMissingRelation(e)) {
      log.warn('campus.lead_capture_log table missing — skipping');
      leadCaptureCount = -1;
    } else {
      throw e;
    }
  }

  return { userRow, counts, leadCaptureCount };
}

async function deleteDb(clerkId: string, email: string) {
  // Delete child rows first so the FK on `users.clerk_id` doesn't trip.
  // Each table has a `clerk_id` column we filter on. Tables that don't
  // exist in this environment (schema drift) are skipped.
  for (const { name, table } of CHILD_TABLES) {
    try {
      const col = (table as unknown as { clerkId: typeof users.clerkId }).clerkId;
      const deleted = await db
        .delete(table as unknown as typeof users)
        .where(eq(col, clerkId))
        .returning({ id: (table as unknown as { id: typeof users.id }).id });
      log.done(`db: deleted ${deleted.length} row(s) from ${name}`);
    } catch (e) {
      if (isMissingRelation(e)) log.warn(`db: ${name} table missing — skipping`);
      else throw e;
    }
  }
  try {
    const userDeleted = await db.delete(users).where(eq(users.clerkId, clerkId)).returning({ id: users.id });
    log.done(`db: deleted ${userDeleted.length} row(s) from users`);
  } catch (e) {
    if (isMissingRelation(e)) log.warn('db: users table missing — skipping');
    else throw e;
  }
  try {
    const leadDeleted = await db
      .delete(leadCaptureLog)
      .where(eq(leadCaptureLog.email, email))
      .returning({ id: leadCaptureLog.id });
    log.done(`db: deleted ${leadDeleted.length} row(s) from lead_capture_log`);
  } catch (e) {
    if (isMissingRelation(e)) log.warn('db: lead_capture_log table missing — skipping');
    else throw e;
  }
}

// ─── Klaviyo lookup + delete ──────────────────────────────────────────────

interface KlaviyoProfile {
  id: string;
  email: string;
}

async function lookupKlaviyoProfile(email: string): Promise<KlaviyoProfile | null> {
  const key = process.env.KLAVIYO_PRIVATE_API_KEY;
  const revision = process.env.KLAVIYO_REVISION || '2024-10-15';
  if (!key) return null;
  const url = `https://a.klaviyo.com/api/profiles/?filter=${encodeURIComponent(`equals(email,"${email}")`)}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.api+json',
      Revision: revision,
      Authorization: `Klaviyo-API-Key ${key}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Klaviyo lookup ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const body = (await res.json()) as { data?: Array<{ id: string; attributes: { email: string } }> };
  const first = body.data?.[0];
  return first ? { id: first.id, email: first.attributes.email } : null;
}

async function deleteKlaviyoProfile(profileId: string): Promise<void> {
  const key = process.env.KLAVIYO_PRIVATE_API_KEY;
  const revision = process.env.KLAVIYO_REVISION || '2024-10-15';
  if (!key) throw new Error('KLAVIYO_PRIVATE_API_KEY missing');
  // Klaviyo's "Delete Profile" is exposed via the data-privacy endpoint
  // which queues a full-erasure job (profile + events). See
  // https://developers.klaviyo.com/en/reference/request_profile_deletion
  const res = await fetch('https://a.klaviyo.com/api/data-privacy-deletion-jobs/', {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Revision: revision,
      Authorization: `Klaviyo-API-Key ${key}`,
    },
    body: JSON.stringify({
      data: {
        type: 'data-privacy-deletion-job',
        attributes: { profile: { data: { type: 'profile', id: profileId } } },
      },
    }),
  });
  if (!res.ok && res.status !== 202) {
    throw new Error(`Klaviyo delete ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}

// ─── Stripe lookup + delete ───────────────────────────────────────────────

async function listStripeCustomers(stripe: Stripe, email: string): Promise<Stripe.Customer[]> {
  const list = await stripe.customers.list({ email, limit: 100 });
  return list.data;
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const flags = parseArgs();
  const mode = flags.apply ? 'APPLY' : 'DRY-RUN';

  console.log(`\nGDPR delete user — ${mode}`);
  console.log(`target email: ${flags.email}`);
  if (!flags.apply) {
    console.log('mode: dry-run (no writes). Re-run with --apply to execute.');
  } else {
    console.log('mode: APPLY — destructive writes will happen.');
  }

  // Initialise Stripe lazily so dry-run with --no-stripe doesn't even
  // require STRIPE_SECRET_KEY to be set.
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const stripe = !flags.skipStripe && stripeSecret
    ? new Stripe(stripeSecret, { apiVersion: '2025-12-15.clover' as Stripe.LatestApiVersion })
    : null;
  const clerkEnabled = !flags.skipClerk && !!process.env.CLERK_SECRET_KEY;

  // ─── 1. Clerk lookup ────────────────────────────────────────────────
  log.section('Clerk');
  let clerkUserId: string | null = null;
  if (!clerkEnabled) {
    log.info('skipped (--no-clerk or CLERK_SECRET_KEY missing)');
  } else {
    const user = await lookupClerkUser(flags.email);
    if (!user) {
      log.missing(`no Clerk user with email ${flags.email}`);
    } else {
      clerkUserId = user.id;
      log.found(`user.id=${user.id}  createdAt=${new Date(user.created_at).toISOString()}`);
    }
  }

  // ─── 2. DB inventory ────────────────────────────────────────────────
  log.section('Postgres (campus)');
  if (flags.skipDb) {
    log.info('skipped (--no-db)');
  } else if (!process.env.DATABASE_URL) {
    log.warn('DATABASE_URL not set — skipping DB');
  } else {
    const inv = await inventoryDb(clerkUserId, flags.email);
    if (inv.userRow) {
      log.found(`users.clerk_id=${inv.userRow.clerkId}  email=${inv.userRow.email ?? '(null)'}`);
    } else {
      log.missing('no row in users');
    }
    for (const [name, count] of Object.entries(inv.counts)) {
      if (count === -1) continue; // already logged via log.warn during inventory
      if (count > 0) log.found(`${name}: ${count} row(s)`);
      else log.missing(`${name}: 0`);
    }
    if (inv.leadCaptureCount === -1) {
      // already logged via log.warn during inventory
    } else if (inv.leadCaptureCount > 0) {
      log.found(`lead_capture_log: ${inv.leadCaptureCount} row(s) by email`);
    } else {
      log.missing('lead_capture_log: 0');
    }
  }

  // ─── 3. Stripe lookup ───────────────────────────────────────────────
  log.section('Stripe');
  let stripeCustomers: Stripe.Customer[] = [];
  if (!stripe) {
    log.info('skipped (--no-stripe or STRIPE_SECRET_KEY missing)');
  } else {
    stripeCustomers = await listStripeCustomers(stripe, flags.email);
    if (stripeCustomers.length === 0) {
      log.missing(`no Stripe customer with email ${flags.email}`);
    } else {
      for (const c of stripeCustomers) {
        log.found(`customer ${c.id}  created=${new Date((c.created ?? 0) * 1000).toISOString()}`);
      }
    }
  }

  // ─── 4. Klaviyo lookup ──────────────────────────────────────────────
  log.section('Klaviyo');
  let klaviyoProfile: KlaviyoProfile | null = null;
  if (flags.skipKlaviyo) {
    log.info('skipped (--no-klaviyo)');
  } else if (!process.env.KLAVIYO_PRIVATE_API_KEY) {
    log.warn('KLAVIYO_PRIVATE_API_KEY not set — skipping Klaviyo');
  } else {
    klaviyoProfile = await lookupKlaviyoProfile(flags.email);
    if (klaviyoProfile) log.found(`profile ${klaviyoProfile.id}`);
    else log.missing(`no Klaviyo profile with email ${flags.email}`);
  }

  // ─── 5. Apply ────────────────────────────────────────────────────────
  if (!flags.apply) {
    console.log('\nDry-run complete. Re-run with --apply to delete the above.\n');
    process.exit(0);
  }

  console.log('\n─── Applying deletions ───');

  // DB first so the FK to users.clerk_id is cleared before Clerk goes away
  if (!flags.skipDb && process.env.DATABASE_URL) {
    if (clerkUserId) {
      await deleteDb(clerkUserId, flags.email);
    } else {
      // Walk through DB by email in case Clerk lost the user already
      const inv = await inventoryDb(null, flags.email);
      if (inv.userRow) {
        await deleteDb(inv.userRow.clerkId, flags.email);
      } else if (inv.leadCaptureCount > 0) {
        const leadDeleted = await db
          .delete(leadCaptureLog)
          .where(eq(leadCaptureLog.email, flags.email))
          .returning({ id: leadCaptureLog.id });
        log.done(`db: deleted ${leadDeleted.length} row(s) from lead_capture_log (no user row)`);
      } else {
        log.info('db: nothing to delete');
      }
    }
  }

  // Stripe
  if (stripe && stripeCustomers.length > 0) {
    for (const c of stripeCustomers) {
      try {
        await stripe.customers.del(c.id);
        log.done(`stripe: deleted customer ${c.id}`);
      } catch (e) {
        log.fail(`stripe: failed to delete ${c.id}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }

  // Klaviyo (data-privacy deletion job — async on their side)
  if (klaviyoProfile) {
    try {
      await deleteKlaviyoProfile(klaviyoProfile.id);
      log.done(`klaviyo: queued deletion job for profile ${klaviyoProfile.id}`);
    } catch (e) {
      log.fail(`klaviyo: failed to delete ${klaviyoProfile.id}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // Clerk last so a partial failure above still leaves the user able to
  // log in and ask us what happened. After this point they can't.
  if (clerkEnabled && clerkUserId) {
    try {
      await deleteClerkUser(clerkUserId);
      log.done(`clerk: deleted user ${clerkUserId}`);
    } catch (e) {
      log.fail(`clerk: failed to delete ${clerkUserId}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  console.log('\nApply complete.\n');
}

main().catch((err) => {
  console.error('\n✗ Fatal error:', err);
  process.exit(1);
});
