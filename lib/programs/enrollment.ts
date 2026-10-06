/**
 * Estado de matrícula de un programa, derivado del campo de texto libre
 * `startDate` de Strapi ("Inicio"). En producción casi todos los programas
 * llevan literalmente "Matrícula abierta"; el resto, una fecha en texto.
 *
 * Se deriva aquí (y no con un enum nuevo en el CMS) para que funcione con el
 * contenido que ya existe, sin migrar nada. Si algún día se añade un campo
 * de estado real, este módulo es el único sitio que hay que tocar.
 */
export type EnrollmentStatus =
  | { kind: 'open' }
  | { kind: 'soon' }
  | { kind: 'date'; label: string };

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

export function getEnrollmentStatus(startDate?: string | null): EnrollmentStatus | null {
  const raw = (startDate ?? '').trim();
  if (!raw) return null;
  const n = normalize(raw);
  if (n.includes('abierta') || n.includes('abierto') || n === 'ya' || n.includes('inmediato')) return { kind: 'open' };
  if (n.includes('proximamente') || n.includes('pronto')) return { kind: 'soon' };
  return { kind: 'date', label: raw };
}

export const isEnrollmentOpen = (startDate?: string | null): boolean =>
  getEnrollmentStatus(startDate)?.kind === 'open';
