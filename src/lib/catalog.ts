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

function brandAlreadyInName(brand: string, name: string): boolean {
  const b = slugify(brand);
  const n = slugify(name);
  if (!b) return true;
  if (n === b || n.startsWith(`${b}-`) || n.includes(`-${b}-`)) return true;
  const compactBrand = b.replace(/-/g, "");
  const compactName = n.replace(/-/g, "");
  return compactName.startsWith(compactBrand);
}

export function productSlug(product: Product): string {
  const nameSlug = slugify(product.name);
  const brandSlug = slugify(product.brand ?? "");
  const base =
    brandSlug && !brandAlreadyInName(product.brand ?? "", product.name)
      ? `${brandSlug}-${nameSlug}`
      : nameSlug;
  return `${base}-${product.id}`;
}

/** Title without repeating brand when the listing name already includes it. */
export function productSeoTitle(product: Product): string {
  const name = product.name.trim();
  const brand = (product.brand ?? "").trim();
  const branded =
    brand && !brandAlreadyInName(brand, name) ? `${brand} ${name}` : name;
  return `${branded} | 2nd Chance Resale`;
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
