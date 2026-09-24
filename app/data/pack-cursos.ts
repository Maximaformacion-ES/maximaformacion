// Pack de 3 Cursos Universitarios (UCAV) — datos estáticos.
//
// Estos cursos NO existen todavía en Strapi ni en el campus: son estudios
// propios de la UCAV en fase de lanzamiento (inicio previsto: octubre 2026,
// según los anexos de solicitud). La página /pack-cursos-universitarios y la
// ficha del SAAC (/programas/atencion-educativa-saac, programa de Strapi)
// cobran por Stripe sin crear matrícula; el acceso se asigna después desde el
// admin.
// Fuente del temario: ANEXO_CU_*.docx (solicitud de aprobación UCAV, jul-2026).
//
// Precios (sep-2026, cambio pedido por el cliente): ya NO es un 3×2. Cada curso
// tiene su precio (95 € los de IA, 195 € el de Atención Educativa y SAAC, que
// sube a 6 ECTS / 150 h) y el pack con los tres vale 290 € (385 € sueltos, ahorro de 95 €).

export const PACK_ITEM_ID = 'pack';
export const PACK_PRICE = 290;
export const PACK_TITLE = 'Pack 3 Cursos Universitarios en Innovación Docente';
/** Landing del pack (también es la página a la que vuelve Stripe al cancelar). */
export const PACK_PATH = '/pack-cursos-universitarios';

export interface PackCourse {
  id: string;
  title: string;
  /** Versión corta del título para piezas compactas (mini-cards, menús). */
  shortTitle: string;
  /** Denominación exacta del certificado UCAV. */
  certificate: string;
  summary: string;
  ects: number;
  hours: number;
  /** Precio del curso suelto (€). */
  price: number;
  modules: string[];
  /** Contenido teórico/práctico por módulo (del anexo UCAV); alimenta la ficha individual. */
  moduleDetails?: { title: string; theory: string; practice: string }[];
  /** Portada (webp optimizado en public/pack/); opcional hasta tenerlas todas. */
  image?: string;
  /** Ficha individual en /programas: el programa existe EN STRAPI (el cliente
   *  edita título, descripción, temario, pestañas, FAQ… desde el admin) con
   *  este slug. Lo único que aporta este fichero es el vínculo curso↔item de
   *  compra: /programas/[id] detecta el slug y cobra sin cuenta por
   *  /api/pack/checkout. Alta inicial: scripts/seed-saac-program.mjs. */
  ficha?: { slug: string };
}

export const PACK_COURSES: PackCourse[] = [
  {
    id: 'ia-exelearning',
    title: 'Inteligencia Artificial y eXeLearning: Crea Recursos Educativos Interactivos en Tiempo Récord',
    shortTitle: 'Inteligencia Artificial y eXeLearning',
    certificate:
      'Curso Universitario en Inteligencia Artificial y eXeLearning: Crea Recursos Educativos Interactivos en Tiempo Récord',
    summary:
      'Aprende a combinar la IA generativa con eXeLearning para diseñar y publicar recursos educativos completos: desde la ingeniería de prompts hasta la creación automática de contenidos, actividades y evaluaciones.',
    ects: 4,
    hours: 100,
    price: 95,
    image: '/pack/portada-ia-exelearning.webp',
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
    shortTitle: 'H5P e Inteligencia Artificial',
    certificate:
      'Curso Universitario en H5P e Inteligencia Artificial: Diseña Actividades Interactivas para Moodle en Minutos',
    summary:
      'Crea actividades interactivas, vídeos enriquecidos, gamificación y escenarios ramificados con H5P asistido por IA, e intégralo todo en Moodle: de la idea a la actividad publicada en minutos.',
    ects: 4,
    hours: 100,
    price: 95,
    image: '/pack/portada-h5p-ia.webp',
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
    shortTitle: 'Atención Educativa y SAAC',
    certificate:
      'Curso Universitario en Atención Educativa al Alumnado con Discapacidad Motora y Sistemas Aumentativos y Alternativos de Comunicación (SAAC)',
    summary:
      'Da una respuesta educativa real al alumnado con discapacidad motora: evaluación psicopedagógica, tecnologías de apoyo, sistemas aumentativos y alternativos de comunicación (SAAC) y diseño de situaciones de aprendizaje inclusivas.',
    // Ampliado a 6 ECTS / 150 h (sep-2026): es el curso que se pide para una
    // plaza de profesorado recién convocada; los 10 módulos ganan contenido.
    ects: 6,
    hours: 150,
    price: 195,
    image: '/pack/portada-atencion-educativa-saac.webp',
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
    moduleDetails: [
      {
        title: 'Educación Inclusiva y Atención a la Diversidad',
        theory: 'Evolución de la educación inclusiva, normativa, NEAE, barreras para el aprendizaje, principios del DUA y accesibilidad educativa.',
        practice: 'Análisis de un caso de inclusión educativa e identificación de barreras y propuestas de mejora en un centro educativo.',
      },
      {
        title: 'Discapacidad Motora: Conceptualización y Características',
        theory: 'Concepto, clasificación, etiología, características del alumnado con discapacidad motora, implicaciones educativas y necesidades de apoyo.',
        practice: 'Análisis de perfiles de alumnado con distintas discapacidades motoras y detección de necesidades educativas.',
      },
      {
        title: 'Evaluación Psicopedagógica y Detección de Necesidades',
        theory: 'Evaluación psicopedagógica, identificación de necesidades, informes, coordinación con equipos de orientación y toma de decisiones educativas.',
        practice: 'Interpretación de un informe psicopedagógico y elaboración de propuestas de intervención educativa.',
      },
      {
        title: 'Respuesta Educativa al Alumnado con Discapacidad Motora',
        theory: 'Adaptaciones de acceso al currículo, adaptaciones curriculares, metodologías inclusivas, organización del aula y recursos personales.',
        practice: 'Diseño de adaptaciones para un alumno con parálisis cerebral.',
      },
      {
        title: 'Tecnologías de Apoyo y Accesibilidad',
        theory: 'Tecnologías y productos de apoyo, accesibilidad digital, herramientas TIC, legislación sobre accesibilidad y recursos tecnológicos.',
        practice: 'Evaluación y selección de tecnologías de apoyo para diferentes perfiles de alumnado.',
      },
      {
        title: 'Sistemas Aumentativos y Alternativos de Comunicación (SAAC)',
        theory: 'Comunicación, lenguaje y habla, fundamentos de los SAAC, clasificación, criterios de selección y principios de intervención.',
        practice: 'Identificación del SAAC más adecuado según diferentes perfiles de alumnado.',
      },
      {
        title: 'Sistemas Pictográficos y Comunicación Visual',
        theory: 'Comunicación visual, ARASAAC, SPC, agendas visuales, secuencias, lectura fácil y diseño de materiales accesibles.',
        practice: 'Selección de un SAAC adecuado y diseño de un tablero de comunicación para un caso real.',
      },
      {
        title: 'Comunicadores y Recursos Tecnológicos para SAAC',
        theory: 'Comunicadores dinámicos, aplicaciones móviles, sistemas de acceso alternativo, seguimiento ocular, pulsadores y dispositivos específicos.',
        practice: 'Diseño de un comunicador adaptado utilizando recursos tecnológicos disponibles.',
      },
      {
        title: 'Implementación Educativa de los SAAC',
        theory: 'Estrategias de intervención, modelado, comunicación funcional, inclusión comunicativa, coordinación con familias y seguimiento del alumnado.',
        practice: 'Planificación de una intervención educativa mediante SAAC en un contexto escolar.',
      },
      {
        title: 'Buenas Prácticas Inclusivas y Diseño de Situaciones de Aprendizaje',
        theory: 'Buenas prácticas inclusivas, coordinación interdisciplinar, DUA, planificación didáctica inclusiva y evaluación del alumnado.',
        practice: 'Diseño de una situación de aprendizaje inclusiva para un alumno con discapacidad motora incorporando adaptaciones y un SAAC.',
      },
    ],
    ficha: { slug: 'atencion-educativa-saac' },
  },
];

/** Suma de los cursos sueltos (referencia tachada junto al precio del pack). */
export const PACK_INDIVIDUAL_TOTAL = PACK_COURSES.reduce((sum, c) => sum + c.price, 0);
export const PACK_SAVINGS = PACK_INDIVIDUAL_TOTAL - PACK_PRICE;
export const PACK_TOTAL_ECTS = PACK_COURSES.reduce((sum, c) => sum + c.ects, 0);
export const PACK_TOTAL_HOURS = PACK_COURSES.reduce((sum, c) => sum + c.hours, 0);

export function getPackCourse(id: string): PackCourse | undefined {
  return PACK_COURSES.find((c) => c.id === id);
}

/** Título mostrado en Stripe/emails para un item comprable ('pack' o curso). */
export function packItemTitle(item: string): string | undefined {
  if (item === PACK_ITEM_ID) return PACK_TITLE;
  return getPackCourse(item)?.title;
}

/** Precio (€) de un item comprable ('pack' o id de curso). */
export function packItemPrice(item: string): number | undefined {
  if (item === PACK_ITEM_ID) return PACK_PRICE;
  return getPackCourse(item)?.price;
}

/** ECTS de un item comprable ('pack' o id de curso). */
export function packItemEcts(item: string): number | undefined {
  if (item === PACK_ITEM_ID) return PACK_TOTAL_ECTS;
  return getPackCourse(item)?.ects;
}

/** Ruta de la ficha individual de un curso del pack (solo si la tiene). */
export function courseFichaPath(course: Pick<PackCourse, 'ficha'>): string | undefined {
  return course.ficha ? `/programas/${course.ficha.slug}` : undefined;
}

/** Páginas desde las que se compra (y a las que vuelve Stripe si se cancela). */
export function packReturnPaths(): string[] {
  return [PACK_PATH, ...PACK_COURSES.map(courseFichaPath).filter((p): p is string => !!p)];
}

/** Curso del pack por el slug de su ficha en /programas. */
export function getPackCourseByFichaSlug(slug: string): PackCourse | undefined {
  return PACK_COURSES.find((c) => c.ficha?.slug === slug);
}
