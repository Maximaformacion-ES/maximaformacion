'use client';

import React, { useState } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Locale, MaxymiaCourse } from '../types';

/**
 * Modal "Te resolvemos tus dudas" del campus, con los componentes del kit
 * shadcn (Dialog, Select, Textarea, Button). El alumno ya está logueado:
 * nombre y email salen de Clerk y solo escribe la duda (y elige el curso si
 * no viene fijado). Envío:
 *  - curso con docente con slug → /api/docente-contact (al tutor, reply-to alumno);
 *  - si no → /api/contact (buzón general) con el asunto del curso.
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
    sentBody: (tutor?: string) => `${tutor ?? 'Tu tutor'} te responderá por email lo antes posible.`,
    close: 'Cerrar',
    cancel: 'Cancelar',
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
    cancel: 'Cancel',
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
  const { user } = useUser();
  const [courseId, setCourseId] = useState(course?.id ?? '');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const selected = course ?? courses.find((c) => c.id === courseId);
  const tutor = selected?.docentes?.[0];
  const tutorName = tutor?.name ?? selected?.instructor.name;
  const tutorAvatar = tutor?.avatar || selected?.instructor.avatar;
  const studentName = user?.fullName || user?.firstName || '';
  const studentEmail = user?.primaryEmailAddress?.emailAddress ?? '';

  // Reset al abrir (ajuste de estado durante el render al cambiar la prop).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setStatus('idle');
      setMessage('');
      setCourseId(course?.id ?? '');
    }
  }

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

  const initials = (tutorName ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg overflow-hidden">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarImage src={tutorAvatar} alt="" />
              <AvatarFallback className="rounded-lg bg-mx-blue/10 text-mx-blue">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <DialogTitle>{t.title}</DialogTitle>
              <DialogDescription>{t.intro(tutorName)}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {status === 'sent' ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto mb-3 size-10 text-green-600" />
            <p className="font-semibold">{t.sentTitle}</p>
            <p className="text-muted-foreground mt-1 text-sm">{t.sentBody(tutorName)}</p>
            <DialogFooter className="mt-6 sm:justify-center">
              <Button type="button" onClick={onClose} className="bg-mx-orange text-white hover:bg-mx-orange-dark">
                {t.close}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={submit} className="min-w-0 space-y-4">
            {!course && (
              <div className="space-y-2">
                <Label htmlFor="tutor-course">{t.course}</Label>
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger id="tutor-course" className="w-full max-w-full [&>span]:truncate">
                    <SelectValue placeholder={t.choose} />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title[locale]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="tutor-message">{t.message}</Label>
              <Textarea
                id="tutor-message"
                required
                rows={5}
                maxLength={5000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.placeholder}
              />
            </div>
            {studentEmail && (
              <p className="text-muted-foreground text-xs">
                {t.asStudent} <span className="text-foreground font-medium">{studentName || studentEmail}</span>
                {studentName ? ` · ${studentEmail}` : ''}
              </p>
            )}
            {status === 'error' && <p className="text-sm text-red-700">{t.error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t.cancel}
              </Button>
              <Button
                type="submit"
                disabled={status === 'sending' || !message.trim() || !selected}
                className="bg-mx-orange text-white hover:bg-mx-orange-dark"
              >
                {status === 'sending' ? <Loader2 className="animate-spin" /> : <Send />}
                {status === 'sending' ? t.sending : t.send}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
