'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { MonthPoint } from '@/lib/admin/purchases';

const config = {
  count: { label: 'Compras', color: '#F7A000' },
} satisfies ChartConfig;

/** 'YYYY-MM' → 'ene', y con año ('ene 25') si es enero o el primer punto. */
function monthLabel(key: string, first: boolean): string {
  const [y, m] = key.split('-').map(Number);
  const short = new Date(y, m - 1, 1).toLocaleDateString('es-ES', { month: 'short' });
  return m === 1 || first ? `${short} ${String(y).slice(2)}` : short;
}

export default function ComprasChart({ months }: { months: MonthPoint[] }) {
  const data = months.map((p, i) => ({ ...p, label: monthLabel(p.month, i === 0) }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Compras por mes (últimos 12 meses)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[220px] w-full">
          <BarChart data={data} margin={{ left: -20, right: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={6} />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={52} />
            <ChartTooltip
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const p = payload?.[0]?.payload as (MonthPoint & { label: string }) | undefined;
                    if (!p) return '';
                    const [y, m] = p.month.split('-').map(Number);
                    const full = new Date(y, m - 1, 1).toLocaleDateString('es-ES', {
                      month: 'long',
                      year: 'numeric',
                    });
                    const eur = p.amount.toLocaleString('es-ES', {
                      style: 'currency',
                      currency: 'EUR',
                      maximumFractionDigits: 0,
                    });
                    return `${full} · ${eur}`;
                  }}
                />
              }
            />
            <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ChartContainer>
        <p className="mt-2 text-xs text-muted-foreground">
          El importe del tooltip excluye las compras reembolsadas. La gráfica respeta los filtros
          activos.
        </p>
      </CardContent>
    </Card>
  );
}
