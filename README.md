# Jengerluxurious — 2nd Chance Resale

Web-first clothing resale shop for **Jengerluxurious / 2nd Chance Resale**.

- Catalog: 955 listings in `data/poshmark-import.json`
- Payments: **Stripe** Checkout Sessions (or a Payment Link fallback)
- Shipping: **$6.49** flat US buyer rate in checkout (no Shipping tab)

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

Product pages live at `/product/[slug]` (brand + name slug + id). Trust pages: `/about`, `/returns`. `robots.ts` and `sitemap.ts` cover the homepage, those pages, and every listing. `/shipping` permanently redirects to `/`.

## Environment

Copy `.env.example` to `.env.local`. **Do not invent keys.** The site builds with Stripe values empty.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, sitemap, and robots. Defaults to `https://jenger-drop.vercel.app`. |
| `STRIPE_SECRET_KEY` | Server-only. Creates a Stripe Checkout Session. Never commit a real key. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional public key. |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` | Optional Payment Link fallback if the secret key is unset. |

Set the same variables in **Vercel → Project → Settings → Environment Variables** for Production.

## Payments (Stripe)

Checkout uses **Stripe**. Preferred path: `STRIPE_SECRET_KEY` → `/api/stripe-checkout` creates a Checkout Session that includes line items plus the **$6.49** shipping line.

Without `STRIPE_SECRET_KEY` or `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`, the bag shows a config message and `/api/stripe-checkout` returns **503**. Square is parked at `/api/square-checkout` (`410`).

## Shipping

US domestic only. Rate lives in `data/shipping.ts` (`SHIPPING.flatRateUsd = 6.49`) and is shown as a checkout line before pay. There is no Shipping nav tab.

## Catalog import

See `data/POSHMARK.md` for the internal import pipeline. Do not invent photos or prices.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
