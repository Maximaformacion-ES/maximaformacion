'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Loader2,
  Crown,
  ShieldCheck,
  ArrowRight,
  Monitor,
  Globe,
  Calendar,
  Award,
  Clock,
  GraduationCap,
  Mail,
  Phone,
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import type { Program, PurchasedCourse } from '@/lib/strapi/types';

interface ProgramSidebarProps {
  program: Program;
}

export const ProgramSidebar: React.FC<ProgramSidebarProps> = ({ program }) => {
  const { isSignedIn, user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const infoItems = [
    { icon: Monitor, label: 'Modalidad', value: program.format },
    { icon: Globe, label: 'Idioma', value: program.language },
    { icon: Calendar, label: 'Inicio', value: program.startDate },
    { icon: Award, label: 'Certificación', value: program.certification },
    { icon: Clock, label: 'Duración', value: program.duration },
    { icon: GraduationCap, label: 'Créditos', value: program.ects },
  ].filter((item) => item.value);

  return (
    <div className="sticky top-24">
      <div className="border border-white/10 bg-[#111] p-6 space-y-6">
        {/* Pricing */}
        <div>
          <div className="flex items-baseline gap-3">
            {program.originalPrice && (
              <span className="text-neutral-500 text-lg line-through">
                {program.originalPrice}€
              </span>
            )}
            <span className="text-amber-500 text-4xl font-black">
              {program.price}€
            </span>
          </div>
          {program.originalPrice && (
            <div className="mt-1 text-amber-500 text-xs font-bold">
              Ahorra {program.originalPrice - program.price}€
            </div>
          )}
          <p className="text-neutral-500 text-xs mt-1">Pago único • Acceso permanente</p>
        </div>

        {/* Guarantee badge */}
        <div className="flex items-center gap-3 px-4 py-3 border border-amber-500/20 bg-amber-500/5 rounded-lg">
          <ShieldCheck size={18} className="text-amber-500 shrink-0" />
          <span className="text-xs text-white/80 font-light">
            <span className="font-semibold text-amber-400">14 días de garantía</span> — Devolución del 100%
          </span>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {/* CTA Button */}
        <div className="space-y-3">
          {isLoaded && hasAccess ? (
            <Link
              href={`/cursos/${program.documentId || program.id}`}
              className="group flex items-center justify-center gap-3 w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black px-6 py-4 text-base font-medium rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/30"
            >
              Acceder al Curso
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <motion.button
              onClick={handlePurchaseCourse}
              disabled={isLoading}
              className="group flex items-center justify-center gap-3 w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black px-6 py-4 text-base font-medium rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Procesando...
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  {isSignedIn ? 'Comprar Ahora' : 'Iniciar sesión para comprar'}
                </>
              )}
            </motion.button>
          )}

          {isLoaded && !userHasPro && (
            <Link
              href="/pricing"
              className="flex items-center justify-center gap-2 w-full border border-amber-500/50 text-amber-500 px-6 py-3 text-sm font-light rounded-lg hover:bg-amber-500/10 transition-colors"
            >
              <Crown size={16} />
              O hazte Pro por €18/mes
            </Link>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Info */}
        <div className="space-y-4">
          {infoItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <item.icon size={16} className="text-amber-500 shrink-0" />
              <div>
                <div className="text-[10px] text-neutral-500 uppercase tracking-widest">
                  {item.label}
                </div>
                <div className="text-white text-sm font-medium">{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Contact */}
        <div className="space-y-3">
          <div className="text-xs text-neutral-500 uppercase tracking-widest font-bold">
            Contacto
          </div>
          <a
            href="mailto:cursos@maximaformacion.es"
            className="flex items-center gap-3 text-neutral-400 text-sm hover:text-white transition-colors"
          >
            <Mail size={14} />
            cursos@maximaformacion.es
          </a>
          <a
            href="tel:+34635659391"
            className="flex items-center gap-3 text-neutral-400 text-sm hover:text-white transition-colors"
          >
            <Phone size={14} />
            +34 635 65 93 91
          </a>
        </div>
      </div>
    </div>
  );
};
