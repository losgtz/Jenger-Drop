#!/usr/bin/env node
/**
 * Mark or unmark a closet piece as Sold via the env-gated admin API.
 *
 *   SOLD_ADMIN_SECRET=... node scripts/sold-admin.mjs unmark posh_001_...
 *   SOLD_ADMIN_SECRET=... node scripts/sold-admin.mjs mark posh_001_...
 *   SOLD_ADMIN_SECRET=... node scripts/sold-admin.mjs list
 *
 * Optional SITE_URL / NEXT_PUBLIC_SITE_URL (default http://localhost:3000).
 */
const action = process.argv[2];
const productId = process.argv[3];
const secret = process.env.SOLD_ADMIN_SECRET?.trim();
const base = (
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

if (!secret) {
  console.error("Set SOLD_ADMIN_SECRET.");
  process.exit(1);
}

if (!action || !["mark", "unmark", "list"].includes(action)) {
  console.error("Usage: node scripts/sold-admin.mjs <mark|unmark|list> [productId]");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${secret}`,
  "Content-Type": "application/json",
};

const run = async () => {
  if (action === "list") {
    const response = await fetch(`${base}/api/admin/sold`, { headers });
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
    if (!response.ok) process.exit(1);
    return;
  }

  if (!productId) {
    console.error("Provide a product id or slug.");
    process.exit(1);
  }

  const response = await fetch(`${base}/api/admin/sold`, {
    method: "POST",
    headers,
    body: JSON.stringify({ action, productId }),
  });
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
  if (!response.ok) process.exit(1);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
