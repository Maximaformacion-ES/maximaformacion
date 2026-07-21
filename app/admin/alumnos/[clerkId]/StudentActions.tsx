'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CoursePicker, { type CourseOption } from './CoursePicker';

interface Enrollment {
  documentId: string;
  title: string;
  accessType: string;
  purchasedAt: string | null;
  percent: number | null;
  /** Acceso temporal: fecha de fin (ISO) o null = indefinido. */
  expiresAt: string | null;
}

interface Props {
  clerkId: string;
  plan: string;
  enrollments: Enrollment[];
}

export default function StudentActions({ clerkId, plan, enrollments }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [notify, setNotify] = useState(true);
  // Acceso temporal (opcional): 'YYYY-MM-DD'. Vacío = acceso indefinido.
  const [expiresAt, setExpiresAt] = useState('');

  const base = `/api/admin/students/${clerkId}`;
  const isPro = plan === 'pro';

  async function run(key: string, req: () => Promise<Response>, okMsg: string) {
    setBusy(key);
    try {
      const res = await req();
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const warn = summarizeWarnings(data);
        if (warn) toast.warning(okMsg, { description: warn });
        else toast.success(okMsg);
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

  function grant() {
    if (courses.length === 0) return;
    // Fecha de fin: fin del día elegido (hora local) → ISO. Vacío = indefinido.
    const expiresIso = expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : undefined;
    const suffix = expiresAt ? ` (hasta ${new Date(`${expiresAt}T23:59:59`).toLocaleDateString('es-ES')})` : '';
    const okMsg =
      courses.length === 1
        ? `Acceso concedido a «${courses[0].title}»${suffix}`
        : `Acceso concedido a ${courses.length} cursos${suffix}`;
    run(
      'grant',
      () =>
        fetch(`${base}/access`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentIds: courses.map((c) => c.documentId), notify, expiresAt: expiresIso }),
        }),
      okMsg
    ).then((ok) => ok && (setCourses([]), setExpiresAt('')));
  }

  function togglePro() {
    run(
      'pro',
      () =>
        fetch(`${base}/pro`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPro: !isPro }),
        }),
      isPro ? 'PRO retirado' : 'PRO concedido'
    );
  }

  function reprovision(documentId: string) {
    run(
      `reprov:${documentId}`,
      () =>
        fetch(`${base}/reprovision`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId }),
        }),
      'Provisioning re-ejecutado'
    );
  }

  return (
    <div className="space-y-6">
      {/* PRO + conceder acceso */}
      <div className="space-y-4">
        <div>
          <Button
            onClick={togglePro}
            disabled={busy === 'pro'}
            variant={isPro ? 'outline' : 'default'}
            className={isPro ? '' : 'bg-mx-orange text-white hover:bg-mx-orange-dark'}
          >
            {isPro ? 'Quitar PRO' : 'Dar PRO'}
          </Button>
        </div>

        <div className="space-y-2">
          <span className="block text-xs text-muted-foreground">Conceder acceso a cursos</span>
          <div className="flex flex-wrap items-center gap-2">
            <CoursePicker value={courses} onChange={setCourses} />
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground" title="Deja la fecha vacía para acceso indefinido">
              hasta
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="rounded-md border border-input bg-transparent px-2 py-1 text-xs"
              />
              {expiresAt && (
                <button
                  type="button"
                  onClick={() => setExpiresAt('')}
                  className="rounded-sm hover:text-destructive"
                  aria-label="Quitar fecha de fin"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </label>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
              avisar
            </label>
            <Button
              onClick={grant}
              disabled={busy === 'grant' || courses.length === 0}
              className="bg-mx-blue text-white hover:bg-mx-blue/90"
            >
              Conceder{courses.length > 1 ? ` (${courses.length})` : ''}
            </Button>
          </div>
          {courses.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {courses.map((c) => (
                <Badge key={c.documentId} variant="secondary" className="gap-1 pr-1">
                  <span className="max-w-[220px] truncate">{c.title}</span>
                  <button
                    type="button"
                    onClick={() => setCourses(courses.filter((x) => x.documentId !== c.documentId))}
                    className="rounded-sm hover:text-destructive"
                    aria-label={`Quitar ${c.title}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Matrículas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Matrículas ({enrollments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin matrículas.</p>
          ) : (
            <ul className="divide-y">
              {enrollments.map((e) => (
                <li key={e.documentId} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{e.title}</span>
                      {e.expiresAt &&
                        (new Date(e.expiresAt).getTime() > Date.now() ? (
                          <Badge variant="secondary" className="shrink-0 gap-1 text-[10px] text-mx-blue">
                            hasta {new Date(e.expiresAt).toLocaleDateString('es-ES')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="shrink-0 gap-1 border-transparent bg-destructive/10 text-[10px] text-destructive">
                            caducado {new Date(e.expiresAt).toLocaleDateString('es-ES')}
                          </Badge>
                        ))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {e.accessType}
                      {e.percent != null && ` · ${e.percent}%`}
                      <span className="text-muted-foreground/60"> · {e.documentId}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => reprovision(e.documentId)}
                      disabled={busy === `reprov:${e.documentId}`}
                      title="Re-ejecutar alta en Moodle (solo programas)"
                      className="border-mx-blue/40 text-mx-blue hover:bg-mx-blue/5 hover:text-mx-blue"
                    >
                      Re-provisionar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function summarizeWarnings(data: unknown): string | null {
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    // Concesión múltiple: { granted, total }
    if (typeof d.total === 'number' && typeof d.granted === 'number') {
      return d.granted < d.total ? `${d.granted}/${d.total} concedidos; ${d.total - d.granted} fallaron.` : null;
    }
    // Resultado con pasos (revoke).
    if ('steps' in d && Array.isArray(d.steps)) {
      const failed = (d.steps as { step: string; ok: boolean }[]).filter((s) => !s.ok);
      if (failed.length > 0) return `Fallaron: ${failed.map((s) => s.step).join(', ')}.`;
    }
  }
  return null;
}
