import { cookies } from 'next/headers';
import CampusShell from './CampusShell';
import { fetchMaxymiaCourses } from '../data/queries';

/**
 * Chrome del campus (sidebar + cabecera del kit shadcn) para las rutas que
 * SON campus: dashboard, catálogo, mis cursos, notas y player de lección.
 * La ficha pública y la vista de alumno del curso van con el Header/Footer
 * del sitio (ver [courseSlug]/page.tsx).
 */
export default async function CampusChrome({ children }: { children: React.ReactNode }) {
  const [courses, cookieStore] = await Promise.all([fetchMaxymiaCourses(), cookies()]);
  // Estado colapsado del sidebar persistido por cookie (como en /admin).
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';
  return (
    <CampusShell courses={courses} defaultOpen={defaultOpen}>
      {children}
    </CampusShell>
  );
}
