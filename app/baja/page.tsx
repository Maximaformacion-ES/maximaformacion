import type { Metadata } from 'next';
import { isOptedOut, verifyUnsubscribeToken } from '@/lib/email/optout';
import BajaClient from './BajaClient';

export const metadata: Metadata = {
  title: 'Preferencias de email | Máxima Formación',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

export default async function BajaPage({
  searchParams,
}: {
  searchParams: Promise<{ u?: string; t?: string }>;
}) {
  const sp = await searchParams;
  const u = sp.u ?? '';
  const t = sp.t ?? '';
  const valid = verifyUnsubscribeToken(u, t);
  const optedOut = valid ? await isOptedOut(u) : false;

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-mx-border bg-mx-card p-8 text-center">
        {valid ? (
          <BajaClient u={u} t={t} initialOptedOut={optedOut} />
        ) : (
          <>
            <h1 className="text-heading-sm font-bold mb-3">Enlace no válido</h1>
            <p className="text-body-sm text-mx-text-muted">
              Este enlace de gestión de preferencias no es válido o está incompleto. Escríbenos a{' '}
              <a href="mailto:cursos@maximaformacion.es" className="text-mx-orange underline">
                cursos@maximaformacion.es
              </a>{' '}
              y lo gestionamos nosotros.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
