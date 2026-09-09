/**
 * Square is the live checkout path (same processor as http://www.jengerluxurious.com).
 *
 * Do not invent credentials. Copy placeholders from `.env.example` and fill them
 * locally / in the host. The site must build with every value empty.
 */
export const SQUARE = {
  /** Hosted Square Online checkout / payment-link URL (preferred). */
  checkoutUrl: process.env.NEXT_PUBLIC_SQUARE_CHECKOUT_URL ?? "",
  /** Public Square Web Payments application id (optional placeholder). */
  applicationId: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? "",
  /** Square location id for Web Payments (optional placeholder). */
  locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? "",
};

export function hasSquareCheckoutLink(): boolean {
  return SQUARE.checkoutUrl.trim().length > 0;
}

export function hasSquareWebPaymentsPlaceholders(): boolean {
  return (
    SQUARE.applicationId.trim().length > 0 && SQUARE.locationId.trim().length > 0
  );
}
