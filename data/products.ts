import poshmarkImport from "./poshmark-import.json";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  sizes: string[];
  colors?: string[];
  description: string;
  condition?: string;
  originalPrice?: number;
  brand?: string;
  listingUrl?: string;
  poshmarkId?: string;
  /** Units on hand. 0 = sold out. If omitted, treated as 1. */
  stock?: number;
};

/** The single shoppable category for this resale-only storefront. */
export const RESALE_CATEGORY = "2nd Chance Resale";

function fromPoshmarkListing(
  raw: (typeof poshmarkImport.listings)[number]
): Product {
  return {
    id: raw.id,
    name: raw.name,
    price: raw.price,
    image: raw.image,
    images: raw.images,
    category: raw.category,
    sizes: raw.sizes,
    description: raw.description,
    condition: raw.condition,
    originalPrice: raw.originalPrice,
    brand: raw.brand,
    listingUrl: raw.listingUrl,
    poshmarkId: raw.poshmarkId,
    stock: raw.stock ?? 1,
  };
}

/**
 * Live closet only — Poshmark `@jengerluxuri0us` listings from
 * `data/poshmark-import.json`. No seed, demo, or placeholder SKUs.
 */
export const resaleProducts: Product[] = poshmarkImport.listings.map(
  fromPoshmarkListing
);

/** Shoppable catalog = Poshmark import exclusively. */
export const products: Product[] = resaleProducts;
