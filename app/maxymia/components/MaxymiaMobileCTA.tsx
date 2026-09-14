'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Loader2, ArrowRight, Crown } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import { useLocale } from '../i18n/LocaleProvider';
import Link from 'next/link';
import type { MaxymiaCourse } from '../types';
import { getEffectivePrice, getProSavings, isFreeWithPro, shouldApplyProDiscount } from '@/lib/pricing';
import { trackBeginCheckout } from '@/lib/analytics';

interface MaxymiaMobileCTAProps {
  course: MaxymiaCourse;
}

export const MaxymiaMobileCTA: React.FC<MaxymiaMobileCTAProps> = ({ course }) => {
  const { locale } = useLocale();
  const { isSignedIn, isLoaded } = useUser();
  const { hasPro, hasAccess: checkAccess, isLoading: campusLoading } = useUserCampus();
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Igual que ProgramMobileCTA: publica la altura real de la barra en el body
  // para que el widget de Cookiebot (y cualquier flotante que lea
  // --floating-cta-bottom) se coloque justo encima. Solo aplica en < lg.
  useEffect(() => {
    document.body.dataset.mobileCta = 'true';
    const el = wrapperRef.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      return () => {
        delete document.body.dataset.mobileCta;
      };
    }
    const update = () => {
      const h = el.getBoundingClientRect().height;
      if (h > 0) {
        document.body.style.setProperty('--mobile-cta-height', `${Math.round(h)}px`);
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      observer.disconnect();
      delete document.body.dataset.mobileCta;
      document.body.style.removeProperty('--mobile-cta-height');
    };
  }, []);

  const userStateKnown = isLoaded && !campusLoading;
  const userHasPro = !!isSignedIn && hasPro;
  const hasAccess = userStateKnown && checkAccess(course.id, course.isPro);
  const includedInPro = isFreeWithPro(course, userHasPro);
  const proDiscount = !includedInPro && shouldApplyProDiscount(course, userHasPro);
  const effectivePrice = getEffectivePrice(course, userHasPro);
  const proSavings = getProSavings(course, userHasPro);
  const proOnlyCourse = !!course.proOnly;
  // Curso gratis con Pro visto por alguien SIN Pro: mensaje clicable que
  // invita a suscribirse (mismo criterio que el panel de escritorio).
  const showProFree = userStateKnown && !userHasPro && !!course.isPro && !proOnlyCourse;

  const handlePurchase = async () => {
    if (!isSignedIn) {
      window.location.href = `/sign-in?redirect_url=/maxymia/campus/${course.slug}`;
      return;
    }

    setIsLoading(true);

    trackBeginCheckout([
      {
        item_id: course.slug,
        item_name: course.title.es,
        item_category: 'maxymia-course',
        price: effectivePrice,
      },
    ]);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'maxymia-course',
          documentId: course.id,
          slug: course.slug,
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

  // Full-width bar pinned to the bottom on mobile only. Hidden on lg+,
  // where the sticky sidebar is the canonical CTA. Mismas clases que
  // ProgramMobileCTA (/programas).
  return (
    <div
      ref={wrapperRef}
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-mx-bg/95 backdrop-blur-md border-t border-mx-border px-4 pt-3 safe-bottom"
    >
      {/* Row 1: Price info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-2">
          {includedInPro ? (
            <>
              <span className="text-mx-text-muted text-body-sm line-through">{course.price}€</span>
              <span className="flex items-center gap-1 text-mx-orange text-heading-sm font-black">
                <Crown size={14} /> {locale === 'es' ? 'Incluido en Pro' : 'Included in Pro'}
              </span>
            </>
          ) : userStateKnown && !userHasPro && proOnlyCourse ? (
            <span className="flex items-center gap-1 text-mx-orange text-heading-sm font-black">
              <Crown size={14} /> {locale === 'es' ? 'Gratis con PRO' : 'Free with PRO'}
            </span>
          ) : proDiscount ? (
            <>
              <span className="text-mx-text-muted text-body-sm line-through">{course.price}€</span>
              <span className="text-mx-orange text-heading-sm font-black">{effectivePrice}€</span>
              <span className="flex items-center gap-1 text-label-sm font-bold text-mx-orange">
                <Crown size={10} /> -20%
              </span>
            </>
          ) : (
            <>
              {course.originalPrice != null && (
                <span className="text-mx-text-muted text-body-sm line-through">
                  {course.originalPrice}€
                </span>
              )}
              <span className={`${course.originalPrice != null ? 'text-mx-orange' : 'text-mx-text'} text-heading-sm font-black`}>
                {course.price}€
              </span>
              {course.originalPrice != null && (
                <span className="text-label-sm font-bold text-mx-orange">
                  -{Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}%
                </span>
              )}
            </>
          )}
        </div>
        {/* A la derecha del precio: gratis con Pro (clicable) o ahorro -20%. */}
        {showProFree ? (
          <Link
            href="/pricing"
            className="flex items-center gap-1 text-mx-orange text-label-sm font-bold whitespace-nowrap"
          >
            <Crown size={11} className="shrink-0" /> {locale === 'es' ? 'Gratis con Pro' : 'Free with Pro'}
            <ArrowRight size={11} className="shrink-0" />
          </Link>
        ) : userStateKnown && !userHasPro && proSavings > 0 ? (
          <p className="flex items-center gap-1.5 text-mx-orange text-label-sm font-medium whitespace-nowrap">
            <span className="text-body-sm font-bold">{course.price - proSavings}€</span>
            <Crown size={11} className="shrink-0" /> {locale === 'es' ? `Ahorras ${proSavings}€ con Pro` : `Save ${proSavings}€ with Pro`}
          </p>
        ) : null}
      </div>

      {/* Row 2: CTA button full width */}
      {hasAccess ? (
        <Link
          href={`/maxymia/campus/${course.slug}/lesson/${course.blocks[0]?.lessons[0]?.id}`}
          className="flex items-center justify-center gap-2 w-full bg-mx-orange text-white px-4 py-2 text-label-sm font-medium rounded-lg hover:bg-mx-orange-dark transition-all"
        >
          {locale === 'es' ? 'Acceder al Curso' : 'Access Course'}
          <ArrowRight size={12} />
        </Link>
      ) : userStateKnown && !userHasPro && proOnlyCourse ? (
        <Link
          href="/pricing"
          className="flex items-center justify-center gap-2 w-full bg-mx-orange text-white px-4 py-2 text-label-sm font-medium rounded-lg hover:bg-mx-orange-dark transition-all"
        >
          <Crown size={12} />
          {locale === 'es' ? 'Hazte Pro y accede' : 'Go Pro and access'}
          <ArrowRight size={12} />
        </Link>
      ) : (
        <button
          onClick={handlePurchase}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full bg-mx-orange text-white px-4 py-2 text-label-sm font-medium rounded-lg hover:bg-mx-orange-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={12} />
              {locale === 'es' ? 'Procesando...' : 'Processing...'}
            </>
          ) : (
            <>
              <ShoppingCart size={12} />
              {/* Misma etiqueta que el panel de escritorio; handlePurchase
                  redirige a /sign-in cuando no hay sesión. */}
              {locale === 'es' ? 'Matricúlate ahora' : 'Enroll now'}
            </>
          )}
        </button>
      )}
    </div>
  );
};
