// Shared mapping between the `subjectArea` Strapi enum and the URL slugs used
// by /programas/area/[slug] landing pages. The megamenu, the area filter on
// /programas, and the sitemap all consume this table so adding a new area
// only requires one edit here.

export type SubjectAreaKey =
  | 'Inteligencia Artificial'
  | 'Ciencia de Datos'
  | 'Moodle / Exelearning / H5P'
  | 'Salud basada en datos'
  | 'Educación';

export interface SubjectArea {
  /** Stored value in Strapi's `subjectArea` enum. */
  key: SubjectAreaKey;
  /** URL segment for /programas/area/[slug]. */
  slug: string;
  /** Display label used in the megamenu column header. */
  label: string;
  /** <h1> for the landing page. */
  heading: string;
  /** <title> tag and OG title. */
  metaTitle: string;
  /** Meta description shown in SERPs. */
  metaDescription: string;
  /** Intro copy rendered above the program grid. */
  intro: string;
}

export const SUBJECT_AREAS: SubjectArea[] = [
  {
    key: 'Inteligencia Artificial',
    slug: 'inteligencia-artificial',
    label: 'Cursos de IA',
    heading: 'Formación en Inteligencia Artificial',
    metaTitle: 'Cursos de Inteligencia Artificial | Máxima Formación',
    metaDescription:
      'Cursos de Inteligencia Artificial aplicada a la ciencia y la empresa. Aprende a usar modelos de lenguaje, prompt engineering y agentes de IA con instructores expertos.',
    intro:
      'Programas prácticos para incorporar la IA generativa, los modelos de lenguaje y el prompt engineering al día a día profesional. Pensados para perfiles científicos, técnicos y de negocio.',
  },
  {
    key: 'Ciencia de Datos',
    slug: 'ciencia-de-datos',
    label: 'Ciencia de Datos',
    heading: 'Formación en Ciencia de Datos',
    metaTitle: 'Cursos de Ciencia de Datos con R y Python | Máxima Formación',
    metaDescription:
      'Cursos de ciencia de datos con R y Python: análisis exploratorio, regresión, series temporales, machine learning, clustering y árboles de decisión.',
    intro:
      'Itinerario completo de análisis y modelado de datos con R y Python: desde la introducción al data science hasta el machine learning aplicado.',
  },
  {
    key: 'Moodle / Exelearning / H5P',
    slug: 'moodle-elearning',
    label: 'Moodle — eXeLearning — H5P',
    heading: 'Formación en Moodle, eXeLearning y H5P',
    metaTitle: 'Cursos de Moodle, eXeLearning y H5P | Máxima Formación',
    metaDescription:
      'Cursos prácticos para docentes y administradores de plataformas e-learning: Moodle, eXeLearning y actividades interactivas H5P.',
    intro:
      'Programas orientados a docentes y responsables de plataformas e-learning que quieren diseñar cursos interactivos con Moodle, eXeLearning y H5P.',
  },
  {
    key: 'Salud basada en datos',
    slug: 'salud-basada-en-datos',
    label: 'Salud basada en datos',
    heading: 'Formación en Salud basada en datos',
    metaTitle: 'Cursos de Estadística e Investigación en Salud | Máxima Formación',
    metaDescription:
      'Cursos de estadística aplicada a la salud, metodología de investigación cualitativa y comunicación científica para profesionales sanitarios y de investigación.',
    intro:
      'Itinerario para profesionales de la salud y la investigación que quieren reforzar su base estadística, metodológica y de comunicación científica.',
  },
  {
    key: 'Educación',
    slug: 'educacion',
    label: 'Educación',
    heading: 'Formación en Educación',
    metaTitle: 'Cursos del Área de Educación | Máxima Formación',
    metaDescription:
      'Cursos del área de educación de Máxima Formación: didáctica, innovación docente y herramientas para el aula.',
    intro:
      'Programas orientados a docentes y profesionales de la educación que quieren actualizar su práctica didáctica e incorporar nuevas metodologías y herramientas.',
  },
];

export const SUBJECT_AREA_BY_SLUG = new Map(SUBJECT_AREAS.map((a) => [a.slug, a]));
export const SUBJECT_AREA_BY_KEY = new Map(SUBJECT_AREAS.map((a) => [a.key, a]));
