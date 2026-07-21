import { getLeads, getConsultingLeads } from '@/lib/admin/leads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LeadsTable from './LeadsTable';
import ConsultingTable from './ConsultingTable';

export const dynamic = 'force-dynamic';

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
            <ConsultingTable leads={consulting} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
