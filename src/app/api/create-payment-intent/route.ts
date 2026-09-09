import { NextResponse } from "next/server";

/**
 * Legacy PaymentIntent route. Live checkout uses Checkout Sessions
 * at `/api/stripe-checkout`.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "Use /api/stripe-checkout for Stripe Checkout Sessions.",
      parked: true,
    },
    { status: 410 }
  );
}
