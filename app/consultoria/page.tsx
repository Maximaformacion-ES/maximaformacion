import type { Metadata } from 'next';
import ConsultoriaClient from './ConsultoriaClient';

export const metadata: Metadata = {
  title: 'Consultoría Bioestadística y Análisis de Datos | Máxima Consultoría',
  description:
    'Servicio de consultoría bioestadística y análisis de datos para tesis, artículos, estudios sanitarios, proyectos de investigación, encuestas y empresas. Solicita una consulta gratuita.',
  alternates: {
    canonical: '/consultoria',
  },
  openGraph: {
    title: 'Consultoría Bioestadística y Análisis de Datos | Máxima Consultoría',
    description:
      'Convierte tus datos en resultados claros, rigurosos y útiles. Especialistas en bioestadística y análisis estadístico para investigación, tesis, artículos y empresas.',
    type: 'website',
  },
};

export const revalidate = 3600;

export default function ConsultoriaPage() {
  return <ConsultoriaClient />;
}
