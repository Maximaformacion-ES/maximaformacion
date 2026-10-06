/**
 * Estado de matrícula de un programa.
 *
 * Fuente de verdad: los campos de Strapi `enrollmentStatus` (abierta | fecha |
 * cerrada) y `startsOn` (fecha real). Mientras un programa no tenga el estado
 * rellenado (contenido anterior a la migración), se deriva del antiguo texto
 * libre "Inicio" (`startDate`), que en producción decía literalmente
 * "Matrícula abierta" o una fecha escrita a mano.
 */
export type EnrollmentStatusValue = 'abierta' | 'fecha' | 'cerrada';

export type EnrollmentStatus =
  | { kind: 'open' }
  | { kind: 'closed' }
  | { kind: 'soon' }
  | { kind: 'date'; label: string; iso: string | null };

export interface EnrollmentSource {
  enrollmentStatus?: EnrollmentStatusValue | null;
  /** Fecha ISO (YYYY-MM-DD) de la próxima convocatoria. */
  startsOn?: string | null;
  /** Texto libre antiguo "Inicio". Solo como fallback. */
  startDate?: string | null;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/** "2026-11-02" → "2 de noviembre de 2026". Fecha civil, sin zona horaria. */
export function formatStartsOn(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}

/** Interpreta el texto libre antiguo. Se mantiene solo para el fallback. */
export function getEnrollmentStatus(startDate?: string | null): EnrollmentStatus | null {
  const raw = (startDate ?? '').trim();
  if (!raw) return null;
  const n = normalize(raw);
  if (n.includes('abierta') || n.includes('abierto') || n.includes('inmediato')) return { kind: 'open' };
  if (n.includes('cerrada') || n.includes('cerrado')) return { kind: 'closed' };
  if (n.includes('proximamente') || n.includes('pronto')) return { kind: 'soon' };
  return { kind: 'date', label: raw, iso: null };
}

/** Estado resuelto a partir de los campos del programa (nuevos y antiguo). */
export function resolveEnrollment(src: EnrollmentSource): EnrollmentStatus | null {
  switch (src.enrollmentStatus) {
    case 'abierta':
      return { kind: 'open' };
    case 'cerrada':
      return { kind: 'closed' };
    case 'fecha':
      if (src.startsOn) return { kind: 'date', label: formatStartsOn(src.startsOn), iso: src.startsOn };
      // "Con fecha" sin fecha puesta: no inventamos nada, usamos el texto si lo hay.
      return getEnrollmentStatus(src.startDate) ?? { kind: 'soon' };
    default:
      return getEnrollmentStatus(src.startDate);
  }
}

/** Texto corto equivalente (para listados y pantallas que muestran "Inicio"). */
export function enrollmentLabel(status: EnrollmentStatus | null | undefined): string | null {
  if (!status) return null;
  switch (status.kind) {
    case 'open':
      return 'Matrícula abierta';
    case 'closed':
      return 'Matrícula cerrada';
    case 'soon':
      return 'Próximamente';
    case 'date':
      return status.label;
  }
}

export const isEnrollmentOpen = (status: EnrollmentStatus | null | undefined): boolean => status?.kind === 'open';
