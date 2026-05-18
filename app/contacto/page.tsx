import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contacto | Máxima Formación',
  description: 'Contacta con Máxima Formación. Resuelve dudas sobre nuestras formaciones online en ciencia de datos, IA, salud o Moodle, o consulta sobre programas a medida para empresas.',
  alternates: { canonical: '/contacto' },
};

export default function ContactoPage() {
  return <ContactClient />;
}
