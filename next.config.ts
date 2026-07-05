import type { NextConfig } from "next";

// Only produce a static export (`out/`) for the Capacitor/Android build.
// The default web build keeps the Node server so the API routes
// (/api/checkout, /api/create-payment-intent, /api/telegram-request) keep
// working for Stripe + Telegram. Trigger the mobile build with:
//   BUILD_TARGET=mobile next build   (or `npm run build:mobile`)
const isMobileBuild = process.env.BUILD_TARGET === "mobile";

const nextConfig: NextConfig = {
  ...(isMobileBuild
    ? { output: "export", images: { unoptimized: true } }
    : {}),
};

export default nextConfig;
