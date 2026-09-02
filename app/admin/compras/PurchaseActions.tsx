'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MoreHorizontal, RotateCcw, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/** Menú de fila: marcar/desmarcar la compra como reembolsada (solo la marca;
 *  el reembolso real de Stripe se hace desde la ficha del alumno). */
export default function PurchaseActions({
  enrollmentId,
  refunded,
}: {
  enrollmentId: string;
  refunded: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/purchases/refund-flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, refunded: !refunded }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(refunded ? 'Marca de reembolso quitada.' : 'Compra marcada como reembolsada.');
        router.refresh();
      } else {
        toast.error(d.error || `Error ${res.status}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={busy}>
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Acciones</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={toggle} disabled={busy}>
          {refunded ? (
            <>
              <Undo2 className="mr-2 h-4 w-4" />
              Quitar marca de reembolso
            </>
          ) : (
            <>
              <RotateCcw className="mr-2 h-4 w-4" />
              Marcar como reembolsada
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
