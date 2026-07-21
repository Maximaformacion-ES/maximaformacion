import Link from 'next/link';
import { Users, GraduationCap, Crown, Award, ArrowUpRight, Euro, Inbox, TrendingUp } from 'lucide-react';
import { getAdminMetrics } from '@/lib/admin/metrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const m = await getAdminMetrics();

  const stats: { label: string; value: string; icon: typeof Users }[] = [
    { label: 'Alumnos', value: m.students.toLocaleString('es-ES'), icon: Users },
    { label: 'Matrículas', value: m.enrollments.toLocaleString('es-ES'), icon: GraduationCap },
    { label: 'Alumnos PRO', value: m.pro.toLocaleString('es-ES'), icon: Crown },
    { label: 'Certificados', value: m.certificates.toLocaleString('es-ES'), icon: Award },
    {
      label: 'Ingresos (aprox.)',
      value: m.revenue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }),
      icon: Euro,
    },
    { label: 'Leads', value: m.leads.toLocaleString('es-ES'), icon: Inbox },
    { label: 'Matrículas (30 días)', value: m.recentEnrollments.toLocaleString('es-ES'), icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Resumen del back-office. Strapi sigue siendo el CMS de contenido.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-mx-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Link href="/admin/alumnos" className="block">
        <Card className="transition-colors hover:border-mx-orange/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Alumnos</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Buscar, ficha 360, conceder/revocar acceso, PRO, re-provisionar Moodle.
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-mx-blue" />
          </CardHeader>
        </Card>
      </Link>
    </div>
  );
}
