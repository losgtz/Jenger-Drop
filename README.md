# Jengerluxurious — 2nd Chance Resale

Web-first clothing resale shop for **Jengerluxurious / 2nd Chance Resale**.

- Closet on this site: `data/products.ts` (`2nd Chance Resale` only)
- Poshmark closet: [@jengerluxuri0us](https://poshmark.com/closet/jengerluxuri0us)
- Live Square storefront: [jengerluxurious.com](http://www.jengerluxurious.com)

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

## Payments (Square)

Checkout uses **Square**, not Stripe.

Copy `.env.example` to `.env.local` and fill only what you have. **Do not invent keys.** The site builds with every Square value empty.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SQUARE_CHECKOUT_URL` | Preferred. Hosted Square Online checkout / payment-link URL. |
| `NEXT_PUBLIC_SQUARE_APPLICATION_ID` | Optional Square Web Payments placeholder. |
| `NEXT_PUBLIC_SQUARE_LOCATION_ID` | Optional Square Web Payments placeholder. |
| `SQUARE_ACCESS_TOKEN` | Server-only. Never commit a real token. |

`/api/square-checkout` returns a hosted link when configured, or a documented placeholder when not.

Stripe is parked: `/api/create-payment-intent` returns `410` and is not used by the UI.

## Poshmark import (later)

See `data/poshmark-import.example.json` and `data/POSHMARK.md`. Map an export onto that schema, then merge into `data/products.ts`. Do not invent photos or prices.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
