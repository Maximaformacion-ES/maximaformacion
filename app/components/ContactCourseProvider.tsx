'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

/**
 * "Curso que el visitante está viendo ahora mismo", para que cualquier enlace a
 * /contacto (header, footer, CTAs) llegue con `?curso=<título>` y el formulario
 * salga con ese curso preseleccionado. Así atención al cliente no tiene que
 * preguntar "¿a qué curso te refieres?".
 *
 * - El provider vive en el layout raíz (estado vacío por defecto).
 * - Cada ficha de curso monta `<ContactCourse title=… />`, que fija el curso al
 *   entrar y lo limpia al salir. Se hace así (y no envolviendo la ficha en un
 *   provider) porque en Maxymia el footer lo pinta el layout del campus, fuera
 *   de la página.
 * - Header y footers leen `useContactHref()`.
 */

type ContactCourseContext = {
  course: string | null;
  setCourse: (course: string | null) => void;
};

const Ctx = createContext<ContactCourseContext>({ course: null, setCourse: () => {} });

export function ContactCourseProvider({ children }: { children: React.ReactNode }) {
  const [course, setCourse] = useState<string | null>(null);
  const value = useMemo(() => ({ course, setCourse }), [course]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Enlace a la página de contacto, con el curso preseleccionado si se conoce. */
export function contactHrefFor(course?: string | null): string {
  const title = course?.trim();
  return title ? `/contacto?curso=${encodeURIComponent(title)}` : '/contacto';
}

export function useContactHref(): string {
  const { course } = useContext(Ctx);
  return contactHrefFor(course);
}

/**
 * Montar dentro de una ficha de curso. No pinta nada: solo anuncia el curso
 * actual mientras la ficha esté montada. `title` debe coincidir con el título
 * que lista el selector de /contacto (título del programa en Strapi, o el
 * título en español del curso Maxymia).
 */
export function ContactCourse({ title }: { title: string }) {
  const { setCourse } = useContext(Ctx);
  useEffect(() => {
    setCourse(title);
    return () => setCourse(null);
  }, [title, setCourse]);
  return null;
}
