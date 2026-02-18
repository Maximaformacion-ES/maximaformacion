'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
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
      <div className="border border-mx-border bg-mx-card overflow-hidden rounded-lg shadow-sm">

        {/* Program Image */}
        {program.image && (
          <div className="relative aspect-video w-full">
            <Image
              src={program.image}
              alt={program.title}
              className="w-full h-full object-cover"
              fill
              sizes="(max-width: 1024px) 100vw, 350px"
              unoptimized
            />
          </div>
        )}

        <div className="p-6 space-y-6">
        {/* Info */}
        <div className="grid grid-cols-2 gap-4">
          {infoItems.map((item) => (
            <div key={item.label} className="flex items-start gap-2">
              <item.icon size={14} className="text-mx-orange shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] text-mx-text-muted uppercase tracking-widest">
                  {item.label}
                </div>
                <div className="text-mx-text text-sm font-medium">{item.value} {item.label === 'Duración' ? 'horas' : ''}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-mx-border" />

        {/* Pricing */}
        <div>
          <div className="flex items-baseline gap-3">
            {program.originalPrice && (
              <span className="text-mx-text-muted text-lg line-through">
                {program.originalPrice}€
              </span>
            )}
            <span className={`${program.originalPrice ? 'text-mx-orange' : 'text-mx-text'} text-4xl font-black`}>
              {program.price}€
            </span>
          </div>
          {program.originalPrice && (
            <div className="mt-1 text-mx-orange text-xs font-bold">
              Ahorra {program.originalPrice - program.price}€
            </div>
          )}
          <p className="text-mx-text-muted text-xs mt-1">Pago único • Acceso permanente</p>
        </div>

        {/* Guarantee badge */}
        <div className="flex items-center gap-3 px-4 py-3 border border-mx-orange/20 bg-mx-orange/5 rounded-lg">
          <ShieldCheck size={18} className="text-mx-orange shrink-0" />
          <span className="text-xs text-mx-text-muted font-light">
            <span className="font-semibold text-mx-orange">14 días de garantía</span> — Devolución del 100%
          </span>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {/* CTA Button */}
        <div className="space-y-3">
          {isLoaded && hasAccess ? (
            <Link
              href={`/cursos/${program.documentId || program.id}`}
              className="group flex items-center justify-center gap-3 w-full bg-mx-orange text-white px-6 py-4 text-base font-medium rounded-lg hover:bg-mx-orange-dark transition-all duration-300"
            >
              Acceder al Curso
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <m.button
              onClick={handlePurchaseCourse}
              disabled={isLoading}
              className="group flex items-center justify-center gap-3 w-full bg-mx-orange text-white px-6 py-4 text-base font-medium rounded-lg hover:bg-mx-orange-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
            </m.button>
          )}

          {isLoaded && !userHasPro && (
            <Link
              href="/pricing"
              className="flex items-center justify-center gap-2 w-full border border-mx-orange/50 text-mx-orange px-6 py-3 text-sm font-light rounded-lg hover:bg-mx-orange/10 transition-colors"
            >
              <Crown size={16} />
              O hazte Pro por €18/mes
            </Link>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-mx-border" />

        {/* Contact */}
        <div className="space-y-3">
          <div className="text-xs text-mx-text-muted uppercase tracking-widest font-bold">
            Contacto
          </div>
          <a
            href="mailto:cursos@maximaformacion.es"
            className="flex items-center gap-3 text-mx-text-muted text-sm hover:text-mx-orange transition-colors"
          >
            <Mail size={14} />
            cursos@maximaformacion.es
          </a>
          <a
            href="tel:+34635659391"
            className="flex items-center gap-3 text-mx-text-muted text-sm hover:text-mx-orange transition-colors"
          >
            <Phone size={14} />
            +34 635 65 93 91
          </a>
        </div>
        </div>
      </div>
    </div>
  );
};
