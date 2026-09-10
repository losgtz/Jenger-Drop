/** Fields needed to build a closet slug or public title. */
export type SlugFields = {
  id: string;
  name: string;
  brand?: string;
};

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

export function brandAlreadyInName(brand: string, name: string): boolean {
  const b = slugify(brand);
  const n = slugify(name);
  if (!b) return true;
  if (n === b || n.startsWith(`${b}-`) || n.includes(`-${b}-`)) return true;
  const compactBrand = b.replace(/-/g, "");
  const compactName = n.replace(/-/g, "");
  return compactName.startsWith(compactBrand);
}

/**
 * Pre-dedupe slug from PR #5: always `slugify(brand + name)-id`.
 * Those URLs still resolve (id suffix) and must 301 to the canonical slug.
 */
export function legacyProductSlug(product: SlugFields): string {
  return `${slugify(`${product.brand ?? ""} ${product.name}`)}-${product.id}`;
}

export function productSlug(product: SlugFields): string {
  const nameSlug = slugify(product.name);
  const brandSlug = slugify(product.brand ?? "");
  const base =
    brandSlug && !brandAlreadyInName(product.brand ?? "", product.name)
      ? `${brandSlug}-${nameSlug}`
      : nameSlug;
  return `${base}-${product.id}`;
}

export function productPath(product: SlugFields): string {
  return `/product/${productSlug(product)}`;
}

/**
 * Strip leftover marketplace "SOLD OUT" markers from listing titles.
 * Actual sold state is stock + the sold registry, not this copy.
 */
export function stripSoldOutTitleMarkers(name: string): string {
  const cleaned = name
    .replace(/\*+\s*discontinued\s+and\s+sold\s+out\s*\*+/gi, " ")
    .replace(/\*+\s*sold\s+out(?:\s+online)?\s*\*+/gi, " ")
    .replace(/\bsold\s+out(?:\s+online)?\b/gi, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
  return cleaned || name.trim();
}

export function productDisplayName(product: SlugFields): string {
  return stripSoldOutTitleMarkers(product.name);
}

/** Title without repeating brand when the listing name already includes it. */
export function productSeoTitle(product: SlugFields): string {
  const name = productDisplayName(product);
  const brand = (product.brand ?? "").trim();
  const branded =
    brand && !brandAlreadyInName(brand, name) ? `${brand} ${name}` : name;
  return `${branded} | 2nd Chance Resale`;
}
