import { resaleProducts, type Product } from "../../data/products";
import { findProductBySlug, productSlug } from "@/lib/catalog";
import { isListedSold } from "@/lib/sold";
import { isSoldId, listSoldIds } from "@/lib/sold-store";

export type RawCheckoutItem = {
  id?: unknown;
  slug?: unknown;
  qty?: unknown;
};

export type ResolvedCheckoutItem = {
  product: Product;
  qty: number;
};

function findCatalogProduct(idOrSlug: string): Product | undefined {
  const key = idOrSlug.trim();
  if (!key) return undefined;
  return (
    resaleProducts.find((product) => product.id === key) ??
    findProductBySlug(key)
  );
}

export function parseCheckoutItemIds(items: unknown): string[] {
  if (!Array.isArray(items)) return [];
  const ids: string[] = [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const raw = item as RawCheckoutItem;
    const id = String(raw.id ?? raw.slug ?? "").trim();
    if (id) ids.push(id);
  }
  return ids;
}

export async function resolveCheckoutItems(
  items: unknown
): Promise<{
  resolved: ResolvedCheckoutItem[];
  soldIds: string[];
  unknownIds: string[];
}> {
  const unknownIds: string[] = [];
  const soldIds: string[] = [];
  const resolved: ResolvedCheckoutItem[] = [];
  const seen = new Set<string>();

  if (!Array.isArray(items)) {
    return { resolved, soldIds, unknownIds };
  }

  let registryIds: Set<string> | null = null;
  try {
    registryIds = new Set(await listSoldIds());
  } catch {
    registryIds = new Set();
  }

  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const raw = item as RawCheckoutItem;
    const key = String(raw.id ?? raw.slug ?? "").trim();
    if (!key) continue;

    const product = findCatalogProduct(key);
    if (!product) {
      unknownIds.push(key);
      continue;
    }
    if (seen.has(product.id)) continue;
    seen.add(product.id);

    const registryHit =
      registryIds.has(product.id) ||
      (await isSoldId(product.id, productSlug(product)).catch(() => false));
    if (isListedSold(product, registryHit ? new Set([product.id]) : new Set())) {
      soldIds.push(product.id);
      continue;
    }

    resolved.push({ product, qty: 1 });
  }

  return { resolved, soldIds, unknownIds };
}
