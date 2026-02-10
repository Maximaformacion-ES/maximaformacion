'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { FontStyles } from '../../components/FontStyles';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { GraduationCap, BookOpen, Award, Crown, Check, ArrowRight, Sparkles, ExternalLink, Loader2, CreditCard, Play } from 'lucide-react';
import Link from 'next/link';
import CourseProgressCard from '../../components/CourseProgressCard';
import type { UserCourseData } from '@/lib/strapi/types';

// Custom page component for "Mis Cursos"
const MisCursosPage = () => {
  const [courses, setCourses] = useState<UserCourseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasProAccess, setHasProAccess] = useState(false);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/user/courses');
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        setCourses(data.courses || []);
        setHasProAccess(data.hasProAccess || false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading courses');
      } finally {
        setIsLoading(false);
      }
    }
    fetchCourses();
  }, []);

  // Find the course with most recent activity for "Continue where you left off"
  const inProgressCourse = courses.find(
    (c) => c.progress && c.progress.progressPercent > 0 && c.progress.progressPercent < 100
  );

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="text-mx-orange animate-spin" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-mx-text mb-6">Mis Cursos</h2>
        <div className="p-6 bg-mx-bg border border-mx-border rounded-xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-mx-orange/10 rounded-full flex items-center justify-center">
            <BookOpen className="text-mx-orange" size={28} />
          </div>
          <h3 className="text-mx-text font-semibold text-lg mb-2">No tienes cursos aún</h3>
          <p className="text-mx-text-muted mb-6">
            {hasProAccess
              ? 'Tu suscripción Pro te da acceso a todos los cursos premium.'
              : 'Explora nuestro catálogo y empieza tu formación hoy.'}
          </p>
          <Link
            href="/programas"
            className="inline-flex items-center gap-2 bg-mx-orange hover:bg-mx-orange-dark text-white px-6 py-3 rounded-full font-medium transition-colors"
          >
            Explorar cursos
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-mx-text mb-6">Mis Cursos</h2>

      {/* Continue Learning Section */}
      {inProgressCourse && (
        <div className="mb-8 p-4 bg-mx-orange/5 border border-mx-orange/20 rounded-xl">
          <p className="text-mx-orange text-sm font-medium mb-3">Continuar donde lo dejaste</p>
          <div className="flex items-center gap-4">
            <img
              src={inProgressCourse.program.image}
              alt={inProgressCourse.program.title}
              className="w-20 h-14 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-mx-text font-medium truncate">{inProgressCourse.program.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-mx-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-mx-orange rounded-full"
                    style={{ width: `${inProgressCourse.progress?.progressPercent || 0}%` }}
                  />
                </div>
                <span className="text-mx-orange text-xs font-medium">
                  {inProgressCourse.progress?.progressPercent || 0}%
                </span>
              </div>
            </div>
            <Link
              href={`/cursos/${inProgressCourse.program.documentId}${
                inProgressCourse.progress?.currentLessonId
                  ? `/lesson/${inProgressCourse.progress.currentLessonId}`
                  : ''
              }`}
              className="flex items-center gap-2 bg-mx-orange hover:bg-mx-orange-dark text-white px-4 py-2 rounded-full font-medium transition-colors"
            >
              <Play size={16} fill="currentColor" />
              Continuar
            </Link>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {courses.map((courseData, index) => (
          <CourseProgressCard key={courseData.program.id} courseData={courseData} index={index} />
        ))}
      </div>

      {/* Explore More */}
      <div className="mt-8 text-center">
        <Link
          href="/programas"
          className="text-mx-orange hover:text-mx-orange-dark text-sm font-medium transition-colors"
        >
          Ver más cursos →
        </Link>
      </div>
    </div>
  );
};

// Custom page component for "Certificados"
const CertificadosPage = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-mx-text mb-6">Mis Certificados</h2>
    <div className="space-y-4">
      <div className="p-4 bg-mx-bg border border-mx-border rounded-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-mx-orange/10 rounded-lg flex items-center justify-center">
            <Award className="text-mx-orange" size={24} />
          </div>
          <div>
            <h3 className="text-mx-text font-medium">Sin certificados aún</h3>
            <p className="text-mx-text-muted text-sm">Completa un curso para obtener tu certificado</p>
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
      <h2 className="text-2xl font-bold text-mx-text mb-6">Mi Plan</h2>

      {/* Current Plan Card */}
      <div className={`p-6 rounded-xl border mb-6 ${
        isPro
          ? 'bg-mx-orange/5 border-mx-orange/30'
          : 'bg-mx-bg border-mx-border'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isPro ? 'bg-mx-orange/15' : 'bg-mx-border'
            }`}>
              {isPro ? (
                <Crown className="text-mx-orange" size={24} />
              ) : (
                <Sparkles className="text-mx-text-muted" size={24} />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-mx-text">
                Plan {isPro ? 'Pro' : 'Free'}
              </h3>
              <p className="text-mx-text-muted text-sm">
                {isPro ? 'Acceso completo a todo el contenido' : 'Plan básico gratuito'}
              </p>
            </div>
          </div>
          {isPro && (
            <span className="px-3 py-1 bg-mx-orange text-white text-xs font-bold rounded-full">
              ACTIVO
            </span>
          )}
        </div>

        <div className="space-y-2 mb-6">
          {(isPro ? proFeatures : freeFeatures).map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Check className={isPro ? 'text-mx-orange' : 'text-mx-text-muted'} size={16} />
              <span className="text-mx-text text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {!isPro && (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-mx-orange hover:bg-mx-orange-dark text-white px-6 py-3 rounded-full font-bold transition-colors"
          >
            <Crown size={18} />
            Actualizar a Pro
            <ArrowRight size={18} />
          </Link>
        )}
      </div>

      {/* Upgrade Benefits (for Free users) */}
      {!isPro && (
        <div className="p-6 bg-mx-orange/5 border border-mx-orange/15 rounded-xl">
          <h3 className="text-lg font-bold text-mx-text mb-4 flex items-center gap-2">
            <Crown className="text-mx-orange" size={20} />
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
                <Check className="text-mx-orange" size={14} />
                <span className="text-mx-text-muted text-sm">{benefit}</span>
              </div>
            ))}
          </div>
          <p className="text-mx-orange text-sm mt-4 font-medium">
            Desde €29/mes · Cancela cuando quieras
          </p>
        </div>
      )}

      {/* Billing Info (for Pro users) */}
      {isPro && (
        <div className="p-6 bg-mx-bg border border-mx-border rounded-xl">
          <h3 className="text-lg font-bold text-mx-text mb-4">Información de suscripción</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-mx-text-muted">Estado:</span>
              <span className={`font-medium ${subscriptionStatus === 'active' ? 'text-green-600' : 'text-mx-orange'}`}>
                {subscriptionStatus === 'active' ? 'Activa' : subscriptionStatus || 'Activa'}
              </span>
            </div>
            {subscribedAt && (
              <div className="flex justify-between">
                <span className="text-mx-text-muted">Suscrito desde:</span>
                <span className="text-mx-text">
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
            <div className="mt-6 pt-4 border-t border-mx-border">
              <button
                onClick={handleOpenBillingPortal}
                disabled={isLoadingPortal}
                className="w-full flex items-center justify-center gap-2 bg-mx-bg hover:bg-mx-border/50 text-mx-text border border-mx-border px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-wait"
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
              <p className="text-mx-text-muted text-xs text-center mt-3">
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
    <div className="bg-mx-bg min-h-screen text-mx-text overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10 pt-24 pb-32">
        {/* Hero Section */}
        <section className="px-6 md:px-12 py-16">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <span className="text-mx-orange text-sm font-medium tracking-[0.3em] uppercase mb-4 block">
                Mi Cuenta
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-mx-blue mb-4">
                Mi Perfil
              </h1>
              <p className="text-mx-text-muted font-light max-w-xl mx-auto">
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
                    colorPrimary: '#F7A000',
                    colorBackground: '#ffffff',
                    colorText: '#1a1a1a',
                    colorTextSecondary: '#666563',
                    colorInputBackground: '#FFFEFC',
                    colorInputText: '#1a1a1a',
                    colorNeutral: '#1a1a1a',
                    borderRadius: '0.75rem',
                  },
                  elements: {
                    rootBox: 'w-full',
                    card: 'bg-mx-card border border-mx-border shadow-xl rounded-xl',
                    navbar: 'bg-mx-bg border-r border-mx-border',
                    navbarButton: 'text-mx-text-muted hover:text-mx-orange hover:bg-mx-orange/5 transition-colors',
                    navbarButtonActive: 'text-mx-orange bg-mx-orange/8',
                    navbarButtonIcon: 'text-current',
                    pageScrollBox: 'bg-mx-card',
                    page: 'bg-mx-card',
                    profileSection: 'border-b border-mx-border',
                    profileSectionTitle: 'text-mx-text font-bold',
                    profileSectionTitleText: 'text-mx-text font-bold',
                    profileSectionSubtitle: 'text-mx-text-muted',
                    profileSectionContent: 'text-mx-text',
                    formFieldLabel: 'text-mx-text font-medium',
                    formFieldInput: 'bg-mx-bg border-2 border-mx-border text-mx-text placeholder:text-mx-text-muted/50 focus:border-mx-orange rounded-lg',
                    formButtonPrimary: 'bg-mx-orange hover:bg-mx-orange-dark text-white font-bold rounded-lg',
                    formButtonReset: 'text-mx-text-muted hover:text-mx-text',
                    avatarBox: 'border-2 border-mx-orange/40',
                    avatarImageActions: 'bg-mx-card border border-mx-border',
                    avatarImageActionsUpload: 'text-mx-orange hover:text-mx-orange-dark',
                    avatarImageActionsRemove: 'text-red-500 hover:text-red-600',
                    userPreview: 'bg-mx-bg border border-mx-border rounded-lg',
                    userPreviewMainIdentifier: 'text-mx-text font-medium',
                    userPreviewSecondaryIdentifier: 'text-mx-text-muted',
                    accordionTriggerButton: 'text-mx-text hover:bg-mx-orange/5',
                    accordionContent: 'bg-mx-bg border-t border-mx-border',
                    badge: 'bg-mx-orange/10 text-mx-orange border border-mx-orange/20',
                    headerTitle: 'text-mx-text font-bold',
                    headerSubtitle: 'text-mx-text-muted',
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
