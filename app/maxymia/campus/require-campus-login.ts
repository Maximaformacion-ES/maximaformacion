import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

/**
 * Server guard for campus pages that require a logged-in user (dashboard,
 * mis-cursos, notas, the course catalog). The course **ficha**
 * (/maxymia/campus/[courseSlug]) is intentionally NOT guarded — it's a public
 * landing — and lesson routes gate their content via getCourseAccess.
 *
 * auth() is wrapped because bot requests bypass Clerk's middleware wrapper and
 * auth() would throw without it (those routes are 404'd for bots in proxy.ts,
 * so this branch is just defence in depth).
 */
export async function requireCampusLogin(redirectPath = '/maxymia/campus'): Promise<void> {
  let userId: string | null = null;
  try {
    ({ userId } = await auth());
  } catch {
    userId = null;
  }
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(redirectPath)}`);
  }
}
