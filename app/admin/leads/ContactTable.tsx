'use client';

import { useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ContactMessage } from '@/lib/admin/leads';

function fmt(d: string): string {
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ContactTable({ messages }: { messages: ContactMessage[] }) {
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Mensaje</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((c) => (
            <TableRow
              key={c.id}
              onClick={() => setSelected(c)}
              className="cursor-pointer transition-colors hover:bg-mx-blue/5"
              title="Ver detalle"
            >
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell className="text-muted-foreground">{c.email}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{c.phone?.trim() || '—'}</TableCell>
              <TableCell className="max-w-[280px] truncate text-xs text-muted-foreground">
                {c.message}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{fmt(c.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-3">
                  <a href={`mailto:${selected.email}`} className="inline-flex items-center gap-1 text-mx-blue hover:underline">
                    <Mail className="h-3.5 w-3.5" />
                    {selected.email}
                  </a>
                  {selected.phone?.trim() && (
                    <a href={`tel:${selected.phone}`} className="inline-flex items-center gap-1 text-mx-blue hover:underline">
                      <Phone className="h-3.5 w-3.5" />
                      {selected.phone}
                    </a>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-[110px_1fr] gap-3 py-2">
                <span className="text-xs font-medium text-muted-foreground">Recibido</span>
                <span className="text-sm">{fmt(selected.createdAt)}</span>
              </div>

              <div>
                <div className="mb-1.5 text-xs font-medium text-muted-foreground">Mensaje</div>
                <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border bg-muted/30 p-3 text-sm">
                  {selected.message?.trim() ? selected.message : '—'}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
