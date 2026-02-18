import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto | Máxima Formación',
  description: 'Contacta con Máxima Formación. Estamos aquí para resolver tus dudas sobre formación, consultoría e innovación. Respuesta en menos de 24 horas.',
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
