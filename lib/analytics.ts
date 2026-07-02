declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const CURRENCY = 'EUR';
const PURCHASE_KEY_PREFIX = 'gtm_purchase_';

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  price: number;
  item_category?: string;
  item_variant?: string;
  index?: number;
  quantity?: number;
}

/**
 * Datos de usuario para conversiones mejoradas (Google Ads Enhanced
 * Conversions). Se empujan en claro dentro de `user_data`; GTM los mapea,
 * hashea (SHA-256) y los envía junto con la conversión. Solo se incluyen los
 * campos presentes. El envío efectivo debe respetar el consentimiento de
 * marketing (Consent Mode / Cookiebot) — eso se gobierna en el tag de GTM.
 */
export interface AnalyticsUserData {
  email?: string;
  phone_number?: string;
  address?: {
    first_name?: string;
    last_name?: string;
    street?: string;
    city?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  };
}

const ADDRESS_KEYS = ['first_name', 'last_name', 'street', 'city', 'region', 'postal_code', 'country'] as const;

/** Convierte el `customer` que devuelve /api/checkout/verify (aplanado desde
 *  Stripe customer_details) en AnalyticsUserData. */
export function stripeCustomerToUserData(
  c: Record<string, string | null | undefined> | null | undefined
): AnalyticsUserData | undefined {
  if (!c) return undefined;
  const address: NonNullable<AnalyticsUserData['address']> = {};
  for (const k of ADDRESS_KEYS) if (c[k]) address[k] = c[k] as string;
  const ud: AnalyticsUserData = {};
  if (c.email) ud.email = c.email;
  if (c.phone_number) ud.phone_number = c.phone_number;
  if (Object.keys(address).length) ud.address = address;
  return Object.keys(ud).length ? ud : undefined;
}

/** Normaliza para maximizar el match de EC: email en minúsculas/trim, teléfono
 *  solo con dígitos y +, y campos de dirección recortados. */
function normalizeUserData(u?: AnalyticsUserData): AnalyticsUserData | undefined {
  if (!u) return undefined;
  const out: AnalyticsUserData = {};
  if (u.email) out.email = u.email.trim().toLowerCase();
  if (u.phone_number) {
    const phone = u.phone_number.replace(/[^\d+]/g, '');
    if (phone) out.phone_number = phone;
  }
  if (u.address) {
    const addr: NonNullable<AnalyticsUserData['address']> = {};
    for (const k of ADDRESS_KEYS) {
      const v = u.address[k];
      if (v && String(v).trim()) addr[k] = String(v).trim();
    }
    if (Object.keys(addr).length) out.address = addr;
  }
  return Object.keys(out).length ? out : undefined;
}

function pushEcommerce(event: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push(event);
}

export function trackPageView(url: string, title?: string) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'page_view',
    page_location: url,
    page_title: title ?? document.title,
  });
}

export function trackViewItemList(items: AnalyticsItem[], listName?: string, listId?: string) {
  if (items.length === 0) return;
  pushEcommerce({
    event: 'view_item_list',
    ecommerce: {
      currency: CURRENCY,
      ...(listId ? { item_list_id: listId } : {}),
      ...(listName ? { item_list_name: listName } : {}),
      items,
    },
  });
}

export function trackViewItem(item: AnalyticsItem) {
  pushEcommerce({
    event: 'view_item',
    ecommerce: {
      currency: CURRENCY,
      value: item.price,
      items: [item],
    },
  });
}

export function trackBeginCheckout(items: AnalyticsItem[]) {
  if (items.length === 0) return;
  const value = items.reduce((sum, i) => sum + i.price * (i.quantity ?? 1), 0);
  pushEcommerce({
    event: 'begin_checkout',
    ecommerce: {
      currency: CURRENCY,
      value,
      items,
    },
  });
}

interface PurchaseParams {
  transactionId: string;
  items: AnalyticsItem[];
  value: number;
  tax?: number;
  userData?: AnalyticsUserData;
}

function trackPurchase(params: PurchaseParams) {
  // Datos de usuario para conversiones mejoradas: se empujan a nivel raíz del
  // evento (no dentro de ecommerce) para que GTM los lea como variable propia.
  const userData = normalizeUserData(params.userData);
  pushEcommerce({
    event: 'purchase',
    ...(userData ? { user_data: userData } : {}),
    ecommerce: {
      transaction_id: params.transactionId,
      currency: CURRENCY,
      value: params.value,
      ...(params.tax !== undefined ? { tax: params.tax } : {}),
      items: params.items,
    },
  });
}

export function trackPurchaseOnce(
  sessionId: string,
  params: Omit<PurchaseParams, 'transactionId'>
): boolean {
  if (typeof window === 'undefined' || !sessionId) return false;
  const key = PURCHASE_KEY_PREFIX + sessionId;
  try {
    if (window.localStorage.getItem(key)) return false;
    window.localStorage.setItem(key, '1');
  } catch {
    // localStorage unavailable (private mode); fall through and fire anyway
  }
  trackPurchase({ transactionId: sessionId, ...params });
  return true;
}
