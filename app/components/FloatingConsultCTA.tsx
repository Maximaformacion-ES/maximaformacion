'use client';

import { useEffect, useState } from 'react';
import { Calendar, MessageCircle, PenSquare, X } from 'lucide-react';

const SCHEDULE_URL =
  'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ3kfq4Oykzp4tRiY7GHPyz0C3fIzPmdWDHIBuFG3rS3aaVr6SLu9pN3nIUg9nM8gMDuTQK1gFF5';

export default function FloatingConsultCTA() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const scrollToForm = () => {
    setOpen(false);
    const el = document.getElementById('consultoria-form');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-40 flex items-center gap-2 bg-mx-orange text-white px-5 py-3.5 rounded-full shadow-lg shadow-mx-orange/20 hover:bg-mx-orange/90 hover:shadow-xl transition-all text-body-sm font-medium"
        aria-label="Consulta gratuita"
      >
        <MessageCircle size={18} />
        <span className="hidden sm:inline">Consulta gratuita</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-[#111] border border-white/10 p-6 md:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors p-1"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <h3 className="text-white text-heading-sm font-bold mb-2">
              ¿Cómo prefieres empezar?
            </h3>
            <p className="text-white/60 text-body-sm mb-6">
              Cuéntanos tu caso por formulario o agenda directamente una llamada con nosotros.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={scrollToForm}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-mx-orange text-white hover:bg-mx-orange/90 transition-colors text-body-sm font-medium"
              >
                <PenSquare size={18} />
                <div className="text-left flex-1">
                  <p className="font-semibold">Rellenar formulario</p>
                  <p className="text-white/70 text-label-md font-normal">
                    Cuéntanos los detalles de tu proyecto
                  </p>
                </div>
              </button>
              <a
                href={SCHEDULE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/15 text-white hover:bg-white/5 hover:border-white/30 transition-colors text-body-sm"
              >
                <Calendar size={18} className="text-mx-orange" />
                <div className="text-left flex-1">
                  <p className="font-semibold">Agendar videollamada</p>
                  <p className="text-white/50 text-label-md font-normal">
                    Elige un hueco en nuestro calendario
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
