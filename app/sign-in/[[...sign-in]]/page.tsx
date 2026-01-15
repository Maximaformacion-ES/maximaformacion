'use client';

import React from 'react';
import { SignIn } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FontStyles } from '../../components/FontStyles';
import { Header } from '@/app/components/Header';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500/30 overflow-hidden">
      <FontStyles />

      {/* Background Pattern */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(245,158,11,0.05),transparent_50%)]" />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Header */}
      <Header isMenuOpen={false} setIsMenuOpen={() => {}} />

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-10"
          >
            <span className="text-amber-500 text-sm font-medium tracking-[0.3em] uppercase mb-4 block">
              Bienvenido de nuevo
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
              Inicia Sesión
            </h1>
            <p className="text-white/60 font-light">
              Accede a tu cuenta para continuar tu formación
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center"
          >
            <SignIn
              appearance={{
                variables: {
                  colorPrimary: '#f59e0b',
                  colorBackground: '#141414',
                  colorText: '#ffffff',
                  colorTextSecondary: '#a3a3a3',
                  colorInputBackground: '#1a1a1a',
                  colorInputText: '#ffffff',
                  colorNeutral: '#ffffff',
                  borderRadius: '0.75rem',
                },
                elements: {
                  rootBox: 'w-full max-w-md',
                  card: 'bg-[#141414] border border-amber-500/20 shadow-2xl shadow-amber-500/10 rounded-xl',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton: 
                    'bg-[#1a1a1a] border-2 border-white/20 text-white hover:bg-amber-500/10 hover:border-amber-500 transition-all duration-300 rounded-lg',
                  socialButtonsBlockButtonText: 'text-white font-medium',
                  socialButtonsProviderIcon: 'w-5 h-5',
                  dividerLine: 'bg-white/20',
                  dividerText: 'text-white/50 bg-[#141414] px-3',
                  formFieldLabel: 'text-white font-medium mb-2',
                  formFieldLabelRow: 'mb-2',
                  formFieldInput: 
                    'bg-[#1a1a1a] border-2 border-white/20 text-white placeholder:text-white/40 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition-all duration-300 rounded-lg h-12',
                  formFieldInputShowPasswordButton: 'text-white/60 hover:text-amber-500',
                  formButtonPrimary: 
                    'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold transition-all duration-300 shadow-lg shadow-amber-500/30 rounded-lg h-12 text-base',
                  footerAction: 'mt-6',
                  footerActionText: 'text-white/60',
                  footerActionLink: 'text-amber-500 hover:text-amber-400 font-medium',
                  identityPreview: 'bg-[#1a1a1a] border border-white/20 rounded-lg',
                  identityPreviewText: 'text-white',
                  identityPreviewEditButton: 'text-amber-500 hover:text-amber-400',
                  formFieldAction: 'text-amber-500 hover:text-amber-400',
                  otpCodeFieldInput: 'bg-[#1a1a1a] border-2 border-white/20 text-white focus:border-amber-500 rounded-lg',
                  formResendCodeLink: 'text-amber-500 hover:text-amber-400 font-medium',
                  alert: 'bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg',
                  alertText: 'text-red-400',
                  formFieldErrorText: 'text-red-400 text-sm mt-1',
                  footer: 'hidden',
                }
              }}
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center text-white/40 text-sm mt-8"
          >
            Al iniciar sesión, aceptas nuestros{' '}
            <Link href="/terminos" className="text-amber-500 hover:text-amber-400 transition-colors">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="/privacidad" className="text-amber-500 hover:text-amber-400 transition-colors">
              Política de Privacidad
            </Link>
          </motion.p>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 py-4 px-6 bg-black/80 backdrop-blur-md border-t border-white/5">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between text-white/40 text-xs">
          <span>© 2025 Máxima Formación. Todos los derechos reservados.</span>
          <div className="flex items-center gap-4">
            <Link href="/contacto" className="hover:text-amber-500 transition-colors">
              Contacto
            </Link>
            <Link href="/ayuda" className="hover:text-amber-500 transition-colors">
              Ayuda
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
