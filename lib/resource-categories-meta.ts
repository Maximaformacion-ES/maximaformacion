// SEO metadata for /recursos/categoria/[slug] landing pages. Same structure as
// lib/blog-categories-meta.ts so editors can extend either table without
// touching the rendering code.

import type { ResourceCategory } from './strapi/types';

export interface ResourceCategoryMeta {
  /** Value stored in Strapi's Resource.category enum. */
  key: ResourceCategory;
  /** URL segment for /recursos/categoria/[slug]. */
  slug: string;
  /** Filter chip label. */
  label: string;
  /** <h1> for the landing page. */
  heading: string;
  /** <title> tag and OG title. */
  metaTitle: string;
  /** Meta description shown in SERPs. */
  metaDescription: string;
  /** Intro copy rendered above the resource grid. */
  intro: string;
}

// 'Otros' is intentionally excluded — landings should only exist for
// categories with clear search intent.
export const RESOURCE_CATEGORIES_META: ResourceCategoryMeta[] = [
  {
    key: 'Guías rápidas',
    slug: 'guias-rapidas',
    label: 'Guías rápidas',
    heading: 'Guías rápidas',
    metaTitle: 'Guías rápidas descargables | Recursos Máxima Formación',
    metaDescription:
      'Guías PDF descargables con resúmenes prácticos de estadística, R, ciencia de datos y formación online. Material directo al grano para consultar en tu día a día.',
    intro:
      'Resúmenes PDF prácticos para tener a mano. Apuntes condensados, hojas de referencia y guías rápidas para resolver dudas concretas sin perder tiempo.',
  },
  {
    key: 'TFM',
    slug: 'tfm',
    label: 'Trabajos de investigación',
    heading: 'Trabajos Fin de Máster',
    metaTitle: 'TFM publicados — Trabajos Fin de Máster | Máxima Formación',
    metaDescription:
      'Trabajos Fin de Máster publicados por alumnado de Máxima Formación: investigaciones aplicadas en estadística, ciencia de datos y salud basada en datos.',
    intro:
      'Una selección de TFM y trabajos de investigación realizados por alumnado de nuestros másters. Investigaciones aplicadas en estadística, ciencia de datos y salud.',
  },
  {
    key: 'Tutoriales',
    slug: 'tutoriales',
    label: 'Tutoriales',
    heading: 'Tutoriales paso a paso',
    metaTitle: 'Tutoriales de estadística, R y Data Science | Máxima Formación',
    metaDescription:
      'Tutoriales prácticos paso a paso para aprender estadística, R, Python y ciencia de datos. Con código reproducible y ejemplos reales.',
    intro:
      'Tutoriales prácticos para llevar tu conocimiento al teclado: ejemplos reproducibles con código, datos y explicación detallada.',
  },
  {
    key: 'Infografías',
    slug: 'infografias',
    label: 'Infografías',
    heading: 'Infografías',
    metaTitle: 'Infografías de estadística y ciencia de datos | Máxima Formación',
    metaDescription:
      'Infografías visuales para entender conceptos de estadística, ciencia de datos y formación online de un vistazo. Material gráfico descargable.',
    intro:
      'Conceptos clave explicados en una sola imagen. Material visual para entender estadística, ciencia de datos y formación online de un vistazo.',
  },
  {
    key: 'E-books',
    slug: 'e-books',
    label: 'E-books',
    heading: 'E-books',
    metaTitle: 'E-books gratuitos sobre estadística y data science | Máxima Formación',
    metaDescription:
      'E-books descargables gratis sobre estadística aplicada, R, Python, ciencia de datos y metodología de investigación.',
    intro:
      'Materiales largos para profundizar: e-books descargables sobre estadística, ciencia de datos y metodología de investigación.',
  },
  {
    key: 'Casos de éxito',
    slug: 'casos-de-exito',
    label: 'Casos de éxito',
    heading: 'Casos de éxito',
    metaTitle: 'Casos de éxito de alumnado | Máxima Formación',
    metaDescription:
      'Historias y materiales de alumnos y alumnas que han aplicado lo aprendido en proyectos reales después de formarse con nosotros.',
    intro:
      'Historias y materiales reales de alumnos y alumnas que han llevado lo aprendido a proyectos profesionales en el mundo real.',
  },
];

export const RESOURCE_CATEGORY_BY_SLUG = new Map(
  RESOURCE_CATEGORIES_META.map((c) => [c.slug, c])
);
export const RESOURCE_CATEGORY_BY_KEY = new Map(
  RESOURCE_CATEGORIES_META.map((c) => [c.key, c])
);
