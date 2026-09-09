import { resaleProducts, type Product } from "../../data/products";

/** slugify(brand + name) + "-" + id */
export function slugify(input: string): string {
  const slug = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "item";
}

export function productSlug(product: Product): string {
  return `${slugify(`${product.brand ?? ""} ${product.name}`)}-${product.id}`;
}

export function findProductBySlug(slug: string): Product | undefined {
  const exact = resaleProducts.find((p) => productSlug(p) === slug);
  if (exact) return exact;
  return resaleProducts.find((p) => slug.endsWith(`-${p.id}`));
}

export function allProductSlugs(): string[] {
  return resaleProducts.map(productSlug);
}
