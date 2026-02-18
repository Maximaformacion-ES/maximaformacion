'use client';

import React from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import { Crown, Lock, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import type { Program, PurchasedCourse } from '@/lib/strapi/types';
import CourseAccessGate from '@/app/components/CourseAccessGate';

interface ProGateWrapperProps {
  program: Program;
  children: React.ReactNode;
}

const ProUpgradeGate: React.FC<{ programTitle: string }> = ({ programTitle }) => {
  const proFeatures = [
    'Acceso completo al contenido del curso',
    'Certificado descargable al completar',
    'Soporte prioritario 24/7',
    'Recursos y materiales descargables',
    'Sesiones de mentoría grupales',
    'Acceso a la comunidad exclusiva',
  ];

  return (
    <section className="py-20 md:py-32 px-6 md:px-12 bg-gradient-to-b from-[#0a0a0a] to-black">
      <div className="max-w-4xl mx-auto">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Lock Icon */}
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center">
            <Lock className="text-amber-500" size={40} />
          </div>

          {/* Title */}
          <span className="inline-flex items-center gap-2 text-amber-500 text-sm font-medium tracking-[0.3em] uppercase mb-4">
            <Crown size={16} />
            Contenido Exclusivo Pro
          </span>
          <h2 className="text-3xl md:text-5xl font-black  mb-6">
            Este programa requiere{' '}
            <span className="text-amber-500">Pro</span>
          </h2>
          <p className="text-white/60 font-light text-lg mb-10 max-w-2xl mx-auto">
            &quot;{programTitle}&quot; es un programa exclusivo para miembros Pro.
            Actualiza tu plan para acceder a todo el contenido y beneficios.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-10 text-left">
            {proFeatures.map((feature, idx) => (
              <m.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl"
              >
                <Check className="text-amber-500 flex-shrink-0" size={18} />
                <span className="text-white/80">{feature}</span>
              </m.div>
            ))}
          </div>

          {/* Pricing */}
          <div className="p-8 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="text-amber-500" size={20} />
              <span className="text-white/60 text-sm">Plan Pro</span>
            </div>
            <div className="flex items-baseline justify-center gap-1 mb-4">
              <span className="text-5xl font-black text-white">€29</span>
              <span className="text-white/60">/mes</span>
            </div>
            <p className="text-white/40 text-sm mb-6">
              Facturación mensual • Cancela cuando quieras
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-10 py-4 rounded-full font-bold transition-all duration-300 shadow-lg shadow-amber-500/30"
            >
              <Crown size={18} />
              Actualizar a Pro
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Back Link */}
          <Link
            href="/programas"
            className="text-white/60 hover:text-amber-500 transition-colors text-sm"
          >
            ← Volver al catálogo de programas
          </Link>
        </m.div>
      </div>
    </section>
  );
};

export default function ProGateWrapper({ program, children }: ProGateWrapperProps) {
  const { isSignedIn, user } = useUser();

  // Check if user has Pro plan from Clerk metadata
  const userHasPro = isSignedIn && user?.publicMetadata?.plan === 'pro';

  // Check if user has purchased this specific course
  const purchasedCourses = (user?.publicMetadata?.purchasedCourses as PurchasedCourse[]) || [];
  const hasPurchased = purchasedCourses.some(
    (c) => c.programId === program.id || c.documentId === program.documentId
  );

  // User has access if they have Pro OR have purchased this course
  const hasAccess = userHasPro || hasPurchased;

  // Check if program requires payment (Pro or purchase)
  const requiresPayment = program.isPro;

  // If program requires payment and user doesn't have access
  if (requiresPayment && !hasAccess) {
    // Show the course access gate with purchase option
    return (
      <CourseAccessGate
        program={program}
        isSignedIn={isSignedIn || false}
        userHasPro={userHasPro || false}
      />
    );
  }

  return <>{children}</>;
}
