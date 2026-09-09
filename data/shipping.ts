/**
 * US domestic shipping defaults for 2nd Chance Resale.
 *
 * Flat buyer rate: $6.49 per order for packages up to 5 lb.
 * Change `flatRateUsd` in this file only. Do not invent international rates.
 */
export const SHIPPING = {
  region: "US_DOMESTIC",
  label: "US shipping",
  /** Flat rate (packages up to 5 lb). */
  flatRateUsd: 6.49,
  freeOverUsd: null as number | null,
  note: "US domestic only. $6.49 flat shipping for packages up to 5 lb.",
} as const;

export function shippingFeeForSubtotal(subtotal: number): number {
  if (subtotal <= 0) return 0;
  if (SHIPPING.freeOverUsd != null && subtotal >= SHIPPING.freeOverUsd) {
    return 0;
  }
  return SHIPPING.flatRateUsd;
}
