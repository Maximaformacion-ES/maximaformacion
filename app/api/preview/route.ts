import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Check the secret and required params
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');
  const type = searchParams.get('type') || 'program';

  if (secret !== process.env.STRAPI_PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 });
  }

  if (!slug) {
    return new Response('Missing slug parameter', { status: 400 });
  }

  // Enable Draft Mode
  const draft = await draftMode();
  draft.enable();

  // Redirect to the path from the fetched post
  const redirectPath = type === 'blog' ? `/blog/${slug}` : `/programas/${slug}`;
  redirect(redirectPath);
}
