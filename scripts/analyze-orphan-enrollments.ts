/**
 * Read-only analysis: classify orphaned enrollments.
 *
 * An orphaned enrollment (its `program_document_id` matches no current Strapi
 * course) is NOT necessarily garbage. If the course catalogue was re-imported,
 * every `documentId` changed and legitimate purchases became "orphaned" even
 * though the course still exists under a new id.
 *
 * This script splits orphans into:
 *   - RE-LINKABLE: the stored `title` matches a current course → the purchase
 *     is real and should be re-pointed, not deleted.
 *   - TRULY ORPHANED: no title match → course genuinely gone (or test data).
 *
 * Read-only — never writes. Usage:
 *   export DATABASE_URL=... STRAPI_URL=... STRAPI_API_TOKEN=...
 *   npx tsx scripts/analyze-orphan-enrollments.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../lib/db/schema';
import { enrollments } from '../lib/db/schema';

const DATABASE_URL = process.env.DATABASE_URL;
const STRAPI_URL = process.env.STRAPI_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!DATABASE_URL || !STRAPI_URL || !STRAPI_API_TOKEN) {
  console.error('✗ DATABASE_URL, STRAPI_URL and STRAPI_API_TOKEN must be set.');
  process.exit(1);
}

interface StrapiCourse {
  documentId: string;
  title: string;
  slug: string;
}

async function fetchCourses(
  collection: string,
  titleField: string
): Promise<StrapiCourse[]> {
  const out: StrapiCourse[] = [];
  let page = 1;
  for (;;) {
    const url =
      `${STRAPI_URL}/api/${collection}` +
      `?status=draft&fields[0]=documentId&fields[1]=${titleField}&fields[2]=slug` +
      `&pagination[page]=${page}&pagination[pageSize]=200`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
    });
    if (!res.ok) throw new Error(`${collection}: ${res.status} ${res.statusText}`);
    const json = (await res.json()) as {
      data: Record<string, string>[];
      meta: { pagination: { page: number; pageCount: number } };
    };
    for (const e of json.data) {
      out.push({ documentId: e.documentId, title: e[titleField] ?? '', slug: e.slug ?? '' });
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
  console.log('\n=== Orphaned enrollment analysis (READ-ONLY) ===\n');

  const programs = await fetchCourses('programs', 'title');
  const maxymia = await fetchCourses('maxymia-courses', 'title_es');
  const allCourses = [...programs, ...maxymia];

  const validIds = new Set(allCourses.map((c) => c.documentId));
  const titleToCourse = new Map<string, StrapiCourse>();
  for (const c of allCourses) {
    const key = norm(c.title);
    if (key) titleToCourse.set(key, c);
  }

  console.log(`Current courses in Strapi: ${allCourses.length}\n`);

  const queryClient = postgres(DATABASE_URL!);
  const db = drizzle(queryClient, { schema });

  const rows = await db
    .select({
      clerkId: enrollments.clerkId,
      programDocumentId: enrollments.programDocumentId,
      title: enrollments.title,
    })
    .from(enrollments);

  const orphans = rows.filter((r) => !validIds.has(r.programDocumentId));

  const relinkable: { row: typeof orphans[number]; target: StrapiCourse }[] = [];
  const trulyOrphaned: typeof orphans = [];

  for (const o of orphans) {
    const match = o.title ? titleToCourse.get(norm(o.title)) : undefined;
    if (match) relinkable.push({ row: o, target: match });
    else trulyOrphaned.push(o);
  }

  console.log(`Total enrollments:  ${rows.length}`);
  console.log(`Orphaned:           ${orphans.length}`);
  console.log(`  ├─ re-linkable (title matches a current course): ${relinkable.length}`);
  console.log(`  └─ truly orphaned (no match):                    ${trulyOrphaned.length}\n`);

  if (relinkable.length > 0) {
    console.log('── RE-LINKABLE (real purchases, should be re-pointed) ──');
    for (const { row, target } of relinkable) {
      console.log(
        `   "${row.title}"\n` +
          `      ${row.programDocumentId}  →  ${target.documentId}  (${target.slug})`
      );
    }
    console.log('');
  }

  if (trulyOrphaned.length > 0) {
    console.log('── TRULY ORPHANED (no current course with this title) ──');
    for (const o of trulyOrphaned) {
      console.log(`   ${o.programDocumentId}  title=${JSON.stringify(o.title)}`);
    }
    console.log('');
  }

  await queryClient.end();
}

main().catch((err) => {
  console.error('\n✗ Analysis failed:', err);
  process.exit(1);
});
