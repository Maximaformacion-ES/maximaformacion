import type { HomeData } from '@/lib/strapi/types';

export const HOME_FALLBACK: HomeData = {
  heroOverline: 'Formación Profesional experta',
  heroTitle: 'TRANSFORMA {TU FUTURO}',
  heroDescription: 'Formación especializada que impulsa tu carrera profesional al siguiente nivel',
  numericSection: {
    students: '15K+',
    bussiness: '50+',
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
      'Más de 50 empresas e instituciones han elegido nuestra formación para impulsar el talento de sus equipos',
  },
  testimonialsSection: {
    testimonialsOverline: 'Lo que dicen nuestros alumnos',
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
  ctaSection: {
    ctaOverline: '¿Listo para empezar?',
    ctaTitle: 'TU PRÓXIMO {CAPÍTULO} EMPIEZA HOY',
    ctaDescription:
      'Habla con nuestro equipo de asesores académicos y encuentra el programa perfecto para tus objetivos profesionales.',
  },
};
