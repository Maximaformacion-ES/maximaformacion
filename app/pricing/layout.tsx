import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planes y Precios | Máxima Formación',
  description: 'Descubre los planes y precios de Máxima Formación. Elige entre el plan gratuito o Pro para acceder a todos los cursos y recursos premium.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
