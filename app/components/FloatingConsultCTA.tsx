'use client';

import { MessageCircle } from 'lucide-react';
import { SCHEDULE_URL } from './ConsultaGratuitaChooser';

/**
 * Floating "Consulta gratuita" CTA shown on every page except /consultoria.
 * Outside of consultoría the user only needs the direct path to Alfonso's
 * calendar — the form route (the other branch of the chooser modal) is
 * scoped to /consultoria, where it makes sense to also let the visitor
 * write a short brief before booking.
 */
export default function FloatingConsultCTA() {
  return (
    <a
      href={SCHEDULE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-40 flex items-center gap-2 bg-mx-orange text-white px-5 py-3.5 rounded-full shadow-lg shadow-mx-orange/20 hover:bg-mx-orange/90 hover:shadow-xl transition-all text-body-sm font-medium"
      aria-label="Consulta gratuita — agenda una videollamada"
    >
      <MessageCircle size={18} />
      <span className="hidden sm:inline">Consulta gratuita</span>
    </a>
  );
}
