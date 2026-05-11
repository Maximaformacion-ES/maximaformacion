'use client';

import React, { useState } from 'react';
import { SignIn } from '@clerk/nextjs';
import { m } from 'framer-motion';
import Link from 'next/link';
import { FontStyles } from '../../components/FontStyles';
import { Header } from '@/app/components/Header';

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
      <main className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-32 pb-16">
        <div className="w-full max-w-md">
          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-10"
          >
            <span className="text-mx-orange text-body-sm font-medium tracking-[0.3em] uppercase mb-4 block">
              Bienvenido de nuevo
            </span>
            <h1 className="text-display-sm md:text-display-sm font-black text-mx-blue mb-4">
              Inicia Sesión
            </h1>
            <p className="text-mx-text-muted font-light">
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
                variables: {
                  colorPrimary: '#F7A000',
                  colorBackground: '#ffffff',
                  colorText: '#1a1a1a',
                  colorTextSecondary: '#666563',
                  colorInputBackground: '#FFFEFC',
                  colorInputText: '#1a1a1a',
                  colorNeutral: '#1a1a1a',
                  borderRadius: '0.75rem',
                },
                elements: {
                  rootBox: 'w-full max-w-md',
                  card: 'bg-mx-card border border-mx-border shadow-xl rounded-xl',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton:
                    'bg-mx-bg border-2 border-mx-border text-mx-text hover:bg-mx-orange/5 hover:border-mx-orange transition-all duration-300 rounded-lg',
                  socialButtonsBlockButtonText: 'text-mx-text font-medium',
                  socialButtonsProviderIcon: 'w-5 h-5',
                  dividerLine: 'bg-mx-border',
                  dividerText: 'text-mx-text-muted bg-mx-card px-3',
                  formFieldLabel: 'text-mx-text font-medium mb-2',
                  formFieldLabelRow: 'mb-2',
                  formFieldInput:
                    'bg-mx-bg border-2 border-mx-border text-mx-text placeholder:text-mx-text-muted/50 focus:border-mx-orange focus:ring-2 focus:ring-mx-orange/20 transition-all duration-300 rounded-lg h-12',
                  formFieldInputShowPasswordButton: 'text-mx-text-muted hover:text-mx-orange',
                  formButtonPrimary:
                    'bg-mx-orange hover:bg-mx-orange-dark text-white font-bold transition-all duration-300 rounded-lg h-12 text-body-md',
                  footerAction: 'mt-6',
                  footerActionText: 'text-mx-text-muted',
                  footerActionLink: 'text-mx-orange hover:text-mx-orange-dark font-medium',
                  identityPreview: 'bg-mx-bg border border-mx-border rounded-lg',
                  identityPreviewText: 'text-mx-text',
                  identityPreviewEditButton: 'text-mx-orange hover:text-mx-orange-dark',
                  formFieldAction: 'text-mx-orange hover:text-mx-orange-dark',
                  otpCodeFieldInput: 'bg-mx-bg border-2 border-mx-border text-mx-text focus:border-mx-orange rounded-lg',
                  formResendCodeLink: 'text-mx-orange hover:text-mx-orange-dark font-medium',
                  alert: 'bg-red-50 border border-red-200 text-red-600 rounded-lg',
                  alertText: 'text-red-600',
                  formFieldErrorText: 'text-red-500 text-body-sm mt-1',
                  footer: 'hidden',
                }
              }}
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
            />
          </m.div>

          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center text-mx-text-muted text-body-sm mt-8"
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
      <footer className="fixed bottom-0 left-0 right-0 z-20 py-4 px-6 bg-mx-bg/80 backdrop-blur-md border-t border-mx-border">
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
