// SEO metadata for /blog/categoria/[slug] landing pages. Lives apart from
// lib/blog-categories.ts (which holds visual styles) so the SEO table can be
// edited without touching styling concerns.

import type { BlogCategory } from './strapi/types';

export interface BlogCategoryMeta {
  /** Value stored in Strapi's BlogPost.category enum. */
  key: BlogCategory;
  /** URL segment for /blog/categoria/[slug]. */
  slug: string;
  /** Filter chip label in /blog. */
  label: string;
  /** <h1> for the landing page. */
  heading: string;
  /** <title> tag and OG title. */
  metaTitle: string;
  /** Meta description shown in SERPs. */
  metaDescription: string;
  /** Intro copy rendered above the post grid. */
  intro: string;
}

// 'General' is intentionally excluded — landings should only exist for
// categories with clear search intent.
export const BLOG_CATEGORIES_META: BlogCategoryMeta[] = [
  {
    key: 'Estadística',
    slug: 'estadistica',
    label: 'Estadística',
    heading: 'Artículos de Estadística',
    metaTitle: 'Artículos de Estadística | Blog Máxima Formación',
    metaDescription:
      'Artículos sobre estadística aplicada: inferencia, regresión, series temporales, análisis multivariante y diseño experimental con casos prácticos.',
    intro:
      'Guías y casos prácticos de estadística aplicada a la investigación, la ciencia de datos y la toma de decisiones. Inferencia, regresión, series temporales y diseño experimental.',
  },
  {
    key: 'Data Science',
    slug: 'data-science',
    label: 'Data Science',
    heading: 'Artículos de Data Science',
    metaTitle: 'Artículos de Data Science y Machine Learning | Blog Máxima Formación',
    metaDescription:
      'Artículos sobre ciencia de datos y machine learning: pipelines, clustering, modelos predictivos y aplicación en proyectos reales.',
    intro:
      'Pipelines de datos, machine learning, modelos predictivos y aplicaciones reales contadas por profesionales que trabajan en el sector.',
  },
  {
    key: 'R Software',
    slug: 'r-software',
    label: 'R Software',
    heading: 'Artículos sobre R y RStudio',
    metaTitle: 'Artículos sobre R y RStudio | Blog Máxima Formación',
    metaDescription:
      'Tutoriales y trucos de R, RStudio y RMarkdown: tidyverse, ggplot2, modelos estadísticos y reproducibilidad de análisis.',
    intro:
      'Tutoriales y consejos prácticos para programar análisis estadísticos reproducibles con R, RStudio y el ecosistema tidyverse.',
  },
  {
    key: 'Formación',
    slug: 'formacion',
    label: 'Formación',
    heading: 'Recursos sobre Formación',
    metaTitle: 'Artículos sobre Formación Online y Aprendizaje | Blog Máxima Formación',
    metaDescription:
      'Reflexiones y guías sobre formación profesional online, metodología de aprendizaje, certificaciones y diseño de cursos.',
    intro:
      'Cómo aprender mejor y elegir una formación con sentido: metodologías, certificaciones, diseño instruccional y aprendizaje continuo.',
  },
  {
    key: 'Casos de Éxito',
    slug: 'casos-de-exito',
    label: 'Casos de Éxito',
    heading: 'Casos de Éxito',
    metaTitle: 'Casos de Éxito de alumnos y alumnas | Blog Máxima Formación',
    metaDescription:
      'Historias de alumnos y alumnas que han transformado su carrera gracias a nuestras formaciones en ciencia de datos, IA y estadística.',
    intro:
      'Historias reales de alumnos y alumnas que han transformado su trayectoria profesional con nuestras formaciones.',
  },
  {
    key: 'Experiencias reales',
    slug: 'experiencias-reales',
    label: 'Experiencias reales',
    heading: 'Experiencias reales del aula',
    metaTitle: 'Experiencias reales en el aula | Blog Máxima Formación',
    metaDescription:
      'Reflexiones del equipo docente y de alumnado sobre cómo se viven nuestras formaciones por dentro y qué se aprende en el camino.',
    intro:
      'Lo que ocurre dentro de un programa más allá del temario: reflexiones del equipo docente y de alumnado sobre cómo se aprende en Máxima Formación.',
  },
];

export const BLOG_CATEGORY_BY_SLUG = new Map(
  BLOG_CATEGORIES_META.map((c) => [c.slug, c])
);
export const BLOG_CATEGORY_BY_KEY = new Map(
  BLOG_CATEGORIES_META.map((c) => [c.key, c])
);
