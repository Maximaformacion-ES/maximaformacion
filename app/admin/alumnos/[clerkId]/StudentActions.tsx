'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface Enrollment {
  documentId: string;
  title: string;
  accessType: string;
  purchasedAt: string | null;
  percent: number | null;
}

interface Props {
  clerkId: string;
  plan: string;
  enrollments: Enrollment[];
}

export default function StudentActions({ clerkId, plan, enrollments }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [grantDocId, setGrantDocId] = useState('');
  const [notify, setNotify] = useState(true);

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
    const documentId = grantDocId.trim();
    if (!documentId) return;
    run(
      'grant',
      () =>
        fetch(`${base}/access`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId, notify }),
        }),
      'Acceso concedido'
    ).then((ok) => ok && setGrantDocId(''));
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

  function revoke(documentId: string) {
    run(
      `revoke:${documentId}`,
      () =>
        fetch(`${base}/access?documentId=${encodeURIComponent(documentId)}&confirm=true`, {
          method: 'DELETE',
        }),
      'Acceso revocado'
    );
  }

  return (
    <div className="space-y-6">
      {/* PRO + conceder acceso */}
      <div className="flex flex-wrap items-end gap-4">
        <Button
          onClick={togglePro}
          disabled={busy === 'pro'}
          variant={isPro ? 'outline' : 'default'}
          className={isPro ? '' : 'bg-mx-orange text-white hover:bg-mx-orange-dark'}
        >
          {isPro ? 'Quitar PRO' : 'Dar PRO'}
        </Button>

        <div className="flex items-end gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="grant-doc" className="text-xs text-muted-foreground">
              Conceder acceso (documentId de Strapi)
            </Label>
            <Input
              id="grant-doc"
              value={grantDocId}
              onChange={(e) => setGrantDocId(e.target.value)}
              placeholder="documentId del programa o curso Maxymia"
              className="w-72"
            />
          </div>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground pb-2.5">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            avisar
          </label>
          <Button
            onClick={grant}
            disabled={busy === 'grant' || !grantDocId.trim()}
            className="bg-mx-blue text-white hover:bg-mx-blue/90"
          >
            Conceder
          </Button>
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
                    <div className="text-sm font-medium truncate">{e.title}</div>
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy === `revoke:${e.documentId}`}
                          className="border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
                        >
                          Revocar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Revocar acceso a «{e.title}»?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se borrará la matrícula y se quitará de la cuenta del alumno. Si es un
                            programa, también se le dará de baja en Moodle. Esta acción es destructiva.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => revoke(e.documentId)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            Revocar acceso
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
    if ('steps' in d && Array.isArray(d.steps)) {
      const failed = (d.steps as { step: string; ok: boolean }[]).filter((s) => !s.ok);
      if (failed.length > 0) return `Fallaron: ${failed.map((s) => s.step).join(', ')}.`;
    }
  }
  return null;
}
