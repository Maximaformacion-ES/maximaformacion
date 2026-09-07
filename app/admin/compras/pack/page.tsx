import Link from 'next/link';
import { desc } from 'drizzle-orm';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { db } from '@/lib/db/client';
import { packPurchases } from '@/lib/db/schema';
import { PACK_ITEM_ID } from '@/app/data/pack-cursos';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const dynamic = 'force-dynamic';

const eur = (n: number) =>
  n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

/**
 * Compras del pack de cursos universitarios (/pack-cursos-universitarios).
 * Son pagos SIN cuenta ni matrícula: esta lista es la referencia para asignar
 * el acceso a mano (alta en /admin/alumnos + matrícula) cuando los cursos
 * estén disponibles en el campus.
 */
export default async function ComprasPackPage() {
  const rows = await db
    .select()
    .from(packPurchases)
    .orderBy(desc(packPurchases.createdAt))
    .limit(500);

  const totalAmount = rows.reduce((acc, r) => acc + Number(r.amount ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Compras del pack universitario</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length.toLocaleString('es-ES')} compras · {eur(totalAmount)} · pendientes de
            asignar acceso cuando los cursos estén en el campus
          </p>
        </div>
        <Link
          href="/admin/compras"
          className="inline-flex items-center gap-2 text-sm text-mx-blue hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a compras
        </Link>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Comprador</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Compra</TableHead>
              <TableHead className="text-right">Importe</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Todavía no hay compras del pack.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{r.email}</TableCell>
                  <TableCell>
                    {r.item === PACK_ITEM_ID ? (
                      <Badge className="bg-mx-orange text-white hover:bg-mx-orange">Pack completo</Badge>
                    ) : (
                      <span className="text-sm">{r.itemTitle ?? r.item}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {r.amount != null ? eur(Number(r.amount)) : '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.dni ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.createdAt.toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    {r.stripePaymentId ? (
                      <a
                        href={`https://dashboard.stripe.com/payments/${r.stripePaymentId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ver pago en Stripe"
                        className="text-muted-foreground hover:text-mx-blue"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
