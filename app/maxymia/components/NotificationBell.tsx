'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '../i18n/LocaleProvider';
import { getTranslation } from '../i18n/translations';
import { useNewCourseNotifications } from '../hooks/useNewCourseNotifications';
import { useCampusTheme } from '../campus/CampusShell';
import type { MaxymiaCourse, Locale } from '../types';

function formatRelativeDate(iso: string, locale: Locale, t: (key: string) => string): string {
  const now = Date.now();
  const created = new Date(iso).getTime();
  const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return t('notifications.today');
  if (diffDays === 1) return t('notifications.yesterday');
  return t('notifications.daysAgo').replace('{n}', String(diffDays));
}

interface NotificationBellProps {
  courses: MaxymiaCourse[];
}

export default function NotificationBell({ courses }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { locale } = useLocale();
  const { light } = useCampusTheme();
  const t = (key: string) => getTranslation(locale, key);
  const { newCourses, hasUnseen, markAsSeen, isLoaded } = useNewCourseNotifications(courses);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening && hasUnseen) {
      markAsSeen();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className={`relative p-2.5 rounded-full transition-colors ${light ? 'hover:bg-black/[0.04]' : 'hover:bg-white/5'}`}
        aria-label="Notifications"
      >
        <Bell size={16} className={light ? 'text-mx-text-muted' : 'text-white/60'} />
        {isLoaded && hasUnseen && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-mx-orange rounded-full" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 mt-2 w-[26rem] rounded-xl overflow-hidden shadow-xl z-50 border ${light ? 'bg-white border-mx-border' : 'bg-[#0b1018] border-white/10'}`}
          >
            {/* Header */}
            <div className={`px-4 py-3 border-b ${light ? 'border-mx-border' : 'border-white/5'}`}>
              <h3 className={`text-body-sm font-medium ${light ? 'text-mx-text' : 'text-white'}`}>
                {t('notifications.title')}
              </h3>
            </div>

            {/* Course list */}
            <div className="max-h-80 overflow-y-auto">
              {newCourses.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell size={24} className={`mx-auto mb-2 ${light ? 'text-mx-text-muted/50' : 'text-white/20'}`} />
                  <p className={`text-body-sm ${light ? 'text-mx-text-muted' : 'text-white/40'}`}>
                    {t('notifications.empty')}
                  </p>
                </div>
              ) : (
                newCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={`/maxymia/campus/${course.slug}`}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors border-b last:border-b-0 ${light ? 'hover:bg-black/[0.04] border-mx-border' : 'hover:bg-white/5 border-white/5'}`}
                    >
                      {/* Mini thumbnail matching card style */}
                      <div className="relative w-16 h-12 rounded-md overflow-hidden shrink-0 bg-[#527be7]">
                        <img
                          src={course.image}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover opacity-20"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-full h-[60%] bg-[#0b1018]/50 blur-[10px]" />
                        </div>
                        <img src="/iconBlue.svg" alt="" className="absolute left-0.5 top-1/2 -translate-y-1/2 w-2.5 h-auto z-10" />
                        <img src="/iconOrange.svg" alt="" className="absolute right-0.5 top-1/2 -translate-y-1/2 w-2.5 h-auto z-10" />
                        <div className="relative z-10 flex items-center justify-center h-full px-3">
                          {(() => {
                            const lines = course.thumbnailTitle
                              ? course.thumbnailTitle[locale].split('\n')
                              : [course.title[locale].split(' ').slice(0, 2).join(' ')];
                            return lines.length > 1 ? (
                              <div className="text-center">
                                <p className="text-white/70 text-[5px] tracking-widest uppercase font-medium leading-none">{lines[0]}</p>
                                <p className="text-white text-[8px] font-black tracking-tight leading-tight">{lines.slice(1).join(' ')}</p>
                              </div>
                            ) : (
                              <p className="text-white text-[7px] font-black tracking-tight leading-tight uppercase text-center">{lines[0]}</p>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-body-sm font-medium truncate ${light ? 'text-mx-text' : 'text-white'}`}>
                          {course.title[locale]}
                        </p>
                        <p className={`text-label-md mt-0.5 ${light ? 'text-mx-text-muted' : 'text-white/40'}`}>
                          {course.createdAt && formatRelativeDate(course.createdAt, locale, t)}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
