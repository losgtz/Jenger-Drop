/**
 * US domestic shipping defaults for 2nd Chance Resale.
 *
 * Mirrors Poshmark’s 2026 standard buyer shipping for packages up to 5 lb
 * ($6.49 flat). Heavy/oversize upgrades (seller-paid above 5 lb) are out of
 * scope. Change these constants in one place — do not invent international rates.
 */
export const SHIPPING = {
  region: "US_DOMESTIC",
  label: "US shipping",
  /** Poshmark-standard flat rate (packages up to 5 lb). */
  flatRateUsd: 6.49,
  /** No free-shipping threshold for this PR (Poshmark charges the flat rate). */
  freeOverUsd: null as number | null,
  note: "US domestic only. Matches current Poshmark buyer shipping ($6.49 up to 5 lb).",
} as const;

export function shippingFeeForSubtotal(subtotal: number): number {
  if (subtotal <= 0) return 0;
  if (SHIPPING.freeOverUsd != null && subtotal >= SHIPPING.freeOverUsd) {
    return 0;
  }
  return SHIPPING.flatRateUsd;
}
