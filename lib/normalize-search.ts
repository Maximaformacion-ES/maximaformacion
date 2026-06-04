/**
 * Normaliza un texto para búsqueda insensible a mayúsculas y a tildes/acentos,
 * de modo que "estadistica" encuentre "Estadística", "analisis" → "Análisis", etc.
 *
 * NFD descompone cada carácter acentuado en su base + marca diacrítica combinante
 * (p. ej. "á" -> "a" + U+0301); luego eliminamos esas marcas (rango U+0300-U+036F).
 * Hay que aplicarlo a AMBOS lados (término buscado y texto indexado) para que
 * funcione con y sin tildes.
 */
export function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}
