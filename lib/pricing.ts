export const PRO_COURSE_DISCOUNT = 0.20;

export type DiscountableProduct = {
  price: number;
  isPro?: boolean | null;
  /** 'Master' | 'Curso' for Programs; undefined for Maxymia courses (treated as Curso). */
  type?: 'Master' | 'Curso';
};

/** Course is included in the Pro plan (100% off for Pro users). */
export function isFreeWithPro(
  product: Pick<DiscountableProduct, 'isPro'>,
  hasPro: boolean | undefined,
): boolean {
  return !!hasPro && !!product.isPro;
}

/** Eligible for the standard 20% Pro discount (excludes Másters). */
export function isProDiscountEligible(product: Pick<DiscountableProduct, 'type'>): boolean {
  // Maxymia courses have no `type` field — treat them as Curso for the 20% rule.
  return product.type === undefined || product.type === 'Curso';
}

/** True whenever any Pro discount applies (100% or 20%). */
export function shouldApplyProDiscount(
  product: Pick<DiscountableProduct, 'type' | 'isPro'>,
  hasPro: boolean | undefined,
): boolean {
  if (!hasPro) return false;
  if (isFreeWithPro(product, hasPro)) return true;
  return isProDiscountEligible(product);
}

export function getEffectivePrice(
  product: DiscountableProduct,
  hasPro: boolean | undefined,
): number {
  if (isFreeWithPro(product, hasPro)) return 0;
  if (!shouldApplyProDiscount(product, hasPro)) return product.price;
  return Math.round(product.price * (1 - PRO_COURSE_DISCOUNT));
}
