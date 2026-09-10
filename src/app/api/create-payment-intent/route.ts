import { NextResponse } from "next/server";
import { resolveCheckoutItems } from "@/lib/checkout-items";

/**
 * Legacy PaymentIntent route. Live checkout uses Checkout Sessions
 * at `/api/stripe-checkout`. Still rejects sold product ids if posted.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const items = Array.isArray(body?.items) ? body.items : [];
  if (items.length > 0) {
    const { soldIds } = await resolveCheckoutItems(items);
    if (soldIds.length > 0) {
      return NextResponse.json(
        { error: "A piece in your bag has sold.", soldIds },
        { status: 409 }
      );
    }
  }

  return NextResponse.json(
    {
      error: "Use /api/stripe-checkout for Stripe Checkout Sessions.",
      parked: true,
    },
    { status: 410 }
  );
}
