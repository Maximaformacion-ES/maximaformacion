'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Download,
  FileText,
  List,
  X,
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Header } from '@/app/components/Header';
import { FontStyles } from '@/app/components/FontStyles';
import VideoPlayer from '@/app/components/VideoPlayer';
import LessonSidebar from '@/app/components/LessonSidebar';
import type {
  ProgramWithLessons,
  Lesson,
  PurchasedCourse,
  CourseProgress,
} from '@/lib/strapi/types';
import type { LessonNavigation } from '@/lib/strapi/lesson-queries';
import CourseAccessGate from '@/app/components/CourseAccessGate';

interface LessonPlayerClientProps {
  program: ProgramWithLessons;
  lesson: Lesson;
  navigation: LessonNavigation;
}

export default function LessonPlayerClient({
  program,
  lesson,
  navigation,
}: LessonPlayerClientProps) {
  const router = useRouter();
  const { isSignedIn, user, isLoaded } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Get user access
  const userHasPro = isSignedIn && user?.publicMetadata?.plan === 'pro';
  const purchasedCourses = (user?.publicMetadata?.purchasedCourses as PurchasedCourse[]) || [];
  const hasPurchased = purchasedCourses.some(
    (c) => c.programId === program.id || c.documentId === program.documentId
  );
  const hasAccess = userHasPro || hasPurchased || lesson.isFree;

  // Get course progress
  const courseProgress =
    (user?.publicMetadata?.courseProgress as Record<string, CourseProgress>) || {};
  const progress = courseProgress[program.documentId];
  const completedLessons = new Set(progress?.completedLessons || []);
  const isAlreadyCompleted = completedLessons.has(lesson.documentId);

  // Handle lesson completion
  const handleLessonComplete = useCallback(async () => {
    if (!isSignedIn || isAlreadyCompleted || isCompleted) return;

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: program.documentId,
          lessonId: lesson.documentId,
          action: 'complete',
        }),
      });
      setIsCompleted(true);
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  }, [isSignedIn, isAlreadyCompleted, isCompleted, program.documentId, lesson.documentId]);

  // Handle video progress milestones
  const handleProgress = useCallback(
    (percent: number) => {
      // Mark as complete when 90% watched
      if (percent >= 90) {
        handleLessonComplete();
      }
    },
    [handleLessonComplete]
  );

  // Navigate to next lesson
  const goToNext = () => {
    if (navigation.next) {
      router.push(`/cursos/${program.documentId}/lesson/${navigation.next.documentId}`);
    }
  };

  // Navigate to previous lesson
  const goToPrevious = () => {
    if (navigation.previous) {
      router.push(`/cursos/${program.documentId}/lesson/${navigation.previous.documentId}`);
    }
  };

  // If user doesn't have access, show access gate
  if (isLoaded && !hasAccess) {
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
      </div>
    );
  }

  const showCompleted = isAlreadyCompleted || isCompleted;

  return (
    <div className="bg-black min-h-screen text-white selection:bg-amber-500/30">
      <FontStyles />
      <div className="grain" />

      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-4 md:px-6 h-16">
          <div className="flex items-center gap-4">
            <Link
              href={`/cursos/${program.documentId}`}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden md:inline">Volver al curso</span>
            </Link>
            <div className="h-6 w-px bg-white/20" />
            <h1 className="text-sm md:text-base font-medium truncate max-w-[200px] md:max-w-none">
              {program.title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-white/40 text-sm hidden md:block">
              Lección {navigation.currentIndex + 1} de {navigation.totalLessons}
            </span>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <List size={18} />
              <span className="hidden md:inline">Contenido</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 min-h-screen flex flex-col lg:flex-row">
        {/* Video and Lesson Content */}
        <div className="flex-1 flex flex-col">
          {/* Video Player */}
          <div className="w-full bg-black">
            {lesson.cloudflareVideoId ? (
              <div className="max-w-6xl mx-auto">
                <VideoPlayer
                  videoId={lesson.cloudflareVideoId}
                  title={lesson.title}
                  onProgress={handleProgress}
                  onComplete={handleLessonComplete}
                  className="w-full"
                />
              </div>
            ) : (
              <div className="aspect-video max-w-6xl mx-auto bg-white/5 flex items-center justify-center">
                <p className="text-white/40">Esta lección no tiene video</p>
              </div>
            )}
          </div>

          {/* Lesson Info */}
          <div className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full">
            {/* Title and Completion Status */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">{lesson.title}</h2>
                {navigation.currentModule && (
                  <p className="text-white/40">
                    Módulo: {navigation.currentModule.title}
                  </p>
                )}
              </div>
              {showCompleted ? (
                <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-full">
                  <CheckCircle size={18} />
                  <span className="font-medium">Completada</span>
                </div>
              ) : (
                <button
                  onClick={handleLessonComplete}
                  className="flex items-center gap-2 text-white/60 hover:text-amber-500 bg-white/5 hover:bg-amber-500/10 px-4 py-2 rounded-full transition-colors"
                >
                  <CheckCircle size={18} />
                  <span>Marcar como completada</span>
                </button>
              )}
            </div>

            {/* Description */}
            {lesson.description && (
              <div
                className="prose prose-invert prose-amber max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: lesson.description }}
              />
            )}

            {/* Resources */}
            {lesson.resources && lesson.resources.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Recursos descargables</h3>
                <div className="space-y-2">
                  {lesson.resources.map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      download
                      className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
                    >
                      <FileText className="text-amber-500" size={20} />
                      <span className="flex-1 text-white/80">{resource.name}</span>
                      <Download className="text-white/40" size={18} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 border-t border-white/10">
              <button
                onClick={goToPrevious}
                disabled={!navigation.previous}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
                  navigation.previous
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                }`}
              >
                <ArrowLeft size={18} />
                <span className="hidden md:inline">Anterior</span>
              </button>

              {navigation.next ? (
                <button
                  onClick={goToNext}
                  className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl transition-colors"
                >
                  <span>Siguiente lección</span>
                  <ArrowRight size={18} />
                </button>
              ) : (
                <Link
                  href={`/cursos/${program.documentId}`}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl transition-colors"
                >
                  <CheckCircle size={18} />
                  <span>Completar curso</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <LessonSidebar
          program={program}
          currentLessonId={lesson.documentId}
          completedLessons={completedLessons}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </main>
    </div>
  );
}
