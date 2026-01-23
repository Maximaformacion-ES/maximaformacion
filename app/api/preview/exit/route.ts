import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Disable Draft Mode
  const draft = await draftMode();
  draft.disable();

  // Redirect to the path or home
  const redirectPath = searchParams.get('redirect') || '/';
  redirect(redirectPath);
}
