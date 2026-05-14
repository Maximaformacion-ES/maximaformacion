'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ConsultaGratuitaChooser from './ConsultaGratuitaChooser';

export default function FloatingConsultCTA() {
  const [open, setOpen] = useState(false);
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
      <ConsultaGratuitaChooser open={open} onClose={() => setOpen(false)} />
    </>
  );
}
