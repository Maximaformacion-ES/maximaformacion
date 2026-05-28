'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ConsultaGratuitaChooser from './ConsultaGratuitaChooser';

interface Props {
  /**
   * 'global' (default): "Rellenar formulario" navigates to /contacto.
   *   Used on home and any non-consultoria page.
   * 'consultoria': "Rellenar formulario" opens the inline consultoria form
   *   modal. Used on /consultoria, where the form is project-scoped.
   */
  variant?: 'global' | 'consultoria';
}

export default function FloatingConsultCTA({ variant = 'global' }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ bottom: 'var(--floating-cta-bottom)' }}
        className="fixed right-5 md:right-8 z-40 flex items-center gap-2 bg-mx-orange text-white px-5 py-3.5 rounded-full shadow-lg shadow-mx-orange/20 hover:bg-mx-orange/90 hover:shadow-xl transition-all text-body-sm font-medium"
        aria-label="Consulta gratuita"
      >
        <MessageCircle size={18} />
        <span className="hidden sm:inline">Consulta gratuita</span>
      </button>
      <ConsultaGratuitaChooser
        open={open}
        onClose={() => setOpen(false)}
        formMode={variant === 'consultoria' ? 'consultoria-form' : 'contacto-page'}
      />
    </>
  );
}
