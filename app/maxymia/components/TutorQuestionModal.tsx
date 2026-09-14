'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m } from 'framer-motion';
import { CheckCircle2, Loader2, MessageCircle, Send, X } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useMounted } from '@/app/hooks/useMounted';
import type { Locale, MaxymiaCourse } from '../types';

/**
 * Modal "Te resolvemos tus dudas" del campus. El alumno ya está logueado, así
 * que nombre y email salen de Clerk y solo escribe la duda (y elige el curso
 * si no viene fijado). Envío:
 *  - si el curso tiene docente con slug → /api/docente-contact (le llega al
 *    tutor, con reply-to del alumno);
 *  - si no → /api/contact (buzón general de Máxima) con el asunto del curso.
 */

const COPY = {
  es: {
    title: '¿Tienes dudas? Te las resolvemos',
    intro: (tutor?: string) =>
      tutor ? `${tutor} responde a tus preguntas sobre el curso.` : 'Tu tutor responde a tus preguntas sobre el curso.',
    course: 'Curso',
    choose: 'Elige un curso',
    message: 'Tu duda',
    placeholder: 'Cuéntanos qué no te ha quedado claro, en qué lección estás y qué has probado…',
    send: 'Enviar duda',
    sending: 'Enviando…',
    sentTitle: '¡Duda enviada!',
    sentBody: (tutor?: string) =>
      `${tutor ?? 'Tu tutor'} te responderá por email lo antes posible.`,
    close: 'Cerrar',
    error: 'No se pudo enviar. Inténtalo de nuevo en unos minutos.',
    asStudent: 'Se enviará como',
  },
  en: {
    title: 'Questions? We are here to help',
    intro: (tutor?: string) =>
      tutor ? `${tutor} answers your questions about the course.` : 'Your tutor answers your questions about the course.',
    course: 'Course',
    choose: 'Choose a course',
    message: 'Your question',
    placeholder: 'Tell us what is unclear, which lesson you are on and what you have tried…',
    send: 'Send question',
    sending: 'Sending…',
    sentTitle: 'Question sent!',
    sentBody: (tutor?: string) => `${tutor ?? 'Your tutor'} will reply by email as soon as possible.`,
    close: 'Close',
    error: 'Could not send. Please try again in a few minutes.',
    asStudent: 'Sent as',
  },
} as const;

interface Props {
  open: boolean;
  onClose: () => void;
  locale?: Locale;
  /** Curso fijado (vista de alumno). Si no viene, se elige entre `courses`. */
  course?: MaxymiaCourse;
  courses?: MaxymiaCourse[];
}

export default function TutorQuestionModal({ open, onClose, locale = 'es', course, courses = [] }: Props) {
  const t = COPY[locale];
  const mounted = useMounted();
  const { user } = useUser();
  const [courseId, setCourseId] = useState(course?.id ?? '');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const selected = course ?? courses.find((c) => c.id === courseId);
  const tutor = selected?.docentes?.[0];
  const tutorName = tutor?.name ?? selected?.instructor.name;
  const studentName = user?.fullName || user?.firstName || '';
  const studentEmail = user?.primaryEmailAddress?.emailAddress ?? '';

  // Reset al abrir.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setStatus('idle');
      setMessage('');
      setCourseId(course?.id ?? '');
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !message.trim() || !studentEmail) return;
    setStatus('sending');
    try {
      const courseTitle = selected.title[locale];
      const res = tutor?.slug
        ? await fetch('/api/docente-contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ docenteSlug: tutor.slug, name: studentName, email: studentEmail, message, courseTitle }),
          })
        : await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: studentName,
              email: studentEmail,
              message,
              subject: `${locale === 'es' ? 'Duda de alumno' : 'Student question'} · ${courseTitle}`,
            }),
          });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-6"
          onClick={onClose}
        >
          <m.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tutor-question-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-mx-border bg-mx-card shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-mx-border">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-mx-blue/10 text-mx-blue flex items-center justify-center shrink-0 overflow-hidden">
                  {tutor?.avatar || selected?.instructor.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tutor?.avatar || selected?.instructor.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <MessageCircle size={18} />
                  )}
                </div>
                <div>
                  <h2 id="tutor-question-title" className="text-body-md font-bold text-mx-text">
                    {t.title}
                  </h2>
                  <p className="text-label-md text-mx-text-muted mt-0.5">{t.intro(tutorName)}</p>
                </div>
              </div>
              <button onClick={onClose} aria-label={t.close} className="p-2 -mr-2 -mt-2 rounded-full hover:bg-black/[0.04] text-mx-text-muted">
                <X size={18} />
              </button>
            </div>

            {status === 'sent' ? (
              <div className="px-6 py-10 text-center">
                <CheckCircle2 size={40} className="mx-auto text-green-600 mb-3" />
                <p className="text-body-md font-bold text-mx-text mb-1">{t.sentTitle}</p>
                <p className="text-body-sm text-mx-text-muted mb-6">{t.sentBody(tutorName)}</p>
                <button onClick={onClose} className="inline-flex items-center justify-center rounded-lg bg-mx-orange text-white px-5 py-2.5 text-body-sm font-medium hover:bg-mx-orange-dark transition-colors">
                  {t.close}
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="px-6 py-5 space-y-4">
                {!course && (
                  <label className="block">
                    <span className="block text-label-md font-medium text-mx-text mb-1.5">{t.course}</span>
                    <select
                      required
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                      className="w-full rounded-lg border border-mx-border bg-mx-card px-3 py-2.5 text-body-sm text-mx-text focus:outline-none focus:ring-2 focus:ring-mx-orange/40"
                    >
                      <option value="" disabled>{t.choose}</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.title[locale]}</option>
                      ))}
                    </select>
                  </label>
                )}
                <label className="block">
                  <span className="block text-label-md font-medium text-mx-text mb-1.5">{t.message}</span>
                  <textarea
                    required
                    rows={5}
                    maxLength={5000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.placeholder}
                    className="w-full rounded-lg border border-mx-border bg-mx-card px-3 py-2.5 text-body-sm text-mx-text placeholder:text-mx-text-muted focus:outline-none focus:ring-2 focus:ring-mx-orange/40 resize-y"
                  />
                </label>
                {studentEmail && (
                  <p className="text-label-md text-mx-text-muted">
                    {t.asStudent} <span className="text-mx-text font-medium">{studentName || studentEmail}</span>
                    {studentName ? ` · ${studentEmail}` : ''}
                  </p>
                )}
                {status === 'error' && <p className="text-body-sm text-red-700">{t.error}</p>}
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={onClose} className="rounded-lg border border-mx-border px-4 py-2.5 text-body-sm text-mx-text-muted hover:text-mx-text hover:border-mx-orange/40 transition-colors">
                    {t.close}
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'sending' || !message.trim() || !selected}
                    className="inline-flex items-center gap-2 rounded-lg bg-mx-orange text-white px-5 py-2.5 text-body-sm font-medium hover:bg-mx-orange-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'sending' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {status === 'sending' ? t.sending : t.send}
                  </button>
                </div>
              </form>
            )}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
