import { NextResponse } from "next/server";

/**
 * Square checkout — primary payment path (same processor as
 * http://www.jengerluxurious.com).
 *
 * Preferred: NEXT_PUBLIC_SQUARE_CHECKOUT_URL = Square Online checkout
 * or Payment Link. Optional Web Payments placeholders:
 *   NEXT_PUBLIC_SQUARE_APPLICATION_ID
 *   NEXT_PUBLIC_SQUARE_LOCATION_ID
 *   SQUARE_ACCESS_TOKEN   (server-only — never commit a real value)
 *
 * Builds without secrets. Unconfigured deploys return 503 so checkout
 * cannot complete as a pay-later hold.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const checkoutUrl =
      process.env.NEXT_PUBLIC_SQUARE_CHECKOUT_URL?.trim() || "";
    const applicationId =
      process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID?.trim() || "";
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID?.trim() || "";
    const amount = Number(body?.amount ?? 0);
    const shippingFee = Number(body?.shippingFee ?? 0);

    if (checkoutUrl) {
      return NextResponse.json({
        provider: "square",
        mode: "hosted_checkout_link",
        checkoutUrl,
        amount,
        shippingFee,
        message: "Open the Square Online checkout / Payment Link to pay.",
      });
    }

    return NextResponse.json(
      {
        provider: "square",
        mode: "unconfigured",
        checkoutUrl: null,
        webPaymentsReady: Boolean(applicationId && locationId),
        amount,
        shippingFee,
        error:
          "Square checkout is not configured. Set NEXT_PUBLIC_SQUARE_CHECKOUT_URL to a Square Payment Link or Online checkout URL (see .env.example). Payment is required.",
      },
      { status: 503 }
    );
  } catch (error) {
    console.error("square-checkout error:", error);
    return NextResponse.json(
      { error: "Failed to start Square checkout." },
      { status: 500 }
    );
  }
}
