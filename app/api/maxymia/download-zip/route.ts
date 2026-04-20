import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { isAllowedDownloadHost, sanitizeDownloadName } from '@/lib/maxymia/download-hosts';

interface RequestedFile {
  url: string;
  name: string;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { files?: RequestedFile[]; zipName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const files = body.files;
  if (!Array.isArray(files) || files.length === 0) {
    return NextResponse.json({ error: 'No files' }, { status: 400 });
  }
  if (files.length > 50) {
    return NextResponse.json({ error: 'Too many files' }, { status: 400 });
  }

  for (const f of files) {
    if (!f?.url || !f?.name) {
      return NextResponse.json({ error: 'Invalid file entry' }, { status: 400 });
    }
    let parsed: URL;
    try {
      parsed = new URL(f.url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
    if (!isAllowedDownloadHost(parsed.hostname)) {
      return NextResponse.json({ error: `Host not allowed: ${parsed.hostname}` }, { status: 400 });
    }
  }

  const zip = new JSZip();
  const counts = new Map<string, number>();

  try {
    const fetched = await Promise.all(
      files.map(async (f) => {
        const res = await fetch(f.url);
        if (!res.ok) throw new Error(`${f.name} (${res.status})`);
        const buf = await res.arrayBuffer();
        return { name: f.name, buf };
      })
    );
    for (const { name, buf } of fetched) {
      const safe = sanitizeDownloadName(name);
      const n = counts.get(safe) ?? 0;
      counts.set(safe, n + 1);
      const finalName = n === 0 ? safe : safe.replace(/(\.[^.]+)?$/, `_${n}$1`);
      zip.file(finalName, buf);
    }
    const buffer = await zip.generateAsync({ type: 'uint8array' });
    const zipName = sanitizeDownloadName(body.zipName ?? 'descargables');
    return new NextResponse(new Blob([new Uint8Array(buffer)], { type: 'application/zip' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipName}.zip"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to build zip';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
