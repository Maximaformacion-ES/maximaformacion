import { listCampaigns } from '@/lib/email/campaign';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import EmailComposer from './EmailComposer';

export const dynamic = 'force-dynamic';

const SEGMENT_LABEL: Record<string, string> = {
  course: 'Curso(s)',
  pro: 'PRO',
  inactive: 'Inactivos',
  all: 'Todos',
  newsletter: 'Boletín (Klaviyo)',
  nopro_registered: 'No PRO (registrados)',
  nopro_unregistered: 'No PRO (sin cuenta)',
  nopro_all: 'No PRO (todos)',
};

function segmentLabel(segment: unknown): string {
  const kind = (segment as { kind?: string } | null)?.kind;
  return (kind && SEGMENT_LABEL[kind]) || '—';
}

function fmtDate(d: Date | string | null): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'done') return <Badge className="border-transparent bg-green-100 text-green-700">enviada</Badge>;
  if (status === 'failed') return <Badge variant="destructive">fallida</Badge>;
  if (status === 'sending') return <Badge className="border-transparent bg-amber-100 text-amber-700">enviando</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

export default async function EmailsPage() {
  const campaigns = await listCampaigns();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Emails a alumnos</h1>
        <p className="text-sm text-muted-foreground">
          Redacta y envía emails segmentados. Con vista previa y envío de prueba antes del envío real.
        </p>
      </div>

      <EmailComposer />

      <Card className="overflow-hidden p-0">
        <CardHeader className="p-4">
          <CardTitle className="text-base">Campañas ({campaigns.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asunto</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead className="text-right">Enviados</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                    Aún no hay campañas.
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="max-w-[280px] truncate font-medium">{c.subject}</TableCell>
                    <TableCell className="text-muted-foreground">{segmentLabel(c.segment)}</TableCell>
                    <TableCell className="text-right">
                      {c.sent}/{c.total}
                      {c.failed > 0 && <span className="text-destructive"> ({c.failed} fallidos)</span>}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{fmtDate(c.sentAt ?? c.createdAt)}</TableCell>
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
