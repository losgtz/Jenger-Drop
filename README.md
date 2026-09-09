# Jengerluxurious — 2nd Chance Resale

Web-first clothing resale shop for **Jengerluxurious / 2nd Chance Resale**.

- Closet on this site: Poshmark batches 1–10/10 in `data/poshmark-import.json` (955 listings from `@jengerluxuri0us`)
- Poshmark closet: [@jengerluxuri0us](https://poshmark.com/closet/jengerluxuri0us)
- Live Square storefront: [jengerluxurious.com](https://www.jengerluxurious.com)

The former **Jenger Drop** emergency-delivery side (Fashion & Beauty Fix, Game Day & Going Out, Essentials) is removed from the shoppable catalog and homepage.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Production web build:

```bash
npm run build
npm start
```

Capacitor/Android remains in the tree (`npm run build:mobile`, `capacitor.config.ts`) but is not required for the website.

Product pages live at `/product/[slug]` (brand + name slug + id). Thin trust pages: `/about`, `/shipping`, `/returns`. `robots.ts` and `sitemap.ts` cover the homepage, those pages, and every resale listing.

## Environment

Copy `.env.example` to `.env.local`. **Do not invent keys.** The site builds with Square values empty.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, sitemap, and robots. Defaults to `https://www.jengerluxurious.com`. |
| `NEXT_PUBLIC_SQUARE_CHECKOUT_URL` | Required to collect payment. Square Online checkout / Payment Link URL. |
| `NEXT_PUBLIC_SQUARE_APPLICATION_ID` | Optional Square Web Payments placeholder. |
| `NEXT_PUBLIC_SQUARE_LOCATION_ID` | Optional Square Web Payments placeholder. |
| `SQUARE_ACCESS_TOKEN` | Server-only. Never commit a real token. |

## Payments (Square)

Checkout uses **Square**, not Stripe. Without `NEXT_PUBLIC_SQUARE_CHECKOUT_URL`, the bag shows a config message and `/api/square-checkout` returns **503** — there is no pay-later / hold path.

Stripe is parked: `/api/create-payment-intent` returns `410` and is not used by the UI.

## Shipping

US domestic only. Rate lives in `data/shipping.ts` (`SHIPPING.flatRateUsd = 6.49`) and is shown as a separate checkout line before pay. Mirrors Poshmark’s 2026 flat buyer rate for packages up to 5 lb. Heavy/oversize (seller-paid upgrades above 5 lb) is out of scope.

## Poshmark import

See `data/POSHMARK.md`. The live closet is batches 1–10 of 10 on this PR (**955** listings). Inventory is **FROZEN** until Carlos green-lights more. Do not invent photos or prices.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
