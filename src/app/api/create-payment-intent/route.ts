import { NextResponse } from "next/server";
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

export async function POST(request: Request) {
  try {
    if (!secretKey) {
      console.error("STRIPE_SECRET_KEY is missing from the environment.");
      return NextResponse.json(
        { error: "Payment is not configured." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(secretKey);

    const body = await request.json().catch(() => ({}));
    const amountDollars = Number(body?.amount ?? 0);

    // Stripe expects the amount in the smallest currency unit (cents).
    // Enforce Stripe's $0.50 minimum charge.
    const amount = Math.max(50, Math.round(amountDollars * 100));

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: { app: "jenger-drop" },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("create-payment-intent error:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent." },
      { status: 500 }
    );
  }
}
