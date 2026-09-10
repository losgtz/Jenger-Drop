import { NextResponse } from "next/server";
import Stripe from "stripe";
import { resaleProducts } from "../../../../data/products";
import { findProductBySlug, productSlug } from "@/lib/catalog";
import { unpackProductIds } from "@/lib/sold-metadata";
import {
  markSold,
  sessionAlreadyRecorded,
  soldStoreConfigured,
} from "@/lib/sold-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function findProduct(idOrSlug: string) {
  const key = idOrSlug.trim();
  if (!key) return undefined;
  return (
    resaleProducts.find((product) => product.id === key) ??
    findProductBySlug(key)
  );
}

async function productIdsFromSession(
  stripe: Stripe,
  session: Stripe.Checkout.Session
): Promise<string[]> {
  const fromMeta = unpackProductIds(session.metadata ?? undefined);
  if (fromMeta.length > 0) return fromMeta;

  const full = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["line_items.data.price.product"],
  });
  const ids: string[] = [];
  for (const item of full.line_items?.data ?? []) {
    const product = item.price?.product;
    if (product && typeof product !== "string" && !product.deleted) {
      const id = product.metadata?.productId;
      if (id) ids.push(id);
    }
  }
  return [...new Set(ids)];
}

async function markIdsSold(
  ids: string[],
  sourceSessionId?: string
): Promise<{ marked: string[]; already: string[] }> {
  const records: Array<{
    productId: string;
    slug?: string;
    source: "stripe";
    sessionId?: string;
  }> = [];
  const known = new Set<string>();

  for (const id of ids) {
    const product = findProduct(id);
    const productId = product?.id ?? id.trim();
    if (!productId || known.has(productId)) continue;
    known.add(productId);
    records.push({
      productId,
      slug: product ? productSlug(product) : undefined,
      source: "stripe",
      sessionId: sourceSessionId,
    });
  }

  return markSold(records);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const stripeSecret = process.env.STRIPE_SECRET_KEY?.trim();

  if (!webhookSecret) {
    return NextResponse.json(
      {
        error:
          "Stripe webhook is not configured. Set STRIPE_WEBHOOK_SECRET (see .env.example).",
      },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = Stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("stripe-webhook signature error:", error);
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  if (!soldStoreConfigured()) {
    return NextResponse.json(
      {
        error:
          "Sold registry is not configured. Add Upstash Redis so Stripe retries can mark pieces sold.",
      },
      { status: 503 }
    );
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "payment") {
        return NextResponse.json({ received: true, ignored: "not_payment_mode" });
      }
      const paid =
        session.payment_status === "paid" ||
        event.type === "checkout.session.async_payment_succeeded";
      if (!paid) {
        return NextResponse.json({ received: true, ignored: "not_paid" });
      }
      if (await sessionAlreadyRecorded(session.id)) {
        return NextResponse.json({ received: true, idempotent: true });
      }
      if (!stripeSecret) {
        const ids = unpackProductIds(session.metadata ?? undefined);
        if (ids.length === 0) {
          return NextResponse.json(
            { error: "STRIPE_SECRET_KEY is required to expand session line items." },
            { status: 503 }
          );
        }
        const result = await markIdsSold(ids, session.id);
        return NextResponse.json({ received: true, ...result });
      }
      const stripe = new Stripe(stripeSecret);
      const ids = await productIdsFromSession(stripe, session);
      if (ids.length === 0) {
        console.warn("stripe-webhook: paid session had no product ids", session.id);
        return NextResponse.json({ received: true, marked: [], already: [] });
      }
      const result = await markIdsSold(ids, session.id);
      return NextResponse.json({ received: true, ...result });
    }

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const ids = unpackProductIds(intent.metadata ?? undefined);
      if (ids.length === 0) {
        return NextResponse.json({ received: true, ignored: "no_product_ids" });
      }
      const result = await markIdsSold(ids, intent.id);
      return NextResponse.json({ received: true, ...result });
    }

    return NextResponse.json({ received: true, ignored: event.type });
  } catch (error) {
    console.error("stripe-webhook handler error:", error);
    return NextResponse.json(
      { error: "Failed to persist sold state." },
      { status: 500 }
    );
  }
}
