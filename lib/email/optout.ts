import { createHmac, timingSafeEqual } from 'node:crypto';
import { eq, isNotNull } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { upsertUser } from '@/lib/db/queries';

// ─── Baja de comunicaciones comerciales ────────────────────────────────
// El enlace de baja de los emails del panel es un enlace firmado (HMAC del
// clerkId) que no requiere iniciar sesión. La firma evita que un tercero dé
// de baja a otros. UNSUBSCRIBE_SECRET permite rotar la clave sin tocar Clerk.

const SECRET = process.env.UNSUBSCRIBE_SECRET || process.env.CLERK_SECRET_KEY || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.maximaformacion.es';

export function unsubscribeToken(clerkId: string): string {
  return createHmac('sha256', SECRET).update(`unsub:${clerkId}`).digest('hex').slice(0, 32);
}

export function verifyUnsubscribeToken(clerkId: string, token: string): boolean {
  if (!SECRET || !clerkId || !token) return false;
  const expected = Buffer.from(unsubscribeToken(clerkId));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function unsubscribeUrl(clerkId: string): string {
  return `${APP_URL}/baja?u=${encodeURIComponent(clerkId)}&t=${unsubscribeToken(clerkId)}`;
}

/** clerkIds dados de baja del marketing. Defensivo: si la columna aún no
 *  existe (migración 0010 sin aplicar) devuelve vacío y no filtra a nadie. */
export async function optedOutClerkIds(): Promise<Set<string>> {
  try {
    const rows = await db
      .select({ clerkId: users.clerkId })
      .from(users)
      .where(isNotNull(users.marketingOptOutAt));
    return new Set(rows.map((r) => r.clerkId));
  } catch (e) {
    console.warn('[optout] read failed (¿migración 0010 aplicada?):', e);
    return new Set();
  }
}

export async function isOptedOut(clerkId: string): Promise<boolean> {
  try {
    const [row] = await db
      .select({ at: users.marketingOptOutAt })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);
    return !!row?.at;
  } catch {
    return false;
  }
}

/** Da de baja (o de alta de nuevo) al usuario. Crea el espejo si no existe. */
export async function setMarketingOptOut(clerkId: string, optOut: boolean): Promise<void> {
  await upsertUser(clerkId);
  await db
    .update(users)
    .set({ marketingOptOutAt: optOut ? new Date() : null, updatedAt: new Date() })
    .where(eq(users.clerkId, clerkId));
}
