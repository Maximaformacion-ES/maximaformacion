import type { MaxymiaHomeData } from '@/lib/strapi/types';

export const MAXYMIA_HOME_FALLBACK: MaxymiaHomeData = {
  hero: {
    overline: 'Campus Virtual de IA',
    title: 'DOMINA LA <br /> <span class="text-mx-orange">IA APLICADA</span> <br /> A CIENCIAS',
    description:
      'El campus virtual de Máxima Formación donde la inteligencia artificial se encuentra con la investigación científica. Cursos especializados para profesionales que quieren liderar el futuro.',
  },
  whatIsSection: {
    overline: 'Qué es Maxymia',
    title: 'DONDE LA CIENCIA <br /> <span class="text-mx-orange">ABRAZA LA IA</span>',
    description:
      'Maxymia es el campus virtual de Máxima Formación dedicado exclusivamente a la inteligencia artificial aplicada a disciplinas científicas. Aquí no encontrarás cursos genéricos: cada programa está diseñado por investigadores y científicos en activo.',
    cards: [
      {
        title: 'Mentorías Personalizadas',
        description:
          'Accede a sesiones 1:1 con investigadores y científicos de datos que aplican IA en su día a día profesional.',
        image: '',
      },
      {
        title: 'Certificación Profesional',
        description:
          'Obtén certificaciones reconocidas en el sector científico y tecnológico, avaladas por Máxima Formación y con validez internacional.',
        image: '',
      },
      {
        title: 'Labs Prácticos',
        description:
          'Laboratorios virtuales con datasets reales, entornos preconfigurados y proyectos de investigación aplicada en la nube.',
        image: '',
      },
      {
        title: 'Rutas de Aprendizaje',
        description:
          'Itinerarios completos por especialidad: bioinformática, química computacional, diagnóstico médico y muchas más.',
        image: '',
      },
    ],
  },
  coursesSection: {
    overline: 'Destacados',
    title: 'CURSOS {POPULARES}',
    description: 'Formación diseñada por científicos, para científicos. IA aplicada a problemas reales.',
  },
  whyMaxymia: {
    overline: 'Por qué elegir Maxymia',
    title: 'NO ES FORMACIÓN GENÉRICA',
    description:
      'Maxymia está diseñado específicamente para profesionales de ciencias que necesitan dominar la IA aplicada a su campo.',
    cards: [
      {
        title: 'Datasets Científicos Reales',
        description:
          'Trabaja con datos reales de investigaciones publicadas: secuencias genómicas, imágenes médicas, datos moleculares y registros clínicos.',
        image: '',
      },
      {
        title: 'Mentores Investigadores',
        description:
          'Aprende directamente de científicos e investigadores que publican papers y trabajan en proyectos reales de I+D+i.',
        image: '',
      },
      {
        title: 'Entornos Cloud Preconfigurados',
        description:
          'Accede a laboratorios virtuales con GPU, entornos Jupyter y herramientas de análisis listas para usar sin configuración.',
        image: '',
      },
      {
        title: 'Comunidad Científica Activa',
        description:
          'Conecta con una red de profesionales de ciencias aplicadas: comparte conocimiento, colabora en proyectos y crece profesionalmente.',
        image: '',
      },
    ],
  },
  ctaSection: {
    overline: 'Empieza ahora',
    title: '¿LISTO PARA TRANSFORMAR <br /> <span class="text-mx-orange">TU INVESTIGACIÓN</span> <br /> CON IA?',
    description:
      'Accede ahora al campus virtual. Explora nuestro catálogo completo de cursos, inscríbete en una ruta de aprendizaje y únete a una comunidad de científicos que ya están aplicando inteligencia artificial.',
    logo: '/logo-completo.webp',
  },
};
