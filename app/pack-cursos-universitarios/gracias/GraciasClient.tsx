'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import { CheckCircle2, Mail, ReceiptText } from 'lucide-react';
import { FontStyles } from '../../components/FontStyles';
import { MarketingHeader as Header } from '../../components/MarketingHeader';
import { Footer } from '../../components/Footer';

export default function GraciasClient({
  itemTitle,
  email,
  amount,
}: {
  itemTitle?: string;
  email?: string;
  amount?: number;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main>
        <section className="relative pt-40 pb-24 px-6 md:px-12">
          <div className="max-w-2xl mx-auto">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-mx-orange/10 text-mx-orange flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={32} />
              </div>
              <span className="text-mx-orange text-label-sm md:text-label-md font-medium tracking-[0.5em] uppercase mb-4 block">
                Pago Completado
              </span>
              <h1 className="text-heading-lg md:text-display-sm font-black leading-heading mb-6 text-mx-blue">
                ¡GRACIAS POR <br />
                <span className="text-stroke text-mx-orange">TU COMPRA!</span>
              </h1>

              {itemTitle && (
                <p className="text-body-md text-mx-text font-bold mb-2">{itemTitle}</p>
              )}
              {amount !== undefined && (
                <p className="text-body-sm text-mx-text-muted mb-8">
                  Importe abonado:{' '}
                  {amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </p>
              )}

              <div className="text-left bg-mx-card border border-mx-border rounded-2xl p-8 space-y-5 mb-10">
                <p className="flex gap-3 text-body-sm text-mx-text-muted leading-relaxed">
                  <Mail size={18} className="text-mx-orange shrink-0 mt-0.5" />
                  <span>
                    Tu formación estará <span className="font-bold text-mx-text">disponible próximamente</span>.
                    Te contactaremos {email ? <>en <span className="font-bold text-mx-text">{email}</span></> : 'por email'}{' '}
                    en cuanto abramos el acceso, con todas las instrucciones para empezar. No tienes
                    que hacer nada más.
                  </span>
                </p>
                <p className="flex gap-3 text-body-sm text-mx-text-muted leading-relaxed">
                  <ReceiptText size={18} className="text-mx-orange shrink-0 mt-0.5" />
                  <span>
                    Recibirás la confirmación de compra y tu factura en tu bandeja de entrada (revisa
                    también la carpeta de spam).
                  </span>
                </p>
              </div>

              <p className="text-body-sm text-mx-text-muted">
                ¿Alguna duda? Escríbenos a{' '}
                <a href="mailto:cursos@maximaformacion.es" className="text-mx-orange font-bold">
                  cursos@maximaformacion.es
                </a>
                .
              </p>
              <p className="mt-8">
                <Link
                  href="/"
                  className="inline-block bg-mx-bg border border-mx-border text-mx-text px-8 py-4 rounded-xl font-bold text-label-sm uppercase tracking-widest hover:border-mx-orange/50 transition-all"
                >
                  Volver al inicio
                </Link>
              </p>
            </m.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
