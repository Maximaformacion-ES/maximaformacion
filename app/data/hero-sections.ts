import type { HeroSection } from '@/lib/strapi/types';

// Fallback data for hero sections when Strapi is unavailable

export const CONOCENOS_HERO_FALLBACK: HeroSection = {
  heroImage: 'us.webp',
  heroOverline: 'MÁXIMA FORMACIÓN',
  heroTitle: 'CONÓCENOS',
  heroDescription: '',
};

export const CONSULTORIA_HERO_FALLBACK: HeroSection = {
  heroImage: 'about-us.webp',
  heroOverline: 'EL ANÁLISIS DE DATOS AL SERVICIO DE TU NEGOCIO',
  heroTitle: 'Consultoría estadística para empresas e instituciones',
  heroDescription: 'Basa en datos tu toma de decisiones con el máximo acierto',
};

export const INNOVACION_HERO_FALLBACK: HeroSection = {
  heroImage: 'light.webp',
  heroOverline: 'BIOMÁXIMA INNOVACIÓN',
  heroTitle: 'Convertimos tecnología en calidad de vida',
  heroDescription: 'Soluciones tecnológicas avanzadas en ciencia, salud y medicina',
};
