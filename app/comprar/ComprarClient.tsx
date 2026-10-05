'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SignIn, SignUp, useUser } from '@clerk/nextjs';
import { m } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Crown,
  Loader2,
  Lock,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';
import { FontStyles } from '@/app/components/FontStyles';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { CLERK_ELEMENTS, CLERK_VARIABLES } from '@/app/components/clerkAppearance';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import { getEffectivePrice, isFreeWithPro, shouldApplyProDiscount, klarnaInstallment } from '@/lib/pricing';
import { trackBeginCheckout } from '@/lib/analytics';
import type { ServerUserState } from '@/lib/auth/server-user-state';
import type { PurchaseItem } from './types';

interface Props {
  item: PurchaseItem;
  initialUserState: ServerUserState;
}

type AuthMode = 'registro' | 'login';

/**
 * Página de compra directa. Objetivo (petición de Marcos, 05-oct-2026): que
 * quien viene "en caliente" de un anuncio y pulsa "Matricúlate ahora" no
 * acabe en /sign-in sin opción visible de registrarse y, tras loguearse, de
 * vuelta en la ficha teniendo que pulsar otra vez. Aquí:
 *
 *   - Siempre se ve el resumen del curso y el botón "Comprar ahora".
 *   - Sin sesión, el formulario de crear cuenta (por defecto) o iniciar
 *     sesión está embebido en la misma pantalla.
 *   - Al terminar el registro/login, Clerk vuelve a esta misma URL con
 *     `?continuar=1` y el checkout de Stripe se lanza solo: cero clics extra.
 */
export default function ComprarClient(props: Props) {
  // useSearchParams exige un límite de Suspense en el árbol (patrón de /pricing).
  return (
    <Suspense
      fallback={
        <div className="bg-mx-bg min-h-screen text-mx-text flex items-center justify-center">
          <p className="text-mx-text-muted text-body-lg">Cargando...</p>
        </div>
      }
    >
      <ComprarContent {...props} />
    </Suspense>
  );
}

function ComprarContent({ item, initialUserState }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn, isLoaded } = useUser();
  const { hasPro, hasAccess: checkAccess, isLoading: campusLoading } = useUserCampus();
  const searchParams = useSearchParams();
  const autoContinue = searchParams.get('continuar') === '1';

  const [mode, setMode] = useState<AuthMode>('registro');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const authRef = useRef<HTMLDivElement>(null);
  const autoFired = useRef(false);

  // Mientras Clerk/perfil cargan, usamos el estado resuelto en servidor para
  // pintar lo correcto desde el primer frame (sin "Cargando…").
  const authLoading = !isLoaded || campusLoading;
  const signedIn = authLoading ? initialUserState.isSignedIn : !!isSignedIn;
  const userHasPro = authLoading ? initialUserState.isSignedIn && initialUserState.hasPro : !!isSignedIn && hasPro;
  const hasAccess = authLoading
    ? initialUserState.enrolledProgramDocumentIds.includes(item.accessId) || (item.isPro && initialUserState.hasPro)
    : checkAccess(item.accessId, item.isPro);

  const includedInPro = isFreeWithPro(item, userHasPro);
  const proDiscount = !includedInPro && shouldApplyProDiscount(item, userHasPro);
  const effectivePrice = getEffectivePrice(item, userHasPro);
  const installment = klarnaInstallment(effectivePrice);

  const startCheckout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    trackBeginCheckout([
      {
        item_id: item.slug,
        item_name: item.title,
        item_category: item.kind === 'maxymia' ? 'maxymia-course' : item.type ?? 'Curso',
        price: effectivePrice,
      },
    ]);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.checkoutBody),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al procesar el pago');
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error('No se pudo abrir la pasarela de pago');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago');
      setIsLoading(false);
    }
  }, [item, effectivePrice]);

  // Vuelta de Clerk tras registro/login (?continuar=1): lanzamos el checkout
  // sin esperar otro clic. Solo una vez y solo con el estado ya confirmado
  // por el cliente (no el snapshot de servidor, que es anterior al login).
  useEffect(() => {
    if (!autoContinue || autoFired.current) return;
    if (!isLoaded || campusLoading) return;
    if (!isSignedIn || checkAccess(item.accessId, item.isPro)) return;
    autoFired.current = true;
    void startCheckout();
  }, [autoContinue, isLoaded, campusLoading, isSignedIn, checkAccess, item.accessId, item.isPro, startCheckout]);

  const handleBuyClick = () => {
    if (signedIn) {
      void startCheckout();
      return;
    }
    // Sin sesión: el botón existe (se ve que es el siguiente paso) pero
    // lleva al formulario de cuenta que está en la misma pantalla.
    setHint(true);
    authRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const switchMode = (next: AuthMode) => {
    if (next === mode) return;
    // Clerk guarda el paso del flujo en el hash (#/verify-email-address…):
    // lo limpiamos al cambiar de formulario para no arrastrar un paso ajeno.
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setMode(next);
  };

  const returnUrl = `${item.selfPath}?continuar=1`;
  const clerkAppearance = {
    variables: CLERK_VARIABLES,
    elements: {
      ...CLERK_ELEMENTS,
      // Clerk fija el ancho de la tarjeta (≈25rem) con su propio CSS: hay que
      // forzarlo con !important para que ocupe toda la columna, igual que las
      // pestañas de arriba. Si no, queda flotando sin llegar al borde.
      rootBox: '!w-full !max-w-none',
      cardBox: '!w-full !max-w-none',
      card: '!w-full !max-w-none bg-mx-card border border-mx-border shadow-sm rounded-xl',
    },
  };

  const buying = isLoading || (autoContinue && signedIn && !hasAccess && !error);

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10 pt-24 md:pt-32 pb-16 md:pb-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href={item.fichaHref}
            className="inline-flex items-center gap-2 text-mx-text-muted hover:text-mx-orange text-label-md md:text-body-sm transition-colors mb-4 md:mb-6"
          >
            <ArrowLeft size={14} />
            Volver a la ficha del curso
          </Link>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 md:mb-10"
          >
            <span className="text-mx-orange text-label-md md:text-body-sm font-medium tracking-[0.3em] uppercase block mb-2">
              Completar compra
            </span>
            <h1 className="text-heading-md md:text-heading-lg font-black text-mx-blue leading-tight">
              {item.title}
            </h1>
          </m.div>

          <div className="grid gap-6 lg:gap-10 lg:grid-cols-[minmax(0,1fr)_400px] items-start">
            {/* ── Formulario de cuenta (o estado de sesión) ── */}
            <div ref={authRef} className="scroll-mt-28 order-2 lg:order-1">
              {hasAccess ? (
                <AccessPanel item={item} />
              ) : signedIn ? (
                <SignedInPanel buying={buying} error={error} onBuy={handleBuyClick} />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Lock size={18} className="text-mx-orange mt-1 shrink-0" />
                    <div>
                      <h2 className="text-heading-sm md:text-heading-md font-bold text-mx-text">
                        {mode === 'registro' ? 'Crea tu cuenta para comprar' : 'Inicia sesión para comprar'}
                      </h2>
                      <p className="text-mx-text-muted text-body-sm mt-1">
                        Tu cuenta es donde tendrás el curso, el certificado y la factura. Es un
                        momento: al terminar pasas directamente al pago.
                      </p>
                    </div>
                  </div>

                  {hint && (
                    <p className="rounded-lg border border-mx-orange/40 bg-mx-orange/10 text-mx-orange text-body-sm font-medium px-4 py-3">
                      Para comprar solo falta tu cuenta: regístrate o inicia sesión aquí y el pago se abre
                      automáticamente.
                    </p>
                  )}

                  {/* Pestañas registro / login */}
                  <div className="grid grid-cols-2 rounded-lg border border-mx-border bg-mx-card p-1" role="tablist">
                    <TabButton active={mode === 'registro'} onClick={() => switchMode('registro')}>
                      Soy nuevo · Crear cuenta
                    </TabButton>
                    <TabButton active={mode === 'login'} onClick={() => switchMode('login')}>
                      Ya tengo cuenta
                    </TabButton>
                  </div>

                  <div className="w-full">
                    {mode === 'registro' ? (
                      <SignUp
                        key="signup"
                        routing="hash"
                        appearance={clerkAppearance}
                        forceRedirectUrl={returnUrl}
                        signInForceRedirectUrl={returnUrl}
                        signInUrl={`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`}
                      />
                    ) : (
                      <SignIn
                        key="signin"
                        routing="hash"
                        appearance={clerkAppearance}
                        forceRedirectUrl={returnUrl}
                        signUpForceRedirectUrl={returnUrl}
                        signUpUrl={`/sign-up?redirect_url=${encodeURIComponent(returnUrl)}`}
                      />
                    )}
                  </div>

                  <p className="text-center text-mx-text-muted text-label-md md:text-body-sm">
                    {mode === 'registro' ? (
                      <>
                        ¿Ya tienes cuenta?{' '}
                        <button type="button" onClick={() => switchMode('login')} className="text-mx-orange hover:text-mx-orange-dark font-medium">
                          Inicia sesión
                        </button>
                      </>
                    ) : (
                      <>
                        ¿Es tu primera vez?{' '}
                        <button type="button" onClick={() => switchMode('registro')} className="text-mx-orange hover:text-mx-orange-dark font-medium">
                          Crea tu cuenta
                        </button>
                      </>
                    )}
                  </p>

                  <p className="text-center text-mx-text-muted text-label-md">
                    Al continuar aceptas los{' '}
                    <Link href="/aviso-legal" className="text-mx-orange hover:text-mx-orange-dark">Términos de Servicio</Link>{' '}
                    y la{' '}
                    <Link href="/politica-de-privacidad" className="text-mx-orange hover:text-mx-orange-dark">Política de Privacidad</Link>.
                  </p>
                </div>
              )}
            </div>

            {/* ── Resumen del pedido ── */}
            <aside className="order-1 lg:order-2 lg:sticky lg:top-32">
              <div className="border border-mx-border bg-mx-card rounded-lg shadow-sm overflow-hidden">
                {item.image && (
                  <div className="relative aspect-video w-full hidden sm:block">
                    <Image src={item.image} alt={item.title} fill sizes="(max-width: 1024px) 100vw, 400px" className="object-cover" unoptimized />
                  </div>
                )}
                <div className="p-5 md:p-6 space-y-5">
                  <div>
                    <p className="text-mx-text-muted text-label-md uppercase tracking-[0.2em] mb-1">Tu pedido</p>
                    <p className="font-bold text-mx-text text-body-md md:text-body-lg leading-snug">{item.title}</p>
                  </div>

                  {item.details.length > 0 && (
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-body-sm">
                      {item.details.map((d) => (
                        <div key={d.label}>
                          <dt className="text-mx-text-muted text-label-md">{d.label}</dt>
                          <dd className="text-mx-text font-medium">{d.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  <div className="border-t border-mx-border pt-4">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      {includedInPro ? (
                        <>
                          <span className="text-mx-text-muted text-body-sm line-through">{item.price}€</span>
                          <span className="flex items-center gap-2 text-mx-orange text-heading-md font-black">
                            <Crown size={20} /> Incluido en Pro
                          </span>
                        </>
                      ) : proDiscount ? (
                        <>
                          <span className="text-mx-text-muted text-body-sm line-through">{item.price}€</span>
                          <span className="text-mx-orange text-heading-md md:text-heading-lg font-black">{effectivePrice}€</span>
                          <span className="text-mx-orange text-label-md font-bold flex items-center gap-1"><Crown size={12} /> -20% Pro</span>
                        </>
                      ) : (
                        <>
                          {item.originalPrice ? (
                            <span className="text-mx-text-muted text-body-sm line-through">{item.originalPrice}€</span>
                          ) : null}
                          <span className={`${item.originalPrice ? 'text-mx-orange' : 'text-mx-text'} text-heading-md md:text-heading-lg font-black`}>
                            {item.price}€
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-mx-text-muted text-label-md mt-1">
                      {installment ? (
                        <>Pago único o <span className="text-mx-text font-medium">3 plazos de {installment} €</span> sin intereses con Klarna</>
                      ) : (
                        'Pago único'
                      )}
                    </p>
                  </div>

                  {error && !signedIn && <p className="text-red-500 text-body-sm">{error}</p>}

                  {hasAccess ? (
                    <Link
                      href={item.accesoHref}
                      className="group flex items-center justify-center gap-3 w-full bg-mx-orange text-white px-6 py-4 text-body-sm md:text-body-md font-medium rounded-lg hover:bg-mx-orange-dark transition-all duration-300"
                    >
                      Acceder al curso
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <m.button
                      type="button"
                      onClick={handleBuyClick}
                      disabled={buying}
                      className="group flex items-center justify-center gap-3 w-full bg-mx-orange text-white px-6 py-4 text-body-sm md:text-body-md font-bold rounded-lg hover:bg-mx-orange-dark transition-all duration-300 disabled:opacity-60 disabled:cursor-wait"
                      whileHover={{ scale: buying ? 1 : 1.02 }}
                      whileTap={{ scale: buying ? 1 : 0.98 }}
                    >
                      {buying ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Abriendo el pago seguro…
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={18} />
                          Comprar ahora
                        </>
                      )}
                    </m.button>
                  )}

                  {!signedIn && !hasAccess && (
                    <p className="text-center text-mx-text-muted text-label-md -mt-2">
                      Crea tu cuenta o inicia sesión{' '}
                      <span className="lg:hidden">más abajo</span>
                      <span className="hidden lg:inline">a la izquierda</span>
                      {' '}y pasarás directo al pago.
                    </p>
                  )}

                  <ul className="space-y-2 text-mx-text-muted text-label-md md:text-body-sm">
                    <li className="flex items-center gap-2"><ShieldCheck size={15} className="text-mx-orange shrink-0" /> Pago seguro con Stripe (tarjeta o Klarna)</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-mx-orange shrink-0" /> Acceso permanente y factura por email</li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-md px-3 py-2.5 text-label-md md:text-body-sm font-medium transition-colors ${
        active ? 'bg-mx-orange text-white shadow-sm' : 'text-mx-text-muted hover:text-mx-text'
      }`}
    >
      {children}
    </button>
  );
}

function SignedInPanel({ buying, error, onBuy }: { buying: boolean; error: string | null; onBuy: () => void }) {
  return (
    <div className="border border-mx-border bg-mx-card rounded-lg shadow-sm p-6 md:p-8 space-y-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 size={22} className="text-mx-orange shrink-0 mt-0.5" />
        <div>
          <h2 className="text-heading-sm md:text-heading-md font-bold text-mx-text">Todo listo</h2>
          <p className="text-mx-text-muted text-body-sm mt-1">
            Ya tienes sesión iniciada. Pulsa <strong>Comprar ahora</strong> y te llevamos al pago seguro de
            Stripe. Al terminar, el curso aparecerá en tu campus.
          </p>
        </div>
      </div>
      {error && <p className="text-red-500 text-body-sm">{error}</p>}
      <button
        type="button"
        onClick={onBuy}
        disabled={buying}
        className="inline-flex items-center justify-center gap-3 bg-mx-orange text-white px-6 py-3.5 text-body-sm md:text-body-md font-bold rounded-lg hover:bg-mx-orange-dark transition-all duration-300 disabled:opacity-60 disabled:cursor-wait"
      >
        {buying ? (
          <>
            <Loader2 className="animate-spin" size={18} /> Abriendo el pago seguro…
          </>
        ) : (
          <>
            <ShoppingCart size={18} /> Comprar ahora
          </>
        )}
      </button>
    </div>
  );
}

function AccessPanel({ item }: { item: PurchaseItem }) {
  return (
    <div className="border border-mx-border bg-mx-card rounded-lg shadow-sm p-6 md:p-8 space-y-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 size={22} className="text-mx-orange shrink-0 mt-0.5" />
        <div>
          <h2 className="text-heading-sm md:text-heading-md font-bold text-mx-text">Ya tienes este curso</h2>
          <p className="text-mx-text-muted text-body-sm mt-1">
            No hace falta comprarlo otra vez: está disponible en tu campus.
          </p>
        </div>
      </div>
      <Link
        href={item.accesoHref}
        className="group inline-flex items-center gap-3 bg-mx-orange text-white px-6 py-3.5 text-body-sm md:text-body-md font-bold rounded-lg hover:bg-mx-orange-dark transition-all duration-300"
      >
        Acceder al curso
        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
