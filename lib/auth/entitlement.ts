import { auth, currentUser } from '@clerk/nextjs/server';
import { isDbConfigured } from '@/lib/db/client';

export interface CourseAccess {
  /** Clerk reports a signed-in user. */
  isSignedIn: boolean;
  /** The visitor is entitled to the paid content of this program. */
  hasAccess: boolean;
}

/**
 * Server-side source of truth for "can this visitor open the paid content of
 * a course?". This MUST gate the campus course + lesson routes: the
 * client-side `useUserCampus` hook resolves after hydration, which left a
 * window where the "Comenzar curso" CTA flashed and the lesson player HTML
 * was served before the gate rendered — a non-buyer could click through and
 * reach the content. Deciding on the server means non-entitled content is
 * never sent to the browser at all.
 *
 * Access is granted when the user has a real enrollment for this program
 * (a completed checkout) or — only for courses explicitly marked `isPro` in
 * Strapi — when they're on the Pro plan. Mirrors the logic in
 * `useUserCampus.hasAccess` and `getServerUserState`.
 *
 * Fails closed: any auth/DB problem resolves to no access for paid content,
 * so an outage can never leak a course.
 */
export async function getCourseAccess(
  programDocumentId: string,
  isPro?: boolean | null,
): Promise<CourseAccess> {
  let userId: string | null = null;
  try {
    ({ userId } = await auth());
  } catch {
    return { isSignedIn: false, hasAccess: false };
  }
  if (!userId) return { isSignedIn: false, hasAccess: false };

  if (isDbConfigured()) {
    try {
      const { hasActiveEnrollment, getUserByClerkId } = await import('@/lib/db/queries');
      const [enrolled, dbUser] = await Promise.all([
        // `hasActiveEnrollment` excluye las matrículas caducadas (acceso temporal).
        hasActiveEnrollment(userId, programDocumentId),
        isPro === true ? getUserByClerkId(userId) : Promise.resolve(null),
      ]);
      const hasPro = dbUser?.plan === 'pro';
      return {
        isSignedIn: true,
        hasAccess: enrolled || (isPro === true && hasPro),
      };
    } catch (error) {
      // DB unavailable — fall through to the Clerk metadata fallback below
      // (mirrors /api/user/profile) rather than failing the request.
      console.warn('getCourseAccess: DB unavailable, falling back to Clerk metadata:', error);
    }
  }

  // Fallback: read entitlement from Clerk publicMetadata (same shape the
  // Stripe webhook writes and that /api/user/profile reads as its fallback).
  try {
    const user = await currentUser();
    const meta = (user?.publicMetadata as Record<string, unknown>) || {};
    const purchased = (meta.purchasedCourses as Array<{ documentId?: string; expiresAt?: string | null }>) || [];
    const now = Date.now();
    const enrolled = purchased.some(
      (c) => c.documentId === programDocumentId && (!c.expiresAt || new Date(c.expiresAt).getTime() > now)
    );
    const hasPro = (meta.plan as string) === 'pro';
    return {
      isSignedIn: true,
      hasAccess: enrolled || (isPro === true && hasPro),
    };
  } catch {
    return { isSignedIn: true, hasAccess: false };
  }
}
