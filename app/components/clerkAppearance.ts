/**
 * Apariencia compartida de los componentes <SignIn>/<SignUp> de Clerk, en el
 * tema claro de Máxima. La usan /sign-in, /sign-up y la página de compra
 * directa (/comprar) para que el formulario sea idéntico en los tres sitios.
 */
export const CLERK_VARIABLES = {
  colorPrimary: '#F7A000',
  colorBackground: '#ffffff',
  colorText: '#1a1a1a',
  colorTextSecondary: '#666563',
  colorInputBackground: '#FFFEFC',
  colorInputText: '#1a1a1a',
  colorNeutral: '#1a1a1a',
  borderRadius: '0.75rem',
};

export const CLERK_ELEMENTS = {
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
  // El pie de Clerk ("¿No tienes cuenta?" + marca) va oculto: cada página pone
  // su propio enlace para cambiar entre registro e inicio de sesión.
  footer: 'hidden',
};
