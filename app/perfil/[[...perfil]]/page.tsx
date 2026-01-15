'use client';

import React, { useState } from 'react';
import { UserProfile, useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { FontStyles } from '../../components/FontStyles';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { GraduationCap, BookOpen, Award, Crown, Check, ArrowRight, Sparkles, ExternalLink, Loader2, CreditCard } from 'lucide-react';
import Link from 'next/link';

// Custom page component for "Mis Cursos"
const MisCursosPage = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-white mb-6">Mis Cursos</h2>
    <div className="space-y-4">
      <div className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-amber-500/50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
            <BookOpen className="text-amber-500" size={24} />
          </div>
          <div>
            <h3 className="text-white font-medium">No tienes cursos activos</h3>
            <p className="text-white/60 text-sm">Explora nuestro catálogo de formación</p>
          </div>
        </div>
      </div>
    </div>
    <a 
      href="/programas" 
      className="inline-flex items-center gap-2 mt-6 bg-amber-500 text-black px-6 py-3 rounded-full font-medium hover:bg-amber-400 transition-colors"
    >
      Ver catálogo de cursos
    </a>
  </div>
);

// Custom page component for "Certificados"
const CertificadosPage = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-white mb-6">Mis Certificados</h2>
    <div className="space-y-4">
      <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
            <Award className="text-amber-500" size={24} />
          </div>
          <div>
            <h3 className="text-white font-medium">Sin certificados aún</h3>
            <p className="text-white/60 text-sm">Completa un curso para obtener tu certificado</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Custom page component for "Mi Plan"
const MiPlanPage = () => {
  const { isSignedIn, user } = useUser();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  
  // Check if user has Pro plan from Clerk metadata
  const isPro = isSignedIn && user?.publicMetadata?.plan === 'pro';
  
  // Get subscription info from metadata
  const subscribedAt = user?.publicMetadata?.subscribedAt as string | undefined;
  const subscriptionStatus = user?.publicMetadata?.subscriptionStatus as string | undefined;
  const stripeCustomerId = user?.publicMetadata?.stripeCustomerId as string | undefined;

  // Open Stripe billing portal
  const handleOpenBillingPortal = async () => {
    setIsLoadingPortal(true);
    try {
      const response = await fetch('/api/billing-portal', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Error al acceder al portal de facturación');
      }
    } catch (error) {
      console.error('Billing portal error:', error);
      alert('Error al acceder al portal de facturación');
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const freeFeatures = [
    'Acceso a cursos gratuitos',
    'Blog y recursos educativos',
    'Soporte por email',
  ];

  const proFeatures = [
    'Todo lo del plan Free',
    'Cursos exclusivos premium',
    'Certificados descargables',
    'Soporte prioritario 24/7',
    'Recursos descargables',
    'Sesiones de mentoría',
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Mi Plan</h2>
      
      {/* Current Plan Card */}
      <div className={`p-6 rounded-xl border mb-6 ${
        isPro 
          ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/5 border-amber-500/50' 
          : 'bg-white/5 border-white/10'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isPro ? 'bg-amber-500/30' : 'bg-white/10'
            }`}>
              {isPro ? (
                <Crown className="text-amber-500" size={24} />
              ) : (
                <Sparkles className="text-white/60" size={24} />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Plan {isPro ? 'Pro' : 'Free'}
              </h3>
              <p className="text-white/60 text-sm">
                {isPro ? 'Acceso completo a todo el contenido' : 'Plan básico gratuito'}
              </p>
            </div>
          </div>
          {isPro && (
            <span className="px-3 py-1 bg-amber-500 text-black text-xs font-bold rounded-full">
              ACTIVO
            </span>
          )}
        </div>

        <div className="space-y-2 mb-6">
          {(isPro ? proFeatures : freeFeatures).map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Check className={isPro ? 'text-amber-500' : 'text-white/40'} size={16} />
              <span className="text-white/80 text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {!isPro && (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-full font-bold transition-colors"
          >
            <Crown size={18} />
            Actualizar a Pro
            <ArrowRight size={18} />
          </Link>
        )}
      </div>

      {/* Upgrade Benefits (for Free users) */}
      {!isPro && (
        <div className="p-6 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Crown className="text-amber-500" size={20} />
            Beneficios de Pro
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              'Cursos exclusivos',
              'Certificados',
              'Soporte 24/7',
              'Mentoría grupal',
              'Recursos premium',
              'Acceso anticipado',
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Check className="text-amber-500" size={14} />
                <span className="text-white/70 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
          <p className="text-amber-500 text-sm mt-4 font-medium">
            Desde €29/mes • Cancela cuando quieras
          </p>
        </div>
      )}

      {/* Billing Info (for Pro users) */}
      {isPro && (
        <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-4">Información de suscripción</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Estado:</span>
              <span className={`font-medium ${subscriptionStatus === 'active' ? 'text-green-400' : 'text-amber-500'}`}>
                {subscriptionStatus === 'active' ? 'Activa' : subscriptionStatus || 'Activa'}
              </span>
            </div>
            {subscribedAt && (
              <div className="flex justify-between">
                <span className="text-white/60">Suscrito desde:</span>
                <span className="text-white">
                  {new Date(subscribedAt).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            )}
          </div>
          
          {/* Stripe Billing Portal Button */}
          {stripeCustomerId && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                onClick={handleOpenBillingPortal}
                disabled={isLoadingPortal}
                className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                {isLoadingPortal ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    Gestionar facturación
                    <ExternalLink size={14} className="opacity-60" />
                  </>
                )}
              </button>
              <p className="text-white/40 text-xs text-center mt-3">
                Accede al portal de Stripe para ver facturas, actualizar método de pago o cancelar suscripción.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function PerfilPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-black min-h-screen text-white selection:bg-amber-500/30 overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10 pt-24 pb-32">
        {/* Hero Section */}
        <section className="px-6 md:px-12 py-16 bg-linear-to-b from-amber-500/5 to-transparent">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <span className="text-amber-500 text-sm font-medium tracking-[0.3em] uppercase mb-4 block">
                Mi Cuenta
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
                Mi Perfil
              </h1>
              <p className="text-white/60 font-light max-w-xl mx-auto">
                Gestiona tu información personal, cursos y certificados
              </p>
            </motion.div>
          </div>
        </section>

        {/* User Profile Section */}
        <section className="px-6 md:px-12">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="user-profile-container"
            >
              <UserProfile
                routing="path"
                path="/perfil"
                appearance={{
                  variables: {
                    colorPrimary: '#f59e0b',
                    colorBackground: '#141414',
                    colorText: '#ffffff',
                    colorTextSecondary: '#a3a3a3',
                    colorInputBackground: '#1a1a1a',
                    colorInputText: '#ffffff',
                    colorNeutral: '#ffffff',
                    borderRadius: '0.75rem',
                  },
                  elements: {
                    rootBox: 'w-full',
                    card: 'bg-[#141414] border border-amber-500/20 shadow-2xl shadow-amber-500/5 rounded-xl',
                    navbar: 'bg-[#0a0a0a] border-r border-white/10',
                    navbarButton: 'text-white/70 hover:text-amber-500 hover:bg-white/5 transition-colors',
                    navbarButtonActive: 'text-amber-500 bg-amber-500/10',
                    navbarButtonIcon: 'text-current',
                    pageScrollBox: 'bg-[#141414]',
                    page: 'bg-[#141414]',
                    profileSection: 'border-b border-white/10',
                    profileSectionTitle: 'text-white font-bold',
                    profileSectionTitleText: 'text-white font-bold',
                    profileSectionSubtitle: 'text-white/60',
                    profileSectionContent: 'text-white/80',
                    formFieldLabel: 'text-white font-medium',
                    formFieldInput: 'bg-[#1a1a1a] border-2 border-white/20 text-white placeholder:text-white/40 focus:border-amber-500 rounded-lg',
                    formButtonPrimary: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-lg',
                    formButtonReset: 'text-white/60 hover:text-white',
                    avatarBox: 'border-2 border-amber-500/50',
                    avatarImageActions: 'bg-[#1a1a1a] border border-white/20',
                    avatarImageActionsUpload: 'text-amber-500 hover:text-amber-400',
                    avatarImageActionsRemove: 'text-red-400 hover:text-red-300',
                    userPreview: 'bg-[#0a0a0a] border border-white/10 rounded-lg',
                    userPreviewMainIdentifier: 'text-white font-medium',
                    userPreviewSecondaryIdentifier: 'text-white/60',
                    accordionTriggerButton: 'text-white hover:bg-white/5',
                    accordionContent: 'bg-[#0a0a0a] border-t border-white/10',
                    badge: 'bg-amber-500/20 text-amber-500 border border-amber-500/30',
                    headerTitle: 'text-white font-bold',
                    headerSubtitle: 'text-white/60',
                    footer: 'hidden',
                    // Hide Clerk's built-in billing section (we use Stripe directly)
                    billingPage: 'hidden',
                    billingSection: 'hidden',
                    'cl-billingPage': 'hidden',
                    'cl-billingSection': 'hidden',
                  }
                }}
              >
                {/* Custom Page: Mi Plan */}
                <UserProfile.Page 
                  label="Mi Plan" 
                  labelIcon={<Crown size={16} />}
                  url="plan"
                >
                  <MiPlanPage />
                </UserProfile.Page>

                {/* Custom Page: Mis Cursos */}
                <UserProfile.Page 
                  label="Mis Cursos" 
                  labelIcon={<GraduationCap size={16} />}
                  url="cursos"
                >
                  <MisCursosPage />
                </UserProfile.Page>

                {/* Custom Page: Certificados */}
                <UserProfile.Page 
                  label="Certificados" 
                  labelIcon={<Award size={16} />}
                  url="certificados"
                >
                  <CertificadosPage />
                </UserProfile.Page>

                {/* External Link: Campus */}
                <UserProfile.Link 
                  label="Ir al Campus" 
                  labelIcon={<BookOpen size={16} />}
                  url="https://maximaformacion.com.es/"
                />
              </UserProfile>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
