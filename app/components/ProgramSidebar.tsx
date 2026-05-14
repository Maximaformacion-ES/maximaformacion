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
  Download,
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import Link from 'next/link';
import type { Program } from '@/lib/strapi/types';
import { getEffectivePrice, shouldApplyProDiscount, isFreeWithPro, getProSavings } from '@/lib/pricing';
import { trackBeginCheckout } from '@/lib/analytics';

interface ProgramSidebarProps {
  program: Program;
}

export const ProgramSidebar: React.FC<ProgramSidebarProps> = ({ program }) => {
  const { isSignedIn, isLoaded } = useUser();
  const { hasPro, hasAccess: checkAccess, isLoading: campusLoading } = useUserCampus();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userHasPro = !!isSignedIn && hasPro;
  const hasAccess = checkAccess(program.documentId);
  const includedInPro = isFreeWithPro(program, userHasPro);
  const proDiscount = !includedInPro && shouldApplyProDiscount(program, userHasPro);
  const effectivePrice = getEffectivePrice(program, userHasPro);
  const proSavings = getProSavings(program, userHasPro);

  const handlePurchaseCourse = async () => {
    if (!isSignedIn) {
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
        price: effectivePrice,
      },
    ]);

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

  const durationDisplay = program.durationLabel
    ? program.durationLabel
    : program.duration
    ? `${program.duration} horas`
    : null;

  const infoItems = [
    { icon: Monitor, label: 'Modalidad', value: program.format },
    { icon: Globe, label: 'Idioma', value: program.language },
    { icon: Calendar, label: 'Inicio', value: program.startDate },
    { icon: Award, label: 'Certificación', value: program.certification },
    { icon: Clock, label: 'Duración', value: durationDisplay },
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
                <div className="text-label-sm text-mx-text-muted uppercase tracking-widest">
                  {item.label}
                </div>
                <div className="text-mx-text text-body-sm font-medium">{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-mx-border" />

        {/* Pricing & CTA */}
        {program.type === 'Master' ? (
          <>
            <div>
              <p className="text-body-sm md:text-body-md text-mx-text-muted font-light">
                {program.priceLabel
                  ? `Precio: ${program.priceLabel}. Solicita información detallada por email.`
                  : 'El precio de este máster varía en función del país de residencia del alumno.'}
              </p>
            </div>

            <a
              href={`mailto:cursos@maximaformacion.es?subject=${encodeURIComponent(`Consulta sobre ${program.title}`)}`}
              className="group flex items-center justify-center gap-3 w-full bg-mx-orange text-white px-6 py-4 text-body-sm md:text-body-md font-medium rounded-lg hover:bg-mx-orange-dark transition-all duration-300"
            >
              <Mail size={18} />
              Consultar precio
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>

            {program.brochurePdfUrl && (
              <a
                href={program.brochurePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="flex items-center justify-center gap-2 w-full border border-mx-border text-mx-text-muted hover:text-mx-orange hover:border-mx-orange/40 px-6 py-3 text-body-sm font-light rounded-lg transition-colors"
              >
                <Download size={16} />
                Descarga el temario (PDF)
              </a>
            )}
          </>
        ) : (
          <>
            <div>
              <div className="flex items-baseline gap-3">
                {includedInPro ? (
                  <>
                    <span className="text-mx-text-muted text-body-sm md:text-body-md line-through">
                      {program.price}€
                    </span>
                    <span className="flex items-center gap-2 text-mx-orange text-heading-md md:text-heading-lg font-black">
                      <Crown size={20} /> Incluido en Pro
                    </span>
                  </>
                ) : proDiscount ? (
                  <>
                    <span className="text-mx-text-muted text-body-sm md:text-body-md line-through">
                      {program.price}€
                    </span>
                    <span className="text-mx-orange text-display-sm font-black">
                      {effectivePrice}€
                    </span>
                  </>
                ) : (
                  <>
                    {program.originalPrice && (
                      <span className="text-mx-text-muted text-body-sm md:text-body-md line-through">
                        {program.originalPrice}€
                      </span>
                    )}
                    <span className={`${program.originalPrice ? 'text-mx-orange' : 'text-mx-text'} text-display-sm font-black`}>
                      {program.price}€
                    </span>
                  </>
                )}
              </div>
              {includedInPro ? (
                <div className="mt-1 text-mx-orange text-label-sm md:text-label-md font-bold flex items-center gap-1">
                  <Crown size={12} /> Tu suscripción Pro cubre este curso
                </div>
              ) : proDiscount ? (
                <div className="mt-1 text-mx-orange text-label-sm md:text-label-md font-bold flex items-center gap-1">
                  <Crown size={12} /> Descuento Pro -20% ({program.price - effectivePrice}€)
                </div>
              ) : (
                program.originalPrice && (
                  <div className="mt-1 text-mx-orange text-label-sm md:text-label-md font-bold">
                    Ahorra {program.originalPrice - program.price}€
                  </div>
                )
              )}
              <p className="text-mx-text-muted text-label-sm md:text-label-md mt-1">Pago único • Acceso permanente</p>

              {/* Pro savings hint for non-Pro users */}
              {proSavings > 0 && (
                <Link
                  href="/pricing"
                  className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-mx-orange/30 bg-mx-orange/5 px-3 py-2.5 hover:bg-mx-orange/10 hover:border-mx-orange/50 transition-colors group"
                >
                  <span className="flex items-center gap-2 text-mx-orange text-label-md font-medium">
                    <Crown size={14} />
                    {program.isPro
                      ? `Sería gratis con Pro · ahorras ${proSavings}€`
                      : `Con Pro pagarías ${program.price - proSavings}€ · ahorras ${proSavings}€`}
                  </span>
                  <ArrowRight size={14} className="text-mx-orange shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>

            {/* Guarantee badge */}
            <div className="flex items-center gap-3 px-4 py-3 border border-mx-orange/20 bg-mx-orange/5 rounded-lg">
              <ShieldCheck size={18} className="text-mx-orange shrink-0" />
              <span className="text-label-sm md:text-label-md text-mx-text-muted font-light">
                <span className="font-semibold text-mx-orange">14 días de garantía</span> — Devolución del 100%
              </span>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-body-sm">{error}</p>
            )}

            {/* CTA Button */}
            <div className="space-y-3">
              {isLoaded && !campusLoading && hasAccess ? (
                <Link
                  href={`/cursos/${program.documentId || program.id}`}
                  className="group flex items-center justify-center gap-3 w-full bg-mx-orange text-white px-6 py-4 text-body-sm md:text-body-md font-medium rounded-lg hover:bg-mx-orange-dark transition-all duration-300"
                >
                  Acceder al Curso
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <m.button
                  onClick={handlePurchaseCourse}
                  disabled={isLoading}
                  className="group flex items-center justify-center gap-3 w-full bg-mx-orange text-white px-6 py-4 text-body-sm md:text-body-md font-medium rounded-lg hover:bg-mx-orange-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

              {isLoaded && !campusLoading && !userHasPro && (
                <Link
                  href="/pricing"
                  className="flex items-center justify-center gap-2 w-full border border-mx-orange/50 text-mx-orange px-6 py-3 text-body-sm font-light rounded-lg hover:bg-mx-orange/10 transition-colors"
                >
                  <Crown size={16} />
                  O hazte Pro por €18/mes
                </Link>
              )}

              {program.brochurePdfUrl && (
                <a
                  href={program.brochurePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center justify-center gap-2 w-full border border-mx-border text-mx-text-muted hover:text-mx-orange hover:border-mx-orange/40 px-6 py-3 text-body-sm font-light rounded-lg transition-colors"
                >
                  <Download size={16} />
                  Descarga el temario (PDF)
                </a>
              )}
            </div>
          </>
        )}

        {/* Divider */}
        <div className="border-t border-mx-border" />

        {/* Contact */}
        <div className="space-y-3">
          <div className="text-label-sm md:text-label-md text-mx-text-muted uppercase tracking-widest font-bold">
            Contacto
          </div>
          <a
            href="mailto:cursos@maximaformacion.es"
            className="flex items-center gap-3 text-mx-text-muted text-body-sm hover:text-mx-orange transition-colors"
          >
            <Mail size={14} />
            cursos@maximaformacion.es
          </a>
          <a
            href="tel:+34635659391"
            className="flex items-center gap-3 text-mx-text-muted text-body-sm hover:text-mx-orange transition-colors"
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
