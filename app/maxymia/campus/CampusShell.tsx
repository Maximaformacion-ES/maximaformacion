'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, ChevronLeft, ArrowUpRight, Menu, X } from 'lucide-react';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { LocaleProvider, useLocale } from '../i18n/LocaleProvider';

import NotificationBell from '../components/NotificationBell';
import { MaxymiaFooter } from '../../components/MaxymiaFooter';
import { useSiteBranding } from '../../components/SiteBrandingProvider';
import type { MaxymiaCourse } from '../types';

const CampusCoursesContext = createContext<MaxymiaCourse[]>([]);
export const useCampusCourses = () => useContext(CampusCoursesContext);

const CAMPUS_NAV = [
  { name: 'Inicio', path: '/maxymia/campus' },
  { name: 'Cursos', path: '/maxymia/campus/cursos' },
  { name: 'Mis Cursos', path: '/maxymia/campus/mis-cursos' },
  { name: 'Notas', path: '/maxymia/campus/notas' },
];

function CampusHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLessonPage = mounted && /\/maxymia\/campus\/[^/]+\/lesson\//.test(pathname);

  if (isLessonPage) return <LessonHeader />;
  return <DefaultCampusHeader />;
}

function DefaultCampusHeader() {
  const pathname = usePathname();
  const courses = useCampusCourses();
  const [menuOpen, setMenuOpen] = useState(false);
  const { logoMaxymia } = useSiteBranding();

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <header className="relative top-0 left-0 right-0 z-50 bg-mx-bg border-b border-mx-border">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 md:px-[128px] flex items-center justify-between py-4 md:py-6">
          {/* Logo + Nav */}
          <div className="flex items-center gap-16">
            <Link href="/maxymia" className="flex items-center shrink-0">
              {logoMaxymia && (
                <Image
                  src={logoMaxymia}
                  alt="Maxymia"
                  width={128}
                  height={48}
                  className="h-8 sm:h-10 md:h-12 w-auto"
                  priority
                />
              )}
            </Link>

            {/* Las secciones del campus son privadas: solo se muestran a
                usuarios logueados. Un anónimo (viendo una ficha pública) no las
                ve. */}
            <SignedIn>
              <nav className="hidden md:flex items-center gap-1">
                {CAMPUS_NAV.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      className="relative px-4 py-2 rounded-lg"
                    >
                      <span
                        className={`text-body-sm 2xl:text-body-md ${
                          isActive ? 'font-medium text-mx-text' : 'font-normal text-mx-text-muted hover:text-mx-text transition-colors'
                        }`}
                      >
                        {item.name}
                      </span>
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#527be7] rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </SignedIn>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="hidden md:flex items-center gap-1 text-mx-text-muted hover:text-mx-orange text-label-md transition-colors mr-2"
            >
              <span>Máxima Formación</span>
              <ArrowUpRight size={10} className="opacity-60" />
            </Link>
            <div className="w-px h-4 bg-mx-border hidden md:block" />
            {/* Search, notificaciones y avatar son propios del usuario:
                ocultos para anónimos. */}
            <SignedIn>
              <button className="p-2 sm:p-2.5 rounded-full hover:bg-black/[0.04] transition-colors" aria-label="Search">
                <Search size={16} className="text-mx-text-muted" />
              </button>
              <NotificationBell courses={courses} />
              <div className="rounded-full p-px hidden md:block" suppressHydrationWarning>
                <UserButton
                  afterSignOutUrl="/maxymia"
                  userProfileMode="navigation"
                  userProfileUrl="/perfil"
                  appearance={{
                    elements: {
                      avatarBox: 'w-6 h-6',
                    },
                  }}
                />
              </div>
            </SignedIn>
            {/* Anónimo viendo una ficha pública: CTA para entrar al campus. */}
            <SignedOut>
              <Link
                href="/sign-in?redirect_url=/maxymia/campus"
                className="hidden md:inline-flex items-center px-4 py-2 rounded-full bg-mx-orange hover:bg-mx-orange-dark text-white text-body-sm font-bold transition-colors"
              >
                Iniciar sesión
              </Link>
            </SignedOut>

            {/* Burger button — mobile only */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-black/[0.04] transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? (
                <X size={20} className="text-mx-text" />
              ) : (
                <Menu size={20} className="text-mx-text" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          {/* Menu panel */}
          <div className="absolute top-0 right-0 w-56 h-full bg-white border-l border-mx-border shadow-2xl shadow-black/50 flex flex-col">
            {/* Close + avatar */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-mx-border" suppressHydrationWarning>
              <SignedIn>
                <UserButton
                  afterSignOutUrl="/maxymia"
                  userProfileMode="navigation"
                  userProfileUrl="/perfil"
                  appearance={{
                    elements: {
                      avatarBox: 'w-7 h-7',
                    },
                  }}
                />
              </SignedIn>
              <SignedOut>
                <span className="text-mx-text text-label-md font-medium">Maxymia</span>
              </SignedOut>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/[0.04] transition-colors"
              >
                <X size={16} className="text-mx-text-muted" />
              </button>
            </div>

            {/* Nav links — secciones privadas, solo para logueados */}
            <SignedIn>
              <nav className="flex flex-col py-3">
                {CAMPUS_NAV.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      className={`px-4 py-2.5 text-label-md font-medium transition-colors ${
                        isActive
                          ? 'text-mx-text bg-black/[0.04] border-l-2 border-mx-blue'
                          : 'text-mx-text-muted hover:text-mx-text hover:bg-black/[0.03] border-l-2 border-transparent'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </SignedIn>
            {/* Anónimo: CTA para entrar al campus */}
            <SignedOut>
              <div className="px-4 py-4">
                <Link
                  href="/sign-in?redirect_url=/maxymia/campus"
                  className="flex items-center justify-center px-4 py-2.5 rounded-full bg-mx-orange hover:bg-mx-orange-dark text-white text-label-md font-bold transition-colors"
                >
                  Iniciar sesión
                </Link>
              </div>
            </SignedOut>

            {/* Bottom link */}
            <div className="mt-auto px-4 py-4 border-t border-mx-border">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-mx-text-muted hover:text-mx-orange text-label-sm transition-colors"
              >
                <span>Máxima Formación</span>
                <ArrowUpRight size={9} className="opacity-60" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LessonHeader() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const courses = useCampusCourses();
  const { logoMaxymia } = useSiteBranding();

  // Extract courseSlug from path: /maxymia/campus/:courseSlug/lesson/:lessonId
  const segments = pathname.split('/');
  const courseSlugIndex = segments.indexOf('campus') + 1;
  const courseSlug = segments[courseSlugIndex] || '';
  const course = courses.find((c) => c.slug === courseSlug);
  const courseTitle = course?.title[locale] ?? '';

  return (
    <header className="relative top-0 left-0 right-0 z-50 bg-[#0b1018] border-b border-white/5">
      <div className="px-6 md:px-8 flex items-center justify-between py-3">
        {/* Left: back + logo + breadcrumb */}
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href={`/maxymia/campus/${courseSlug}`}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors shrink-0"
          >
            <ChevronLeft size={16} />
          </Link>

          <Link href="/maxymia" className="shrink-0 hidden md:block">
            {logoMaxymia && (
              <Image
                src={logoMaxymia}
                alt="Maxymia"
                width={96}
                height={36}
                className="h-8 w-auto"
              />
            )}
          </Link>

          {courseTitle && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-white/20 hidden md:block">|</span>
              <Link
                href={`/maxymia/campus/${courseSlug}`}
                className="text-white/50 hover:text-white/70 text-label-md md:text-body-sm truncate transition-colors"
              >
                {courseTitle}
              </Link>
            </div>
          )}
        </div>

        {/* Right: avatar */}
        <div className="flex items-center gap-3">
          <div className="rounded-full p-px" suppressHydrationWarning>
            <UserButton
              afterSignOutUrl="/maxymia"
              userProfileMode="navigation"
              userProfileUrl="/perfil"
              appearance={{
                elements: {
                  avatarBox: 'w-6 h-6',
                },
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

interface CampusShellProps {
  children: React.ReactNode;
  courses?: MaxymiaCourse[];
}

export default function CampusShell({ children, courses = [] }: CampusShellProps) {
  const pathname = usePathname();
  const isLessonPage = /\/maxymia\/campus\/[^/]+\/lesson\//.test(pathname);

  return (
    <LocaleProvider>
      <CampusCoursesContext.Provider value={courses}>
        {/* overflow-x-clip (not -hidden) so the course-detail sidebar can use
            position: sticky. `overflow-x: hidden` makes this a scroll
            container and pins sticky children to it instead of the viewport;
            `clip` prevents the horizontal scrollbar without that side effect. */}
        <div className={`min-h-screen overflow-x-clip relative ${isLessonPage ? 'bg-[#0b1018] text-white' : 'bg-mx-bg text-mx-text'}`}>
          <CampusHeader />
          <main className="relative z-10">
            {children}
          </main>
          {!isLessonPage && <MaxymiaFooter />}
        </div>
      </CampusCoursesContext.Provider>
    </LocaleProvider>
  );
}
