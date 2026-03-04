'use client';

import React, { createContext, useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { LocaleProvider, useLocale } from '../i18n/LocaleProvider';
import { getTranslation } from '../i18n/translations';
import NotificationBell from '../components/NotificationBell';
import type { MaxymiaCourse } from '../types';

const CampusCoursesContext = createContext<MaxymiaCourse[]>([]);
export const useCampusCourses = () => useContext(CampusCoursesContext);

const CAMPUS_NAV = [
  { name: 'Inicio', path: '/maxymia/campus' },
  { name: 'Cursos', path: '/maxymia/campus/cursos' },
];

function CampusHeader() {
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
                    className={`text-[14px] 2xl:text-[16px] ${
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

        {/* Right side: search, bell, avatar */}
        <div className="flex items-center gap-3">
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

function CampusFooter() {
  const { locale } = useLocale();
  const t = (key: string) => getTranslation(locale, key);

  return (
    <footer className="border-t border-white/5 mt-20">
      <div className="max-w-[1800px] mx-auto px-6 md:px-[128px] py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo + description */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-mx-orange to-amber-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <span className="text-white font-semibold tracking-tight">Maxymia</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-5">
              {t('footer.description')}
            </p>
          </div>

          {/* Campus */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t('footer.campus')}</h4>
            <ul className="space-y-2.5">
              <li><Link href="/maxymia/campus" className="text-white/40 hover:text-white/70 text-sm transition-colors">{t('footer.allCourses')}</Link></li>
              <li><Link href="/maxymia/campus" className="text-white/40 hover:text-white/70 text-sm transition-colors">{t('footer.myProgress')}</Link></li>
              <li><Link href="/maxymia/campus" className="text-white/40 hover:text-white/70 text-sm transition-colors">{t('footer.certificates')}</Link></li>
            </ul>
          </div>

          {/* Specialties */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t('footer.specialties')}</h4>
            <ul className="space-y-2.5">
              <li><Link href="/maxymia/campus" className="text-white/40 hover:text-white/70 text-sm transition-colors">{t('footer.ia')}</Link></li>
              <li><Link href="/maxymia/campus" className="text-white/40 hover:text-white/70 text-sm transition-colors">{t('footer.dataScience')}</Link></li>
              <li><Link href="/maxymia/campus" className="text-white/40 hover:text-white/70 text-sm transition-colors">{t('footer.machineLearning')}</Link></li>
              <li><Link href="/maxymia/campus" className="text-white/40 hover:text-white/70 text-sm transition-colors">{t('footer.nlp')}</Link></li>
              <li><Link href="/maxymia/campus" className="text-white/40 hover:text-white/70 text-sm transition-colors">{t('footer.cv')}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2.5">
              <li><Link href="/maxymia" className="text-white/40 hover:text-white/70 text-sm transition-colors">{t('footer.about')}</Link></li>
              <li><Link href="/consultoria" className="text-white/40 hover:text-white/70 text-sm transition-colors">{t('footer.contact')}</Link></li>
              <li><Link href="#" className="text-white/40 hover:text-white/70 text-sm transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link href="#" className="text-white/40 hover:text-white/70 text-sm transition-colors">{t('footer.terms')}</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-white/5">
        <div className="max-w-[1800px] mx-auto px-6 md:px-[128px] py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/30 text-xs">
            &copy; {new Date().getFullYear()} Maxymia. {t('footer.rights')}
          </p>
          <p className="text-white/20 text-xs">
            Maxima Formacion
          </p>
        </div>
      </div>
    </footer>
  );
}

interface CampusShellProps {
  children: React.ReactNode;
  courses?: MaxymiaCourse[];
}

export default function CampusShell({ children, courses = [] }: CampusShellProps) {
  return (
    <LocaleProvider>
      <CampusCoursesContext.Provider value={courses}>
        <div className="min-h-screen bg-[#0b1018] text-white overflow-x-hidden relative">
          <CampusHeader />
          <main className="relative z-10">
            {children}
          </main>
          <CampusFooter />
        </div>
      </CampusCoursesContext.Provider>
    </LocaleProvider>
  );
}
