'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import ConsultoriaForm from './ConsultoriaForm';

interface ConsultoriaFormModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ConsultoriaFormModal({ open, onClose }: ConsultoriaFormModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="consultoria-form-title"
    >
      <div
        className="relative w-full max-w-3xl my-8 rounded-2xl bg-mx-bg border border-mx-text/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-mx-text/5 hover:bg-mx-text/10 text-mx-text/70 hover:text-mx-text transition-colors"
        >
          <X size={18} />
        </button>
        <div id="consultoria-form-title" className="px-6 md:px-12 py-12 md:py-14">
          <ConsultoriaForm />
        </div>
      </div>
    </div>
  );
}
