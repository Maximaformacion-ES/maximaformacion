import Link from 'next/link';
import { Search, ArrowLeft, ArrowRight } from 'lucide-react';
import { listStudents } from '@/lib/admin/students';
import { listCourses } from '@/lib/admin/courses';
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
  searchParams: Promise<{ q?: string; page?: string; plan?: string; course?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? '';
  const plan = sp.plan === 'pro' ? 'pro' : undefined;
  const course = sp.course?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);
  const limit = 25;
  const filtered = !!plan || !!course;

  const [{ items, total }, courses] = await Promise.all([
    listStudents({ query: q, plan, courseDocumentId: course, limit, offset: (page - 1) * limit }),
    listCourses().catch(() => []),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const courseTitle = course ? courses.find((c) => c.documentId === course)?.title : undefined;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Alumnos</h1>
          <p className="text-sm text-muted-foreground">
            {total.toLocaleString('es-ES')} {filtered ? 'con este filtro' : 'en total'}
            {courseTitle ? ` · matriculados en «${courseTitle}»` : ''}
            {plan ? ' · solo PRO' : ''}
          </p>
        </div>
      </div>

      <form method="get" className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Nombre o email…" className="pl-8" />
        </div>
        <select
          name="course"
          defaultValue={course ?? ''}
          className="h-9 max-w-[240px] rounded-md border border-input bg-transparent px-2 text-sm"
        >
          <option value="">Todos los cursos</option>
          {courses.map((c) => (
            <option key={c.documentId} value={c.documentId}>
              {c.title}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <input type="checkbox" name="plan" value="pro" defaultChecked={plan === 'pro'} />
          Solo PRO
        </label>
        <Button type="submit" className="bg-mx-orange text-white hover:bg-mx-orange-dark">
          Filtrar
        </Button>
        {filtered && (
          <Link href="/admin/alumnos" className="text-sm text-muted-foreground hover:text-foreground">
            Limpiar
          </Link>
        )}
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
          <PageLink q={q} plan={plan} course={course} page={page - 1} disabled={page <= 1} label="Anterior" dir="prev" />
          <span className="text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <PageLink q={q} plan={plan} course={course} page={page + 1} disabled={page >= totalPages} label="Siguiente" dir="next" />
        </div>
      )}
    </div>
  );
}

function PageLink({
  q,
  plan,
  course,
  page,
  disabled,
  label,
  dir,
}: {
  q: string;
  plan?: string;
  course?: string;
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
  if (plan) params.set('plan', plan);
  if (course) params.set('course', course);
  params.set('page', String(page));
  return (
    <Link href={`/admin/alumnos?${params.toString()}`} className="inline-flex items-center gap-1 text-foreground hover:text-mx-blue">
      {content}
    </Link>
  );
}
