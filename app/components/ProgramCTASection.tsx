'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Phone, Mail, ShoppingCart, Loader2, Crown } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import type { Program, PurchasedCourse } from '@/lib/strapi/types';

interface ProgramCTASectionProps {
  program: Program;
}

export const ProgramCTASection: React.FC<ProgramCTASectionProps> = ({ program }) => {
  const { isSignedIn, user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has Pro or has purchased this course
  const userHasPro = isSignedIn && user?.publicMetadata?.plan === 'pro';
  const purchasedCourses = (user?.publicMetadata?.purchasedCourses as PurchasedCourse[]) || [];
  const hasPurchased = purchasedCourses.some(
    (c) => c.programId === program.id || c.documentId === program.documentId
  );
  const hasAccess = userHasPro || hasPurchased;

  const handlePurchaseCourse = async () => {
    if (!isSignedIn) {
      window.location.href = `/sign-in?redirect_url=/programas/${program.documentId || program.id}`;
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'course',
          documentId: program.documentId || program.id.toString(),
          programId: String(program.id),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el pago');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago');
      setIsLoading(false);
    }
  };

  return (
    <section className="py-32 md:py-48 px-6 md:px-12 bg-[#111]">
      <div className="max-w-[1200px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8">
            ¿LISTO PARA <span className="text-stroke">COMENZAR?</span>
          </h2>
          <p className="text-xl text-neutral-400 font-light mb-12 max-w-2xl mx-auto">
            Únete a cientos de profesionales que ya están transformando su carrera con este programa.
          </p>
        </motion.div>

        {/* Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-12"
        >
          <div className="inline-flex items-baseline gap-4">
            {program.originalPrice && (
              <span className="text-neutral-500 text-2xl line-through">
                {program.originalPrice}€
              </span>
            )}
            <span className="text-amber-500 text-5xl md:text-6xl font-black">
              {program.price}€
            </span>
          </div>
          {program.originalPrice && (
            <div className="mt-2 text-amber-500 text-sm font-bold">
              Ahorra {program.originalPrice - program.price}€
            </div>
          )}
          <p className="text-neutral-500 text-sm mt-2">Pago único • Acceso permanente</p>
        </motion.div>

        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {/* Show different button based on access status */}
          {isLoaded && hasAccess ? (
            <Link
              href={`/cursos/${program.documentId || program.id}`}
              className="group flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black px-10 py-5 text-lg font-medium rounded-full hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/30"
            >
              Acceder al Curso
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <motion.button
              onClick={handlePurchaseCourse}
              disabled={isLoading}
              className="group flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black px-10 py-5 text-lg font-medium rounded-full hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Procesando...
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  {isSignedIn ? 'Comprar Ahora' : 'Iniciar sesión para comprar'}
                </>
              )}
            </motion.button>
          )}

          {/* Pro subscription option for non-Pro users */}
          {isLoaded && !userHasPro && (
            <Link
              href="/pricing"
              className="flex items-center justify-center gap-3 border border-amber-500/50 text-amber-500 px-10 py-5 text-lg font-light rounded-full hover:bg-amber-500/10 transition-colors"
            >
              <Crown size={20} />
              O hazte Pro por €18/mes
            </Link>
          )}
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16 pt-16 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-8 text-neutral-400"
        >
          <a href="mailto:cursos@maximaformacion.es" className="flex items-center gap-3 hover:text-white transition-colors">
            <Mail size={18} />
            cursos@maximaformacion.es
          </a>
          <a href="tel:+34635659391" className="flex items-center gap-3 hover:text-white transition-colors">
            <Phone size={18} />
            +34 635 65 93 91
          </a>
        </motion.div>
      </div>
    </section>
  );
};
