import type { Metadata } from 'next';
import { getTeacherBySlug } from '@/lib/strapi/queries';
import type { Docente } from '../components/DocenteSection';
import PackClient from './PackClient';

export const metadata: Metadata = {
  title: 'Pack 3 Cursos Universitarios en Innovación Docente | Máxima Formación',
  description:
    'Tres Cursos Universitarios (4 ECTS cada uno, 12 ECTS en total): IA y eXeLearning, H5P e IA para Moodle, y Atención Educativa al alumnado con discapacidad motora y SAAC. Pack completo por 190 € o 95 € por curso.',
  alternates: { canonical: '/pack-cursos-universitarios' },
};

// Docente de los tres cursos del pack: José Antonio Lorente (responsable de
// e-learning). Sale de Strapi por su slug de /profesorado; si Strapi no
// responde, la sección simplemente no se pinta (DocenteSection devuelve null).
const DOCENTE_SLUG = 'jose-ant-lorente';

export default async function PackCursosPage() {
  const teacher = await getTeacherBySlug(DOCENTE_SLUG).catch(() => null);
  const docentes: Docente[] | undefined = teacher
    ? [
        {
          documentId: teacher.documentId,
          slug: teacher.slug,
          name: teacher.name,
          role: teacher.role,
          avatar: teacher.avatarUrl,
          bio: teacher.bio,
          linkedin: teacher.linkedin,
          email: teacher.email,
        },
      ]
    : undefined;
  return <PackClient docentes={docentes} />;
}
