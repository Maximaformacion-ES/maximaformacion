import Link from 'next/link';
import { Search, ArrowLeft, ArrowRight } from 'lucide-react';
import { listStudents } from '@/lib/admin/students';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

export default async function AlumnosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? '';
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);
  const limit = 25;

  const { items, total } = await listStudents({ query: q, limit, offset: (page - 1) * limit });
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Alumnos</h1>
          <p className="text-sm text-muted-foreground">{total.toLocaleString('es-ES')} en total</p>
        </div>
      </div>

      <form method="get" className="flex gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Buscar por nombre o email…" className="pl-8" />
        </div>
        <Button type="submit" className="bg-mx-orange text-white hover:bg-mx-orange-dark">
          Buscar
        </Button>
      </form>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alumno</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Cursos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Sin resultados.
                </TableCell>
              </TableRow>
            ) : (
              items.map((s) => (
                <TableRow key={s.clerkId}>
                  <TableCell>
                    <Link href={`/admin/alumnos/${s.clerkId}`} className="font-medium text-mx-blue hover:underline">
                      {s.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.email ?? '—'}</TableCell>
                  <TableCell>
                    {s.plan === 'pro' ? (
                      <Badge className="bg-mx-orange/10 text-mx-orange-dark hover:bg-mx-orange/10 border-transparent">
                        pro
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">free</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{s.enrollmentCount}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <PageLink q={q} page={page - 1} disabled={page <= 1} label="Anterior" dir="prev" />
          <span className="text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <PageLink q={q} page={page + 1} disabled={page >= totalPages} label="Siguiente" dir="next" />
        </div>
      )}
    </div>
  );
}

function PageLink({ q, page, disabled, label, dir }: { q: string; page: number; disabled: boolean; label: string; dir: 'prev' | 'next' }) {
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
  params.set('page', String(page));
  return (
    <Link href={`/admin/alumnos?${params.toString()}`} className="inline-flex items-center gap-1 text-foreground hover:text-mx-blue">
      {content}
    </Link>
  );
}
