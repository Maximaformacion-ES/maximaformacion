import type { Metadata } from 'next';
import Stripe from 'stripe';
import GraciasClient from './GraciasClient';

export const metadata: Metadata = {
  title: 'Compra completada | Máxima Formación',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

/**
 * Página de confirmación del pack: aquí NO se da acceso a ningún curso (aún no
 * existen en el campus) — se confirma el pago y se explica que contactaremos
 * cuando esté disponible. Recuperamos la sesión de Stripe solo para pintar qué
 * se compró; si falla, la página funciona igual con el mensaje genérico.
 */
export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  let itemTitle: string | undefined;
  let email: string | undefined;
  let amount: number | undefined;

  if (sessionId && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-12-15.clover',
      });
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.metadata?.type === 'pack' && session.payment_status === 'paid') {
        itemTitle = session.metadata?.packItemTitle || undefined;
        email = session.customer_details?.email || session.customer_email || undefined;
        amount = (session.amount_total || 0) / 100;
      }
    } catch (e) {
      console.warn('[pack-gracias] could not retrieve session:', e);
    }
  }

  return <GraciasClient itemTitle={itemTitle} email={email} amount={amount} />;
}
