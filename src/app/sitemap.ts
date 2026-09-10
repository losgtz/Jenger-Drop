import type { MetadataRoute } from "next";
import { resaleProducts } from "../../data/products";
import { productSlug } from "@/lib/catalog";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog-query";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const closetPages = Math.max(
    1,
    Math.ceil(resaleProducts.length / CATALOG_PAGE_SIZE)
  );
  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    ...Array.from({ length: closetPages - 1 }, (_, index) => ({
      url: `${SITE_URL}/?page=${index + 2}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...(["/about", "/returns"] as const).map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...resaleProducts.map((product) => ({
      url: `${SITE_URL}/product/${productSlug(product)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
