import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { resaleProducts } from "../../../../../data/products";
import { findProductBySlug, productSlug } from "@/lib/catalog";
import {
  listSoldRecords,
  markSold,
  soldStoreBackend,
  soldStoreConfigured,
  unmarkSold,
} from "@/lib/sold-store";

export const dynamic = "force-dynamic";

function adminAuthorized(request: Request): boolean {
  const secret = process.env.SOLD_ADMIN_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const left = Buffer.from(token);
  const right = Buffer.from(secret);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function findProduct(idOrSlug: string) {
  const key = idOrSlug.trim();
  if (!key) return undefined;
  return (
    resaleProducts.find((product) => product.id === key) ??
    findProductBySlug(key)
  );
}

export async function GET(request: Request) {
  if (!process.env.SOLD_ADMIN_SECRET?.trim()) {
    return NextResponse.json(
      { error: "Set SOLD_ADMIN_SECRET to enable sold recovery." },
      { status: 503 }
    );
  }
  if (!adminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const records = await listSoldRecords();
    return NextResponse.json({
      backend: soldStoreBackend(),
      configured: soldStoreConfigured(),
      records,
    });
  } catch (error) {
    console.error("admin sold list error:", error);
    return NextResponse.json(
      { error: "Could not read sold registry." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!process.env.SOLD_ADMIN_SECRET?.trim()) {
    return NextResponse.json(
      { error: "Set SOLD_ADMIN_SECRET to enable sold recovery." },
      { status: 503 }
    );
  }
  if (!adminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!soldStoreConfigured()) {
    return NextResponse.json(
      {
        error:
          "Sold registry is not configured. Add Upstash Redis (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN) on Vercel.",
      },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const action = String(body?.action ?? "").trim().toLowerCase();
  const productId = String(body?.productId ?? body?.id ?? body?.slug ?? "").trim();
  const product = findProduct(productId);

  if (action !== "mark" && action !== "unmark") {
    return NextResponse.json(
      { error: "Use action: \"mark\" or \"unmark\"." },
      { status: 400 }
    );
  }
  if (!product && !productId) {
    return NextResponse.json(
      { error: "Provide productId (or slug)." },
      { status: 400 }
    );
  }

  const id = product?.id ?? productId;

  try {
    if (action === "unmark") {
      const removed = await unmarkSold(id);
      return NextResponse.json({
        ok: true,
        action: "unmark",
        productId: id,
        removed,
      });
    }

    const result = await markSold([
      {
        productId: id,
        slug: product ? productSlug(product) : undefined,
        source: "admin",
      },
    ]);
    return NextResponse.json({
      ok: true,
      action: "mark",
      productId: id,
      ...result,
    });
  } catch (error) {
    console.error("admin sold write error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sold registry write failed." },
      { status: 500 }
    );
  }
}
