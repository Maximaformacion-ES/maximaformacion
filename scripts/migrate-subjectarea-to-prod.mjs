#!/usr/bin/env node
/**
 * Copy `subjectArea` from local Strapi programs to production. The field is
 * what powers the "Inteligencia Artificial" / "Ciencia de Datos" / ... chips
 * on /programas; in prod every program has it null, so the filter shows zero
 * results. Match by `slug`. PUT only programs where the value changes.
 */

const LOCAL = process.env.LOCAL_URL || 'http://localhost:1337';
const PROD = process.env.PROD_URL || 'https://sincere-beef-7072b60a10.strapiapp.com';
const LOCAL_TOKEN = process.env.LOCAL_TOKEN;
const PROD_TOKEN = process.env.PROD_TOKEN;
if (!LOCAL_TOKEN || !PROD_TOKEN) {
  console.error('Missing LOCAL_TOKEN or PROD_TOKEN');
  process.exit(1);
}

async function fetchAll(base, token, plural, fields) {
  const all = [];
  let page = 1;
  while (true) {
    const url = new URL(`${base}/api/${plural}`);
    url.searchParams.set('pagination[page]', String(page));
    url.searchParams.set('pagination[pageSize]', '100');
    fields.forEach((f, i) => url.searchParams.set(`fields[${i}]`, f));
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`${plural} ${res.status}`);
    const json = await res.json();
    all.push(...json.data);
    if (page >= json.meta.pagination.pageCount) break;
    page++;
  }
  return all;
}

async function main() {
  const [local, prod] = await Promise.all([
    fetchAll(LOCAL, LOCAL_TOKEN, 'programs', ['slug', 'title', 'subjectArea']),
    fetchAll(PROD, PROD_TOKEN, 'programs', ['slug', 'title', 'subjectArea']),
  ]);
  console.log(`Local: ${local.length}  Prod: ${prod.length}`);

  const prodBySlug = new Map(prod.map((p) => [p.slug, p]));
  let updated = 0;
  let skipped = 0;
  let missing = 0;
  let failed = 0;

  for (const l of local) {
    if (!l.subjectArea) {
      skipped++;
      continue;
    }
    const p = prodBySlug.get(l.slug);
    if (!p) {
      console.log(`  ? "${l.title}" (slug=${l.slug}) — not in prod`);
      missing++;
      continue;
    }
    if (p.subjectArea === l.subjectArea) {
      skipped++;
      continue;
    }
    const res = await fetch(`${PROD}/api/programs/${p.documentId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${PROD_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { subjectArea: l.subjectArea } }),
    });
    if (!res.ok) {
      console.error(`  ! ${l.title}: ${res.status} ${(await res.text()).slice(0, 200)}`);
      failed++;
      continue;
    }
    console.log(`  ↻ ${l.title} → ${l.subjectArea}`);
    updated++;
  }

  console.log(`\nupdated=${updated} skipped=${skipped} missing=${missing} failed=${failed}`);
}

main().catch((err) => { console.error('Fatal:', err); process.exit(1); });
