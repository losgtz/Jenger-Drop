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
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadataBase, sitemap, robots, OG. **Keep `https://jenger-drop.vercel.app` until DNS for jengerluxurious.com points at this Vercel app.** The Square/Weebly host is ignored unless `NEXT_PUBLIC_USE_CUSTOM_DOMAIN=true`. |
| `NEXT_PUBLIC_USE_CUSTOM_DOMAIN` | Set `true` only after DNS is on Vercel, then set `NEXT_PUBLIC_SITE_URL=https://www.jengerluxurious.com`. |
| `STRIPE_SECRET_KEY` | Server-only. Creates a Stripe Checkout Session. Never commit a real key. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional public key. |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` | Optional Payment Link fallback if the secret key is unset. |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret for `/api/stripe-webhook`. Required to mark pieces **Sold** after payment. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Durable sold registry (Upstash Redis REST). Also accepts `KV_REST_API_URL` / `KV_REST_API_TOKEN`. Required on Vercel — the local filesystem is not shared across instances. |
| `SOLD_ADMIN_SECRET` | Bearer token for `/api/admin/sold` (mark / unmark a mistaken Sold). |

Set the same variables in **Vercel → Project → Settings → Environment Variables** for Production. Do not invent Stripe keys.

## Payments (Stripe)

Checkout uses **Stripe**. Preferred path: `STRIPE_SECRET_KEY` → `/api/stripe-checkout` creates a Checkout Session that includes line items plus the **$6.49** shipping line.

Without `STRIPE_SECRET_KEY` or `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`, the bag shows a config message and `/api/stripe-checkout` returns **503**. Square is parked at `/api/square-checkout` (`410`).

## Sold pieces

One-of-a-kind listings stay on the catalog and PDP after purchase (grayed, **Sold** badge). Add to bag and checkout are blocked. `/api/stripe-checkout` rejects sold product ids (409) and does not trust client prices — line items use catalog data.

Sold state is **not** written to `order_queue.json`. On Vercel that file is not durable. Production uses **Upstash Redis** (free tier is enough):

1. Create a Redis database (Upstash console or Vercel Marketplace → Upstash Redis).
2. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` on the Vercel project.
3. In Stripe Dashboard → Developers → Webhooks, add `https://<host>/api/stripe-webhook` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `payment_intent.succeeded`.
4. Set `STRIPE_WEBHOOK_SECRET` to the signing secret Stripe shows.

Checkout Sessions copy product ids into Session + PaymentIntent metadata so the webhook can mark them. A generic Payment Link does **not** attach line items — prefer Checkout Sessions for automatic Sold.

Locally, if Redis is unset, sold ids are stored in `data/sold-registry.local.json` (gitignored).

### Unmark a mistaken Sold

```bash
curl -X POST https://<host>/api/admin/sold \
  -H "Authorization: Bearer $SOLD_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action":"unmark","productId":"posh_001_..."}'
```

`action: "mark"` is available for recovery tests. `GET /api/admin/sold` lists records. You can also run `node scripts/sold-admin.mjs unmark <productId>` against a running server.

## Shipping

US domestic only. Rate lives in `data/shipping.ts` (`SHIPPING.flatRateUsd = 6.49`) and is shown as a checkout line before pay. There is no Shipping nav tab.

## Catalog import

See `data/POSHMARK.md` for the internal import pipeline. Do not invent photos or prices.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
