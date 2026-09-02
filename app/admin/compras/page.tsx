import Link from 'next/link';
import { ArrowLeft, ArrowRight, Euro, ExternalLink, RotateCcw, ShoppingCart, TrendingUp } from 'lucide-react';
import { listPurchases } from '@/lib/admin/purchases';
import { listCourses } from '@/lib/admin/courses';
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
import PurchaseFilters from './PurchaseFilters';
import PurchaseActions from './PurchaseActions';
import ComprasChart from './ComprasChart';

export const dynamic = 'force-dynamic';

const eur = (n: number) =>
  n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

export default async function ComprasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; course?: string; tipo?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? '';
  const course = sp.course?.trim() || undefined;
  const tipo = sp.tipo === 'purchased' || sp.tipo === 'admin_granted' ? sp.tipo : undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);
  const limit = 25;
  const filtered = !!q || !!course || !!tipo;

  const [
    { items, total, totalAmount, last30Count, last30Amount, refundedCount, refundedAmount, months },
    courses,
  ] = await Promise.all([
    listPurchases({ query: q, courseDocumentId: course, accessType: tipo, limit, offset: (page - 1) * limit }),
    listCourses().catch(() => []),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const courseTitle = course ? courses.find((c) => c.documentId === course)?.title : undefined;

  const stats: { label: string; value: string; icon: typeof Euro }[] = [
    { label: filtered ? 'Compras (filtro)' : 'Compras', value: total.toLocaleString('es-ES'), icon: ShoppingCart },
    { label: filtered ? 'Ingresos (filtro)' : 'Ingresos', value: eur(totalAmount), icon: Euro },
    {
      label: 'Últimos 30 días',
      value: `${eur(last30Amount)} · ${last30Count.toLocaleString('es-ES')}`,
      icon: TrendingUp,
    },
    {
      label: 'Reembolsadas',
      value: `${refundedCount.toLocaleString('es-ES')} · ${eur(refundedAmount)}`,
      icon: RotateCcw,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Compras</h1>
        <p className="text-sm text-muted-foreground">
          {total.toLocaleString('es-ES')} {filtered ? 'con este filtro' : 'en total'}
          {courseTitle ? ` · «${courseTitle}»` : ''}
          {tipo === 'purchased' ? ' · solo pagos Stripe' : tipo === 'admin_granted' ? ' · solo accesos manuales' : ''}
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

      <ComprasChart months={months} />

      <PurchaseFilters q={q} course={course} tipo={tipo} courses={courses} />

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alumno</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead className="text-right">Importe</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Sin resultados.
                </TableCell>
              </TableRow>
            ) : (
              items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link href={`/admin/alumnos/${p.clerkId}`} className="font-medium text-mx-blue hover:underline">
                      {p.buyerName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.buyerEmail ?? '—'}</TableCell>
                  <TableCell>
                    <span className="line-clamp-2 max-w-[320px]">{p.title}</span>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    <span className={p.refundedAt ? 'text-muted-foreground line-through' : undefined}>
                      {p.price !== null
                        ? Number(p.price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
                        : '—'}
                    </span>
                    {p.refundedAt && (
                      <Badge
                        variant="outline"
                        className="ml-2 border-red-200 bg-red-50 text-red-600"
                        title={`Reembolsada el ${new Date(p.refundedAt).toLocaleDateString('es-ES')}`}
                      >
                        reembolsada
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {p.purchasedAt
                      ? new Date(p.purchasedAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {p.accessType === 'purchased' ? (
                      <Badge className="bg-mx-blue/10 text-mx-blue hover:bg-mx-blue/10 border-transparent">
                        compra
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        manual
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {p.stripePaymentId?.startsWith('pi_') ? (
                      <a
                        href={`https://dashboard.stripe.com/payments/${p.stripePaymentId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-mx-blue hover:underline"
                      >
                        Stripe
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="pr-2">
                    <PurchaseActions enrollmentId={p.id} refunded={!!p.refundedAt} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <PageLink q={q} course={course} tipo={tipo} page={page - 1} disabled={page <= 1} label="Anterior" dir="prev" />
          <span className="text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <PageLink q={q} course={course} tipo={tipo} page={page + 1} disabled={page >= totalPages} label="Siguiente" dir="next" />
        </div>
      )}
    </div>
  );
}

function PageLink({
  q,
  course,
  tipo,
  page,
  disabled,
  label,
  dir,
}: {
  q: string;
  course?: string;
  tipo?: string;
  page: number;
  disabled: boolean;
  label: string;
  dir: 'prev' | 'next';
}) {
  const content = (
    <>
      {dir === 'prev' && <ArrowLeft className="h-4 w-4" />}
      {label}
      {dir === 'next' && <ArrowRight className="h-4 w-4" />}
    </>
  );
  if (disabled) return <span className="inline-flex items-center gap-1 text-muted-foreground/40">{content}</span>;
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (course) params.set('course', course);
  if (tipo) params.set('tipo', tipo);
  params.set('page', String(page));
  return (
    <Link href={`/admin/compras?${params.toString()}`} className="inline-flex items-center gap-1 text-foreground hover:text-mx-blue">
      {content}
    </Link>
  );
}
