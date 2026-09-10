import { NextResponse } from "next/server";
import Stripe from "stripe";
import { SITE_URL } from "@/lib/site";
import { SHIPPING } from "../../../../data/shipping";
import { resolveCheckoutItems } from "@/lib/checkout-items";
import { packProductIds } from "@/lib/sold-metadata";

/**
 * Stripe Checkout Session (primary) or Payment Link fallback.
 * Builds without secrets. Unconfigured deploys return 503.
 * Rejects product ids already in the durable sold registry.
 * Do not invent keys.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { resolved, soldIds, unknownIds } = await resolveCheckoutItems(
      body?.items
    );
    const shippingFee = Number(body?.shippingFee ?? SHIPPING.flatRateUsd);
    const name = String(body?.name ?? "").trim();
    const location = String(body?.location ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const instructions = String(body?.instructions ?? "").trim();

    if (unknownIds.length > 0) {
      return NextResponse.json(
        { error: "One or more pieces are no longer in the closet.", unknownIds },
        { status: 400 }
      );
    }

    if (soldIds.length > 0) {
      return NextResponse.json(
        {
          error: "A piece in your bag has sold.",
          soldIds,
        },
        { status: 409 }
      );
    }

    if (resolved.length === 0) {
      return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });
    }

    const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK?.trim() || "";
    const secret = process.env.STRIPE_SECRET_KEY?.trim() || "";
    const productIds = resolved.map((item) => item.product.id);
    const productIdMeta = packProductIds(productIds);
    const subtotal = resolved.reduce(
      (sum, item) => sum + item.product.price * item.qty,
      0
    );

    if (secret) {
      const stripe = new Stripe(secret);
      const origin = SITE_URL || new URL(request.url).origin;
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

      for (const item of resolved) {
        const price = item.product.price;
        if (!Number.isFinite(price) || price <= 0) continue;
        lineItems.push({
          quantity: item.qty,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(price * 100),
            product_data: {
              name: item.product.name.slice(0, 200),
              metadata: { productId: item.product.id },
            },
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
          ...productIdMeta,
        },
        payment_intent_data: {
          metadata: {
            ...productIdMeta,
          },
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
        warning:
          "Payment Link does not attach line items. Sold state flips only after a Checkout Session webhook.",
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
