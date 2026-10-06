import React from 'react';
import { CalendarClock } from 'lucide-react';
import type { EnrollmentStatus } from '@/lib/programs/enrollment';

/**
 * Pastilla de estado de matrícula. Verde con punto "en vivo" cuando está
 * abierta (es la señal que la gente no veía en la fila "Inicio"); naranja con
 * la fecha cuando hay convocatoria; gris si "Próximamente".
 *
 * `size="sm"` para tarjetas y barra móvil; `size="md"` para hero y sidebar.
 */
export function EnrollmentBadge({
  status,
  size = 'md',
  className = '',
}: {
  status: EnrollmentStatus | null | undefined;
  size?: 'sm' | 'md';
  className?: string;
}) {
  if (!status) return null;
  const pad = size === 'sm' ? 'px-2.5 py-1 text-label-sm' : 'px-3 py-1.5 text-label-sm md:text-label-md';
  const base = `inline-flex items-center gap-1.5 rounded-full font-black uppercase tracking-[0.14em] whitespace-nowrap ${pad} ${className}`;

  if (status.kind === 'open') {
    return (
      <span className={`${base} bg-emerald-600 text-white shadow-sm shadow-emerald-600/30`}>
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
        Matrícula abierta
      </span>
    );
  }
  if (status.kind === 'date') {
    return (
      <span className={`${base} bg-mx-orange/10 text-mx-orange border border-mx-orange/30 normal-case tracking-normal font-bold`}>
        <CalendarClock size={size === 'sm' ? 11 : 13} className="shrink-0" aria-hidden="true" />
        Próxima convocatoria: {status.label}
      </span>
    );
  }
  return (
    <span className={`${base} bg-mx-text/10 text-mx-text-muted`}>
      {status.kind === 'closed' ? 'Matrícula cerrada' : 'Próximamente'}
    </span>
  );
}
