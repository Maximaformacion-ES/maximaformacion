'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Props {
  /** 'to-sign-up' en /sign-in; 'to-sign-in' en /sign-up. */
  direction: 'to-sign-up' | 'to-sign-in';
}

/**
 * Enlace visible para cambiar entre iniciar sesión y crear cuenta. El pie del
 * componente de Clerk va oculto (marca + enlace), y sin esto el visitante que
 * llegaba a /sign-in sin cuenta no veía forma de registrarse. Conserva el
 * `redirect_url` para que, tras registrarse, vuelva a donde iba.
 */
function SwitchLinkInner({ direction }: Props) {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url');
  const query = redirectUrl ? `?redirect_url=${encodeURIComponent(redirectUrl)}` : '';
  const toSignUp = direction === 'to-sign-up';
  return (
    <p className="text-center text-mx-text text-body-sm md:text-body-md mt-4 md:mt-6">
      {toSignUp ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
      <Link
        href={`${toSignUp ? '/sign-up' : '/sign-in'}${query}`}
        className="text-mx-orange hover:text-mx-orange-dark font-bold underline underline-offset-4 transition-colors"
      >
        {toSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
      </Link>
    </p>
  );
}

export function AuthSwitchLink(props: Props) {
  return (
    <Suspense fallback={null}>
      <SwitchLinkInner {...props} />
    </Suspense>
  );
}
