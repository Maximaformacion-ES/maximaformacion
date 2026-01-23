'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Lock,
  FileText,
  Video,
  ArrowRight,
  PartyPopper,
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { FontStyles } from '@/app/components/FontStyles';
import type { ProgramWithLessons, PurchasedCourse, CourseProgress } from '@/lib/strapi/types';
import { formatTotalDuration, formatDuration } from '@/lib/cloudflare/stream';
import CourseAccessGate from '@/app/components/CourseAccessGate';

interface CourseOverviewClientProps {
  program: ProgramWithLessons;
  firstLessonId: string | null;
  showSuccessMessage: boolean;
}

export default function CourseOverviewClient({
  program,
  firstLessonId,
  showSuccessMessage,
}: CourseOverviewClientProps) {
  const { isSignedIn, user, isLoaded } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));
  const [showSuccess, setShowSuccess] = useState(showSuccessMessage);

  // Get user access and progress
  const userHasPro = isSignedIn && user?.publicMetadata?.plan === 'pro';
  const purchasedCourses = (user?.publicMetadata?.purchasedCourses as PurchasedCourse[]) || [];
  const hasPurchased = purchasedCourses.some(
    (c) => c.programId === program.id || c.documentId === program.documentId
  );
  const hasAccess = userHasPro || hasPurchased;

  // Get course progress
  const courseProgress = (user?.publicMetadata?.courseProgress as Record<string, CourseProgress>) || {};
  const progress = courseProgress[program.documentId];
  const completedLessons = new Set(progress?.completedLessons || []);

  // Hide success message after 5 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Toggle module expansion
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

  // If user doesn't have access and the course is Pro, show access gate
  if (isLoaded && program.isPro && !hasAccess) {
    return (
      <div className="bg-black min-h-screen text-white selection:bg-amber-500/30 overflow-x-hidden">
        <FontStyles />
        <div className="grain" />
        <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        <main className="relative z-10">
          <CourseAccessGate
            program={program}
            isSignedIn={isSignedIn || false}
            userHasPro={userHasPro || false}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate progress percentage
  const totalLessons = program.totalLessons;
  const completedCount = completedLessons.size;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Find current lesson (last accessed or first incomplete)
  const currentLessonId = progress?.currentLessonId || firstLessonId;

  return (
    <div className="bg-black min-h-screen text-white selection:bg-amber-500/30 overflow-x-hidden">
      <FontStyles />
      <div className="grain" />
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10">
        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-green-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
            >
              <PartyPopper size={24} />
              <span className="font-medium">¡Compra completada! Ya tienes acceso al curso.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6 md:px-12 bg-gradient-to-b from-[#0a0a0a] to-black">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="grid lg:grid-cols-2 gap-12 items-start"
            >
              {/* Course Info */}
              <div>
                <span className="text-amber-500 text-sm font-medium tracking-[0.3em] uppercase mb-4 block">
                  {program.type}
                </span>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">
                  {program.title}
                </h1>
                <p className="text-white/60 font-light text-lg mb-8">
                  {program.description}
                </p>

                {/* Course Stats */}
                <div className="flex flex-wrap gap-6 mb-8">
                  <div className="flex items-center gap-2">
                    <BookOpen className="text-amber-500" size={20} />
                    <span className="text-white/80">{program.totalLessons} lecciones</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="text-amber-500" size={20} />
                    <span className="text-white/80">{formatTotalDuration(program.totalDuration)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="text-amber-500" size={20} />
                    <span className="text-white/80">{program.moduleRelations.length} módulos</span>
                  </div>
                </div>

                {/* Progress Bar (if has progress) */}
                {progress && (
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/60 text-sm">Tu progreso</span>
                      <span className="text-amber-500 font-medium">{progressPercent}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                      />
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                {currentLessonId && (
                  <Link
                    href={`/cursos/${program.documentId}/lesson/${currentLessonId}`}
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-8 py-4 rounded-full font-bold transition-all duration-300 shadow-lg shadow-amber-500/30"
                  >
                    <Play size={20} fill="currentColor" />
                    {progress ? 'Continuar donde lo dejaste' : 'Comenzar curso'}
                    <ArrowRight size={20} />
                  </Link>
                )}
              </div>

              {/* Course Image */}
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <img
                  src={program.image}
                  alt={program.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Module List */}
        <section className="py-16 px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Contenido del curso</h2>

            <div className="space-y-4">
              {program.moduleRelations.map((module, moduleIndex) => {
                const isExpanded = expandedModules.has(moduleIndex);
                const moduleCompleted = module.lessons.every((l) =>
                  completedLessons.has(l.documentId)
                );
                const moduleProgress = module.lessons.filter((l) =>
                  completedLessons.has(l.documentId)
                ).length;

                return (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: moduleIndex * 0.1 }}
                    className="border border-white/10 rounded-xl overflow-hidden"
                  >
                    {/* Module Header */}
                    <button
                      onClick={() => toggleModule(moduleIndex)}
                      className="w-full p-6 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            moduleCompleted
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-amber-500/20 text-amber-500'
                          }`}
                        >
                          {moduleCompleted ? (
                            <CheckCircle size={20} />
                          ) : (
                            <span className="font-bold">{moduleIndex + 1}</span>
                          )}
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-white">{module.title}</h3>
                          <p className="text-white/40 text-sm">
                            {module.lessonCount} lecciones • {formatTotalDuration(module.totalDuration)}
                            {progress && (
                              <span className="ml-2 text-amber-500">
                                ({moduleProgress}/{module.lessonCount} completadas)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="text-white/40" size={24} />
                      ) : (
                        <ChevronDown className="text-white/40" size={24} />
                      )}
                    </button>

                    {/* Lessons List */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-white/10">
                            {module.lessons.map((lesson, lessonIndex) => {
                              const isCompleted = completedLessons.has(lesson.documentId);
                              const isFree = lesson.isFree;
                              const canAccess = hasAccess || isFree;

                              return (
                                <Link
                                  key={lesson.id}
                                  href={
                                    canAccess
                                      ? `/cursos/${program.documentId}/lesson/${lesson.documentId}`
                                      : '#'
                                  }
                                  className={`block p-4 pl-20 flex items-center justify-between border-b border-white/5 last:border-0 transition-colors ${
                                    canAccess
                                      ? 'hover:bg-white/5 cursor-pointer'
                                      : 'opacity-50 cursor-not-allowed'
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        isCompleted
                                          ? 'bg-green-500/20 text-green-500'
                                          : canAccess
                                            ? 'bg-white/10 text-white/60'
                                            : 'bg-white/5 text-white/30'
                                      }`}
                                    >
                                      {isCompleted ? (
                                        <CheckCircle size={16} />
                                      ) : canAccess ? (
                                        <Video size={16} />
                                      ) : (
                                        <Lock size={14} />
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-white/80 font-medium">
                                        {lesson.title}
                                        {isFree && !hasAccess && (
                                          <span className="ml-2 text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full">
                                            Vista previa
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-white/40 text-sm">
                                        {formatDuration(lesson.duration)}
                                      </p>
                                    </div>
                                  </div>
                                  {canAccess && !isCompleted && (
                                    <Play className="text-white/30" size={16} />
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
