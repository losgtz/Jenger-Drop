import { NextResponse } from "next/server";
import Stripe from "stripe";
import { SITE_URL } from "@/lib/site";
import { SHIPPING } from "../../../../data/shipping";

/**
 * Stripe Checkout Session (primary) or Payment Link fallback.
 * Builds without secrets. Unconfigured deploys return 503.
 * Do not invent keys.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const items = Array.isArray(body?.items) ? body.items : [];
    const subtotal = Number(body?.subtotal ?? 0);
    const shippingFee = Number(body?.shippingFee ?? SHIPPING.flatRateUsd);
    const name = String(body?.name ?? "").trim();
    const location = String(body?.location ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const instructions = String(body?.instructions ?? "").trim();

    const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK?.trim() || "";
    const secret = process.env.STRIPE_SECRET_KEY?.trim() || "";

    if (secret) {
      const stripe = new Stripe(secret);
      const origin = SITE_URL || new URL(request.url).origin;
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

      for (const item of items) {
        const qty = Math.max(1, Number(item?.qty ?? 1));
        const price = Number(item?.price ?? 0);
        const title = String(item?.name ?? "Closet piece").slice(0, 200);
        if (!Number.isFinite(price) || price <= 0) continue;
        lineItems.push({
          quantity: qty,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(price * 100),
            product_data: { name: title },
          },
        });
      }

      if (shippingFee > 0) {
        lineItems.push({
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(shippingFee * 100),
            product_data: {
              name: SHIPPING.label,
              description: SHIPPING.note,
            },
          },
        });
      }

      if (lineItems.length === 0) {
        return NextResponse.json(
          { error: "Your bag is empty." },
          { status: 400 }
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        success_url: `${origin}/?paid=1`,
        cancel_url: `${origin}/?checkout=cancel`,
        shipping_address_collection: { allowed_countries: ["US"] },
        metadata: {
          name,
          phone,
          location,
          instructions: instructions.slice(0, 400),
          subtotal: subtotal.toFixed(2),
          shippingFee: shippingFee.toFixed(2),
        },
      });

      if (!session.url) {
        return NextResponse.json(
          { error: "Stripe did not return a checkout URL. Check the Stripe Dashboard." },
          { status: 502 }
        );
      }

      return NextResponse.json({
        provider: "stripe",
        mode: "checkout_session",
        checkoutUrl: session.url,
        sessionId: session.id,
      });
    }

    if (paymentLink) {
      return NextResponse.json({
        provider: "stripe",
        mode: "payment_link",
        checkoutUrl: paymentLink,
      });
    }

    return NextResponse.json(
      {
        provider: "stripe",
        mode: "unconfigured",
        checkoutUrl: null,
        error:
          "Stripe checkout is not configured. Set STRIPE_SECRET_KEY (Checkout Session) or NEXT_PUBLIC_STRIPE_PAYMENT_LINK in Vercel / .env.local (see .env.example). Payment is required.",
      },
      { status: 503 }
    );
  } catch (error) {
    console.error("stripe-checkout error:", error);
    return NextResponse.json(
      { error: "Failed to start Stripe checkout." },
      { status: 500 }
    );
  }
}
