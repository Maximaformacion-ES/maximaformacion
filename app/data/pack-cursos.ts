// Pack de 3 Cursos Universitarios (UCAV) — datos estáticos.
//
// Estos cursos NO existen todavía en Strapi ni en el campus: son estudios
// propios de la UCAV en fase de lanzamiento (inicio previsto: octubre 2026,
// según los anexos de solicitud). La página /pack-cursos-universitarios cobra
// por Stripe sin crear matrícula; el acceso se asigna después desde el admin.
// Fuente del temario: ANEXO_CU_*.docx (solicitud de aprobación UCAV, jul-2026).

export const PACK_ITEM_ID = 'pack';
export const PACK_PRICE = 190;
export const COURSE_PRICE = 95;
export const PACK_TITLE = 'Pack 3 Cursos Universitarios en Innovación Docente';

export interface PackCourse {
  id: string;
  title: string;
  /** Denominación exacta del certificado UCAV. */
  certificate: string;
  summary: string;
  ects: number;
  hours: number;
  modules: string[];
}

export const PACK_COURSES: PackCourse[] = [
  {
    id: 'ia-exelearning',
    title: 'Inteligencia Artificial y eXeLearning: Crea Recursos Educativos Interactivos en Tiempo Récord',
    certificate:
      'Curso Universitario en Inteligencia Artificial y eXeLearning: Crea Recursos Educativos Interactivos en Tiempo Récord',
    summary:
      'Aprende a combinar la IA generativa con eXeLearning para diseñar y publicar recursos educativos completos: desde la ingeniería de prompts hasta la creación automática de contenidos, actividades y evaluaciones.',
    ects: 4,
    hours: 100,
    modules: [
      'Inteligencia Artificial aplicada a la creación de contenidos educativos',
      'Ingeniería de Prompts para docentes',
      'Diseño didáctico mediante Inteligencia Artificial',
      'Creación automática de contenidos educativos',
      'Creación de recursos multimedia mediante IA',
      'Creación automática de actividades y evaluación',
      'Integración de la Inteligencia Artificial en eXeLearning',
      'Automatización del trabajo docente mediante IA',
      'Desarrollo de un proyecto educativo completo',
      'Calidad, accesibilidad y futuro de la IA en educación',
    ],
  },
  {
    id: 'h5p-ia',
    title: 'H5P e Inteligencia Artificial: Diseña Actividades Interactivas para Moodle en Minutos',
    certificate:
      'Curso Universitario en H5P e Inteligencia Artificial: Diseña Actividades Interactivas para Moodle en Minutos',
    summary:
      'Crea actividades interactivas, vídeos enriquecidos, gamificación y escenarios ramificados con H5P asistido por IA, e intégralo todo en Moodle: de la idea a la actividad publicada en minutos.',
    ects: 4,
    hours: 100,
    modules: [
      'H5P y la Inteligencia Artificial aplicada a la educación',
      'Ingeniería de Prompts para la creación de actividades H5P',
      'Creación de actividades de evaluación con H5P e Inteligencia Artificial',
      'Diseño de vídeos interactivos asistidos por Inteligencia Artificial',
      'Desarrollo de contenidos multimedia interactivos',
      'Gamificación con H5P e Inteligencia Artificial',
      'Escenarios ramificados y aprendizaje personalizado',
      'Automatización de la creación de actividades educativas',
      'Integración de H5P en Moodle',
      'Diseño de una unidad didáctica interactiva con H5P e Inteligencia Artificial',
    ],
  },
  {
    id: 'atencion-educativa-saac',
    title:
      'Atención Educativa al Alumnado con Discapacidad Motora y Sistemas Aumentativos y Alternativos de Comunicación (SAAC)',
    certificate:
      'Curso Universitario en Atención Educativa al Alumnado con Discapacidad Motora y Sistemas Aumentativos y Alternativos de Comunicación (SAAC)',
    summary:
      'Da una respuesta educativa real al alumnado con discapacidad motora: evaluación psicopedagógica, tecnologías de apoyo, sistemas aumentativos y alternativos de comunicación (SAAC) y diseño de situaciones de aprendizaje inclusivas.',
    ects: 4,
    hours: 100,
    modules: [
      'Educación Inclusiva y Atención a la Diversidad',
      'Discapacidad Motora: Conceptualización y Características',
      'Evaluación Psicopedagógica y Detección de Necesidades',
      'Respuesta Educativa al Alumnado con Discapacidad Motora',
      'Tecnologías de Apoyo y Accesibilidad',
      'Sistemas Aumentativos y Alternativos de Comunicación (SAAC)',
      'Sistemas Pictográficos y Comunicación Visual',
      'Comunicadores y Recursos Tecnológicos para SAAC',
      'Implementación Educativa de los SAAC',
      'Buenas Prácticas Inclusivas y Diseño de Situaciones de Aprendizaje',
    ],
  },
];

export function getPackCourse(id: string): PackCourse | undefined {
  return PACK_COURSES.find((c) => c.id === id);
}

/** Título mostrado en Stripe/emails para un item comprable ('pack' o curso). */
export function packItemTitle(item: string): string | undefined {
  if (item === PACK_ITEM_ID) return PACK_TITLE;
  return getPackCourse(item)?.title;
}
