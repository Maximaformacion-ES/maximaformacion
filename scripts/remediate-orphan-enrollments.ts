/**
 * One-time remediation: fix orphaned campus rows after a Strapi catalogue
 * re-import changed every course `documentId`.
 *
 * An orphaned row's `program_document_id` matches no current course. Most are
 * NOT garbage — they are real purchases of courses that still exist under a
 * new id. Deleting them blindly would revoke paid access. This script instead:
 *
 *   1. RE-LINK enrollments whose stored `title` matches a current course —
 *      update `program_document_id` (+ `program_id`) to the new value. If the
 *      same user already has an enrollment for that course, the orphan is a
 *      duplicate and gets deleted instead (the unique index forbids two).
 *   2. DELETE enrollments whose title matches no current course (course truly
 *      gone or test data).
 *   3. DELETE orphaned `lesson_progress` / `course_activity` rows — their
 *      lesson ids changed too, so that progress is unrecoverable dead weight.
 *
 * Usage:
 *   export DATABASE_URL=... STRAPI_URL=... STRAPI_API_TOKEN=...
 *   npx tsx scripts/remediate-orphan-enrollments.ts            # dry run
 *   npx tsx scripts/remediate-orphan-enrollments.ts --apply    # write
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, inArray } from 'drizzle-orm';
import * as schema from '../lib/db/schema';
import { enrollments, lessonProgress, courseActivity } from '../lib/db/schema';

const APPLY = process.argv.includes('--apply');

const DATABASE_URL = process.env.DATABASE_URL;
const STRAPI_URL = process.env.STRAPI_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!DATABASE_URL || !STRAPI_URL || !STRAPI_API_TOKEN) {
  console.error('✗ DATABASE_URL, STRAPI_URL and STRAPI_API_TOKEN must be set.');
  process.exit(1);
}

interface Course {
  id: number;
  documentId: string;
  title: string;
}

/** `status=draft` returns every non-deleted entry (each one has a draft version). */
async function fetchCourses(collection: string, titleField: string): Promise<Course[]> {
  const out: Course[] = [];
  let page = 1;
  for (;;) {
    const url =
      `${STRAPI_URL}/api/${collection}` +
      `?status=draft&fields[0]=documentId&fields[1]=${titleField}` +
      `&pagination[page]=${page}&pagination[pageSize]=200`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
    });
    if (!res.ok) throw new Error(`${collection}: ${res.status} ${res.statusText}`);
    const json = (await res.json()) as {
      data: ({ id: number; documentId: string } & Record<string, string>)[];
      meta: { pagination: { page: number; pageCount: number } };
    };
    for (const e of json.data) {
      out.push({ id: e.id, documentId: e.documentId, title: e[titleField] ?? '' });
    }
    if (page >= json.meta.pagination.pageCount) break;
    page += 1;
  }
  return out;
}

const norm = (s: string) =>
  (s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

async function main() {
  console.log(`\n=== Orphan enrollment remediation (${APPLY ? 'APPLY' : 'DRY RUN'}) ===\n`);

  // ── 1. Current courses from Strapi ───────────────────────────────────
  const programs = await fetchCourses('programs', 'title');
  const maxymia = await fetchCourses('maxymia-courses', 'title_es');
  const allCourses = [...programs, ...maxymia];

  const validIds = new Set(allCourses.map((c) => c.documentId));
  const titleToCourse = new Map<string, Course>();
  for (const c of allCourses) {
    const key = norm(c.title);
    if (key && !titleToCourse.has(key)) titleToCourse.set(key, c);
  }

  console.log(`Current courses in Strapi: ${allCourses.length}`);
  if (validIds.size === 0) {
    console.error('✗ Strapi returned zero courses — aborting.');
    process.exit(1);
  }

  // ── 2. Connect ───────────────────────────────────────────────────────
  const queryClient = postgres(DATABASE_URL!);
  const db = drizzle(queryClient, { schema });

  // ── 3. Classify enrollments ──────────────────────────────────────────
  const rows = await db
    .select({
      id: enrollments.id,
      clerkId: enrollments.clerkId,
      programDocumentId: enrollments.programDocumentId,
      title: enrollments.title,
    })
    .from(enrollments);

  // Track which course documentIds each user already owns, so a re-link
  // never produces a (clerkId, programDocumentId) collision.
  const claimed = new Map<string, Set<string>>();
  const claim = (clerkId: string, docId: string) => {
    const set = claimed.get(clerkId) ?? new Set<string>();
    set.add(docId);
    claimed.set(clerkId, set);
  };

  for (const r of rows) {
    if (validIds.has(r.programDocumentId)) claim(r.clerkId, r.programDocumentId);
  }

  const toRelink: { id: string; from: string; to: Course; title: string | null }[] = [];
  const toDeleteDuplicate: { id: string; title: string | null; to: string }[] = [];
  const toDeleteGone: { id: string; title: string | null; docId: string }[] = [];

  for (const r of rows) {
    if (validIds.has(r.programDocumentId)) continue; // already valid

    const match = r.title ? titleToCourse.get(norm(r.title)) : undefined;
    if (!match) {
      toDeleteGone.push({ id: r.id, title: r.title, docId: r.programDocumentId });
      continue;
    }
    if ((claimed.get(r.clerkId) ?? new Set()).has(match.documentId)) {
      toDeleteDuplicate.push({ id: r.id, title: r.title, to: match.documentId });
    } else {
      toRelink.push({ id: r.id, from: r.programDocumentId, to: match, title: r.title });
      claim(r.clerkId, match.documentId);
    }
  }

  // ── 4. Classify orphaned progress / activity ─────────────────────────
  const lpRows = await db
    .select({ id: lessonProgress.id, programDocumentId: lessonProgress.programDocumentId })
    .from(lessonProgress);
  const caRows = await db
    .select({ id: courseActivity.id, programDocumentId: courseActivity.programDocumentId })
    .from(courseActivity);

  const lpOrphans = lpRows.filter((r) => !validIds.has(r.programDocumentId));
  const caOrphans = caRows.filter((r) => !validIds.has(r.programDocumentId));

  // ── 5. Report ────────────────────────────────────────────────────────
  console.log(`\nenrollments: ${rows.length} total`);
  console.log(`  ├─ re-link to new documentId : ${toRelink.length}`);
  console.log(`  ├─ delete (duplicate)        : ${toDeleteDuplicate.length}`);
  console.log(`  └─ delete (course gone)      : ${toDeleteGone.length}`);
  console.log(`lesson_progress : delete ${lpOrphans.length} / ${lpRows.length} orphaned`);
  console.log(`course_activity : delete ${caOrphans.length} / ${caRows.length} orphaned\n`);

  if (toRelink.length) {
    console.log('── RE-LINK ──');
    for (const r of toRelink) {
      console.log(`   "${r.title}"  ${r.from} → ${r.to.documentId}`);
    }
    console.log('');
  }
  if (toDeleteDuplicate.length) {
    console.log('── DELETE (duplicate of an enrollment the user already has) ──');
    for (const r of toDeleteDuplicate) console.log(`   "${r.title}" → ${r.to}`);
    console.log('');
  }
  if (toDeleteGone.length) {
    console.log('── DELETE (no current course with this title) ──');
    for (const r of toDeleteGone) console.log(`   ${r.docId}  "${r.title}"`);
    console.log('');
  }

  // ── 6. Apply ─────────────────────────────────────────────────────────
  if (!APPLY) {
    console.log('Dry run — nothing written. Re-run with --apply to commit.\n');
    await queryClient.end();
    return;
  }

  for (const r of toRelink) {
    await db
      .update(enrollments)
      .set({ programDocumentId: r.to.documentId, programId: r.to.id })
      .where(eq(enrollments.id, r.id));
  }
  console.log(`✓ re-linked ${toRelink.length} enrollment(s)`);

  const deleteEnrollmentIds = [
    ...toDeleteDuplicate.map((r) => r.id),
    ...toDeleteGone.map((r) => r.id),
  ];
  if (deleteEnrollmentIds.length) {
    await db.delete(enrollments).where(inArray(enrollments.id, deleteEnrollmentIds));
    console.log(`✓ deleted ${deleteEnrollmentIds.length} enrollment(s)`);
  }
  if (lpOrphans.length) {
    await db
      .delete(lessonProgress)
      .where(inArray(lessonProgress.id, lpOrphans.map((r) => r.id)));
    console.log(`✓ deleted ${lpOrphans.length} lesson_progress row(s)`);
  }
  if (caOrphans.length) {
    await db
      .delete(courseActivity)
      .where(inArray(courseActivity.id, caOrphans.map((r) => r.id)));
    console.log(`✓ deleted ${caOrphans.length} course_activity row(s)`);
  }

  console.log('\n✓ Remediation complete.\n');
  await queryClient.end();
}

main().catch((err) => {
  console.error('\n✗ Remediation failed:', err);
  process.exit(1);
});
