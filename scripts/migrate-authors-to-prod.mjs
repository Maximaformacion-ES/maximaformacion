#!/usr/bin/env node
/**
 * One-shot migration: copy `author` and `maxymia-instructor` records (plus
 * their avatar media) from the local Strapi instance to production.
 *
 * Strategy:
 *  - Build a local→prod avatar map by downloading each referenced avatar
 *    from local and re-uploading to prod once (deduped by local id).
 *  - For each local author: look up by `slug` in prod, then PUT to overwrite
 *    or POST to create. Relations (blog_posts, resources, programs) are
 *    intentionally NOT migrated — they get re-linked when their owning
 *    entries are migrated.
 *  - For each local instructor: look up by `name` (no slug on this CT),
 *    then PUT or POST.
 *  - Print a summary of created / overwritten / failed at the end.
 */

const LOCAL = process.env.LOCAL_URL || 'http://localhost:1337';
const PROD = process.env.PROD_URL || 'https://sincere-beef-7072b60a10.strapiapp.com';
const LOCAL_TOKEN = process.env.LOCAL_TOKEN;
const PROD_TOKEN = process.env.PROD_TOKEN;

if (!LOCAL_TOKEN || !PROD_TOKEN) {
  console.error('Missing LOCAL_TOKEN or PROD_TOKEN env vars');
  process.exit(1);
}

const localHeaders = { Authorization: `Bearer ${LOCAL_TOKEN}` };
const prodHeaders = { Authorization: `Bearer ${PROD_TOKEN}` };

const AUTHOR_FIELDS = [
  'name',
  'slug',
  'role',
  'email',
  'linkedin',
  'roleDescription',
  'bio',
  'isTeacher',
  'featured',
  'expertiseAreas',
  'websiteUrl',
  'twitter',
  'orcid',
  'seoTitle',
  'seoDescription',
  'avatarUrl',
];

async function fetchAllLocal(plural, populate = 'avatar') {
  const all = [];
  let page = 1;
  while (true) {
    const url = new URL(`${LOCAL}/api/${plural}`);
    url.searchParams.set('pagination[page]', String(page));
    url.searchParams.set('pagination[pageSize]', '100');
    url.searchParams.set('populate', populate);
    const res = await fetch(url, { headers: localHeaders });
    if (!res.ok) throw new Error(`Local fetch ${plural} failed: ${res.status}`);
    const json = await res.json();
    all.push(...json.data);
    const { page: cur, pageCount } = json.meta.pagination;
    if (cur >= pageCount) break;
    page++;
  }
  return all;
}

async function findProdBy(plural, field, value) {
  const url = new URL(`${PROD}/api/${plural}`);
  url.searchParams.set(`filters[${field}][$eq]`, value);
  url.searchParams.set('pagination[pageSize]', '1');
  const res = await fetch(url, { headers: prodHeaders });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data?.[0] || null;
}

async function downloadFromLocal(fileUrl) {
  const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${LOCAL}${fileUrl}`;
  const res = await fetch(fullUrl);
  if (!res.ok) throw new Error(`Download failed ${fullUrl}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadToProd(buffer, fileName, mime) {
  const fd = new FormData();
  const blob = new Blob([new Uint8Array(buffer)], { type: mime });
  fd.append('files', blob, fileName);
  const res = await fetch(`${PROD}/api/upload`, {
    method: 'POST',
    headers: prodHeaders,
    body: fd,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Upload ${fileName} failed: ${res.status} — ${txt.slice(0, 300)}`);
  }
  const arr = await res.json();
  return arr[0];
}

// ─── Avatar migration ────────────────────────────────────────────────

async function migrateAvatars(entities) {
  // entities is the array of (author|instructor) objects with `.avatar` populated.
  const seen = new Map(); // local avatar id → prod avatar id
  for (const e of entities) {
    const av = e.avatar;
    if (!av || !av.id || seen.has(av.id)) continue;
    try {
      const buf = await downloadFromLocal(av.url);
      const uploaded = await uploadToProd(buf, av.name || `avatar-${av.id}.bin`, av.mime || 'application/octet-stream');
      seen.set(av.id, uploaded.id);
      console.log(`  ✓ avatar ${av.id} → prod ${uploaded.id} (${av.name})`);
    } catch (err) {
      console.error(`  ✗ avatar ${av.id} (${av.name}): ${err.message}`);
    }
  }
  return seen;
}

// ─── Author migration ────────────────────────────────────────────────

function buildAuthorPayload(local, avatarMap) {
  const payload = {};
  for (const f of AUTHOR_FIELDS) {
    if (local[f] !== undefined) payload[f] = local[f];
  }
  if (local.avatar?.id && avatarMap.has(local.avatar.id)) {
    payload.avatar = avatarMap.get(local.avatar.id);
  }
  return { data: payload };
}

async function migrateAuthors(authors, avatarMap) {
  const stats = { created: 0, overwritten: 0, failed: 0, details: [] };
  for (const a of authors) {
    const slug = a.slug;
    if (!slug) {
      console.log(`  ⚠ ${a.name}: no slug, skipping`);
      stats.failed++;
      continue;
    }
    try {
      const existing = await findProdBy('authors', 'slug', slug);
      const body = buildAuthorPayload(a, avatarMap);
      if (existing) {
        const res = await fetch(`${PROD}/api/authors/${existing.documentId}`, {
          method: 'PUT',
          headers: { ...prodHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`PUT ${res.status}: ${(await res.text()).slice(0, 300)}`);
        console.log(`  ↻ ${a.name} (overwrite)`);
        stats.overwritten++;
        stats.details.push({ name: a.name, action: 'overwrite' });
      } else {
        const res = await fetch(`${PROD}/api/authors`, {
          method: 'POST',
          headers: { ...prodHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`POST ${res.status}: ${(await res.text()).slice(0, 300)}`);
        console.log(`  + ${a.name} (created)`);
        stats.created++;
        stats.details.push({ name: a.name, action: 'created' });
      }
    } catch (err) {
      console.error(`  ✗ ${a.name}: ${err.message}`);
      stats.failed++;
      stats.details.push({ name: a.name, action: 'failed', error: err.message });
    }
  }
  return stats;
}

// ─── Instructor migration ────────────────────────────────────────────

async function migrateInstructors(instructors, avatarMap) {
  const stats = { created: 0, overwritten: 0, failed: 0, details: [] };
  for (const i of instructors) {
    try {
      const existing = await findProdBy('maxymia-instructors', 'name', i.name);
      const payload = { name: i.name, role: i.role };
      if (i.avatar?.id && avatarMap.has(i.avatar.id)) {
        payload.avatar = avatarMap.get(i.avatar.id);
      }
      const body = { data: payload };
      if (existing) {
        const res = await fetch(`${PROD}/api/maxymia-instructors/${existing.documentId}`, {
          method: 'PUT',
          headers: { ...prodHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`PUT ${res.status}: ${(await res.text()).slice(0, 300)}`);
        console.log(`  ↻ ${i.name} (overwrite)`);
        stats.overwritten++;
        stats.details.push({ name: i.name, action: 'overwrite' });
      } else {
        const res = await fetch(`${PROD}/api/maxymia-instructors`, {
          method: 'POST',
          headers: { ...prodHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`POST ${res.status}: ${(await res.text()).slice(0, 300)}`);
        console.log(`  + ${i.name} (created)`);
        stats.created++;
        stats.details.push({ name: i.name, action: 'created' });
      }
    } catch (err) {
      console.error(`  ✗ ${i.name}: ${err.message}`);
      stats.failed++;
      stats.details.push({ name: i.name, action: 'failed', error: err.message });
    }
  }
  return stats;
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching local authors...');
  const authors = await fetchAllLocal('authors');
  console.log(`  ${authors.length} authors`);
  console.log('Fetching local instructors...');
  const instructors = await fetchAllLocal('maxymia-instructors');
  console.log(`  ${instructors.length} instructors`);

  console.log('\n── Migrating avatars (dedup by local id) ──');
  const avatarMap = await migrateAvatars([...authors, ...instructors]);
  console.log(`  ${avatarMap.size} unique avatars uploaded`);

  console.log('\n── Migrating authors ──');
  const authorStats = await migrateAuthors(authors, avatarMap);

  console.log('\n── Migrating instructors ──');
  const instructorStats = await migrateInstructors(instructors, avatarMap);

  console.log('\n══════ SUMMARY ══════');
  console.log(`Authors:     ${authorStats.created} created, ${authorStats.overwritten} overwritten, ${authorStats.failed} failed`);
  console.log(`Instructors: ${instructorStats.created} created, ${instructorStats.overwritten} overwritten, ${instructorStats.failed} failed`);
  if (authorStats.failed || instructorStats.failed) {
    console.log('\nFailures:');
    [...authorStats.details, ...instructorStats.details]
      .filter((d) => d.action === 'failed')
      .forEach((d) => console.log(`  - ${d.name}: ${d.error}`));
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
