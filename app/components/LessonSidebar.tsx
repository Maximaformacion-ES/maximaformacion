'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { m, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Play,
  X,
  Clock,
} from 'lucide-react';
import type { ProgramWithLessons } from '@/lib/strapi/types';
import { formatDuration, formatTotalDuration } from '@/lib/cloudflare/stream';

interface LessonSidebarProps {
  program: ProgramWithLessons;
  currentLessonId: string;
  completedLessons: Set<string>;
  isOpen: boolean;
  onClose: () => void;
}

export default function LessonSidebar({
  program,
  currentLessonId,
  completedLessons,
  isOpen,
  onClose,
}: LessonSidebarProps) {
  // Find which module contains the current lesson and expand it
  const currentModuleIndex = program.moduleRelations.findIndex((m) =>
    m.lessons.some((l) => l.documentId === currentLessonId)
  );

  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    new Set(currentModuleIndex >= 0 ? [currentModuleIndex] : [0])
  );

  const toggleModule = (index: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Calculate overall progress
  const totalLessons = program.totalLessons;
  const completedCount = completedLessons.size;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <m.aside
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed lg:static right-0 top-0 bottom-0 w-full max-w-md lg:max-w-sm xl:max-w-md bg-[#0a0a0a] border-l border-white/10 z-50 lg:z-auto overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-semibold">Contenido del curso</h3>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress */}
        <div className="p-4 border-b border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/60 text-body-sm">Tu progreso</span>
            <span className="text-amber-500 font-medium text-body-sm">
              {completedCount}/{totalLessons} completadas
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <m.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
            />
          </div>
        </div>

        {/* Module List */}
        <div className="flex-1 overflow-y-auto">
          {program.moduleRelations.map((module, moduleIndex) => {
            const isExpanded = expandedModules.has(moduleIndex);
            const moduleCompleted = module.lessons.every((l) =>
              completedLessons.has(l.documentId)
            );
            const moduleProgress = module.lessons.filter((l) =>
              completedLessons.has(l.documentId)
            ).length;

            return (
              <div key={module.id} className="border-b border-white/5">
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(moduleIndex)}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-body-sm ${
                        moduleCompleted
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {moduleCompleted ? (
                        <CheckCircle size={14} />
                      ) : (
                        moduleIndex + 1
                      )}
                    </div>
                    <div className="text-left min-w-0">
                      <p className="font-medium text-body-sm truncate">{module.title}</p>
                      <p className="text-white/40 text-label-md">
                        {moduleProgress}/{module.lessonCount} • {formatTotalDuration(module.totalDuration)}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="text-white/40 flex-shrink-0" size={18} />
                  ) : (
                    <ChevronDown className="text-white/40 flex-shrink-0" size={18} />
                  )}
                </button>

                {/* Lessons */}
                <AnimatePresence>
                  {isExpanded && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {module.lessons.map((lesson) => {
                        const isActive = lesson.documentId === currentLessonId;
                        const isCompleted = completedLessons.has(lesson.documentId);

                        return (
                          <Link
                            key={lesson.id}
                            href={`/cursos/${program.documentId}/lesson/${lesson.documentId}`}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 pl-14 transition-colors ${
                              isActive
                                ? 'bg-amber-500/10 border-l-2 border-amber-500'
                                : 'hover:bg-white/5 border-l-2 border-transparent'
                            }`}
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isCompleted
                                  ? 'bg-green-500/20 text-green-500'
                                  : isActive
                                    ? 'bg-amber-500/20 text-amber-500'
                                    : 'bg-white/10 text-white/40'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle size={12} />
                              ) : isActive ? (
                                <Play size={10} fill="currentColor" />
                              ) : (
                                <Play size={10} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-body-sm truncate ${
                                  isActive ? 'text-amber-500 font-medium' : 'text-white/70'
                                }`}
                              >
                                {lesson.title}
                              </p>
                              <div className="flex items-center gap-1 text-white/40 text-label-md">
                                <Clock size={10} />
                                {formatDuration(lesson.duration)}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <Link
            href={`/cursos/${program.documentId}`}
            onClick={onClose}
            className="block w-full text-center py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-colors text-body-sm"
          >
            Ver resumen del curso
          </Link>
        </div>
      </m.aside>
    </>
  );
}
