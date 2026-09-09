import { NextResponse } from "next/server";

/**
 * Square checkout stub.
 *
 * Preferred path: set NEXT_PUBLIC_SQUARE_CHECKOUT_URL to a Square Online
 * checkout / payment-link URL (same processor as http://www.jengerluxurious.com).
 *
 * Web Payments SDK can be wired later with:
 *   NEXT_PUBLIC_SQUARE_APPLICATION_ID
 *   NEXT_PUBLIC_SQUARE_LOCATION_ID
 *   SQUARE_ACCESS_TOKEN   (server-only — never commit a real value)
 *
 * This route must succeed without any live secrets so `npm run build` stays clean.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const checkoutUrl =
      process.env.NEXT_PUBLIC_SQUARE_CHECKOUT_URL?.trim() || "";
    const applicationId =
      process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID?.trim() || "";
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID?.trim() || "";

    return NextResponse.json({
      provider: "square",
      mode: checkoutUrl
        ? "hosted_checkout_link"
        : applicationId && locationId
          ? "web_payments_placeholder"
          : "unconfigured",
      checkoutUrl: checkoutUrl || null,
      webPaymentsReady: Boolean(applicationId && locationId),
      amount: Number(body?.amount ?? 0),
      message: checkoutUrl
        ? "Open the Square Online checkout link to complete payment."
        : "Square is not configured. Set NEXT_PUBLIC_SQUARE_CHECKOUT_URL (hosted link) or the Web Payments placeholders in .env.example.",
    });
  } catch (error) {
    console.error("square-checkout error:", error);
    return NextResponse.json(
      { error: "Failed to start Square checkout." },
      { status: 500 }
    );
  }
}
