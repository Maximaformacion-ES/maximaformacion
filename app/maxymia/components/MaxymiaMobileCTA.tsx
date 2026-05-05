'use client';

import React, { useState } from 'react';
import { ShoppingCart, Loader2, ArrowRight, Crown } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import { useLocale } from '../i18n/LocaleProvider';
import Link from 'next/link';
import type { MaxymiaCourse } from '../types';
import { getEffectivePrice, isFreeWithPro, shouldApplyProDiscount } from '@/lib/pricing';
import { trackBeginCheckout } from '@/lib/analytics';

interface MaxymiaMobileCTAProps {
  course: MaxymiaCourse;
}

export const MaxymiaMobileCTA: React.FC<MaxymiaMobileCTAProps> = ({ course }) => {
  const { locale } = useLocale();
  const { isSignedIn, isLoaded } = useUser();
  const { hasPro, hasAccess: checkAccess, isLoading: campusLoading } = useUserCampus();
  const [isLoading, setIsLoading] = useState(false);

  const userHasPro = !!isSignedIn && hasPro;
  const hasAccess = checkAccess(course.id);
  const includedInPro = isFreeWithPro(course, userHasPro);
  const proDiscount = !includedInPro && shouldApplyProDiscount(course, userHasPro);
  const effectivePrice = getEffectivePrice(course, userHasPro);

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

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#0b1018]/95 backdrop-blur-md border-t border-white/10 px-4 py-3 safe-bottom">
      {/* Row 1: Price info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-2">
          {includedInPro ? (
            <>
              <span className="text-white/40 text-body-sm line-through">{course.price}€</span>
              <span className="flex items-center gap-1 text-mx-orange text-heading-sm font-black">
                <Crown size={14} /> {locale === 'es' ? 'Incluido en Pro' : 'Included in Pro'}
              </span>
            </>
          ) : proDiscount ? (
            <>
              <span className="text-white/40 text-body-sm line-through">{course.price}€</span>
              <span className="text-mx-orange text-heading-sm font-black">{effectivePrice}€</span>
              <span className="flex items-center gap-1 text-label-sm font-bold text-mx-orange">
                <Crown size={10} /> -20%
              </span>
            </>
          ) : (
            <>
              {course.originalPrice != null && (
                <span className="text-white/40 text-body-sm line-through">
                  {course.originalPrice}€
                </span>
              )}
              <span className={`${course.originalPrice != null ? 'text-mx-orange' : 'text-white'} text-heading-sm font-black`}>
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
        {!userHasPro && isLoaded && !campusLoading && (
          <Link href="/pricing" className="flex items-center gap-1 text-label-sm text-mx-orange font-medium">
            <Crown size={12} />
            {locale === 'es' ? 'o Pro €18/mes' : 'or Pro €18/mo'}
          </Link>
        )}
      </div>

      {/* Row 2: CTA button full width */}
      {isLoaded && !campusLoading && hasAccess ? (
        <Link
          href={`/maxymia/campus/${course.slug}/lesson/${course.blocks[0]?.lessons[0]?.id}`}
          className="flex items-center justify-center gap-2 w-full bg-mx-orange text-white px-4 py-3 text-body-sm font-medium rounded-lg hover:bg-mx-orange-dark transition-all"
        >
          {locale === 'es' ? 'Acceder al Curso' : 'Access Course'}
          <ArrowRight size={16} />
        </Link>
      ) : (
        <button
          onClick={handlePurchase}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full bg-mx-orange text-white px-4 py-3 text-body-sm font-medium rounded-lg hover:bg-mx-orange-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              {locale === 'es' ? 'Procesando...' : 'Processing...'}
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              {isSignedIn
                ? (locale === 'es' ? 'Comprar Ahora' : 'Buy Now')
                : (locale === 'es' ? 'Iniciar sesión para comprar' : 'Sign in to buy')}
            </>
          )}
        </button>
      )}
    </div>
  );
};
