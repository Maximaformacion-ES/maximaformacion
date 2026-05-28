import { auth } from '@clerk/nextjs/server';
import { isDbConfigured } from '@/lib/db/client';

export interface ServerUserState {
  /** True once Clerk reports a userId — pages can use this to skip the
   *  "Iniciar sesión para comprar" branch entirely on the first paint. */
  isSignedIn: boolean;
  /** User is on the Pro plan according to the DB (or Clerk metadata fallback). */
  hasPro: boolean;
  /** Document IDs of programs the user has bought (purchased or trial). */
  enrolledProgramDocumentIds: string[];
}

const EMPTY: ServerUserState = {
  isSignedIn: false,
  hasPro: false,
  enrolledProgramDocumentIds: [],
};

/**
 * Resolves the visitor's access state on the server so program/course pages
 * can render the correct CTA on first paint instead of starting from a
 * client-side loading skeleton. The client-side `useUserCampus` hook still
 * runs after hydration and can override these values if anything changed
 * (e.g. just-completed checkout), but the initial render already matches
 * reality.
 *
 * Calling this in a server component opts the page into dynamic rendering
 * — it cannot be statically generated because the result depends on the
 * request's auth cookies. The data-layer caches on Strapi (revalidate=60)
 * mean we still don't hit Strapi per-request, so the cost is one extra DB
 * round-trip per page view.
 */
export async function getServerUserState(): Promise<ServerUserState> {
  const { userId } = await auth();
  if (!userId) return EMPTY;
  if (!isDbConfigured()) {
    // No Postgres → can't read enrollments. Still report signed-in so the
    // CTA doesn't ask the user to "Iniciar sesión" when they already are.
    return { ...EMPTY, isSignedIn: true };
  }

  const { getUserByClerkId, getUserEnrollments } = await import('@/lib/db/queries');
  const [dbUser, userEnrollments] = await Promise.all([
    getUserByClerkId(userId),
    getUserEnrollments(userId),
  ]);

  return {
    isSignedIn: true,
    hasPro: dbUser?.plan === 'pro',
    enrolledProgramDocumentIds: userEnrollments.map((e) => e.programDocumentId),
  };
}
