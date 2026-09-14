import CampusShell from './CampusShell';
import { fetchMaxymiaCourses } from '../data/queries';

/**
 * Chrome del campus (cabecera propia oscura + footer de Maxymia) para las
 * rutas que SON campus: dashboard, catálogo, mis cursos, notas, vista de
 * alumno de un curso y player de lección.
 *
 * Antes vivía en app/maxymia/campus/layout.tsx y envolvía también la ficha
 * pública de venta (/maxymia/campus/[slug] sin matrícula). Esa ficha ahora
 * lleva el Header/Footer del sitio, igual que las fichas de /programas, así
 * que el shell se aplica por ruta y la página del curso decide en servidor
 * cuál de los dos chromes pinta (sin parpadeo de cabecera).
 */
export default async function CampusChrome({ children }: { children: React.ReactNode }) {
  const courses = await fetchMaxymiaCourses();
  return <CampusShell courses={courses}>{children}</CampusShell>;
}
