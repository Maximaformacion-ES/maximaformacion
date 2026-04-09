'use client';

import React from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { Smartphone, Zap, BarChart3, Globe, Link as LinkIcon, BookOpen, Check, X, ArrowUpRight } from 'lucide-react';

const SAPO_TEAL = '#016157';

interface SAPOFeature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const sapoFeatures: SAPOFeature[] = [
  {
    icon: Smartphone,
    title: 'Interfaz intuitiva',
    description: 'Navegación clara y procesos guiados paso a paso.',
  },
  {
    icon: Zap,
    title: 'Automatización de procesos',
    description: 'Sugerencia automática de la metodología estadística más adecuada.',
  },
  {
    icon: BarChart3,
    title: 'Análisis avanzado',
    description: 'Descriptivos avanzados, gráficos y resultados con rigor científico.',
  },
  {
    icon: Globe,
    title: 'Soporte multilingüe',
    description: 'Disponible en múltiples idiomas para investigadores de todo el mundo.',
  },
  {
    icon: LinkIcon,
    title: 'Integración con plataformas',
    description: 'Conecta con tus herramientas y exporta en múltiples formatos.',
  },
  {
    icon: BookOpen,
    title: 'Asistencia guiada',
    description: 'Ayuda contextual con explicaciones claras de conceptos estadísticos.',
  },
];

const pricingFeatures = [
  { label: 'Acceso a la plataforma', free: 'Básico', monthly: 'Completo', yearly: 'Completo' },
  { label: 'Análisis estadísticos', free: 'Fundamentales', monthly: 'Avanzados', yearly: 'Avanzados' },
  { label: 'Generación de gráficos', free: true, monthly: true, yearly: true },
  { label: 'Generación automática de resultados', free: false, monthly: true, yearly: true },
  { label: 'Exportación en múltiples formatos', free: false, monthly: true, yearly: true },
  { label: 'Soporte prioritario', free: false, monthly: true, yearly: true },
  { label: 'Sin límites de uso', free: false, monthly: true, yearly: true },
  { label: 'Actualizaciones prioritarias', free: false, monthly: false, yearly: true },
  { label: 'Acceso anticipado a nuevas funciones', free: false, monthly: false, yearly: true },
  { label: 'Capacitación personalizada', free: false, monthly: false, yearly: true },
];

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return <span className="text-body-sm text-mx-text font-medium">{value}</span>;
  }
  return value ? (
    <Check size={18} style={{ color: SAPO_TEAL }} className="mx-auto" />
  ) : (
    <X size={18} className="text-mx-text-muted/40 mx-auto" />
  );
}

export const InnovacionSAPOSection: React.FC = () => {
  return (
    <section className="py-20 md:py-32 px-6 md:px-12 bg-mx-bg overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Sub-zone A: Product hero with image */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 mb-16 md:mb-32">
          {/* Left: Text content + cards */}
          <m.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <span
              className="text-label-sm md:text-label-md xl:text-label-lg font-medium tracking-[0.5em] uppercase mb-4 block text-mx-orange"
            >
              Te presentamos nuestra APP
            </span>
            <h2 className="text-heading-sm md:text-heading-md xl:text-heading-lg font-black mb-6" style={{ color: SAPO_TEAL }}>
              Conoce SAPO
            </h2>
            <p className="text-mx-text-muted text-body-sm md:text-body-md xl:text-body-lg font-light leading-relaxed mb-8">
              Una app que automatiza el análisis estadístico y genera resultados listos para publicar,
              sin necesidad de programar.
            </p>

            <div className="space-y-4 mb-8">
              <div className="p-6 border rounded-lg" style={{ borderColor: `${SAPO_TEAL}20`, backgroundColor: `${SAPO_TEAL}05` }}>
                <h3 className="text-body-sm md:text-body-md font-bold text-mx-text mb-2">
                  Asistencia estadística automatizada
                </h3>
                <p className="text-mx-text-muted font-light text-body-sm">
                  La app te guía paso a paso: recopila información clave de tu estudio y te sugiere
                  automáticamente la metodología estadística más adecuada.
                </p>
              </div>
              <div className="p-6 border rounded-lg" style={{ borderColor: `${SAPO_TEAL}20`, backgroundColor: `${SAPO_TEAL}05` }}>
                <h3 className="text-body-sm md:text-body-md font-bold text-mx-text mb-2">
                  Generación automática de resultados
                </h3>
                <p className="text-mx-text-muted font-light text-body-sm">
                  Obtén análisis listos para publicar sin necesidad de programar. Genera descriptivos
                  avanzados, gráficos y resultados estadísticos con rigor científico.
                </p>
              </div>
            </div>

            <a
              href="https://biomaximainnovacion.es/sapo"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-bold tracking-wide transition-all duration-300 hover:opacity-90"
              style={{ backgroundColor: SAPO_TEAL }}
            >
              Descubre SAPO
              <ArrowUpRight
                size={20}
                className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
              />
            </a>
          </m.div>

          {/* Right: App image */}
          <m.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 flex justify-center"
          >
            <Image
              src="/sapo.png"
              alt="SAPO Statistical Assistant - App móvil"
              className="w-full max-w-md drop-shadow-2xl"
              width={448}
              height={800}
            />
          </m.div>
        </div>

        {/* Sub-zone B: Features - 2 columns, no cards */}
        <div className="mb-16 md:mb-32 relative">
          {/* Decorative concentric rings */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full border" style={{ borderColor: `${SAPO_TEAL}10` }} />
            <div className="absolute inset-4 md:inset-8 rounded-full border" style={{ borderColor: `${SAPO_TEAL}08` }} />
            <div className="absolute inset-8 md:inset-16 rounded-full border" style={{ borderColor: `${SAPO_TEAL}05` }} />
          </div>

          <m.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-heading-sm md:text-heading-md xl:text-heading-lg font-bold text-mx-text text-center mb-16 relative"
          >
            Características principales
          </m.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 max-w-4xl mx-auto relative">
            {sapoFeatures.map((feature, idx) => (
              <m.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="flex items-start gap-4"
              >
                <feature.icon className="shrink-0 mt-1" size={22} style={{ color: SAPO_TEAL }} />
                <div>
                  <h4 className="text-body-sm md:text-body-md font-bold text-mx-text mb-1">{feature.title}</h4>
                  <p className="text-body-sm text-mx-text-muted font-light leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </m.div>
            ))}
          </div>
        </div>

        {/* Sub-zone C: Pricing comparison table */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-heading-sm md:text-heading-md xl:text-heading-lg font-bold text-mx-text text-center mb-8 md:mb-12">Planes y precios</h3>

          {/* Mobile: stacked pricing cards */}
          <div className="md:hidden space-y-4">
            {([
              { name: 'Gratuito', price: '0€', suffix: '', featured: false, features: pricingFeatures.map(f => ({ label: f.label, value: f.free })) },
              { name: 'Mensual', price: '2.99€', suffix: '/mes', featured: true, features: pricingFeatures.map(f => ({ label: f.label, value: f.monthly })) },
              { name: 'Anual', price: '24.99€', suffix: '/año', featured: false, features: pricingFeatures.map(f => ({ label: f.label, value: f.yearly })) },
            ] as const).map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-5 ${plan.featured ? 'border-[#016157]/30 bg-[#016157]/5' : 'border-mx-border bg-mx-card'}`}
              >
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <div className="text-body-sm font-bold text-mx-text">{plan.name}</div>
                    {plan.featured && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-white text-label-sm font-bold uppercase tracking-widest rounded-full" style={{ backgroundColor: SAPO_TEAL }}>
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="text-heading-sm font-black text-mx-text">
                    {plan.price}<span className="text-label-sm font-normal text-mx-text-muted">{plan.suffix}</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((f) => {
                    const included = typeof f.value === 'string' ? true : f.value;
                    return (
                      <li key={f.label} className={`flex items-center gap-2 text-body-sm ${included ? 'text-mx-text' : 'text-mx-text-muted/40'}`}>
                        {included ? (
                          <Check size={14} style={{ color: SAPO_TEAL }} className="shrink-0" />
                        ) : (
                          <X size={14} className="shrink-0" />
                        )}
                        <span className="font-light">{f.label}</span>
                        {typeof f.value === 'string' && (
                          <span className="ml-auto text-label-sm font-medium text-mx-text-muted">{f.value}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <a
                  href="https://biomaximainnovacion.es/sapo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-center mt-4 px-6 py-2.5 rounded-full text-body-sm font-medium transition-colors ${
                    plan.featured
                      ? 'text-white hover:opacity-90'
                      : 'border border-mx-border text-mx-text hover:opacity-80'
                  }`}
                  style={plan.featured ? { backgroundColor: SAPO_TEAL } : undefined}
                >
                  {plan.price === '0€' ? 'Empezar gratis' : 'Suscribirse'}
                </a>
              </div>
            ))}
          </div>

          {/* Desktop: comparison table */}
          <div className="hidden md:block pt-4">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr>
                  <th className="text-left py-4 px-6 text-label-sm md:text-label-md font-medium text-mx-text-muted uppercase tracking-wider border-b border-mx-border w-[40%]">
                    Característica
                  </th>
                  <th className="text-center py-4 px-4 border-b border-mx-border w-[20%]">
                    <div className="text-body-sm md:text-body-md font-bold text-mx-text">Gratuito</div>
                    <div className="text-heading-sm md:text-heading-md font-black text-mx-text mt-1">0€</div>
                  </th>
                  <th
                    className="text-center py-4 px-4 border-b border-mx-border w-[20%] rounded-t-lg relative"
                    style={{ backgroundColor: `${SAPO_TEAL}08` }}
                  >
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-white text-label-sm font-bold uppercase tracking-widest rounded-full"
                      style={{ backgroundColor: SAPO_TEAL }}
                    >
                      Popular
                    </div>
                    <div className="text-body-sm md:text-body-md font-bold text-mx-text">Mensual</div>
                    <div className="text-heading-sm md:text-heading-md font-black text-mx-text mt-1">
                      2.99€<span className="text-label-sm md:text-label-md font-normal text-mx-text-muted">/mes</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 border-b border-mx-border w-[20%]">
                    <div className="text-body-sm md:text-body-md font-bold text-mx-text">Anual</div>
                    <div className="text-heading-sm md:text-heading-md font-black text-mx-text mt-1">
                      24.99€<span className="text-label-sm md:text-label-md font-normal text-mx-text-muted">/año</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pricingFeatures.map((row, idx) => (
                  <tr
                    key={row.label}
                    className={idx % 2 === 0 ? '' : 'bg-mx-card/50'}
                  >
                    <td className="py-3.5 px-6 text-body-sm text-mx-text font-light border-b border-mx-border/50">
                      {row.label}
                    </td>
                    <td className="py-3.5 px-4 text-center border-b border-mx-border/50">
                      <CellValue value={row.free} />
                    </td>
                    <td
                      className="py-3.5 px-4 text-center border-b border-mx-border/50"
                      style={{ backgroundColor: `${SAPO_TEAL}08` }}
                    >
                      <CellValue value={row.monthly} />
                    </td>
                    <td className="py-3.5 px-4 text-center border-b border-mx-border/50">
                      <CellValue value={row.yearly} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="py-6 px-6" />
                  <td className="py-6 px-4 text-center">
                    <a
                      href="https://biomaximainnovacion.es/sapo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-2.5 rounded-full text-body-sm font-medium border border-mx-border text-mx-text hover:opacity-80 transition-colors"
                    >
                      Empezar gratis
                    </a>
                  </td>
                  <td className="py-6 px-4 text-center" style={{ backgroundColor: `${SAPO_TEAL}08` }}>
                    <a
                      href="https://biomaximainnovacion.es/sapo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-2.5 rounded-full text-body-sm font-medium text-white hover:opacity-90 transition-colors"
                      style={{ backgroundColor: SAPO_TEAL }}
                    >
                      Suscribirse
                    </a>
                  </td>
                  <td className="py-6 px-4 text-center">
                    <a
                      href="https://biomaximainnovacion.es/sapo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-2.5 rounded-full text-body-sm font-medium border border-mx-border text-mx-text hover:opacity-80 transition-colors"
                    >
                      Suscribirse
                    </a>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </m.div>
      </div>
    </section>
  );
};
