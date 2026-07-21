import { desc } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { adminAudit } from '@/lib/db/schema';

export interface AuditEntry {
  /** clerkId del admin que ejecuta la acción. */
  actor: string;
  /** Acción: 'grant_access' | 'revoke_access' | 'set_pro' | 'unset_pro' | 'reprovision' | … */
  action: string;
  entityType?: string;
  entityId?: string;
  /** Alumno afectado. */
  targetClerkId?: string;
  /** Payload / antes-después de la acción (se guarda como JSONB). */
  diff?: unknown;
  source?: 'panel' | 'assistant' | 'script';
}

/**
 * Escribe una fila de auditoría. **Best-effort**: la auditoría no debe tumbar la
 * operación principal, así que si falla (p.ej. la tabla aún no está migrada en
 * prod) se loguea y se traga el error.
 */
export async function writeAudit(entry: AuditEntry): Promise<void> {
  try {
    await db.insert(adminAudit).values({
      clerkIdActor: entry.actor,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      targetClerkId: entry.targetClerkId,
      diff: (entry.diff ?? null) as never,
      source: entry.source ?? 'panel',
    });
  } catch (e) {
    console.error('[admin-audit] failed to write audit row:', e);
  }
}

/** Últimas entradas de auditoría (solo lectura, para el visor). Defensivo. */
export async function listAudit(opts: { limit?: number } = {}): Promise<(typeof adminAudit.$inferSelect)[]> {
  const { limit = 200 } = opts;
  try {
    return await db.select().from(adminAudit).orderBy(desc(adminAudit.createdAt)).limit(limit);
  } catch (e) {
    console.warn('[admin:listAudit] failed:', e);
    return [];
  }
}
