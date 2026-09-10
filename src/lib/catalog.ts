import { resaleProducts, type Product } from "../../data/products";
import {
  legacyProductSlug,
  productSlug,
} from "./product-slug";

export {
  brandAlreadyInName,
  legacyProductSlug,
  productDisplayName,
  productPath,
  productSeoTitle,
  productSlug,
  slugify,
  stripSoldOutTitleMarkers,
} from "./product-slug";

/** 301 map for brand-duplicated slugs (e.g. pacsun-pacsun-nwt-… → pacsun-nwt-…). */
export function legacyProductRedirects(): Array<{
  source: string;
  destination: string;
  statusCode: 301;
}> {
  const seen = new Set<string>();
  const redirects: Array<{
    source: string;
    destination: string;
    statusCode: 301;
  }> = [];
  for (const product of resaleProducts) {
    const canonical = productSlug(product);
    const legacy = legacyProductSlug(product);
    if (legacy === canonical || seen.has(legacy)) continue;
    seen.add(legacy);
    redirects.push({
      source: `/product/${legacy}`,
      destination: `/product/${canonical}`,
      statusCode: 301,
    });
  }
  return redirects;
}

export function productSeoDescription(product: Product): string {
  return [
    product.brand,
    product.condition,
    product.sizes?.[0] ? `Size ${product.sizes[0]}` : null,
    `$${product.price.toFixed(2)}`,
    "One-of-a-kind piece from 2nd Chance Resale.",
  ]
    .filter(Boolean)
    .join(" · ");
}

export function findProductBySlug(slug: string): Product | undefined {
  const exact = resaleProducts.find((p) => productSlug(p) === slug);
  if (exact) return exact;
  return resaleProducts.find((p) => slug.endsWith(`-${p.id}`));
}

export function allProductSlugs(): string[] {
  return resaleProducts.map(productSlug);
}
