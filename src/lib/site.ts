/** Canonical site origin for metadata, sitemap, and robots. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.jengerluxurious.com"
).replace(/\/$/, "");
