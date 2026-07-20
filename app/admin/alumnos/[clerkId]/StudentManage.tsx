'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Purchase {
  documentId: string;
  title: string;
  price: string | null;
  purchasedAt: string | null;
  accessType: string;
  refundable: boolean;
}
interface Subscription {
  status: string;
  plan: string;
  currentPeriodEnd: string | null;
  paymentFailed: boolean | null;
}
interface Enrollment {
  documentId: string;
  title: string;
  percent: number | null;
}
interface ProgressCourse {
  documentId: string;
  title: string;
  percent: number | null;
  completed: number;
  lastAccessedAt: string | null;
  enrolled: boolean;
}
interface Cert {
  id: string;
  courseId: string;
  courseTitle: string;
  issuedAt: string;
  revokedAt: string | null;
}
interface Exam {
  id: string;
  courseId: string;
  blockId: string;
  examId: string;
  score: number;
  passed: boolean;
}

interface Props {
  clerkId: string;
  purchases: Purchase[];
  subscription: Subscription | null;
  enrollments: Enrollment[];
  progress: ProgressCourse[];
  certificates: Cert[];
  exams: Exam[];
}

function fmtDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function StudentManage({ clerkId, purchases, subscription, enrollments, progress, certificates, exams }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [issueCourse, setIssueCourse] = useState('');
  const [issueInstructor, setIssueInstructor] = useState('');
  const base = `/api/admin/students/${clerkId}`;

  async function run(key: string, req: () => Promise<Response>, okMsg: string): Promise<boolean> {
    setBusy(key);
    try {
      const res = await req();
      const data = await res.json().catch(() => ({}));
      if (res.ok && !data?.error) {
        toast.success(okMsg);
        router.refresh();
        return true;
      }
      toast.error(data?.error || `Error ${res.status}`);
      return false;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setBusy(null);
    }
  }

  const post = (path: string, body: unknown) =>
    fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  function refund(documentId: string) {
    run(`refund:${documentId}`, () => post('/payments/refund', { documentId, confirm: true }), 'Reembolso realizado');
  }
  function wipe() {
    run('wipe', () => post('/payments/wipe', { confirm: true }), 'Compras borradas');
  }
  function resetProgress(documentId: string) {
    run(`prog:${documentId}`, () => post('/progress/reset', { documentId, confirm: true }), 'Progreso reseteado');
  }
  function issueCert() {
    const enr = enrollments.find((e) => e.documentId === issueCourse);
    if (!enr) {
      toast.error('Elige un curso.');
      return;
    }
    run(
      'issue',
      () =>
        post('/certificates', {
          courseId: enr.documentId,
          courseTitle: enr.title,
          instructor: issueInstructor.trim() || undefined,
        }),
      'Certificado emitido'
    ).then((ok) => ok && (setIssueCourse(''), setIssueInstructor('')));
  }
  function revokeCert(id: string) {
    run(`cert:${id}`, () => post(`/certificates/${id}/revoke`, {}), 'Certificado revocado');
  }
  function reinstateCert(id: string) {
    run(`cert:${id}`, () => post(`/certificates/${id}/reinstate`, {}), 'Certificado reinstaurado');
  }
  function resetExam(examId: string) {
    run(`exam:${examId}`, () => post(`/exams/${examId}/reset`, {}), 'Examen reseteado');
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* ── Pagos ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm">Pagos ({purchases.length})</CardTitle>
          {purchases.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy === 'wipe'}
                  className="border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
                >
                  Borrar compras
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Borrar TODAS las compras del alumno?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Borra matrículas, progreso, actividad, reseñas, exámenes y certificados, y limpia
                    las compras de su cuenta de Clerk. <strong>No</strong> reembolsa en Stripe ni borra la
                    cuenta. Acción destructiva e irreversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={wipe} className="bg-destructive text-white hover:bg-destructive/90">
                    Borrar todo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {subscription && (
            <div className="text-xs text-muted-foreground">
              Suscripción: <span className="font-medium text-foreground">{subscription.status}</span> (
              {subscription.plan})
              {subscription.paymentFailed && <span className="text-destructive"> · pago fallido</span>}
            </div>
          )}
          {purchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin compras.</p>
          ) : (
            <ul className="divide-y">
              {purchases.map((p) => (
                <li key={p.documentId} className="flex items-center justify-between gap-3 py-2 first:pt-0">
                  <div className="min-w-0">
                    <div className="truncate text-sm">{p.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.price ? `${p.price}€` : 'gratis'} · {fmtDate(p.purchasedAt)} · {p.accessType}
                    </div>
                  </div>
                  {p.refundable ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy === `refund:${p.documentId}`}
                          className="border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
                        >
                          Reembolsar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            ¿Reembolsar {p.price ? `${p.price}€` : ''} de «{p.title}»?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Es un <strong>reembolso REAL en Stripe</strong>, irreversible. No revoca el
                            acceso (eso se hace aparte con «Revocar»).
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => refund(p.documentId)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            Reembolsar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <span className="shrink-0 text-xs text-muted-foreground/60">sin pago Stripe</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ── Progreso ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Progreso</CardTitle>
        </CardHeader>
        <CardContent>
          {progress.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin actividad en ningún curso.</p>
          ) : (
            <ul className="divide-y">
              {progress.map((c) => (
                <li key={c.documentId} className="flex items-center justify-between gap-3 py-2 first:pt-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/alumnos/${clerkId}/progreso/${c.documentId}`}
                        className="inline-flex min-w-0 items-center gap-1 text-sm font-medium hover:text-mx-blue hover:underline"
                      >
                        <span className="truncate">{c.title}</span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
                      </Link>
                      {!c.enrolled && (
                        <Badge variant="secondary" className="shrink-0 text-[10px]">sin matrícula</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {c.percent != null ? `${c.percent}% · ` : ''}
                      {c.completed} {c.completed === 1 ? 'lección' : 'lecciones'}
                      {c.lastAccessedAt ? ` · última conexión ${fmtDateTime(c.lastAccessedAt)}` : ''}
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={busy === `prog:${c.documentId}`}>
                        Resetear
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Resetear el progreso de «{c.title}»?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Borra las lecciones completadas y la actividad del alumno en este curso. El
                          alumno empezará de cero. Irreversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => resetProgress(c.documentId)}
                          className="bg-destructive text-white hover:bg-destructive/90"
                        >
                          Resetear progreso
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ── Certificados ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Certificados ({certificates.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {certificates.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin certificados.</p>
          ) : (
            <ul className="divide-y">
              {certificates.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-2 first:pt-0">
                  <div className="min-w-0">
                    <div className="truncate text-sm">{c.courseTitle}</div>
                    <div className="text-xs">
                      {c.revokedAt ? (
                        <Badge variant="outline" className="border-destructive/40 text-destructive">
                          revocado
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">emitido {fmtDate(c.issuedAt)}</span>
                      )}
                    </div>
                  </div>
                  {c.revokedAt ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy === `cert:${c.id}`}
                      onClick={() => reinstateCert(c.id)}
                      className="border-mx-blue/40 text-mx-blue hover:bg-mx-blue/5 hover:text-mx-blue"
                    >
                      Reinstaurar
                    </Button>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy === `cert:${c.id}`}
                          className="border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
                        >
                          Revocar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Revocar el certificado de «{c.courseTitle}»?</AlertDialogTitle>
                          <AlertDialogDescription>
                            La verificación pública (/verificar) lo marcará como revocado. Se puede
                            reinstaurar luego.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => revokeCert(c.id)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            Revocar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Emitir certificado */}
          {enrollments.length > 0 && (
            <div className="space-y-2 border-t pt-3">
              <span className="block text-xs text-muted-foreground">Emitir certificado</span>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={issueCourse}
                  onChange={(e) => setIssueCourse(e.target.value)}
                  className="h-9 max-w-[240px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-mx-blue/30"
                >
                  <option value="">Curso…</option>
                  {enrollments.map((e) => (
                    <option key={e.documentId} value={e.documentId}>
                      {e.title}
                    </option>
                  ))}
                </select>
                <Input
                  value={issueInstructor}
                  onChange={(e) => setIssueInstructor(e.target.value)}
                  placeholder="Instructor (opcional)"
                  className="h-9 w-44"
                />
                <Button
                  onClick={issueCert}
                  disabled={busy === 'issue' || !issueCourse}
                  className="bg-mx-orange text-white hover:bg-mx-orange-dark"
                >
                  Emitir
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Exámenes ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Exámenes ({exams.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin exámenes.</p>
          ) : (
            <ul className="divide-y">
              {exams.map((ex) => (
                <li key={ex.id} className="flex items-center justify-between gap-3 py-2 first:pt-0">
                  <div className="min-w-0">
                    <div className="truncate text-xs text-muted-foreground">
                      {ex.courseId} · bloque {ex.blockId}
                    </div>
                    <div className={`text-sm ${ex.passed ? 'text-green-600' : 'text-destructive'}`}>
                      {ex.score} — {ex.passed ? 'aprobado' : 'suspenso'}
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={busy === `exam:${ex.examId}`}>
                        Resetear
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Resetear este examen?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Borra el resultado para que el alumno pueda volver a hacerlo. Irreversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => resetExam(ex.examId)}
                          className="bg-destructive text-white hover:bg-destructive/90"
                        >
                          Resetear
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
