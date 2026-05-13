#!/usr/bin/env node
/**
 * Delete every `author` and `maxymia-instructor` entry from production
 * before re-running migrate-authors-to-prod. Destructive.
 */

const PROD = process.env.PROD_URL || 'https://sincere-beef-7072b60a10.strapiapp.com';
const PROD_TOKEN = process.env.PROD_TOKEN;
if (!PROD_TOKEN) {
  console.error('Missing PROD_TOKEN');
  process.exit(1);
}
const headers = { Authorization: `Bearer ${PROD_TOKEN}` };

async function fetchAll(plural) {
  const all = [];
  let page = 1;
  while (true) {
    const url = new URL(`${PROD}/api/${plural}`);
    url.searchParams.set('pagination[page]', String(page));
    url.searchParams.set('pagination[pageSize]', '100');
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`fetch ${plural} ${res.status}`);
    const json = await res.json();
    all.push(...json.data);
    if (page >= json.meta.pagination.pageCount) break;
    page++;
  }
  return all;
}

async function wipe(plural, label) {
  const entries = await fetchAll(plural);
  console.log(`Wiping ${entries.length} ${label}...`);
  let deleted = 0;
  let failed = 0;
  for (const e of entries) {
    const res = await fetch(`${PROD}/api/${plural}/${e.documentId}`, {
      method: 'DELETE',
      headers,
    });
    if (res.ok || res.status === 404) {
      deleted++;
    } else {
      console.error(`  ! ${e.name || e.id}: ${res.status}`);
      failed++;
    }
  }
  console.log(`  ${label}: ${deleted} deleted, ${failed} failed`);
}

async function main() {
  await wipe('authors', 'authors');
  await wipe('maxymia-instructors', 'instructors');
}

main().catch((err) => { console.error('Fatal:', err); process.exit(1); });
