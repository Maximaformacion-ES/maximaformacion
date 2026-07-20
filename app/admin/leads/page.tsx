import { getLeads, getConsultingLeads } from '@/lib/admin/leads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LeadsTable from './LeadsTable';

export const dynamic = 'force-dynamic';

function fmt(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function LeadsPage() {
  const [capture, consulting] = await Promise.all([getLeads({ limit: 200 }), getConsultingLeads()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="text-sm text-muted-foreground">
          Captación de emails (Klaviyo) y solicitudes de consultoría.
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <CardHeader className="pb-3 pt-5">
          <CardTitle className="text-base">Captación · {capture.length}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <LeadsTable leads={capture} />
        </CardContent>
      </Card>

      <Card className="overflow-hidden p-0">
        <CardHeader className="pb-3 pt-5">
          <CardTitle className="text-base">Consultoría · {consulting.length}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {consulting.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              Sin solicitudes de consultoría (o Strapi no disponible).
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Pregunta</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consulting.map((c) => (
                  <TableRow key={c.documentId}>
                    <TableCell>
                      <div className="font-medium">{c.fullName}</div>
                      {c.organization && (
                        <div className="text-xs text-muted-foreground">{c.organization}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.email}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.sector ?? '—'}</TableCell>
                    <TableCell className="max-w-[280px] truncate text-xs text-muted-foreground">
                      {c.questionGoal ?? '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{fmt(c.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
