'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { LocaleProvider, useLocale } from '../i18n/LocaleProvider';

import NotificationBell from '../components/NotificationBell';
import { MaxymiaFooter } from '../../components/MaxymiaFooter';
import type { MaxymiaCourse } from '../types';

const CampusCoursesContext = createContext<MaxymiaCourse[]>([]);
export const useCampusCourses = () => useContext(CampusCoursesContext);

const CAMPUS_NAV = [
  { name: 'Inicio', path: '/maxymia/campus' },
  { name: 'Cursos', path: '/maxymia/campus/cursos' },
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

  return (
    <header className="relative top-0 left-0 right-0 z-50 bg-[#0b1018] border-b border-white/5">
      <div className="max-w-[1800px] mx-auto px-6 md:px-[128px] flex items-center justify-between py-6">
        {/* Logo + Nav */}
        <div className="flex items-center gap-16">
          <Link href="/maxymia" className="flex items-center shrink-0">
            <Image
              src="/logo-completo.webp"
              alt="Maxymia"
              width={128}
              height={48}
              className="h-10 md:h-12 w-auto"
              priority
            />
          </Link>

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
                      isActive ? 'font-medium text-white' : 'font-normal text-white/50 hover:text-white/70 transition-colors'
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
        </div>

        {/* Right side: back to MF, search, bell, avatar */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden md:flex items-center gap-1 text-white/30 hover:text-mx-orange text-label-md transition-colors mr-2"
          >
            <span>Máxima Formación</span>
            <ArrowUpRight size={10} className="opacity-60" />
          </Link>
          <div className="w-px h-4 bg-white/10 hidden md:block" />
          <button className="p-2.5 rounded-full hover:bg-white/5 transition-colors" aria-label="Search">
            <Search size={16} className="text-white/60" />
          </button>
          <NotificationBell courses={courses} />
          <div className="rounded-full p-px">
            <UserButton
              afterSignOutUrl="/maxymia"
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

function LessonHeader() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const courses = useCampusCourses();

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
            <Image
              src="/logo-completo.webp"
              alt="Maxymia"
              width={96}
              height={36}
              className="h-8 w-auto"
            />
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
          <div className="rounded-full p-px">
            <UserButton
              afterSignOutUrl="/maxymia"
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
        <div className="min-h-screen bg-[#0b1018] text-white overflow-x-hidden relative">
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
