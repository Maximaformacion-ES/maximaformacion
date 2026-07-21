'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface DryRun {
  email?: string | null;
  report?: Record<string, unknown>;
}

export default function DangerZone({ clerkId, email }: { clerkId: string; email: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState<DryRun | null>(null);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadDryRun() {
    setBusy(true);
    setReport(null);
    try {
      const res = await fetch(`/api/admin/students/${clerkId}/gdpr-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      setReport((await res.json().catch(() => ({}))) as DryRun);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function doDelete() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/students/${clerkId}/gdpr-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      });
      if (res.ok) {
        toast.success('Datos del alumno borrados (RGPD)');
        router.push('/admin/alumnos');
      } else {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || `Error ${res.status}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const canDelete = !!email && confirmEmail.trim().toLowerCase() === email.toLowerCase();

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-sm text-destructive">Zona de peligro · RGPD</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Borra <strong>todos</strong> los datos personales del alumno en Postgres, Clerk y Stripe
          (customer), y marca su perfil de Klaviyo para supresión manual. Es <strong>irreversible</strong>.
          Las facturas de Stripe se retienen por obligación legal.
        </p>
        <AlertDialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (o) loadDryRun();
            else {
              setConfirmEmail('');
              setReport(null);
            }
          }}
        >
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive/5 hover:text-destructive"
            >
              Borrar datos (RGPD)
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Borrar datos de {email ?? 'este alumno'}</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2 text-sm">
                  <span className="block">
                    Se borrarán los datos personales en todos los sistemas. <strong>Irreversible.</strong>
                  </span>
                  {busy && !report && (
                    <span className="block text-muted-foreground">Calculando qué se borrará…</span>
                  )}
                  {report?.report && (
                    <pre className="max-h-44 overflow-auto rounded bg-muted p-2 text-xs">
                      {JSON.stringify(report.report, null, 2)}
                    </pre>
                  )}
                  <span className="block">Para confirmar, escribe el email del alumno:</span>
                  <Input
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder={email ?? 'email del alumno'}
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                disabled={!canDelete || busy}
                onClick={(e) => {
                  if (!canDelete) {
                    e.preventDefault();
                    return;
                  }
                  doDelete();
                }}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Borrar definitivamente
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
