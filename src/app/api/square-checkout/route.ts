import { NextResponse } from "next/server";

/** Square checkout is parked. The live shop uses Stripe (`/api/stripe-checkout`). */
export async function POST() {
  return NextResponse.json(
    {
      error: "Square is not the active checkout. Use Stripe.",
      parked: true,
    },
    { status: 410 }
  );
}
