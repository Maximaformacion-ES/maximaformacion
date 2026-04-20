import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { isAllowedDownloadHost, sanitizeDownloadName } from '@/lib/maxymia/download-hosts';

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const name = searchParams.get('name');

  if (!url || !name) {
    return NextResponse.json({ error: 'Missing url or name' }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }
  if (!isAllowedDownloadHost(parsed.hostname)) {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 400 });
  }

  const upstream = await fetch(parsed.toString());
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: `Upstream error ${upstream.status}` },
      { status: 502 }
    );
  }

  const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
  const contentLength = upstream.headers.get('content-length');
  const safeName = sanitizeDownloadName(name);

  const headers: Record<string, string> = {
    'Content-Type': contentType,
    'Content-Disposition': `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`,
    'Cache-Control': 'private, max-age=300',
  };
  if (contentLength) headers['Content-Length'] = contentLength;

  return new NextResponse(upstream.body, { status: 200, headers });
}
