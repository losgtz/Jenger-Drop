import type { MetadataRoute } from "next";
import { resaleProducts } from "../../data/products";
import { productSlug } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    ...resaleProducts.map((product) => ({
      url: `${SITE_URL}/product/${productSlug(product)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
