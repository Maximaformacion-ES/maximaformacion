'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import {
  Crown,
  Lock,
  Check,
  ArrowRight,
  Sparkles,
  ShoppingCart,
  Loader2,
} from 'lucide-react';
import type { Program } from '@/lib/strapi/types';
import { trackBeginCheckout } from '@/lib/analytics';

interface CourseAccessGateProps {
  program: Program;
  isSignedIn: boolean;
  userHasPro: boolean;
}

export default function CourseAccessGate({
  program,
  isSignedIn,
  userHasPro,
}: CourseAccessGateProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const proFeatures = [
    'Acceso ilimitado a todos los cursos',
    'Certificados descargables',
    'Soporte prioritario 24/7',
    'Recursos y materiales descargables',
    'Sesiones de mentoría grupales',
    'Comunidad exclusiva',
  ];

  const courseFeatures = [
    'Acceso permanente al curso',
    'Certificado de finalización',
    'Materiales del curso descargables',
    'Actualizaciones gratuitas',
  ];

  const handlePurchaseCourse = async () => {
    if (!isSignedIn) {
      // Redirect to sign in with return URL
      window.location.href = `/sign-in?redirect_url=/programas/${program.slug}`;
      return;
    }

    setIsLoading(true);
    setError(null);

    trackBeginCheckout([
      {
        item_id: program.slug,
        item_name: program.title,
        item_category: program.type,
        price: program.price,
      },
    ]);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'course',
          documentId: program.documentId,
          programId: String(program.id),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el pago');
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago');
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  return (
    <section className="py-20 md:py-32 px-6 md:px-12 bg-gradient-to-b from-[#0a0a0a] to-black">
      <div className="max-w-6xl mx-auto">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          {/* Lock Icon */}
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center">
            <Lock className="text-amber-500" size={40} />
          </div>

          {/* Title */}
          <span className="inline-flex items-center gap-2 text-amber-500 text-body-sm font-medium tracking-[0.3em] uppercase mb-4">
            <Crown size={16} />
            Contenido Premium
          </span>
          <h2 className="text-heading-lg md:text-display-sm font-black  mb-6">
            Accede a &quot;{program.title}&quot;
          </h2>
          <p className="text-white/60 font-light text-body-lg mb-10 max-w-2xl mx-auto">
            Este programa es exclusivo. Elige la opción que mejor se adapte a ti.
          </p>
        </m.div>

        {/* Two Options Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Option 1: Buy Course */}
          <m.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="p-8 bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl transition-all"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <ShoppingCart className="text-white" size={24} />
              <span className="text-white font-semibold text-body-lg">Comprar este curso</span>
            </div>

            <div className="flex items-baseline justify-center gap-1 mb-2">
              {program.originalPrice && program.originalPrice > program.price && (
                <span className="text-white/40 text-heading-sm line-through mr-2">
                  {formatPrice(program.originalPrice)}
                </span>
              )}
              <span className="text-display-sm font-black text-white">
                {formatPrice(program.price)}
              </span>
            </div>
            <p className="text-white/40 text-body-sm mb-6 text-center">
              Pago único • Acceso permanente
            </p>

            {/* Course Features */}
            <div className="space-y-3 mb-8">
              {courseFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <Check className="text-green-500 flex-shrink-0" size={16} />
                  <span className="text-white/70 text-body-sm">{feature}</span>
                </div>
              ))}
            </div>

            {error && (
              <p className="text-red-400 text-body-sm mb-4 text-center">{error}</p>
            )}

            <button
              onClick={handlePurchaseCourse}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-black px-6 py-4 rounded-full font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Procesando...
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  {isSignedIn ? 'Comprar ahora' : 'Iniciar sesión para comprar'}
                </>
              )}
            </button>
          </m.div>

          {/* Option 2: Pro Subscription */}
          <m.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="p-8 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl relative overflow-hidden"
          >
            {/* Recommended Badge */}
            <div className="absolute top-0 right-0 bg-amber-500 text-black text-label-md font-bold px-4 py-1 rounded-bl-xl">
              RECOMENDADO
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
              <Crown className="text-amber-500" size={24} />
              <span className="text-amber-500 font-semibold text-body-lg">Suscripción Pro</span>
            </div>

            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-display-sm font-black text-white">€18</span>
              <span className="text-white/60">/mes</span>
            </div>
            <p className="text-white/40 text-body-sm mb-6 text-center">
              Cancela cuando quieras
            </p>

            {/* Pro Features */}
            <div className="space-y-3 mb-8">
              {proFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <Sparkles className="text-amber-500 flex-shrink-0" size={16} />
                  <span className="text-white/70 text-body-sm">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/pricing"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-6 py-4 rounded-full font-bold transition-all duration-300 shadow-lg shadow-amber-500/30"
            >
              <Crown size={18} />
              Hazte Pro
              <ArrowRight size={18} />
            </Link>

            <p className="text-center text-white/40 text-label-md mt-4">
              Acceso a +50 cursos y masters
            </p>
          </m.div>
        </div>

        {/* Back Link */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            href="/programas"
            className="text-white/60 hover:text-amber-500 transition-colors text-body-sm"
          >
            ← Volver al catálogo de programas
          </Link>
        </m.div>
      </div>
    </section>
  );
}
