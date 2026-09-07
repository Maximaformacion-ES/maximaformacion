import type { Metadata } from 'next';
import PackClient from './PackClient';

export const metadata: Metadata = {
  title: 'Pack 3 Cursos Universitarios en Innovación Docente | Máxima Formación',
  description:
    'Tres Cursos Universitarios (4 ECTS cada uno, 12 ECTS en total): IA y eXeLearning, H5P e IA para Moodle, y Atención Educativa al alumnado con discapacidad motora y SAAC. Pack completo por 190 € o 95 € por curso.',
  alternates: { canonical: '/pack-cursos-universitarios' },
};

export default function PackCursosPage() {
  return <PackClient />;
}
