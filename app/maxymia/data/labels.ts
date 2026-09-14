import type { Locale } from '../types';

/** Etiquetas legibles de categoría y nivel de los cursos Maxymia (es/en). */
export const MAXYMIA_CATEGORY_LABELS: Record<string, Record<Locale, string>> = {
  ia: { es: 'Inteligencia Artificial', en: 'Artificial Intelligence' },
  'data-science': { es: 'Data Science', en: 'Data Science' },
  'machine-learning': { es: 'Machine Learning', en: 'Machine Learning' },
  nlp: { es: 'Procesamiento del Lenguaje', en: 'Language Processing' },
  'computer-vision': { es: 'Visión por Computador', en: 'Computer Vision' },
};

export const MAXYMIA_LEVEL_LABELS: Record<string, Record<Locale, string>> = {
  beginner: { es: 'Principiante', en: 'Beginner' },
  intermediate: { es: 'Intermedio', en: 'Intermediate' },
  advanced: { es: 'Avanzado', en: 'Advanced' },
};

/** Etiqueta de categoría tolerante con la clave ('data_science', 'Data-Science'…). */
export function maxymiaCategoryLabel(category: string | undefined | null, locale: Locale): string {
  if (!category) return '';
  const key = category.toLowerCase().replace(/[_\s]+/g, '-');
  return MAXYMIA_CATEGORY_LABELS[key]?.[locale] ?? category.replace(/[_-]+/g, ' ');
}
