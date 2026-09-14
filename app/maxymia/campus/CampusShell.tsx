'use client';

import React, { createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { CampusSidebar } from '@/components/campus/campus-sidebar';
import { CampusHeader } from '@/components/campus/campus-header';
import { LocaleProvider, useLocale } from '../i18n/LocaleProvider';
import type { MaxymiaCourse } from '../types';

/**
 * Shell del campus Maxymia sobre el kit shadcn (SidebarProvider + Sidebar +
 * SidebarInset), la misma base que el panel /admin: barra lateral colapsable
 * a iconos con estado persistido en cookie, cabecera con buscador y
 * notificaciones, y usuario en el pie del sidebar. Siempre en claro.
 *
 * Solo envuelve rutas privadas (dashboard, catálogo, mis cursos, notas y
 * player). La ficha pública y la vista de alumno del curso van con el
 * Header/Footer del sitio, fuera de aquí.
 */

const CampusCoursesContext = createContext<MaxymiaCourse[]>([]);
export const useCampusCourses = () => useContext(CampusCoursesContext);

// Compatibilidad: el campus ya es siempre claro; `setLight` no hace nada.
type CampusTheme = { light: boolean; setLight: (v: boolean) => void };
const CampusThemeContext = createContext<CampusTheme>({ light: true, setLight: () => {} });
export const useCampusTheme = () => useContext(CampusThemeContext);

interface CampusShellProps {
  children: React.ReactNode;
  courses?: MaxymiaCourse[];
  /** Estado inicial del sidebar (cookie `sidebar_state`, leída en servidor). */
  defaultOpen?: boolean;
}

function ShellInner({ children, courses, defaultOpen }: Required<Omit<CampusShellProps, 'defaultOpen'>> & { defaultOpen: boolean }) {
  const { locale } = useLocale();
  const pathname = usePathname();
  // Player de lección/examen: ocupa exactamente la ventana menos la cabecera
  // (57 px) y SOLO hacen scroll su índice y su contenido, cada uno por su
  // lado. Sin padding ni ancho máximo, y con la página bloqueada.
  const isLessonPage = /\/maxymia\/campus\/[^/]+\/lesson\//.test(pathname);
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <CampusSidebar locale={locale} />
      <SidebarInset className={`bg-mx-bg text-mx-text ${isLessonPage ? 'h-svh max-h-svh overflow-hidden' : ''}`}>
        <CampusHeader locale={locale} courses={courses} />
        {isLessonPage ? (
          <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
        ) : (
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1400px]">{children}</div>
          </main>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function CampusShell({ children, courses = [], defaultOpen = true }: CampusShellProps) {
  return (
    <LocaleProvider>
      <CampusCoursesContext.Provider value={courses}>
        <CampusThemeContext.Provider value={{ light: true, setLight: () => {} }}>
          <ShellInner courses={courses} defaultOpen={defaultOpen}>
            {children}
          </ShellInner>
        </CampusThemeContext.Provider>
      </CampusCoursesContext.Provider>
    </LocaleProvider>
  );
}
