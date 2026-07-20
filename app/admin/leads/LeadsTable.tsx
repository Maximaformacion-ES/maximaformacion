'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface CaptureLead {
  id: string;
  source: string;
  email: string;
  name: string | null;
  resourceTitle: string | null;
  consent: boolean;
  utmSource: string | null;
  synced: boolean;
  klaviyoError: string | null;
  createdAt: string;
}

function fmt(d: string): string {
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function LeadsTable({ leads }: { leads: CaptureLead[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function resync(id: string) {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/leads/${id}/resync-klaviyo`, { method: 'POST' });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.ok) {
        toast.success('Sincronizado con Klaviyo');
        router.refresh();
      } else {
        toast.error(d.error || `Error ${res.status}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Origen</TableHead>
          <TableHead>Recurso</TableHead>
          <TableHead>Klaviyo</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead className="text-right">Acción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
              Sin leads de captación.
            </TableCell>
          </TableRow>
        ) : (
          leads.map((l) => (
            <TableRow key={l.id}>
              <TableCell>
                <div className="font-medium">{l.email}</div>
                {l.name && <div className="text-xs text-muted-foreground">{l.name}</div>}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{l.source}</TableCell>
              <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground">
                {l.resourceTitle ?? '—'}
              </TableCell>
              <TableCell>
                {l.synced ? (
                  <Badge className="border-transparent bg-green-100 text-green-700 hover:bg-green-100">
                    sincronizado
                  </Badge>
                ) : l.klaviyoError ? (
                  <Badge variant="destructive" title={l.klaviyoError}>
                    error
                  </Badge>
                ) : (
                  <Badge variant="secondary">pendiente</Badge>
                )}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{fmt(l.createdAt)}</TableCell>
              <TableCell className="text-right">
                {!l.synced && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy === l.id}
                    onClick={() => resync(l.id)}
                    className="gap-1.5 border-mx-blue/40 text-mx-blue hover:bg-mx-blue/5 hover:text-mx-blue"
                  >
                    <RefreshCw className="size-3.5" />
                    Reintentar
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
