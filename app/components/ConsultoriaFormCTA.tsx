'use client';

import { m } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface ConsultoriaFormCTAProps {
  onOpenForm: () => void;
}

export default function ConsultoriaFormCTA({ onOpenForm }: ConsultoriaFormCTAProps) {
  return (
    <section id="consultoria-form" className="px-6 md:px-12 py-24">
      <div className="max-w-4xl mx-auto">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl border border-mx-orange/20 bg-gradient-to-br from-mx-orange/10 via-mx-bg to-mx-bg p-10 md:p-16 text-center"
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-mx-orange/10 rounded-full blur-[100px] pointer-events-none" />

          <p className="relative text-mx-orange text-label-md tracking-[0.3em] uppercase font-semibold mb-3">
            Consulta gratuita
          </p>
          <h2 className="relative text-mx-text text-heading-md md:text-heading-lg xl:text-display-sm font-bold mb-5 max-w-2xl mx-auto text-balance">
            ¿Listo para sacarle todo el partido a tus datos?
          </h2>
          <p className="relative text-mx-text/60 text-body-md md:text-body-lg font-light mb-10 max-w-xl mx-auto leading-relaxed">
            Cuéntanos tu proyecto y preparamos una propuesta adaptada a tus datos y objetivos. Sin compromiso.
          </p>

          <button
            type="button"
            onClick={onOpenForm}
            className="relative inline-flex items-center gap-2 bg-mx-orange text-white px-8 py-4 rounded-full text-body-md font-medium hover:bg-mx-orange/90 hover:shadow-lg hover:shadow-mx-orange/20 transition-all"
          >
            Solicitar consulta gratuita
            <ArrowRight size={18} />
          </button>
        </m.div>
      </div>
    </section>
  );
}
