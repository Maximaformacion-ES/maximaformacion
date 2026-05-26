'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingCart, Loader2, ArrowRight, Crown, Mail } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import Link from 'next/link';
import type { Program } from '@/lib/strapi/types';
import { getEffectivePrice, shouldApplyProDiscount, isFreeWithPro } from '@/lib/pricing';
import { trackBeginCheckout } from '@/lib/analytics';
import ConsultaGratuitaChooser from './ConsultaGratuitaChooser';
import { SIDEBAR_CTA_ANCHOR_ID } from './ProgramSidebar';

interface ProgramMobileCTAProps {
  program: Program;
}

export const ProgramMobileCTA: React.FC<ProgramMobileCTAProps> = ({ program }) => {
  const { isSignedIn, isLoaded } = useUser();
  const { hasPro, hasAccess: checkAccess, isLoading: campusLoading } = useUserCampus();
  const [isLoading, setIsLoading] = useState(false);
  const [consultaOpen, setConsultaOpen] = useState(false);
  // Desktop-only visibility flag. Starts hidden so we don't double-render
  // the CTA while the sidebar's primary button is still in view; flips
  // true once that anchor scrolls out of the viewport.
  const [desktopVisible, setDesktopVisible] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById(SIDEBAR_CTA_ANCHOR_ID);
    if (!anchor) {
      // No anchor mounted yet (e.g. mobile-only page or hero hasn't
      // hydrated). Fall back to "always visible on desktop" so the user
      // doesn't end up without a CTA at all.
      setDesktopVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setDesktopVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, []);

  const userHasPro = !!isSignedIn && hasPro;
  const hasAccess = checkAccess(program.documentId, program.isPro);
  const includedInPro = isFreeWithPro(program, userHasPro);
  const proDiscount = !includedInPro && shouldApplyProDiscount(program, userHasPro);
  const effectivePrice = getEffectivePrice(program, userHasPro);

  const handlePurchaseCourse = async () => {
    if (!isSignedIn) {
      window.location.href = `/sign-in?redirect_url=/programas/${program.slug}`;
      return;
    }

    setIsLoading(true);

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
    } catch {
      setIsLoading(false);
    }
  };

  // Sticky CTA: full-width bar on mobile (always visible), compact
  // floating card pinned bottom-right on lg+ that only appears after
  // the in-hero sidebar's primary button scrolls out of view (see the
  // IntersectionObserver above). Hidden state on desktop uses opacity
  // + translate + pointer-events:none so the transition is smooth and
  // the card doesn't block clicks while invisible.
  const desktopVisibilityClass = desktopVisible
    ? "lg:opacity-100 lg:translate-y-0 lg:pointer-events-auto"
    : "lg:opacity-0 lg:translate-y-4 lg:pointer-events-none";

  const stickyWrapperClass =
    "fixed bottom-0 inset-x-0 z-40 bg-mx-bg/95 backdrop-blur-md border-t border-mx-border px-4 pt-3 safe-bottom " +
    "lg:bottom-6 lg:right-6 lg:left-auto lg:inset-x-auto lg:max-w-sm lg:w-full " +
    "lg:rounded-2xl lg:border lg:shadow-2xl lg:px-5 lg:pt-4 lg:pb-4 " +
    "lg:transition-all lg:duration-300 ease-out " +
    desktopVisibilityClass;

  if (program.type === 'Master') {
    return (
      <>
        <div className={stickyWrapperClass}>
          <button
            type="button"
            onClick={() => setConsultaOpen(true)}
            className="flex items-center justify-center gap-2 w-full bg-mx-orange text-white px-4 py-2 text-label-sm font-medium rounded-lg hover:bg-mx-orange-dark transition-all"
          >
            <Mail size={12} />
            Consultar precio
          </button>
        </div>
        <ConsultaGratuitaChooser open={consultaOpen} onClose={() => setConsultaOpen(false)} />
      </>
    );
  }

  return (
    <div className={stickyWrapperClass}>
      {/* Row 1: Price info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-2">
          {includedInPro ? (
            <>
              <span className="text-mx-text-muted text-body-sm line-through">
                {program.price}€
              </span>
              <span className="flex items-center gap-1 text-mx-orange text-heading-sm font-black">
                <Crown size={14} /> Incluido en Pro
              </span>
            </>
          ) : proDiscount ? (
            <>
              <span className="text-mx-text-muted text-body-sm line-through">
                {program.price}€
              </span>
              <span className="text-mx-orange text-heading-sm font-black">
                {effectivePrice}€
              </span>
              <span className="flex items-center gap-1 text-label-sm font-bold text-mx-orange">
                <Crown size={10} /> -20%
              </span>
            </>
          ) : (
            <>
              {program.originalPrice && (
                <span className="text-mx-text-muted text-body-sm line-through">
                  {program.originalPrice}€
                </span>
              )}
              <span className={`${program.originalPrice ? 'text-mx-orange' : 'text-mx-text'} text-heading-sm font-black`}>
                {program.price}€
              </span>
              {program.originalPrice && (
                <span className="text-label-sm font-bold text-mx-orange">
                  -{Math.round(((program.originalPrice - program.price) / program.originalPrice) * 100)}%
                </span>
              )}
            </>
          )}
        </div>
        {!userHasPro && isLoaded && !campusLoading && (
          <Link href="/pricing" className="flex items-center gap-1 text-label-sm text-mx-orange font-medium">
            <Crown size={12} />
            o Pro €18/mes
          </Link>
        )}
      </div>

      {/* Row 2: CTA button full width */}
      {isLoaded && !campusLoading && hasAccess ? (
        <Link
          href={`/cursos/${program.documentId || program.id}`}
          className="flex items-center justify-center gap-2 w-full bg-mx-orange text-white px-4 py-2 text-label-sm font-medium rounded-lg hover:bg-mx-orange-dark transition-all"
        >
          Acceder al Curso
          <ArrowRight size={12} />
        </Link>
      ) : (
        <button
          onClick={handlePurchaseCourse}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full bg-mx-orange text-white px-4 py-2 text-label-sm font-medium rounded-lg hover:bg-mx-orange-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={12} />
              Procesando...
            </>
          ) : (
            <>
              <ShoppingCart size={12} />
              {isSignedIn ? 'Comprar Ahora' : 'Iniciar sesión para comprar'}
            </>
          )}
        </button>
      )}
    </div>
  );
};
