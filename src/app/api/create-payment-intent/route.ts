import { NextResponse } from "next/server";

/**
 * Stripe checkout is parked. The live shop uses Square
 * (see `/api/square-checkout` and `src/lib/square.ts`).
 * This route stays so old clients fail closed instead of charging cards.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "Stripe is not the active checkout. Use Square.",
      parked: true,
    },
    { status: 410 }
  );
}
