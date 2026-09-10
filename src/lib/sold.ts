import type { Product } from "../../data/products";

/** Badge / button copy for one-of-a-kind pieces that have sold. */
export const SOLD_LABEL = "Sold";

export type SoldSource = "stripe" | "admin";

export type SoldRecord = {
  productId: string;
  slug?: string;
  soldAt: string;
  source: SoldSource;
  sessionId?: string;
};

/** Static import stock is 0, or the id is in the durable sold registry. */
export function isListedSold(
  product: Product,
  soldIds: ReadonlySet<string>
): boolean {
  if (soldIds.has(product.id)) return true;
  return (product.stock ?? 1) <= 0;
}
