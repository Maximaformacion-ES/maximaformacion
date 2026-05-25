import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Gate for /api/admin/* endpoints. Returns either the admin's clerkId or
 * a NextResponse with the appropriate 401/403 to bail out of the handler.
 *
 * Membership is granted by setting `role: "admin"` in the user's Clerk
 * publicMetadata (Clerk Dashboard → Users → Edit metadata). The previous
 * check by email domain (@atlansec.es) is too coarse: any internal account
 * matching the domain — including possibly compromised ones — would have
 * had blanket access to destructive endpoints.
 *
 * Usage:
 *
 *   const gate = await requireAdmin();
 *   if (gate instanceof NextResponse) return gate;
 *   const { userId } = gate;
 */
export async function requireAdmin(): Promise<
  { userId: string; email: string | null } | NextResponse
> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const me = await currentUser();
  const role = (me?.publicMetadata as { role?: string } | undefined)?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return {
    userId,
    email: me?.emailAddresses?.[0]?.emailAddress ?? null,
  };
}
