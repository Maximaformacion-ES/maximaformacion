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
}

function trackPurchase(params: PurchaseParams) {
  pushEcommerce({
    event: 'purchase',
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
