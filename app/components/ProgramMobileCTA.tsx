'use client';

import React, { useState } from 'react';
import { ShoppingCart, Loader2, ArrowRight, Crown, Mail } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import Link from 'next/link';
import type { Program } from '@/lib/strapi/types';
import { getEffectivePrice, shouldApplyProDiscount, isFreeWithPro } from '@/lib/pricing';
import { trackBeginCheckout } from '@/lib/analytics';

interface ProgramMobileCTAProps {
  program: Program;
}

export const ProgramMobileCTA: React.FC<ProgramMobileCTAProps> = ({ program }) => {
  const { isSignedIn, isLoaded } = useUser();
  const { hasPro, hasAccess: checkAccess, isLoading: campusLoading } = useUserCampus();
  const [isLoading, setIsLoading] = useState(false);

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

  if (program.type === 'Master') {
    return (
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-mx-bg/95 backdrop-blur-md border-t border-mx-border px-4 pt-3 safe-bottom">
        <a
          href={`mailto:cursos@maximaformacion.es?subject=${encodeURIComponent(`Consulta sobre ${program.title}`)}`}
          className="flex items-center justify-center gap-2 w-full bg-mx-orange text-white px-4 py-3 text-body-sm font-medium rounded-lg hover:bg-mx-orange-dark transition-all"
        >
          <Mail size={16} />
          Consultar precio
        </a>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-mx-bg/95 backdrop-blur-md border-t border-mx-border px-4 py-3 safe-bottom">
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
          className="flex items-center justify-center gap-2 w-full bg-mx-orange text-white px-4 py-3 text-body-sm font-medium rounded-lg hover:bg-mx-orange-dark transition-all"
        >
          Acceder al Curso
          <ArrowRight size={16} />
        </Link>
      ) : (
        <button
          onClick={handlePurchaseCourse}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full bg-mx-orange text-white px-4 py-3 text-body-sm font-medium rounded-lg hover:bg-mx-orange-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Procesando...
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              {isSignedIn ? 'Comprar Ahora' : 'Iniciar sesión para comprar'}
            </>
          )}
        </button>
      )}
    </div>
  );
};
