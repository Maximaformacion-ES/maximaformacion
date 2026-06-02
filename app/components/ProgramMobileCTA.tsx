'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingCart, Loader2, ArrowRight, Crown, Mail } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import Link from 'next/link';
import type { Program } from '@/lib/strapi/types';
import { getEffectivePrice, getProSavings, shouldApplyProDiscount, isFreeWithPro } from '@/lib/pricing';
import { trackBeginCheckout } from '@/lib/analytics';
import ConsultaGratuitaChooser from './ConsultaGratuitaChooser';
import type { ServerUserState } from '@/lib/auth/server-user-state';

interface ProgramMobileCTAProps {
  program: Program;
  /** See ProgramSidebar — same purpose: server-resolved access state so
   *  the sticky bar shows the right CTA on the first paint. */
  initialUserState?: ServerUserState;
}

/**
 * Mobile-only sticky purchase bar.
 *
 * On desktop (lg+) there is NO floating CTA: the in-hero ProgramSidebar is
 * sticky and stays with the user through the program content, so the old
 * floating card was redundant clutter (removed in MF-17). This component is
 * therefore `lg:hidden` and only handles the small-screen case, where the
 * sidebar can't be pinned and a full-width bottom bar is the right pattern.
 */
export const ProgramMobileCTA: React.FC<ProgramMobileCTAProps> = ({ program, initialUserState }) => {
  const { isSignedIn, isLoaded } = useUser();
  const { hasPro, hasAccess: checkAccess, isLoading: campusLoading } = useUserCampus();
  const [isLoading, setIsLoading] = useState(false);
  // Master "Consultar precio" opens a chooser (form vs videollamada).
  const [masterChooserOpen, setMasterChooserOpen] = useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Publish the sticky bar's actual height on the body so the Cookiebot
  // widget (and any other floating widget that reads --floating-cta-bottom)
  // sits exactly above it. The CSS only lifts on viewports < lg, which is
  // exactly where this bar renders. ResizeObserver re-measures when the
  // "Con Pro pagarías..." row appears/disappears.
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

  // Prefer the server snapshot during the brief client-side load window
  // (see ProgramSidebar for the same pattern).
  const authLoading = !isLoaded || campusLoading;
  const useServer = authLoading && !!initialUserState;
  const userHasPro = useServer
    ? initialUserState!.isSignedIn && initialUserState!.hasPro
    : !!isSignedIn && hasPro;
  const hasAccess = useServer
    ? initialUserState!.enrolledProgramDocumentIds.includes(program.documentId)
      || (program.isPro === true && initialUserState!.hasPro)
    : checkAccess(program.documentId, program.isPro);
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

  // Full-width bar pinned to the bottom on mobile only. Hidden on lg+,
  // where the sticky sidebar is the canonical CTA.
  const stickyWrapperClass =
    "lg:hidden fixed bottom-0 inset-x-0 z-40 bg-mx-bg/95 backdrop-blur-md border-t border-mx-border px-4 pt-3 safe-bottom";

  if (program.type === 'Master') {
    return (
      <>
        <div ref={wrapperRef} className={stickyWrapperClass}>
          <button
            type="button"
            onClick={() => setMasterChooserOpen(true)}
            className="flex items-center justify-center gap-2 w-full bg-mx-orange text-white px-4 py-2 text-label-sm font-medium rounded-lg hover:bg-mx-orange-dark transition-all"
          >
            <Mail size={12} />
            Consultar precio
          </button>
        </div>
        <ConsultaGratuitaChooser
          open={masterChooserOpen}
          onClose={() => setMasterChooserOpen(false)}
          formMode="contacto-page"
        />
      </>
    );
  }

  return (
    <div ref={wrapperRef} className={stickyWrapperClass}>
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
      </div>

      {/* Pro savings banner — render optimistically while auth is still
          loading. proSavings is computed assuming the visitor is not Pro
          (the common case), so we show it immediately and only hide once
          we confirm the user actually does have Pro. */}
      {!userHasPro && proSavings > 0 && (
        <Link
          href="/pricing"
          className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-mx-orange/30 bg-mx-orange/5 px-2.5 py-1.5 hover:bg-mx-orange/10 hover:border-mx-orange/50 transition-colors group"
        >
          <span className="flex items-center gap-1.5 text-mx-orange text-label-sm font-medium leading-tight">
            <Crown size={12} className="shrink-0" />
            {includedInPro
              ? `Sería gratis con Pro · ahorras ${proSavings}€`
              : `Con Pro pagarías ${program.price - proSavings}€ · ahorras ${proSavings}€`}
          </span>
          <ArrowRight size={12} className="text-mx-orange shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}

      {/* Row 2: CTA button full width. If the page handed us a server-
          resolved state, render the correct CTA from the first paint.
          Without that we still need the "Cargando…" placeholder. */}
      {authLoading && !initialUserState ? (
        <button
          disabled
          className="flex items-center justify-center gap-2 w-full bg-mx-orange/70 text-white px-4 py-2 text-label-sm font-medium rounded-lg cursor-wait"
          aria-busy="true"
        >
          <Loader2 className="animate-spin" size={12} />
          Cargando…
        </button>
      ) : hasAccess ? (
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
              {/* Always the same label; handlePurchaseCourse redirects to
                  /sign-in (register or log in) when there's no session. */}
              Matricúlate ahora
            </>
          )}
        </button>
      )}
    </div>
  );
};
