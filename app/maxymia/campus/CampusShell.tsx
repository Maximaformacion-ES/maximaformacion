'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  Award,
  BookOpen,
  ChevronLeft,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  Search,
  Shield,
  X,
} from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';
import { LocaleProvider, useLocale } from '../i18n/LocaleProvider';
import { useMounted } from '../../hooks/useMounted';
import NotificationBell from '../components/NotificationBell';
import TutorQuestionModal from '../components/TutorQuestionModal';
import type { MaxymiaCourse } from '../types';

/**
 * Shell del campus Maxymia: app en tema claro con barra lateral izquierda
 * (navegación), barra superior (buscador, notificaciones, usuario) y área de
 * contenido. En las páginas de lección la barra lateral desaparece y queda
 * una barra superior compacta (volver al curso, título, usuario) para dejar
 * sitio al player, que lleva su propio índice de lecciones.
 *
 * Solo envuelve rutas privadas (todas pasan por requireCampusLogin), así que
 * no hay estado "anónimo" que contemplar. La ficha pública y la vista de
 * alumno de un curso van con el Header/Footer del sitio, fuera de aquí.
 */

const CampusCoursesContext = createContext<MaxymiaCourse[]>([]);
export const useCampusCourses = () => useContext(CampusCoursesContext);

// Compatibilidad: el campus ya es siempre claro. Se mantiene el hook para
// componentes que aún lo importan; `setLight` no hace nada.
type CampusTheme = { light: boolean; setLight: (v: boolean) => void };
const CampusThemeContext = createContext<CampusTheme>({ light: true, setLight: () => {} });
export const useCampusTheme = () => useContext(CampusThemeContext);

const LOGO = '/logo_maxymia_negro_sin_fondo.png';

interface NavItem {
  key: string;
  es: string;
  en: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  /** Solo activo con coincidencia exacta (la home del campus). */
  exact?: boolean;
}

const NAV: NavItem[] = [
  { key: 'home', es: 'Inicio', en: 'Home', path: '/maxymia/campus', icon: LayoutDashboard, exact: true },
  { key: 'courses', es: 'Cursos', en: 'Courses', path: '/maxymia/campus/cursos', icon: BookOpen },
  { key: 'mine', es: 'Mis cursos', en: 'My courses', path: '/maxymia/campus/mis-cursos', icon: GraduationCap },
  { key: 'grades', es: 'Notas', en: 'Grades', path: '/maxymia/campus/notas', icon: Award },
];

function useIsAdmin(): boolean {
  const { user } = useUser();
  return (user?.publicMetadata as { role?: string } | undefined)?.role === 'admin';
}

function UserMenu({ size = 'w-8 h-8' }: { size?: string }) {
  const isAdmin = useIsAdmin();
  return (
    <UserButton
      afterSignOutUrl="/maxymia"
      userProfileMode="navigation"
      userProfileUrl="/perfil"
      appearance={{ elements: { avatarBox: size } }}
    >
      {isAdmin ? (
        <UserButton.MenuItems>
          <UserButton.Link label="Admin" labelIcon={<Shield size={16} />} href="/admin" />
        </UserButton.MenuItems>
      ) : null}
    </UserButton>
  );
}

function isActivePath(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.path : pathname.startsWith(item.path);
}

// ─── Barra lateral (lg+) y cajón móvil ───────────────────────────────

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { locale } = useLocale();
  return (
    <nav className="flex flex-col gap-1" aria-label="Campus">
      <p className="px-3 mb-2 text-label-sm font-semibold uppercase tracking-[0.18em] text-mx-text-muted">
        {locale === 'es' ? 'Menú' : 'Menu'}
      </p>
      {NAV.map((item) => {
        const active = isActivePath(pathname, item);
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            href={item.path}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium transition-colors ${
              active
                ? 'bg-mx-orange/10 text-mx-text'
                : 'text-mx-text-muted hover:bg-black/[0.03] hover:text-mx-text'
            }`}
          >
            {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-mx-orange" aria-hidden="true" />}
            <Icon size={18} className={active ? 'text-mx-orange' : 'text-mx-text-muted'} aria-hidden="true" />
            {item[locale]}
          </Link>
        );
      })}

      <p className="px-3 mt-6 mb-2 text-label-sm font-semibold uppercase tracking-[0.18em] text-mx-text-muted">
        {locale === 'es' ? 'Ayuda' : 'Help'}
      </p>
      <Link
        href="/contacto"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium text-mx-text-muted hover:bg-black/[0.03] hover:text-mx-text transition-colors"
      >
        <LifeBuoy size={18} aria-hidden="true" />
        {locale === 'es' ? 'Contactar' : 'Contact'}
      </Link>
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium text-mx-text-muted hover:bg-black/[0.03] hover:text-mx-text transition-colors"
      >
        <ArrowUpRight size={18} aria-hidden="true" />
        Máxima Formación
      </Link>
    </nav>
  );
}

function Sidebar() {
  const { locale } = useLocale();
  const courses = useCampusCourses();
  const [askOpen, setAskOpen] = useState(false);
  return (
    <aside className="hidden lg:flex flex-col sticky top-0 h-screen w-[260px] shrink-0 border-r border-mx-border bg-mx-card">
      <div className="px-6 py-6 border-b border-mx-border">
        <Link href="/maxymia/campus" className="inline-flex items-center">
          <Image src={LOGO} alt="Maxymia" width={128} height={48} className="h-9 w-auto" priority />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-6">
        <NavLinks />
      </div>
      <div className="px-4 pb-5">
        <div className="rounded-xl border border-mx-border bg-mx-bg p-4">
          <p className="text-body-sm font-semibold text-mx-text mb-1">
            {locale === 'es' ? '¿Dudas con un curso?' : 'Questions about a course?'}
          </p>
          <p className="text-label-md text-mx-text-muted mb-3">
            {locale === 'es' ? 'Tu tutor te las resuelve.' : 'Your tutor will help.'}
          </p>
          <button
            type="button"
            onClick={() => setAskOpen(true)}
            className="inline-flex items-center gap-1.5 text-label-md font-medium text-mx-blue hover:text-mx-orange transition-colors"
          >
            {locale === 'es' ? 'Escribir al tutor' : 'Write to the tutor'} <ArrowUpRight size={12} />
          </button>
        </div>
      </div>
      <TutorQuestionModal open={askOpen} onClose={() => setAskOpen(false)} locale={locale} courses={courses} />
    </aside>
  );
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-[280px] bg-mx-card border-r border-mx-border shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-mx-border">
          <Image src={LOGO} alt="Maxymia" width={112} height={40} className="h-8 w-auto" />
          <button onClick={onClose} aria-label="Cerrar menú" className="p-2 rounded-full hover:bg-black/[0.04]">
            <X size={18} className="text-mx-text-muted" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <NavLinks onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
}

// ─── Barra superior ──────────────────────────────────────────────────

function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { locale } = useLocale();
  const router = useRouter();
  const courses = useCampusCourses();
  const { user } = useUser();
  const mounted = useMounted();
  const [q, setQ] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/maxymia/campus/cursos?q=${encodeURIComponent(term)}` : '/maxymia/campus/cursos');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-mx-border bg-mx-bg/95 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-10 h-16">
        <button
          onClick={onOpenMenu}
          aria-label="Abrir menú"
          className="lg:hidden p-2 -ml-2 rounded-full hover:bg-black/[0.04] text-mx-text"
        >
          <Menu size={20} />
        </button>
        <Link href="/maxymia/campus" className="lg:hidden inline-flex items-center">
          <Image src={LOGO} alt="Maxymia" width={112} height={40} className="h-7 w-auto" />
        </Link>

        <form onSubmit={submit} role="search" className="hidden sm:flex flex-1 max-w-md items-center">
          <label className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mx-text-muted" aria-hidden="true" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={locale === 'es' ? 'Buscar cursos…' : 'Search courses…'}
              className="w-full rounded-full border border-mx-border bg-mx-card pl-9 pr-4 py-2 text-body-sm text-mx-text placeholder:text-mx-text-muted focus:outline-none focus:ring-2 focus:ring-mx-orange/40"
            />
          </label>
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-3" suppressHydrationWarning>
          {mounted && (
            <>
              <NotificationBell courses={courses} />
              <div className="flex items-center gap-2.5 pl-2 sm:pl-3 sm:border-l border-mx-border">
                <UserMenu />
                <span className="hidden md:block text-body-sm font-medium text-mx-text max-w-[160px] truncate">
                  {user?.firstName || user?.fullName || ''}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Barra compacta del player de lección ────────────────────────────

function LessonTopBar() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const courses = useCampusCourses();
  const mounted = useMounted();
  const segments = pathname.split('/');
  const courseSlug = segments[segments.indexOf('campus') + 1] || '';
  const course = courses.find((c) => c.slug === courseSlug);
  const courseTitle = course?.title[locale] ?? '';

  return (
    <header className="sticky top-0 z-40 border-b border-mx-border bg-mx-bg/95 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 h-14">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/maxymia/campus/${courseSlug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-mx-border bg-mx-card px-3 py-1.5 text-label-md font-medium text-mx-text-muted hover:text-mx-text hover:border-mx-orange/40 transition-colors shrink-0"
          >
            <ChevronLeft size={14} /> {locale === 'es' ? 'Curso' : 'Course'}
          </Link>
          <Link href="/maxymia/campus" className="hidden md:inline-flex items-center shrink-0">
            <Image src={LOGO} alt="Maxymia" width={96} height={36} className="h-7 w-auto" />
          </Link>
          {courseTitle && (
            <span className="text-body-sm text-mx-text-muted truncate">
              <span className="hidden md:inline text-mx-border mr-3">|</span>
              {courseTitle}
            </span>
          )}
        </div>
        <div suppressHydrationWarning>{mounted && <UserMenu size="w-7 h-7" />}</div>
      </div>
    </header>
  );
}

// ─── Shell ───────────────────────────────────────────────────────────

interface CampusShellProps {
  children: React.ReactNode;
  courses?: MaxymiaCourse[];
}

export default function CampusShell({ children, courses = [] }: CampusShellProps) {
  const pathname = usePathname();
  const isLessonPage = /\/maxymia\/campus\/[^/]+\/lesson\//.test(pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  // Cerrar el cajón al cambiar de ruta.
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setMenuOpen(false);
  }

  return (
    <LocaleProvider>
      <CampusCoursesContext.Provider value={courses}>
        <CampusThemeContext.Provider value={{ light: true, setLight: () => {} }}>
          {isLessonPage ? (
            <div className="min-h-screen bg-mx-bg text-mx-text">
              <LessonTopBar />
              <main className="relative">{children}</main>
            </div>
          ) : (
            <div className="min-h-screen bg-mx-bg text-mx-text lg:flex">
              <Sidebar />
              <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
              <div className="flex min-h-screen min-w-0 flex-1 flex-col">
                <TopBar onOpenMenu={() => setMenuOpen(true)} />
                <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
                  <div className="mx-auto w-full max-w-[1400px]">{children}</div>
                </main>
                <footer className="px-4 sm:px-6 lg:px-10 py-5 border-t border-mx-border text-label-md text-mx-text-muted flex flex-wrap items-center justify-between gap-2">
                  <span>© {new Date().getFullYear()} Máxima Formación · Maxymia</span>
                  <span className="flex items-center gap-4">
                    <Link href="/contacto" className="hover:text-mx-orange transition-colors">Contacto</Link>
                    <Link href="/" className="hover:text-mx-orange transition-colors">maximaformacion.es</Link>
                  </span>
                </footer>
              </div>
            </div>
          )}
        </CampusThemeContext.Provider>
      </CampusCoursesContext.Provider>
    </LocaleProvider>
  );
}
