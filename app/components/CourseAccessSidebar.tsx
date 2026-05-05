'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle,
  ExternalLink,
  ArrowRight,
  Monitor,
  Globe,
  Calendar,
  Award,
  Clock,
  GraduationCap,
  Mail,
  Phone,
  KeyRound,
  Play,
} from 'lucide-react';
import type { ProgramWithLessons } from '@/lib/strapi/types';
import {
  MOODLE_INSTANCE_LABELS,
  getMoodleCourseUrl,
  getMoodleForgotPasswordUrl,
} from '@/lib/moodle/public';

interface CourseAccessSidebarProps {
  program: ProgramWithLessons;
  /** First lesson id for the internal player CTA (only used when no Moodle and lessons exist). */
  currentLessonId?: string | null;
  /** Whether the user already has progress (changes the CTA text). */
  hasProgress?: boolean;
}

export const CourseAccessSidebar: React.FC<CourseAccessSidebarProps> = ({
  program,
  currentLessonId,
  hasProgress,
}) => {
  const moodleUrl =
    program.moodle && program.moodleCourseId
      ? getMoodleCourseUrl(program.moodle, program.moodleCourseId)
      : null;
  const moodleForgotUrl = program.moodle ? getMoodleForgotPasswordUrl(program.moodle) : null;
  const moodleLabel = program.moodle ? MOODLE_INSTANCE_LABELS[program.moodle] : null;

  const hasInternalLesson = !moodleUrl && !!currentLessonId;

  const infoItems = [
    { icon: Monitor, label: 'Modalidad', value: program.format },
    { icon: Globe, label: 'Idioma', value: program.language },
    { icon: Calendar, label: 'Inicio', value: program.startDate },
    { icon: Award, label: 'Certificación', value: program.certification },
    { icon: Clock, label: 'Duración', value: program.duration ? `${program.duration} horas` : null },
    {
      icon: GraduationCap,
      label: 'Créditos',
      value: program.ects ? String(program.ects) : null,
    },
  ].filter((item) => item.value);

  return (
    <div className="sticky top-24">
      <div className="border border-mx-border bg-mx-card overflow-hidden rounded-lg shadow-sm">
        {/* Program Image */}
        {program.image && (
          <div className="relative aspect-video w-full">
            <Image
              src={program.image}
              alt={program.title}
              className="w-full h-full object-cover"
              fill
              sizes="(max-width: 1024px) 100vw, 350px"
              unoptimized
            />
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-start gap-2">
                <item.icon size={14} className="text-mx-orange shrink-0 mt-0.5" />
                <div>
                  <div className="text-label-sm text-mx-text-muted uppercase tracking-widest">
                    {item.label}
                  </div>
                  <div className="text-mx-text text-body-sm font-medium">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-mx-border" />

          {/* Access status badge */}
          <div className="flex items-center gap-3 px-4 py-3 border border-green-200 bg-green-50 rounded-lg">
            <CheckCircle size={18} className="text-green-600 shrink-0" />
            <span className="text-label-sm md:text-label-md text-mx-text-muted font-light">
              <span className="font-semibold text-green-700">Acceso activo</span>
              {' — '}Pago confirmado
            </span>
          </div>

          {/* Primary CTA */}
          <div className="space-y-3">
            {moodleUrl ? (
              <>
                <a
                  href={moodleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-3 w-full bg-mx-orange text-white px-6 py-4 text-body-sm md:text-body-md font-medium rounded-lg hover:bg-mx-orange-dark transition-all duration-300 shadow-md shadow-mx-orange/20"
                >
                  <ExternalLink size={18} />
                  Ir al Moodle
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
                {moodleLabel && (
                  <p className="text-mx-text-muted text-label-sm md:text-label-md text-center">
                    {moodleLabel}
                  </p>
                )}
                {moodleForgotUrl && (
                  <a
                    href={moodleForgotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full border border-mx-border text-mx-text-muted hover:text-mx-orange hover:border-mx-orange/50 px-6 py-3 text-body-sm font-light rounded-lg transition-colors"
                  >
                    <KeyRound size={14} />
                    ¿Olvidaste tu contraseña?
                  </a>
                )}
              </>
            ) : hasInternalLesson ? (
              <Link
                href={`/cursos/${program.documentId}/lesson/${currentLessonId}`}
                className="group flex items-center justify-center gap-3 w-full bg-mx-orange text-white px-6 py-4 text-body-sm md:text-body-md font-medium rounded-lg hover:bg-mx-orange-dark transition-all duration-300 shadow-md shadow-mx-orange/20"
              >
                <Play size={18} fill="currentColor" />
                {hasProgress ? 'Continuar curso' : 'Comenzar curso'}
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            ) : (
              <div className="text-center text-mx-text-muted text-label-md py-2">
                Tu acceso aparecerá disponible en breve.
              </div>
            )}
          </div>

          {/* Email helper for Moodle */}
          {moodleUrl && (
            <p className="text-mx-text-muted text-label-md font-light text-center -mt-2">
              Te hemos enviado las credenciales por email. Revisa también tu carpeta de spam.
            </p>
          )}

          {/* Divider */}
          <div className="border-t border-mx-border" />

          {/* Contact */}
          <div className="space-y-3">
            <div className="text-label-sm md:text-label-md text-mx-text-muted uppercase tracking-widest font-bold">
              Contacto
            </div>
            <a
              href="mailto:cursos@maximaformacion.es"
              className="flex items-center gap-3 text-mx-text-muted text-body-sm hover:text-mx-orange transition-colors"
            >
              <Mail size={14} />
              cursos@maximaformacion.es
            </a>
            <a
              href="tel:+34635659391"
              className="flex items-center gap-3 text-mx-text-muted text-body-sm hover:text-mx-orange transition-colors"
            >
              <Phone size={14} />
              +34 635 65 93 91
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
