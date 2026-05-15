#!/usr/bin/env node
/**
 * Clean up the "-2" suffix on blog post slugs in production Strapi.
 *
 *   1. For each pair (slug, slug-2) where both exist: delete the "-2"
 *      version and add a 301 redirect from "/blog/<slug-2>" to
 *      "/blog/<slug>".
 *
 *   2. For "-2" slugs that have NO matching base (a "-2" suffix that is
 *      part of the original title): rename to the slug without "-2" and
 *      create a 301 from the old URL to the new one. Skipped silently if
 *      the target slug already exists (conflict — manual review needed).
 *
 * Run with `--dry-run` to print the plan without writing.
 *
 *   PROD_TOKEN=… node scripts/dedup-blog-2-slugs.mjs --dry-run
 *   PROD_TOKEN=… node scripts/dedup-blog-2-slugs.mjs
 */

const PROD = process.env.PROD_URL || 'https://sincere-beef-7072b60a10.strapiapp.com';
const PROD_TOKEN = process.env.PROD_TOKEN;
if (!PROD_TOKEN) { console.error('Missing PROD_TOKEN'); process.exit(1); }
const DRY = process.argv.includes('--dry-run');

// Slugs whose '-2' is part of the legitimate title (e.g. "Paso 2",
// "Tests Trials 2.0"), not a duplicate marker. Renaming would lose the
// semantic meaning, so the dedup script leaves them untouched.
const SKIP_RENAME = new Set([
  'como-describir-tus-datos-en-r-paso-2',
]);

const headers = { Authorization: `Bearer ${PROD_TOKEN}` };
const jsonHeaders = { ...headers, 'Content-Type': 'application/json' };

async function fetchAllBlogs() {
  const all = [];
  let page = 1;
  while (true) {
    const url = new URL(`${PROD}/api/blog-posts`);
    url.searchParams.set('pagination[page]', String(page));
    url.searchParams.set('pagination[pageSize]', '100');
    url.searchParams.set('fields[0]', 'slug');
    url.searchParams.set('fields[1]', 'title');
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`fetch blog-posts ${res.status}`);
    const j = await res.json();
    all.push(...j.data);
    if (page >= j.meta.pagination.pageCount) break;
    page++;
  }
  return all;
}

async function deleteBlog(documentId) {
  if (DRY) return;
  const res = await fetch(`${PROD}/api/blog-posts/${documentId}`, { method: 'DELETE', headers });
  if (!res.ok && res.status !== 404) {
    throw new Error(`DELETE blog ${documentId}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  }
}

async function updateBlogSlug(documentId, newSlug) {
  if (DRY) return;
  const res = await fetch(`${PROD}/api/blog-posts/${documentId}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify({ data: { slug: newSlug } }),
  });
  if (!res.ok) {
    throw new Error(`PUT slug ${documentId}->${newSlug}: ${res.status} ${(await res.text()).slice(0, 300)}`);
  }
}

async function createRedirect(source, destination) {
  if (DRY) return;
  const res = await fetch(`${PROD}/api/redirects`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({
      data: { source, destination, statusCode: 301, active: true },
    }),
  });
  // 400 with unique violation = redirect already exists; that's fine.
  if (!res.ok && res.status !== 400) {
    throw new Error(`POST redirect ${source}->${destination}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  }
}

async function main() {
  console.log(DRY ? '── DRY RUN — no writes ──' : '── EXECUTING ON PROD ──');
  const posts = await fetchAllBlogs();
  const bySlug = new Map(posts.map((p) => [p.slug, p]));

  const pairs = [];
  const orphans = [];
  for (const p of posts) {
    if (!p.slug.endsWith('-2')) continue;
    const base = p.slug.slice(0, -2);
    if (bySlug.has(base)) {
      pairs.push({ base: bySlug.get(base), dup: p });
    } else {
      orphans.push({ post: p, newSlug: base });
    }
  }

  console.log(`\nTotal posts: ${posts.length}`);
  console.log(`Pairs to dedup: ${pairs.length}`);
  console.log(`Orphans to rename: ${orphans.length}`);

  // 1) Pairs: delete -2 + 301 to base
  console.log('\n── PAIRS ──');
  for (const { base, dup } of pairs) {
    console.log(`  ${dup.slug}  →  redirect to /blog/${base.slug}  &  delete`);
    try {
      await createRedirect(`/blog/${dup.slug}`, `/blog/${base.slug}`);
      await deleteBlog(dup.documentId);
    } catch (err) {
      console.error(`    ! ${err.message}`);
    }
  }

  // 2) Orphans: check conflict, rename + 301 from old to new
  console.log('\n── ORPHANS ──');
  for (const { post, newSlug } of orphans) {
    if (SKIP_RENAME.has(post.slug)) {
      console.log(`  ${post.slug}  →  SKIP (in SKIP_RENAME list — '-2' is part of the title)`);
      continue;
    }
    if (bySlug.has(newSlug)) {
      console.log(`  ${post.slug}  →  SKIP (target slug "${newSlug}" already exists, manual review)`);
      continue;
    }
    console.log(`  ${post.slug}  →  rename to "${newSlug}"  &  redirect old slug`);
    try {
      await updateBlogSlug(post.documentId, newSlug);
      await createRedirect(`/blog/${post.slug}`, `/blog/${newSlug}`);
    } catch (err) {
      console.error(`    ! ${err.message}`);
    }
  }

  console.log(`\nDone${DRY ? ' (dry run, no changes applied)' : ''}.`);
}

main().catch((err) => { console.error('Fatal:', err); process.exit(1); });
