'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Zap, BarChart3, Globe, Link as LinkIcon, BookOpen, Check } from 'lucide-react';

interface SAPOFeature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const sapoFeatures: SAPOFeature[] = [
  {
    icon: Smartphone,
    title: 'Interfaz intuitiva',
    description: 'Diseñada para que tanto principiantes como usuarios avanzados puedan trabajar sin complicaciones. Navegación clara y procesos guiados paso a paso.'
  },
  {
    icon: Zap,
    title: 'Automatización de procesos',
    description: 'La app te guía paso a paso: recopila información clave de tu estudio y te sugiere automáticamente la metodología estadística más adecuada, sin complicaciones.'
  },
  {
    icon: BarChart3,
    title: 'Análisis avanzado',
    description: 'Genera análisis listos para publicar sin necesidad de programar. Descriptivos avanzados, gráficos y resultados estadísticos con rigor científico.'
  },
  {
    icon: Globe,
    title: 'Soporte multilingüe',
    description: 'Disponible en múltiples idiomas para investigadores de todo el mundo, facilitando la colaboración internacional.'
  },
  {
    icon: LinkIcon,
    title: 'Integración con plataformas',
    description: 'Conecta fácilmente con tus herramientas de trabajo habituales y exporta resultados en múltiples formatos.'
  },
  {
    icon: BookOpen,
    title: 'Asistencia guiada',
    description: 'Obtén ayuda contextual en cada paso del proceso, con explicaciones claras de conceptos estadísticos y metodologías.'
  }
];

const pricingPlans = [
  {
    name: 'Gratuito',
    price: '0',
    period: '',
    features: [
      'Acceso básico a la plataforma',
      'Análisis estadísticos fundamentales',
      'Generación de gráficos básicos',
      'Soporte comunitario'
    ],
    cta: 'Empezar gratis',
    popular: false
  },
  {
    name: 'Premium Mensual',
    price: '2.99',
    period: '/mes',
    features: [
      'Todo lo del plan gratuito',
      'Análisis estadísticos avanzados',
      'Generación automática de resultados',
      'Exportación en múltiples formatos',
      'Soporte prioritario',
      'Sin límites de uso'
    ],
    cta: 'Suscribirse',
    popular: true
  },
  {
    name: 'Premium Anual',
    price: '24.99',
    period: '/año',
    features: [
      'Todo lo del plan mensual',
      'Ahorro del 30% vs plan mensual',
      'Actualizaciones prioritarias',
      'Acceso anticipado a nuevas funciones',
      'Soporte premium dedicado',
      'Capacitación personalizada'
    ],
    cta: 'Suscribirse',
    popular: false
  }
];

export const InnovacionSAPOSection: React.FC = () => {
  return (
    <section className="py-32 px-6 md:px-12 bg-mx-bg">
      <div className="max-w-7xl mx-auto">
        {/* SAPO Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-mx-orange text-sm font-medium tracking-[0.5em] uppercase mb-4 block">
            Te presentamos nuestra APP
          </span>
          <h2 className="text-mx-blue text-4xl md:text-6xl font-black tracking-tighter mb-6">
            Conoce SAPO
          </h2>
          <p className="text-mx-text-muted text-lg md:text-xl font-light max-w-3xl mx-auto leading-relaxed mb-8">
            Una app que automatiza el análisis estadístico y genera resultados listos para publicar, 
            sin necesidad de programar.
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 border border-mx-border bg-mx-card rounded-lg"
            >
              <h3 className="text-xl font-bold text-mx-text mb-3">Asistencia estadística automatizada</h3>
              <p className="text-mx-text-muted font-light">
                La app te guía paso a paso: recopila información clave de tu estudio y te sugiere
                automáticamente la metodología estadística más adecuada, sin complicaciones.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 border border-mx-border bg-mx-card rounded-lg"
            >
              <h3 className="text-xl font-bold text-mx-text mb-3">Generación automática de resultados</h3>
              <p className="text-mx-text-muted font-light">
                Obtén análisis listos para publicar sin necesidad de programar. Genera descriptivos 
                avanzados, gráficos y resultados estadísticos con rigor científico.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="mb-20">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-mx-text text-center mb-12"
          >
            Características principales
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sapoFeatures.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 border border-mx-border bg-mx-card rounded-lg hover:border-mx-orange/50 transition-all duration-300"
              >
                <feature.icon className="text-mx-orange mb-4" size={28} />
                <h4 className="text-lg font-bold text-mx-text mb-2">{feature.title}</h4>
                <p className="text-mx-text-muted font-light text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h3 className="text-3xl font-bold text-mx-text text-center mb-12">Planes y precios</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative p-8 border rounded-lg ${
                  plan.popular
                    ? 'border-mx-orange bg-mx-orange/10'
                    : 'border-mx-border bg-mx-card'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-mx-orange text-white text-xs font-bold uppercase tracking-widest rounded-full">
                    Popular
                  </div>
                )}
                <h4 className="text-2xl font-bold text-mx-text mb-2">{plan.name}</h4>
                <div className="mb-6">
                  <span className="text-4xl font-black text-mx-text">{plan.price}€</span>
                  {plan.period && <span className="text-mx-text-muted text-lg">{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-mx-text-muted">
                      <Check size={16} className="text-mx-orange mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 px-6 rounded-full font-medium transition-colors ${
                    plan.popular
                      ? 'bg-mx-orange text-white hover:bg-mx-orange-dark'
                      : 'border border-mx-border text-mx-text hover:bg-mx-orange/10 hover:border-mx-orange/50'
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
