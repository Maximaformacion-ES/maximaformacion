'use client';

import React, { useState } from 'react';
import { SignIn } from '@clerk/nextjs';
import { m } from 'framer-motion';
import Link from 'next/link';
import { FontStyles } from '../../components/FontStyles';
import { Header } from '@/app/components/Header';
import { CLERK_ELEMENTS, CLERK_VARIABLES } from '@/app/components/clerkAppearance';
import { AuthSwitchLink } from '@/app/components/AuthSwitchLink';

export default function SignInPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-hidden">
      <FontStyles />

      {/* Decorative Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(247,160,0,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(82,123,231,0.06),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `radial-gradient(circle, #e5e5e5 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Header */}
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20 pb-8 md:pt-32 md:pb-16">
        <div className="w-full max-w-md">
          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-5 md:mb-10"
          >
            <span className="text-mx-orange text-body-sm font-medium tracking-[0.3em] uppercase mb-2 md:mb-4 block">
              Bienvenido de nuevo
            </span>
            <h1 className="text-heading-lg md:text-display-sm font-black text-mx-blue mb-2 md:mb-4">
              Inicia Sesión
            </h1>
            <p className="text-mx-text-muted text-body-sm md:text-body-md font-light">
              Accede a tu cuenta para continuar tu formación
            </p>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center"
          >
            <SignIn
              appearance={{
                variables: CLERK_VARIABLES,
                elements: {
                  ...CLERK_ELEMENTS,
                  rootBox: 'w-full max-w-md',
                  card: 'bg-mx-card border border-mx-border shadow-xl rounded-xl',
                },
              }}
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
            />
          </m.div>

          {/* Enlace explícito para cambiar de flujo (el pie de Clerk va oculto). */}
          <AuthSwitchLink direction="to-sign-up" />

          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center text-mx-text-muted text-label-md md:text-body-sm mt-4 md:mt-8"
          >
            Al iniciar sesión, aceptas nuestros{' '}
            <Link href="/aviso-legal" className="text-mx-orange hover:text-mx-orange-dark transition-colors">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="/politica-de-privacidad" className="text-mx-orange hover:text-mx-orange-dark transition-colors">
              Política de Privacidad
            </Link>
          </m.p>
        </div>
      </main>

      {/* Footer */}
      <footer className="hidden md:block fixed bottom-0 left-0 right-0 z-20 py-4 px-6 bg-mx-bg/80 backdrop-blur-md border-t border-mx-border">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between text-mx-text-muted text-label-md">
          <span>&copy; 2025 Máxima Formación. Todos los derechos reservados.</span>
          <div className="flex items-center gap-4">
            <Link href="/contacto" className="hover:text-mx-orange transition-colors">
              Contacto
            </Link>
            <Link href="/ayuda" className="hover:text-mx-orange transition-colors">
              Ayuda
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
