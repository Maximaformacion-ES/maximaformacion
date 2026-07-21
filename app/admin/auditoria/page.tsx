import { clerkClient } from '@clerk/nextjs/server';
import { listAudit } from '@/lib/admin/audit';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

const ACTION_LABEL: Record<string, string> = {
  grant_access: 'Conceder acceso',
  revoke_access: 'Revocar acceso',
  set_pro: 'Dar PRO',
  unset_pro: 'Quitar PRO',
  reprovision: 'Re-provisionar',
  refund: 'Reembolso',
  wipe_purchases: 'Borrar compras',
  reset_progress: 'Resetear progreso',
  issue_certificate: 'Emitir certificado',
  revoke_certificate: 'Revocar certificado',
  reinstate_certificate: 'Reinstaurar certificado',
  reset_exam: 'Resetear examen',
  resync_klaviyo: 'Reintentar Klaviyo',
  gdpr_delete: 'Borrado RGPD',
  send_email_campaign: 'Campaña de email',
};

function fmt(d: Date): string {
  return d.toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/**
 * Etiqueta de la entidad: preferimos el título del curso (guardado en `diff.title`
 * al escribir la auditoría) en vez del documentId crudo; caemos al `tipo · uuid`
 * solo cuando no hay título.
 */
function entityLabel(row: { entityType?: string | null; entityId?: string | null; diff?: unknown }): string {
  const title =
    row.diff && typeof row.diff === 'object' ? (row.diff as { title?: unknown }).title : undefined;
  if (typeof title === 'string' && title.trim()) return title;
  return [row.entityType, row.entityId].filter(Boolean).join(' · ') || '—';
}

export default async function AuditoriaPage() {
  const rows = await listAudit({ limit: 200 });

  // Resolver clerkIds (actor + objetivo) → email, en lotes.
  const ids = Array.from(
    new Set(rows.flatMap((r) => [r.clerkIdActor, r.targetClerkId]).filter((x): x is string => !!x))
  );
  const emailById = new Map<string, string>();
  if (ids.length > 0) {
    try {
      const cc = await clerkClient();
      for (let i = 0; i < ids.length; i += 100) {
        const res = await cc.users.getUserList({ userId: ids.slice(i, i + 100), limit: 100 });
        for (const u of res.data) {
          emailById.set(u.id, u.primaryEmailAddress?.emailAddress ?? u.emailAddresses[0]?.emailAddress ?? u.id);
        }
      }
    } catch {
      /* si Clerk falla, mostramos el id */
    }
  }
  const who = (id: string | null) => (id ? emailById.get(id) ?? `${id.slice(0, 12)}…` : '—');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Auditoría</h1>
        <p className="text-sm text-muted-foreground">
          Registro de acciones del panel (solo lectura). {rows.length} entradas.
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Sobre</TableHead>
                <TableHead>Entidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Sin registros de auditoría todavía.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {fmt(r.createdAt)}
                    </TableCell>
                    <TableCell className="text-xs">{who(r.clerkIdActor)}</TableCell>
                    <TableCell className="text-sm font-medium">
                      {ACTION_LABEL[r.action] ?? r.action}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{who(r.targetClerkId)}</TableCell>
                    <TableCell className="max-w-[240px] truncate text-xs text-muted-foreground" title={entityLabel(r)}>
                      {entityLabel(r)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
