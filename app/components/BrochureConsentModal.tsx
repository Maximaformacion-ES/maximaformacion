'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Download, Loader2, Lock, X } from 'lucide-react';
import Link from 'next/link';
import { setLeadCookie } from './LeadFormModal';

interface BrochureConsentModalProps {
  open: boolean;
  onClose: () => void;
  programSlug: string;
  programTitle: string;
  /** Fired once the (best-effort) sync finishes — triggers the download. */
  onConfirmed: () => void;
}

/**
 * Minimal consent step for SIGNED-IN users downloading a course brochure
 * (MF-18). We already have their name/email in Clerk, so we don't re-ask for
 * them — the endpoint reads identity from the session. The only thing we
 * capture here is the marketing consent (which isn't stored at registration),
 * so a checked box subscribes them to the newsletter; unchecked still lets
 * them download and records the profile + "Temario Descargado" event for
 * segmentation, just without subscribing.
 */
export function BrochureConsentModal({
  open,
  onClose,
  programSlug,
  programTitle,
  onConfirmed,
}: BrochureConsentModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    // Best-effort: profile + event (and subscription when consented) are
    // recorded server-side from the Clerk session. Never block the download
    // on this — the visitor already owns an account.
    try {
      await fetch('/api/leads/brochure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: programSlug,
          consent,
          referer: typeof document !== 'undefined' ? document.referrer || null : null,
        }),
      });
    } catch {
      // Ignore — proceed to the download regardless.
    }
    setLeadCookie();
    setSubmitting(false);
    onConfirmed();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="brochure-consent-title"
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
            <h2 id="brochure-consent-title" className="text-mx-text text-heading-sm font-bold mb-2 leading-snug text-balance">
              Tu temario está listo
            </h2>
            <p className="text-mx-text-muted text-body-sm font-light leading-relaxed">
              Vas a descargar <span className="font-medium text-mx-text">el temario de {programTitle}</span>.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="flex items-start gap-3 text-body-sm text-mx-text-muted font-light leading-relaxed">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 accent-mx-orange shrink-0"
              />
              <span>
                Quiero recibir comunicaciones comerciales de Máxima Formación. Puedo darme de baja
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-mx-orange text-white px-6 py-3.5 rounded-full text-label-md font-medium hover:bg-mx-orange-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {submitting ? 'Preparando…' : 'Descargar temario'}
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
