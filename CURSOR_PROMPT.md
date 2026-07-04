# Cursor Composer Instructions: Jengerluxurious App UI/UX Pivot

**Context:**
We are refining the existing Next.js (App Router) mobile-first web app. Keep the overall visual direction, layout structure, and tech stack (Tailwind, Shadcn UI, Lucide icons), but execute the following specific refinements to elevate the brand and fix the UX. 

## 1. Brand Accuracy & Naming
- Ensure exact naming is used globally:
  - **Jengerluxurious** (Global Brand)
  - **Jenger Drop** (The emergency delivery side / homepage)
  - **Jengerluxurious 2nd Chance** (The resale side / secondary tab)

## 2. Color Direction & Vibe
- **Palette Pivot:** Push the palette heavily toward true red, deep black, and clean neutrals. 
- **Remove Pink/Purple:** Strip out any pink or purple undertones unless heavily intentional. 
- **The "Luxury" Factor:** It needs to feel polished, feminine, bold, and expensive. Use the brand's true Red specifically for primary Call-to-Action elements (e.g., Search "Go" button, "Request Item" button) so the user's thumb naturally gravitates to it.

## 3. Typography, Spacing, & Interactions
- **Typography:** Swap the main titles and headings to a more elegant serif font. Keep functional body text as a clean sans-serif. 
- **Letter Spacing & Padding:** Increase letter spacing slightly on headings. Add more whitespace (padding) between elements globally so it feels "expensive" rather than "utility-focused."
- **Animations:** Add a slight "scale-down" or "bounce" haptic-like animation effect to buttons when clicked/tapped so it feels like a native iOS app.

## 4. Jenger Drop Behavior (Homepage)
- Keep Jenger Drop as the default homepage.
- **Hero Search Bar:** Must display: "O sh!t! What do you need right now?"
- **Search Functionality:** The bar must function as *both* a real typed search and a category launcher.
- **Synonym Logic (Mocked):** Add front-end mapping so slang maps to real items. Examples:
  - "boob tape" -> fashion tape
  - "clear purse" -> clear stadium bag
  - "phone cord" -> phone charger cable
  - "nipple covers" -> pasties
  - "red top" -> red game day top
- **Replace Placeholders:** Update demo content with realistic campus-ready emergency items (e.g., hangover kits, double-sided tape, chargers, snacks).

## 5. No-Result Fallback & Routing (Crucial)
- **NO DEAD ENDS.** If a search yields zero direct matches, do NOT show a blank "No results" screen.
- Instead, display:
  - Text: "We don't have that yet."
  - Button: "Request this item" (Triggers Request Modal)
  - Button: "Open full menu" (Triggers Full Menu Drawer)
  - Contact Option: "Text us what you need"

## 6. Modals & Drawers
- **Request Item Modal:** Create a clean modal that captures:
  - Item name (pre-fill this from their failed search query)
  - "Need it by:" (Radio/Select: tonight / this week / just exploring)
  - Optional details (Text input for size, color, notes)
  - Contact info (Phone or email)
- **Full Menu Drawer:** A visual drawer/modal populated with item cards and pictures for users who just want to browse everything.

## 7. Global Contact Access
- Ensure the user is never more than one tap away from help.
- **Sticky Actions:** Implement a sticky contact bar or floating actions for: text, call, Instagram DM, and "Menu."

## 8. Jengerluxurious 2nd Chance (Secondary Tab)
- **Layout Shift:** This tab must feel distinct from the utility of Jenger Drop. Make it look more editorial—like a premium fashion magazine layout.
- **Images & Grid:** Use larger hero images and a cleaner, fashion-forward grid. 
- **Card Details:** Use realistic resale product cards. Include:
  - Condition tags (e.g., "LIKE NEW", "GENTLY LOVED")
  - Strikethrough original pricing vs. new price
  - A save/heart icon.

**Execution:**
Please implement these changes step-by-step, ensuring Tailwind classes are updated for the new color palette and spacing, and React state is added for the search fallback logic and modals.

## 9. 2nd Chance Tab (External Link)
- The "Jengerluxurious 2nd Chance" toggle should no longer render a local page. 
- Make it act as a direct external hyperlink (open in a new tab) to a separate storefront. Keep the styling of the toggle button the same, but change its behavior to an `<a>` tag or `window.open`.

## 10. Checkout & Payment Flow (Dual Option)
- Build a clean Checkout Modal/Sheet when a user views their cart or clicks to buy.
- **Form Fields:** Delivery location (dorm/building/address) and Phone Number.
- **Payment Options:** Provide two large, distinct, luxury-styled buttons:
  - Option A: "Pay Now (Card / Apple Pay)" -> (Setup as a placeholder for Stripe integration).
  - Option B: "Pay on Delivery (Venmo / CashApp)"
- **Confirmation Screen:** Upon submitting either, show a success screen: "Order Received. We're on the way. Keep an eye on your texts."
- **Backend Prep:** Scaffold a basic Next.js API route (e.g., `/api/checkout`) that handles the form submission. (We will plug a Telegram webhook into this later to alert the admin).

## 11. Real Stripe Integration (Credit Cards)
- The "Pay Now" button is currently a placeholder. We need to collect real credit cards.
- Please install `@stripe/stripe-js` and `@stripe/react-stripe-js` (and `stripe` for the backend).
- Convert the checkout modal to use Stripe Elements (specifically the Payment Element so they can enter their card number directly in the app).
- Create a `/api/create-payment-intent` route to securely generate the Stripe client secret.

## 12. GPS / Drop a Pin (Location)
- In the Checkout Modal, where we ask for the delivery location, add a "📍 Locate Me" button.
- Use the browser's native `navigator.geolocation` API to get the user's latitude and longitude.
- Convert that into an address (using reverse geocoding if possible, or just send the coordinates/Google Maps link to the backend) so the driver knows exactly where to go on campus.

## 13. Backend Order Logging (Bypass Telegram API)
- The Telegram API is rejecting our direct fetch. Instead, change `/api/checkout/route.ts` so that it appends the new order data (JSON format) to a local file on the disk (e.g., `../../../order_queue.json`).
- Jarvis (the AI assistant) will monitor this file and handle the notifications independently.

## 14. Fix Stripe Integration & GPS Fallback
- **Stripe Failure:** The Stripe Elements payment is hanging or failing to advance after submission. Please review the `/api/create-payment-intent` route. Ensure it is correctly returning the `clientSecret` and that the frontend `Elements` provider is correctly wrapping the payment form and awaiting `stripe.confirmPayment()`. Ensure any errors are clearly caught and logged to the console.
- **GPS Failure:** The "Locate Me" button failed with "couldn't grab your location." This is likely because the browser blocked the `navigator.geolocation` request (common on localhost without HTTPS). Please ensure the geolocation `error` callback is properly logging the reason, and improve the fallback UI so that if it fails, the user is smoothly transitioned to manually typing their address without the UI feeling broken.

## 15. Deep Debug Geolocation
- The user confirmed the browser has NOT blocked location permissions, yet `navigator.geolocation.getCurrentPosition` is still failing.
- Please add explicit console logging to the geolocation `error` callback (e.g., `console.error("Geolocation error:", error.code, error.message)`).
- Ensure the geolocation call includes reasonable options: `{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }`.

## 16. Checkout Re-Pivot (Mock Orders Only)
- The user is skipping Stripe integration and P2P payments for the time being. 
- Please revert the checkout flow to a frictionless MVP.
- Remove the Stripe Payment Elements, the API clientSecret calls, and the Venmo/CashApp instructions entirely.
- The Checkout Drawer should simply ask for Delivery Location and Phone Number.
- Provide a single, large CTA button: "Place Order".
- When clicked, append the order to `order_queue.json` (so the dispatcher still works) and show the "Order Received" confirmation screen.
- Update the success screen copy to remove the "Have your Venmo ready" text. Just say "Order Received. We're on the way. Keep an eye on your texts."

## 17. Re-Enable Stripe (Final Payment Flow)
- The user has requested we restore the payment gateway.
- Please re-implement the Stripe Payment Elements inside the checkout drawer.
- Ensure the flow requires a successful Stripe payment intent confirmation before advancing to the "Order Received" screen.
- Remove the Venmo/CashApp references from the UI entirely; we will be strictly card-only.
- If there are lingering issues with the `STRIPE_SECRET_KEY` validation on the backend, please review the `/api/create-payment-intent` route to ensure it matches the current Stripe SDK requirements.

## 18. Product Data & Final Vercel Deployment
- The app will be deployed as "Jenger Drop" (likely via a Vercel subdomain).
- We need to establish a scalable product data structure. 
- Please extract the hardcoded mock items into a centralized JSON file or TypeScript array (e.g., `data/products.ts`) so the user can easily manage their inventory of ~30 immediate-delivery clothing items and emergency supplies.
- Each product object should support: `id`, `name`, `price`, `image`, `category`, `sizes`, `colors`, and `description`.
- Ensure the frontend reads from this file to populate the search bar, the category grids, and the Full Menu drawer.
- Prepare the `package.json` for a seamless push to Vercel (ensure build scripts are standard Next.js).

## 19. Inventory Update & Deployment Readiness
- The user has provided the exact inventory list. I have already generated `data/products.ts` with these 30 items.
- Please ensure all UI components (Search Bar, Trending Carousel, The Edit grid, Full Menu Drawer) are dynamically reading from `products.ts` rather than hardcoded mock data.
- Ensure the image `src` tags point to the `image` property in the `Product` type (they currently point to `/placeholder.jpg` until the user adds the real photos).
- Make sure `npm run build` succeeds locally so the project is 100% ready to deploy to Vercel.

## 20. Categorized Full Menu Layout
- The user has provided 17 new emergency supply SKUs. I have injected them into `data/products.ts` under four specific categories: "Fashion Fix", "Beauty Fix", "Game Day & Going Out", and "Essentials".
- Please update the **Full Menu Drawer** (the modal that shows when they want to browse everything).
- The Full Menu must NOT just be a flat list of products. It must visually group the items by their `category` (e.g., A bold header for "Fashion Fix", followed by the items in that category, then a header for "Beauty Fix", etc.).
- Ensure this layout feels clean, readable, and easy to scroll through on a mobile device.

## 21. Separate Jenger Drop & 2nd Chance Inventory
- The user has realized that blending the 17 emergency items with the 30 resale clothing items in the "Full Menu Drawer" makes it confusing.
- **Action:** Please split the data source. The "Jenger Drop" homepage and "Full Menu Drawer" should *only* display the retail emergency items (Categories: Fashion Fix, Beauty Fix, Game Day & Going Out, Essentials).
- The 30 resale clothing items (Categories: Rush/Event, Vintage, Bags, etc.) should *only* be associated with the "2nd Chance" tab (which is currently an external link, so they can be ignored in the Drop UI entirely).
- Remove the resale clothing items from the Jenger Drop search bar, trending carousel, and full menu drawer.

## 22. Emergency Revert & Image Fix
- The user is extremely frustrated because the app is displaying random placeholder images (landscapes, tuk-tuks) instead of the correct product images, and the Stripe integration is hanging on "Loading card form...".
- **Action 1 (Images):** The real product images were generated and placed in the `public` folder (e.g., `phone_charger---51e11673-53f6-4e3d-9938-feb9e8325f41.jpg`). You MUST update `data/products.ts` so that the `image` field for those specific emergency items points directly to those filenames, NOT generic placeholders.
- **Action 2 (Stripe):** The checkout is completely broken and stuck loading. Revert the checkout to the frictionless MVP (Location, Phone, and a single "Place Order" button that logs to `order_queue.json`). Remove all Stripe Elements and `create-payment-intent` logic immediately so the app is functional again.

## 23. Remove Random User Images
- The user is concerned because the 30 resale clothing items are displaying random personal photos.
- This happened in Step 22 when Cursor blindly assigned random images from the `public` folder (the `image-1---...jpg` files) to the resale items to avoid 404 errors. These files are likely personal photos synced from the user's iCloud/camera roll.
- **Action:** Open `data/products.ts`. For items 001 through 030 (the resale clothing), replace the `image-1---...jpg` string with a clean UI placeholder (e.g., a solid color or a generic Next.js placeholder SVG, or simply `"/placeholder.jpg"`) until the user provides the real Poshmark photos.
- DO NOT change the images for items 031-047 (the emergency supplies). Those have specific, AI-generated product photography (like `boob_tape---...jpg`) which are correct.

## 24. Multi-Image Product Gallery
- The user is providing multiple images for resale clothing items (e.g., detail shots of tags and linings).
- Please update the `Product` type in `data/products.ts` to support an array of images: `images: string[];`. Keep the `image` string for backward compatibility or the primary thumbnail.
- If a product has multiple images, update the UI (e.g., the Product Detail modal or page) to allow the user to swipe or click through a gallery carousel of those images.

## 25. Build Final Product Galleries
- The user has uploaded several high-quality detail shots for the resale items (e.g., `item_001_details`, `item_002_details`, etc.) into the `public` folder.
- Please implement the Image Gallery/Carousel UI on the frontend (e.g., when a user clicks an item to view its details before adding to cart).
- Users should be able to swipe or click through multiple images if they exist for a product.
- Ensure the app is still strictly using the frictionless MVP checkout (Location + Phone -> Place Order -> `order_queue.json`) with no Stripe dependency.

## 26. Final Product Polish
- The user noted some discrepancies with descriptions and missing images in the gallery for certain Poshmark items (specifically the newly added ones).
- **Action:** Open `data/products.ts`. Please ensure *every* product that has multiple images in the `/public` folder (e.g., `item_001_details`, `item_002_details`, etc.) has those images properly mapped to an `images: string[]` array within its object in `products.ts`. 
- Ensure that the descriptions provided earlier are accurately reflecting what is shown in the UI modal.
