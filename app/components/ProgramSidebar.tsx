'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import {
  ShoppingCart,
  Loader2,
  Crown,
  ArrowRight,
  Monitor,
  Globe,
  Calendar,
  Award,
  Clock,
  GraduationCap,
  Mail,
} from 'lucide-react';
// Note: ShieldCheck (garantía badge) and the Pro-savings hint were removed
// in MF-17 to keep the panel compact enough to stay sticky on screen.
import { useUser } from '@clerk/nextjs';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import Link from 'next/link';
import type { Program } from '@/lib/strapi/types';
import ConsultaGratuitaChooser from './ConsultaGratuitaChooser';
import { getEffectivePrice, shouldApplyProDiscount, isFreeWithPro, getProSavings } from '@/lib/pricing';
import { trackBeginCheckout } from '@/lib/analytics';
import type { ServerUserState } from '@/lib/auth/server-user-state';

interface ProgramSidebarProps {
  program: Program;
  /**
   * When set, the primary CTA inside the sidebar (Comprar / Acceder /
   * Consultar precio) is tagged with this DOM id so it can be used as a
   * scroll anchor.
   *
   * Historically the desktop floating CTA watched this element to decide
   * when to appear; that floating card was removed in MF-17 (the sticky
   * sidebar is now the only desktop CTA), so the id is no longer observed
   * — it's kept as a harmless, optional hook. Only the hero/desktop
   * instance receives it; the full-width mobile duplicate omits it.
   */
  stickyAnchorId?: string;
  /**
   * Server-resolved user access state. When provided, the sidebar uses
   * these values during the first paint (before useUserCampus has
   * finished its async fetch) so the right CTA renders immediately
   * instead of a "Cargando…" placeholder. After hydration, useUserCampus
   * takes over and reflects any client-side change (e.g. just-completed
   * checkout in another tab).
   */
  initialUserState?: ServerUserState;
}

export const SIDEBAR_CTA_ANCHOR_ID = 'program-purchase-cta-anchor';

export const ProgramSidebar: React.FC<ProgramSidebarProps> = ({
  program,
  stickyAnchorId,
  initialUserState,
}) => {
  const { isSignedIn, isLoaded } = useUser();
  const { hasPro, hasAccess: checkAccess, isLoading: campusLoading } = useUserCampus();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Master CTA opens a chooser (form vs videocall) instead of jumping
  // straight to Alfonso's calendar. The form branch links to /contacto
  // (the generic site form), not the consultoria form modal.
  const [masterChooserOpen, setMasterChooserOpen] = useState(false);

  // While the client-side auth hooks are still resolving, prefer the
  // server-resolved state if the caller provided it. Once the hooks
  // finish (isLoaded && !campusLoading), trust them — they're the
  // freshest signal (e.g. a checkout completed in another tab).
  const authLoading = !isLoaded || campusLoading;
  const useServer = authLoading && !!initialUserState;
  // "Known" means we have something authoritative to render — either
  // the hooks finished or the page handed us a server snapshot.
  const userStateKnown = !authLoading || !!initialUserState;
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
  // Curso incluido en Pro (isPro) visto por alguien SIN Pro: en vez del
  // críptico "0€ · Ahorras X€", un mensaje claro y clicable junto al precio
  // que invita a suscribirse a Pro (el curso le saldría gratis).
  const showProFree = userStateKnown && !userHasPro && !!program.isPro;

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
    // top-32 (not top-24) so the pinned card keeps a margin below the fixed
    // header instead of butting right up against it (MF-17).
    <div className="sticky top-32">
      <div className="border border-mx-border bg-mx-card overflow-hidden rounded-lg shadow-sm">

        {/* Program Image — skip when the Strapi mapper fell back to the
            generic placeholder. On mobile this sidebar spans the full
            width, so a blank aspect-video block is far more jarring than
            simply not having an image at all. Programs without a real
            image keep the rest of the sidebar intact. */}
        {program.image && program.image !== '/placeholder-course.svg' && (
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
            {/* No price block for Masters — the only price-related element
                shown to the user is the CTA below ("Consultar precio"),
                which opens the chooser modal (form vs videollamada). */}
            <button
              type="button"
              {...(stickyAnchorId ? { id: stickyAnchorId } : {})}
              onClick={() => setMasterChooserOpen(true)}
              className="group flex items-center justify-center gap-2 md:gap-3 w-full bg-mx-orange text-white px-4 md:px-6 py-2.5 md:py-4 text-label-sm md:text-body-md font-medium rounded-lg hover:bg-mx-orange-dark transition-all duration-300"
            >
              <Mail size={14} className="md:w-[18px] md:h-[18px]" />
              Consultar precio
              <ArrowRight size={14} className="md:w-[18px] md:h-[18px] group-hover:translate-x-1 transition-transform" />
            </button>
            <ConsultaGratuitaChooser
              open={masterChooserOpen}
              onClose={() => setMasterChooserOpen(false)}
              formMode="contacto-page"
            />
            {/* Temario download moved to the hero (under the description)
                in MF-17 — see ProgramHeroSection. */}
          </>
        ) : (
          <>
            <div>
              <div className="flex items-baseline justify-between gap-x-3 gap-y-1 flex-wrap">
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
                    <span className="text-mx-orange text-heading-md md:text-display-sm font-black">
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
                    <span className={`${program.originalPrice ? 'text-mx-orange' : 'text-mx-text'} text-heading-md md:text-display-sm font-black`}>
                      {program.price}€
                    </span>
                  </>
                )}
                </div>
                {/* A la derecha del precio: si el curso es gratis con Pro y el
                    visitante no lo tiene, mensaje clicable "Gratis para
                    usuarios Pro" → /pricing. Si no, el aviso de ahorro -20%. */}
                {showProFree ? (
                  <Link
                    href="/pricing"
                    title="Suscríbete a Pro y accede gratis"
                    className="group inline-flex items-center gap-1.5 rounded-full border border-mx-orange/40 bg-mx-orange/10 px-3 py-1 text-mx-orange text-label-md font-bold hover:bg-mx-orange/20 transition-colors"
                  >
                    <Crown size={12} className="shrink-0" />
                    Gratis para usuarios Pro
                    <ArrowRight size={11} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ) : proSavings > 0 ? (
                  <p className="flex items-center gap-1.5 text-mx-orange text-label-md font-medium">
                    <span className="text-body-md font-bold">{program.price - proSavings}€</span>
                    <Crown size={11} /> Ahorras {proSavings}€ con Pro
                  </p>
                ) : null}
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
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-body-sm">{error}</p>
            )}

            {/* CTA Button */}
            <div className="space-y-3">
              {/* If the page passed a server-resolved user state, render
               * the correct CTA from the first paint. Without it we'd
               * still need the "Cargando…" placeholder while Clerk +
               * campus profile load on the client — kept as a fallback
               * for pages that haven't migrated yet. */}
              {authLoading && !initialUserState ? (
                <button
                  {...(stickyAnchorId ? { id: stickyAnchorId } : {})}
                  disabled
                  className="flex items-center justify-center gap-3 w-full bg-mx-orange/70 text-white px-6 py-4 text-body-sm md:text-body-md font-medium rounded-lg cursor-wait"
                  aria-busy="true"
                >
                  <Loader2 className="animate-spin" size={18} />
                  Cargando…
                </button>
              ) : hasAccess ? (
                <Link
                  {...(stickyAnchorId ? { id: stickyAnchorId } : {})}
                  href={`/cursos/${program.documentId || program.id}`}
                  className="group flex items-center justify-center gap-3 w-full bg-mx-orange text-white px-6 py-4 text-body-sm md:text-body-md font-medium rounded-lg hover:bg-mx-orange-dark transition-all duration-300"
                >
                  Acceder al Curso
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <m.button
                  {...(stickyAnchorId ? { id: stickyAnchorId } : {})}
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
                      {/* Always the same label. If the visitor isn't signed
                          in, handlePurchaseCourse redirects them to
                          /sign-in (register or log in) before checkout. */}
                      Matricúlate ahora
                    </>
                  )}
                </m.button>
              )}

              {/* Secondary CTA: Pro upsell. Per MF-17 the course sidebar
                  keeps exactly two action buttons — the primary purchase
                  CTA above and this one. The brochure/"Descarga el temario"
                  button was removed from the sidebar (the temario still
                  lives in the program tabs). */}
              {userStateKnown && !userHasPro && (
                <Link
                  href="/pricing"
                  className="flex items-center justify-center gap-2 w-full border border-mx-orange/50 text-mx-orange px-6 py-3 text-body-sm font-light rounded-lg hover:bg-mx-orange/10 transition-colors"
                >
                  <Crown size={16} />
                  O hazte Pro por €18/mes
                </Link>
              )}
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
};
