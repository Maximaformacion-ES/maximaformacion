#!/usr/bin/env node
/**
 * Clean up the duplicate authors created by migrate-authors-to-prod.mjs:
 * prod already had 30 author entries with no slug populated, and the
 * migration matched by slug so it created fresh entries instead of
 * overwriting them. Result: 28 same-name pairs.
 *
 * For each (old-with-no-slug, new-with-slug) name pair:
 *   - copy any non-null fields the OLD entry has that are missing/null in
 *     the NEW one (typically `email`) into the NEW one via PUT,
 *   - then delete the OLD entry.
 *
 * Old entries whose name does not match any new entry are left untouched
 * for manual review — they may be different people with similar names.
 */

const PROD = process.env.PROD_URL || 'https://sincere-beef-7072b60a10.strapiapp.com';
const PROD_TOKEN = process.env.PROD_TOKEN;
if (!PROD_TOKEN) {
  console.error('Missing PROD_TOKEN');
  process.exit(1);
}
const headers = { Authorization: `Bearer ${PROD_TOKEN}` };
const jsonHeaders = { ...headers, 'Content-Type': 'application/json' };

const COPYABLE_FIELDS = [
  'email',
  'linkedin',
  'roleDescription',
  'bio',
  'twitter',
  'orcid',
  'websiteUrl',
  'avatarUrl',
  'expertiseAreas',
  'seoTitle',
  'seoDescription',
];

async function fetchAll() {
  const all = [];
  let page = 1;
  while (true) {
    const url = new URL(`${PROD}/api/authors`);
    url.searchParams.set('pagination[page]', String(page));
    url.searchParams.set('pagination[pageSize]', '100');
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`fetch authors ${res.status}`);
    const json = await res.json();
    all.push(...json.data);
    if (page >= json.meta.pagination.pageCount) break;
    page++;
  }
  return all;
}

function isEmpty(v) {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string' && v.trim() === '') return true;
  if (Array.isArray(v) && v.length === 0) return true;
  return false;
}

async function main() {
  const authors = await fetchAll();
  console.log(`Total authors in prod: ${authors.length}`);

  const olds = authors.filter((a) => !a.slug);
  const news = authors.filter((a) => a.slug);
  console.log(`  ${olds.length} old (no slug), ${news.length} new (with slug)`);

  const newByName = new Map();
  for (const n of news) {
    newByName.set(n.name, n);
  }

  let merged = 0;
  let deleted = 0;
  let orphanOld = 0;
  let failed = 0;

  for (const oldA of olds) {
    const match = newByName.get(oldA.name);
    if (!match) {
      console.log(`  ? "${oldA.name}" — no new match, leaving in place`);
      orphanOld++;
      continue;
    }
    const patch = {};
    for (const f of COPYABLE_FIELDS) {
      if (!isEmpty(oldA[f]) && isEmpty(match[f])) {
        patch[f] = oldA[f];
      }
    }
    try {
      if (Object.keys(patch).length > 0) {
        const res = await fetch(`${PROD}/api/authors/${match.documentId}`, {
          method: 'PUT',
          headers: jsonHeaders,
          body: JSON.stringify({ data: patch }),
        });
        if (!res.ok) throw new Error(`PUT merge ${res.status}: ${(await res.text()).slice(0, 200)}`);
        console.log(`  ↻ ${oldA.name}: merged fields ${Object.keys(patch).join(', ')}`);
        merged++;
      }
      const del = await fetch(`${PROD}/api/authors/${oldA.documentId}`, {
        method: 'DELETE',
        headers,
      });
      if (!del.ok && del.status !== 404) {
        throw new Error(`DELETE ${del.status}: ${(await del.text()).slice(0, 200)}`);
      }
      console.log(`  ✗ deleted old ${oldA.name} (documentId ${oldA.documentId})`);
      deleted++;
    } catch (err) {
      console.error(`  ! ${oldA.name}: ${err.message}`);
      failed++;
    }
  }

  console.log('\n══════ SUMMARY ══════');
  console.log(`Merged fields into new: ${merged}`);
  console.log(`Old entries deleted:    ${deleted}`);
  console.log(`Orphan old (no match):  ${orphanOld}`);
  console.log(`Failed:                 ${failed}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
