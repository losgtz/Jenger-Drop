/**
 * Stripe is the live checkout path.
 *
 * Do not invent credentials. Copy placeholders from `.env.example`.
 * The site must build with every value empty.
 */
export const STRIPE_PUBLIC = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  /** Optional hosted Payment Link fallback when Checkout Sessions are unset. */
  paymentLink: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "",
};

export function hasStripePaymentLink(): boolean {
  return STRIPE_PUBLIC.paymentLink.trim().length > 0;
}

export function hasStripePublishableKey(): boolean {
  return STRIPE_PUBLIC.publishableKey.trim().length > 0;
}
