/** Live Next.js host. Use this as canonical until DNS points at Vercel. */
export const LIVE_NEXT_ORIGIN = "https://jenger-drop.vercel.app";

/** Square / Weebly storefront — not this Next app until DNS is flipped. */
const SQUARE_WEEBLY_HOSTS = new Set([
  "jengerluxurious.com",
  "www.jengerluxurious.com",
]);

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/$/, "");
}

/**
 * Canonical origin for metadataBase, sitemap, robots, and OG URLs.
 *
 * Default: https://jenger-drop.vercel.app
 * If NEXT_PUBLIC_SITE_URL is still the Square/Weebly host, ignore it unless
 * NEXT_PUBLIC_USE_CUSTOM_DOMAIN=true (set that only after DNS points at Vercel).
 */
export function resolveSiteUrl(): string {
  const raw = normalizeOrigin(
    process.env.NEXT_PUBLIC_SITE_URL || LIVE_NEXT_ORIGIN
  );
  const allowCustom = process.env.NEXT_PUBLIC_USE_CUSTOM_DOMAIN === "true";
  try {
    const host = new URL(raw).hostname.toLowerCase();
    if (SQUARE_WEEBLY_HOSTS.has(host) && !allowCustom) {
      return LIVE_NEXT_ORIGIN;
    }
    return raw;
  } catch {
    return LIVE_NEXT_ORIGIN;
  }
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "Jengerluxurious 2nd Chance Resale";
export const SITE_TAGLINE =
  "One-of-a-kind pre-loved clothing from the 2nd Chance Resale closet.";
