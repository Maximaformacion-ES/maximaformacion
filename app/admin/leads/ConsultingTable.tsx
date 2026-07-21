'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ConsultingLead } from '@/lib/admin/leads';

function fmt(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Fila de detalle en el modal (etiqueta + valor). */
function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 py-2">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value?.trim() ? value : '—'}</dd>
    </div>
  );
}

export default function ConsultingTable({ leads }: { leads: ConsultingLead[] }) {
  const [selected, setSelected] = useState<ConsultingLead | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>Pregunta</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((c) => {
            const org = c.organization?.trim() || '';
            const sector = c.sector?.trim() || '—';
            const question = c.questionGoal?.trim() || '—';
            return (
              <TableRow
                key={c.documentId}
                onClick={() => setSelected(c)}
                className="cursor-pointer transition-colors hover:bg-mx-blue/5"
                title="Ver detalle"
              >
                <TableCell>
                  <div className="font-medium">{c.fullName}</div>
                  {org && <div className="text-xs text-muted-foreground">{org}</div>}
                </TableCell>
                <TableCell className="text-muted-foreground">{c.email}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{sector}</TableCell>
                <TableCell className="max-w-[280px] truncate text-xs text-muted-foreground">
                  {question}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{fmt(c.createdAt)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.fullName}</DialogTitle>
                <DialogDescription className="flex items-center gap-1.5">
                  <a href={`mailto:${selected.email}`} className="inline-flex items-center gap-1 text-mx-blue hover:underline">
                    <Mail className="h-3.5 w-3.5" />
                    {selected.email}
                  </a>
                </DialogDescription>
              </DialogHeader>

              <dl className="divide-y">
                <Row label="Organización" value={selected.organization} />
                <Row label="Sector" value={selected.sector} />
                <Row label="Fase proyecto" value={selected.projectPhase} />
                <Row label="Fecha límite" value={selected.deadline ? fmt(selected.deadline) : null} />
                <Row label="Recibido" value={fmt(selected.createdAt)} />
              </dl>

              <div>
                <div className="mb-1.5 text-xs font-medium text-muted-foreground">Pregunta / objetivo</div>
                <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border bg-muted/30 p-3 text-sm">
                  {selected.questionGoal?.trim() ? selected.questionGoal : '—'}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
