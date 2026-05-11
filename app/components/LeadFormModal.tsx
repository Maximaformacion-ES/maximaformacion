'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2, Lock, X } from 'lucide-react';
import Link from 'next/link';

const COOKIE_NAME = 'mx_lead_captured';
const COOKIE_MAX_AGE_DAYS = 180;

export function hasLeadCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((c) => c.startsWith(`${COOKIE_NAME}=`));
}

function setLeadCookie() {
  if (typeof document === 'undefined') return;
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${maxAge}; samesite=lax`;
}

export interface LeadFormResult {
  downloads: { id: number; url: string; name: string; mime: string; sizeKB: number }[];
  externalUrl: string | null;
}

interface LeadFormModalProps {
  open: boolean;
  onClose: () => void;
  resourceSlug: string;
  resourceTitle: string;
  /** Called after a successful submit with the resource URLs returned by the API. */
  onSuccess: (result: LeadFormResult) => void;
}

export function LeadFormModal({
  open,
  onClose,
  resourceSlug,
  resourceTitle,
  onSuccess,
}: LeadFormModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    // Autofocus after mount
    const t = setTimeout(() => firstFieldRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      slug: resourceSlug,
      name: String(fd.get('name') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      consent: fd.get('consent') === 'on',
      referer: typeof document !== 'undefined' ? document.referrer || null : null,
    };
    if (!payload.consent) {
      setError('Necesitas aceptar para recibir el recurso por email.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch('/api/leads/resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setLeadCookie();
      onSuccess(data as LeadFormResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-form-title"
    >
      <div
        className="relative w-full max-w-lg my-auto rounded-2xl bg-mx-card border border-mx-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-8 h-8 rounded-full bg-mx-text/10 hover:bg-mx-orange/15 text-mx-text/60 hover:text-mx-orange transition-colors"
        >
          <X size={16} />
        </button>

        <div className="px-6 md:px-8 pt-8 pb-8">
          <header className="mb-6">
            <p className="text-mx-orange text-label-sm md:text-label-md tracking-[0.3em] uppercase font-semibold mb-3">
              Descarga gratuita
            </p>
            <h2 id="lead-form-title" className="text-mx-text text-heading-sm font-bold mb-2 leading-snug text-balance">
              Te enviamos el recurso a tu email
            </h2>
            <p className="text-mx-text-muted text-body-sm font-light leading-relaxed">
              Vas a descargar <span className="font-medium text-mx-text">{resourceTitle}</span>.
              Dinos a dónde mandártelo y recibirás también recursos similares.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-mx-text/70 text-label-md mb-1.5 block">Nombre</span>
              <input
                ref={firstFieldRef}
                name="name"
                type="text"
                required
                placeholder="Tu nombre"
                className="w-full bg-transparent border border-mx-text/15 rounded-lg px-4 py-3 text-mx-text placeholder:text-mx-text/30 text-body-sm focus:outline-none focus:border-mx-orange/60 transition-colors"
              />
            </label>

            <label className="block">
              <span className="text-mx-text/70 text-label-md mb-1.5 block">
                Email <span className="text-mx-orange">*</span>
              </span>
              <input
                name="email"
                type="email"
                required
                placeholder="tu@email.com"
                className="w-full bg-transparent border border-mx-text/15 rounded-lg px-4 py-3 text-mx-text placeholder:text-mx-text/30 text-body-sm focus:outline-none focus:border-mx-orange/60 transition-colors"
              />
            </label>

            <label className="flex items-start gap-3 text-body-sm text-mx-text-muted font-light leading-relaxed">
              <input
                type="checkbox"
                name="consent"
                required
                className="mt-1 accent-mx-orange shrink-0"
              />
              <span>
                Acepto recibir comunicaciones comerciales de Máxima Formación. Puedo darme de baja
                en cualquier momento. Consulta nuestra{' '}
                <Link
                  href="/politica-de-privacidad"
                  target="_blank"
                  className="underline hover:text-mx-orange transition-colors"
                >
                  política de privacidad
                </Link>
                .
              </span>
            </label>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-red-500 text-body-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-mx-orange text-white px-6 py-3.5 rounded-full text-label-md font-medium hover:bg-mx-orange-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {submitting ? 'Enviando…' : 'Acceder a la descarga'}
            </button>

            <p className="flex items-center justify-center gap-2 text-mx-text-muted text-label-md font-light pt-1">
              <Lock size={12} />
              Tus datos se tratan con confidencialidad.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
