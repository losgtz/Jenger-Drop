import type { NextConfig } from "next";

// Only produce a static export (`out/`) for the Capacitor/Android build.
// The default web build keeps the Node server so the API routes
// (/api/checkout, /api/stripe-checkout, /api/stripe-webhook, /api/sold,
// /api/telegram-request) keep working.
// Trigger the mobile build with:
//   BUILD_TARGET=mobile next build   (or `npm run build:mobile`)
const isMobileBuild = process.env.BUILD_TARGET === "mobile";

const nextConfig: NextConfig = {
  ...(isMobileBuild
    ? { output: "export", images: { unoptimized: true } }
    : {
        async redirects() {
          return [
            { source: "/shipping", destination: "/", permanent: true },
          ];
        },
      }),
};

export default nextConfig;
