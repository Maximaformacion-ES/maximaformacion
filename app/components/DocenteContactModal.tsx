'use client';

import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, Send, Check, Loader2 } from 'lucide-react';

type Locale = 'es' | 'en';

const COPY = {
  es: {
    title: (n: string) => `Escríbele a ${n}`,
    subtitle: 'Te responderá en menos de 24 horas, durante el curso y también después.',
    name: 'Tu nombre',
    email: 'Tu email',
    message: 'Tu mensaje',
    send: 'Enviar mensaje',
    sending: 'Enviando…',
    sentTitle: '¡Mensaje enviado!',
    sentBody: (n: string) => `${n} te responderá lo antes posible al email que nos has dejado.`,
    close: 'Cerrar',
  },
  en: {
    title: (n: string) => `Message ${n}`,
    subtitle: 'They’ll reply within 24 hours, during the course and also after it.',
    name: 'Your name',
    email: 'Your email',
    message: 'Your message',
    send: 'Send message',
    sending: 'Sending…',
    sentTitle: 'Message sent!',
    sentBody: (n: string) => `${n} will get back to you at the email you provided.`,
    close: 'Close',
  },
} as const;

/** Formulario de contacto que escribe al docente (resuelto en servidor por slug,
 *  vía /api/docente-contact — anti-relay). Compartido por las fichas de Maxymia
 *  y de /programas. `courseTitle` añade contexto en el email. */
export function DocenteContactModal({
  open,
  onClose,
  docenteSlug,
  docenteName,
  courseTitle,
  locale = 'es',
}: {
  open: boolean;
  onClose: () => void;
  docenteSlug?: string;
  docenteName: string;
  courseTitle?: string;
  locale?: Locale;
}) {
  const t = COPY[locale];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErr('');
    try {
      const res = await fetch('/api/docente-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docenteSlug, name, email, message, courseTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar.');
      setStatus('sent');
    } catch (e) {
      setStatus('error');
      setErr(e instanceof Error ? e.message : 'No se pudo enviar.');
    }
  };

  const inputCls =
    'w-full rounded-lg border border-mx-border bg-white px-4 py-2.5 font-body text-[14px] text-mx-text outline-none transition-colors focus:border-mx-orange';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <m.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-md rounded-2xl bg-mx-bg p-6 md:p-8 shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={t.close}
              className="absolute right-4 top-4 text-mx-text-muted hover:text-mx-text transition-colors"
            >
              <X size={20} />
            </button>

            {status === 'sent' ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mx-orange/15 text-mx-orange">
                  <Check size={26} />
                </div>
                <h3 className="font-sans font-black text-mx-text text-[20px]">{t.sentTitle}</h3>
                <p className="mt-2 font-body text-mx-text-muted text-[14px] leading-relaxed">
                  {t.sentBody(docenteName)}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 rounded-lg bg-mx-orange px-6 py-2.5 font-sans font-medium text-white hover:bg-mx-orange-dark transition-colors"
                >
                  {t.close}
                </button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h3 className="font-sans font-black text-mx-text text-[20px] pr-6">
                  {t.title(docenteName)}
                </h3>
                <p className="mt-1.5 font-body text-mx-text-muted text-[12px] leading-relaxed">{t.subtitle}</p>

                <div className="mt-5 flex flex-col gap-3">
                  <input
                    type="text"
                    required
                    placeholder={t.name}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputCls}
                  />
                  <input
                    type="email"
                    required
                    placeholder={t.email}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                  />
                  <textarea
                    required
                    placeholder={t.message}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className={`${inputCls} resize-none`}
                  />
                </div>

                {status === 'error' && <p className="mt-3 text-[12px] text-red-500">{err}</p>}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-mx-orange px-6 py-3 font-sans font-medium text-white hover:bg-mx-orange-dark transition-colors disabled:opacity-60"
                >
                  {status === 'sending' ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> {t.sending}
                    </>
                  ) : (
                    <>
                      <Send size={16} /> {t.send}
                    </>
                  )}
                </button>
              </form>
            )}
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
