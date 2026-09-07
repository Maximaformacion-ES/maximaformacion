import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { db, isDbConfigured } from '@/lib/db/client';
import { packPurchases } from '@/lib/db/schema';
import { getSiteUrl } from '@/lib/site-url';
import {
  COURSE_PRICE,
  PACK_ITEM_ID,
  PACK_PRICE,
  PACK_TITLE,
  packItemTitle,
} from '@/app/data/pack-cursos';

// Checkout del pack de cursos universitarios. Es PÚBLICO (sin Clerk): los
// compradores llegan desde landings externas y aún no tienen cuenta en la
// plataforma. Pedimos el email en el formulario para poder deduplicar (quien
// compró el pack no puede comprar luego un curso suelto, y viceversa) y lo
// fijamos como customer_email en Stripe para que coincida con lo comprobado.
//
// El webhook (metadata.type === 'pack') registra la compra en
// campus.pack_purchases y notifica; NO crea matrícula: los cursos todavía no
// existen en el campus y el acceso se asignará a mano desde el admin.

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mismo campo fiscal que /api/checkout (DNI como custom field, ver el
// comentario largo allí): la gestoría necesita el DNI para la factura.
const STRIPE_CHECKOUT_EXTRA_FIELDS = {
  custom_fields: [
    {
      key: 'dni',
      label: {
        type: 'custom',
        custom: 'DNI / NIE / CIF (para tu factura)',
      },
      type: 'text',
      text: { minimum_length: 8, maximum_length: 12 },
    },
  ],
} as const satisfies Pick<Stripe.Checkout.SessionCreateParams, 'custom_fields'>;

// CIF del emisor en la factura de Stripe (ver getAccountTaxIds en
// /api/checkout: las facturas de Checkout no siempre heredan los tax IDs de
// la cuenta, así que se pasan de forma determinista).
let cachedAccountTaxIds: string[] | null = null;
async function getAccountTaxIds(stripe: Stripe): Promise<string[]> {
  if (cachedAccountTaxIds) return cachedAccountTaxIds;
  try {
    const list = await stripe.taxIds.list({ limit: 5 });
    const ids = list.data.map((t) => t.id);
    if (ids.length > 0) cachedAccountTaxIds = ids;
    return ids;
  } catch (e) {
    console.warn('[pack-checkout] no se pudieron leer los account tax IDs:', e);
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-12-15.clover' });

    const body = (await request.json().catch(() => ({}))) as {
      item?: string;
      email?: string;
      name?: string;
    };

    const item = body.item?.trim() || '';
    const email = body.email?.trim().toLowerCase() || '';
    const name = body.name?.trim().slice(0, 120) || undefined;

    const title = packItemTitle(item);
    if (!title) {
      return NextResponse.json({ error: 'Curso no válido' }, { status: 400 });
    }
    if (!EMAIL_RX.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Introduce un email válido' }, { status: 400 });
    }

    // Deduplicación por email: pack ya comprado → nada más que comprar; curso
    // suelto ya comprado (o incluido en un pack previo) → no cobrar dos veces.
    // Si la BD no responde no bloqueamos la venta (el webhook registra igual).
    if (isDbConfigured()) {
      try {
        const rows = await db
          .select({ item: packPurchases.item })
          .from(packPurchases)
          .where(eq(packPurchases.email, email));
        const owned = new Set(rows.map((r) => r.item));
        if (owned.has(PACK_ITEM_ID)) {
          return NextResponse.json(
            { error: 'Ya has adquirido el pack completo con este email: los tres cursos están incluidos. Si crees que es un error, escríbenos a cursos@maximaformacion.es.' },
            { status: 409 },
          );
        }
        if (item === PACK_ITEM_ID && owned.size > 0) {
          return NextResponse.json(
            { error: 'Ya has comprado alguno de los cursos por separado con este email. Escríbenos a cursos@maximaformacion.es y te preparamos el pack descontando lo ya pagado.' },
            { status: 409 },
          );
        }
        if (owned.has(item)) {
          return NextResponse.json(
            { error: 'Ya has comprado este curso con este email. Si crees que es un error, escríbenos a cursos@maximaformacion.es.' },
            { status: 409 },
          );
        }
      } catch (e) {
        console.warn('[pack-checkout] dedupe check failed (continuing):', e);
      }
    }

    const isPack = item === PACK_ITEM_ID;
    const amountCents = (isPack ? PACK_PRICE : COURSE_PRICE) * 100;
    const baseUrl = getSiteUrl('http://localhost:3000');
    const accountTaxIds = await getAccountTaxIds(stripe);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: amountCents,
            product_data: {
              name: isPack ? `${PACK_TITLE} (12 ECTS)` : `${title} (4 ECTS)`,
              metadata: { type: 'pack', packItem: item },
            },
          },
        },
      ],
      success_url: `${baseUrl}/pack-cursos-universitarios/gracias?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pack-cursos-universitarios?cancelado=true`,
      customer_email: email,
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: isPack
            ? `Compra del ${PACK_TITLE}`
            : `Compra del curso universitario "${title}"`,
          metadata: { packItem: item },
          ...(accountTaxIds.length ? { account_tax_ids: accountTaxIds } : {}),
        },
      },
      metadata: {
        type: 'pack',
        packItem: item,
        packItemTitle: title.slice(0, 480),
        ...(name ? { buyerName: name } : {}),
      },
      billing_address_collection: 'required',
      ...STRIPE_CHECKOUT_EXTRA_FIELDS,
      locale: 'es',
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('[pack-checkout] error:', error);
    return NextResponse.json(
      { error: 'No se pudo iniciar el pago. Inténtalo de nuevo en unos minutos.' },
      { status: 500 },
    );
  }
}
