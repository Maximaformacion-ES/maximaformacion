'use client';

import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { FontStyles } from '../components/FontStyles';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Check, X, Crown, Sparkles, ArrowRight, Zap, Star, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Plan features comparison (for the comparison table below)
const PLAN_FEATURES = [
  { feature: 'Acceso a cursos gratuitos', free: true, pro: true },
  { feature: 'Blog y recursos educativos', free: true, pro: true },
  { feature: 'Soporte por email', free: true, pro: true },
  { feature: 'Acceso a cursos exclusivos', free: false, pro: true },
  { feature: 'Certificados descargables', free: false, pro: true },
  { feature: 'Soporte prioritario 24/7', free: false, pro: true },
  { feature: 'Recursos descargables premium', free: false, pro: true },
  { feature: 'Acceso anticipado a nuevos cursos', free: false, pro: true },
  { feature: 'Sesiones de mentoría grupales', free: false, pro: true },
  { feature: 'Comunidad exclusiva', free: false, pro: true },
];

// Plans data - these should match your Clerk Dashboard plans
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfecto para comenzar tu viaje en la ciencia de datos',
    price: { monthly: 0, yearly: 0 },
    icon: Star,
    features: [
      'Acceso a cursos gratuitos',
      'Blog y recursos educativos',
      'Soporte por email',
      'Comunidad general',
    ],
    highlighted: false,
    cta: 'Plan Actual',
  },
  {
    id: 'pro', // This should match your Clerk plan ID
    name: 'Pro',
    description: 'Todo lo que necesitas para dominar la estadística profesional',
    price: { monthly: 18, yearly: 216 },
    icon: Crown,
    features: [
      'Todo lo del plan Free',
      'Cursos exclusivos premium',
      'Certificados descargables',
      'Soporte prioritario 24/7',
      'Recursos descargables',
      'Acceso anticipado',
      'Sesiones de mentoría',
      'Comunidad exclusiva',
    ],
    highlighted: true,
    cta: 'Comenzar Pro',
    badge: 'Más Popular',
  },
];

// Success message component that uses useSearchParams
function SuccessMessage() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  if (!success) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center gap-3"
    >
      <Check size={20} />
      <span>¡Suscripción completada con éxito!</span>
    </motion.div>
  );
}

export default function PricingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { isSignedIn, user } = useUser();

  // Check if user already has Pro
  const userHasPro = isSignedIn && user?.publicMetadata?.plan === 'pro';

  const handleSubscribe = async (planId: string) => {
    if (!isSignedIn) {
      // Redirect to sign up if not signed in
      window.location.href = '/sign-up?redirect_url=/pricing';
      return;
    }

    if (planId === 'free') return;

    setLoadingPlan(planId);

    try {
      // Create Stripe checkout session via our API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          planPeriod: billingPeriod === 'yearly' ? 'year' : 'month',
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe hosted checkout page
        window.location.href = data.url;
      } else {
        console.error('No checkout URL received:', data);
        alert('Error al crear la sesión de pago. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error al procesar el pago. Por favor, inténtalo de nuevo.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="bg-mx-bg min-h-screen text-mx-text overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10 pt-24 pb-32">
        {/* Success Message - wrapped in Suspense */}
        <Suspense fallback={null}>
          <SuccessMessage />
        </Suspense>

        {/* Hero Section */}
        <section className="px-6 md:px-12 py-20">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 text-mx-orange text-sm font-medium tracking-[0.3em] uppercase mb-6">
                <Sparkles size={16} />
                Planes y Precios
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-mx-blue mb-6">
                Invierte en tu{' '}
                <span className="text-mx-orange">futuro</span>
              </h1>
              <p className="text-mx-text-muted font-light text-lg md:text-xl max-w-2xl mx-auto mb-10">
                Elige el plan que mejor se adapte a tus necesidades y comienza tu camino hacia la excelencia profesional
              </p>

              {/* Billing Period Toggle */}
              <div className="inline-flex items-center gap-1 p-1 bg-mx-card border border-mx-border rounded-full">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    billingPeriod === 'monthly'
                      ? 'bg-mx-orange text-white'
                      : 'text-mx-text-muted hover:text-mx-text'
                  }`}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    billingPeriod === 'yearly'
                      ? 'bg-mx-orange text-white'
                      : 'text-mx-text-muted hover:text-mx-text'
                  }`}
                >
                  Anual
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    billingPeriod === 'yearly' ? 'bg-white/20' : 'bg-green-50 text-green-600'
                  }`}>
                    Ahorra 20%
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Custom Pricing Cards */}
        <section className="px-6 md:px-12 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {PLANS.map((plan, idx) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: idx * 0.2 }}
                  className={`relative p-8 md:p-10 rounded-2xl border transition-all duration-300 ${
                    plan.highlighted
                      ? 'bg-mx-orange/5 border-mx-orange/30 shadow-xl shadow-mx-orange/5'
                      : 'bg-mx-card border-mx-border hover:border-mx-orange/20'
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-2 bg-mx-orange text-white px-4 py-1.5 rounded-full text-sm font-bold">
                        <Zap size={14} />
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      plan.highlighted ? 'bg-mx-orange/15' : 'bg-mx-border'
                    }`}>
                      <plan.icon className={plan.highlighted ? 'text-mx-orange' : 'text-mx-text-muted'} size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-mx-text">{plan.name}</h3>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl md:text-6xl font-black text-mx-text">
                        €{billingPeriod === 'yearly' ? plan.price.yearly : plan.price.monthly}
                      </span>
                      <span className="text-mx-text-muted font-light">
                        {plan.price.monthly === 0 ? '' : billingPeriod === 'yearly' ? '/año' : '/mes'}
                      </span>
                    </div>
                    {billingPeriod === 'yearly' && plan.price.monthly > 0 && (
                      <p className="text-mx-orange text-sm mt-2">
                        Equivalente a €{Math.round(plan.price.yearly / 12)}/mes
                      </p>
                    )}
                    <p className="text-mx-text-muted font-light mt-2">{plan.description}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <Check className={plan.highlighted ? 'text-mx-orange' : 'text-mx-text-muted'} size={18} />
                        <span className="text-mx-text font-light">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {plan.highlighted ? (
                    userHasPro ? (
                      <button
                        disabled
                        className="w-full bg-green-50 text-green-600 border border-green-200 px-8 py-4 rounded-full font-bold cursor-default flex items-center justify-center gap-2"
                      >
                        <Check size={18} />
                        Plan Activo
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={loadingPlan === plan.id}
                        className="w-full group flex items-center justify-center gap-2 bg-mx-orange hover:bg-mx-orange-dark text-white px-8 py-4 rounded-full font-bold transition-all duration-300 disabled:opacity-70 disabled:cursor-wait"
                      >
                        {loadingPlan === plan.id ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            {plan.cta}
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    )
                  ) : (
                    <button
                      disabled
                      className="w-full bg-mx-border text-mx-text-muted px-8 py-4 rounded-full font-medium cursor-not-allowed"
                    >
                      {plan.cta}
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="px-6 md:px-12 py-20">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-black text-mx-blue mb-4">
                Comparativa de planes
              </h2>
              <p className="text-mx-text-muted font-light">
                Descubre todas las ventajas de cada plan
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border border-mx-border rounded-2xl overflow-hidden"
            >
              {/* Table Header */}
              <div className="grid grid-cols-3 bg-mx-bg border-b border-mx-border">
                <div className="p-4 md:p-6 font-medium text-mx-text-muted">
                  Características
                </div>
                <div className="p-4 md:p-6 text-center font-bold border-l border-mx-border text-mx-text">
                  Free
                </div>
                <div className="p-4 md:p-6 text-center font-bold border-l border-mx-border bg-mx-orange/5 text-mx-orange">
                  Pro
                </div>
              </div>

              {/* Table Rows */}
              {PLAN_FEATURES.map((item, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-3 ${
                    idx !== PLAN_FEATURES.length - 1 ? 'border-b border-mx-border' : ''
                  }`}
                >
                  <div className="p-4 md:p-6 text-mx-text font-light">
                    {item.feature}
                  </div>
                  <div className="p-4 md:p-6 flex items-center justify-center border-l border-mx-border">
                    {item.free ? (
                      <Check className="text-green-500" size={20} />
                    ) : (
                      <X className="text-mx-border" size={20} />
                    )}
                  </div>
                  <div className="p-4 md:p-6 flex items-center justify-center border-l border-mx-border bg-mx-orange/3">
                    {item.pro ? (
                      <Check className="text-mx-orange" size={20} />
                    ) : (
                      <X className="text-mx-border" size={20} />
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-6 md:px-12 py-20">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-black text-mx-blue mb-4">
                Preguntas frecuentes
              </h2>
            </motion.div>

            <div className="space-y-4">
              {[
                {
                  q: '¿Puedo cancelar mi suscripción en cualquier momento?',
                  a: 'Sí, puedes cancelar tu suscripción Pro en cualquier momento desde tu perfil. Seguirás teniendo acceso hasta el final del período de facturación.',
                },
                {
                  q: '¿Qué métodos de pago aceptan?',
                  a: 'Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express) a través de nuestra pasarela de pago segura.',
                },
                {
                  q: '¿Hay garantía de devolución?',
                  a: 'Sí, ofrecemos una garantía de devolución de 14 días. Si no estás satisfecho con el plan Pro, te devolvemos el dinero sin preguntas.',
                },
                {
                  q: '¿Puedo cambiar de plan más adelante?',
                  a: 'Por supuesto. Puedes actualizar de Free a Pro o cambiar entre facturación mensual y anual en cualquier momento.',
                },
              ].map((faq, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 bg-mx-card border border-mx-border rounded-xl hover:border-mx-orange/30 transition-colors"
                >
                  <h3 className="text-lg font-bold text-mx-text mb-2">{faq.q}</h3>
                  <p className="text-mx-text-muted font-light">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 md:px-12 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center p-12 md:p-16 bg-mx-orange/5 border border-mx-orange/20 rounded-3xl"
          >
            <Crown className="text-mx-orange mx-auto mb-6" size={48} />
            <h2 className="text-3xl md:text-4xl font-black text-mx-blue mb-4">
              ¿Listo para dar el siguiente paso?
            </h2>
            <p className="text-mx-text-muted font-light text-lg mb-8 max-w-xl mx-auto">
              Únete a miles de profesionales que ya están impulsando sus carreras con Máxima Formación Pro
            </p>
            <Link
              href={isSignedIn ? '#' : '/sign-up'}
              className="inline-flex items-center gap-2 bg-mx-orange hover:bg-mx-orange-dark text-white px-10 py-4 rounded-full font-bold transition-all duration-300"
            >
              Comenzar con Pro
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
