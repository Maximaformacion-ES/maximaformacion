import type { HomeData } from '@/lib/strapi/types';

export const HOME_FALLBACK: HomeData = {
  heroOverline: 'Formación Profesional experta',
  heroTitle: 'TRANSFORMA {TU FUTURO}',
  heroDescription: 'Formación especializada que impulsa tu carrera profesional al siguiente nivel',
  numericSection: {
    students: '15K+',
    bussiness: '200+',
    activePrograms: '150+',
    mediaRating: '4.9',
  },
  programsSection: {
    programsOverline: 'Programas Destacados',
    programsTitle: 'MÁSTERS & {ESPECIALIZACIONES}',
  },
  partnersSection: {
    partnersOverline: 'Partners',
    partnersTitle: 'Confían en nosotros',
    partnersLogos: [],
    partnersDescription:
      'Más de 200 empresas e instituciones han elegido nuestra formación para impulsar el talento de sus equipos',
  },
  testimonialsSection: {
    testimonialsOverline: 'Lo que dice nuestro alumnado',
    testimonialsTitle: 'HISTORIAS {DE ÉXITO}',
    testimonials: [
      {
        text: 'El máster en Marketing Digital transformó completamente mi carrera. En 6 meses pasé de junior a liderar el equipo de growth de una startup.',
        name: 'María García',
        role: 'Head of Growth @ TechStartup',
      },
      {
        text: 'La metodología práctica y los profesores en activo hacen que cada clase sea aplicable directamente a tu trabajo del día a día.',
        name: 'Carlos Rodríguez',
        role: 'Data Scientist @ FinTech Corp',
      },
      {
        text: 'Después del bootcamp de desarrollo, conseguí trabajo en menos de un mes. La bolsa de empleo de Maxima es increíble.',
        name: 'Laura Martínez',
        role: 'Full Stack Developer @ AgencyX',
      },
    ],
  },
  badgesSection: {
    badgesOverline: 'Certificaciones y reconocimientos',
    badgesTitle: 'CALIDAD {ACREDITADA}',
    badgesDescription:
      'Contamos con certificaciones ISO 9001, ISO 14001 e ISO 27001, el sello Cum Laude de Emagister desde 2018 y una valoración de 5.0 en Google con más de 120 reseñas.',
  },
  faqSection: {
    faqOverline: 'Resolvemos tus dudas',
    faqTitle: 'PREGUNTAS {FRECUENTES}',
    faqDescription: '',
    faqs: [
      {
        question: '¿Qué metodología de enseñanza utilizáis?',
        answer:
          'Combinamos teoría con práctica real a través de proyectos, casos de estudio y mentorías con profesionales en activo. Nuestro enfoque es 100% aplicable al entorno laboral actual.',
      },
      {
        question: '¿Los programas son online o presenciales?',
        answer:
          'Ofrecemos modalidad online con clases en directo y acceso a grabaciones. Esto te permite estudiar a tu ritmo desde cualquier lugar, sin renunciar a la interacción con profesores y compañeros.',
      },
      {
        question: '¿Qué titulación obtendré al finalizar?',
        answer:
          'Al completar el programa recibirás un título propio de Máxima Formación, avalado por nuestros partners académicos y reconocido por empresas del sector.',
      },
      {
        question: '¿Ofrecéis bolsa de empleo o prácticas?',
        answer:
          'Sí, contamos con una bolsa de empleo activa y acuerdos con empresas colaboradoras. Además, ofrecemos orientación profesional personalizada y sesiones de preparación para entrevistas.',
      },
      {
        question: '¿Puedo financiar mi formación?',
        answer:
          'Disponemos de opciones de financiación flexible y planes de pago fraccionado. Contacta con nuestro equipo de asesores para encontrar la opción que mejor se adapte a ti.',
      },
      {
        question: '¿Necesito conocimientos previos para inscribirme?',
        answer:
          'Depende del programa. Algunos están diseñados para principiantes mientras que otros requieren una base previa. En la ficha de cada programa encontrarás los requisitos específicos.',
      },
    ],
  },
  ctaSection: {
    ctaOverline: '¿Listo para empezar?',
    ctaTitle: 'TU PRÓXIMO {CAPÍTULO} EMPIEZA HOY',
    ctaDescription:
      'Habla con nuestro equipo de asesores académicos y encuentra el programa perfecto para tus objetivos profesionales.',
  },
};
