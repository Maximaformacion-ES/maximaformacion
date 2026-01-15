'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FontStyles } from '../../components/FontStyles';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { ProgramHeroSection } from '../../components/ProgramHeroSection';
import { ProgramOverview } from '../../components/ProgramOverview';
import { ProgramCurriculum } from '../../components/ProgramCurriculum';
import { ProgramAudience } from '../../components/ProgramAudience';
import { ProgramCTASection } from '../../components/ProgramCTASection';
import { COMPLETE_PROGRAMS } from '../../data/programs';
import { Crown, Lock, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface ProgramPageProps {
  params: Promise<{
    id: string;
  }> | {
    id: string;
  };
}

// Pro Upgrade Gate Component
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
        <motion.div
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
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6">
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
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl"
              >
                <Check className="text-amber-500 flex-shrink-0" size={18} />
                <span className="text-white/80">{feature}</span>
              </motion.div>
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
        </motion.div>
      </div>
    </section>
  );
};

export default function ProgramPage({ params }: ProgramPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const resolvedParams = use(params instanceof Promise ? params : Promise.resolve(params));
  const programId = parseInt(resolvedParams.id, 10);
  const program = COMPLETE_PROGRAMS.find(p => p.id === programId);

  // Check if user has Pro plan from Clerk metadata
  const userHasPro = isSignedIn && user?.publicMetadata?.plan === 'pro';

  if (!program) {
    return (
      <div className="bg-black min-h-screen text-white selection:bg-amber-500/30 overflow-x-hidden">
        <FontStyles />
        <div className="grain" />
        
        <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

        <main className="relative z-10 flex items-center justify-center min-h-screen px-6">
          <div className="text-center max-w-2xl">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Programa no encontrado
            </h2>
            <p className="text-neutral-400 mb-8 font-light">
              El programa que buscas no existe o ha sido eliminado.
            </p>
            <Link
              href="/programas"
              className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-base font-medium rounded-full hover:bg-amber-500 hover:text-white transition-colors duration-300"
            >
              Ver todos los programas
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Check if program is Pro-only and user doesn't have Pro
  const isProGated = program.isPro && !userHasPro;

  return (
    <div className="bg-black min-h-screen text-white selection:bg-amber-500/30 overflow-x-hidden">
      <FontStyles />
      <div className="grain" />
      
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10">
        <ProgramHeroSection program={program} />
        
        {isProGated ? (
          <ProUpgradeGate programTitle={program.title} />
        ) : (
          <>
            <ProgramOverview program={program} />
            <ProgramCurriculum program={program} />
            <ProgramAudience program={program} />
            <ProgramCTASection program={program} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
