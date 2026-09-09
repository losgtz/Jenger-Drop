import type { Metadata } from "next";
import { SHIPPING } from "../../../data/shipping";
import { CONTACT } from "@/lib/contact";
import { TrustPageShell } from "@/components/trust-page-shell";

export const metadata: Metadata = {
  title: "Shipping | 2nd Chance Resale",
  description:
    "US domestic shipping is $6.49 flat for packages up to 5 lb on 2nd Chance Resale.",
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  const rate = SHIPPING.flatRateUsd.toFixed(2);
  return (
    <TrustPageShell>
      <p className="text-xs font-medium tracking-[0.22em] text-primary uppercase">
        US domestic
      </p>
      <h1 className="mt-2 font-serif text-3xl leading-tight tracking-tight">
        Shipping
      </h1>
      <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Orders ship inside the United States only. Checkout adds a separate{" "}
          <span className="text-foreground">
            ${rate} flat shipping line
          </span>{" "}
          for packages up to 5 lb — the same buyer rate Poshmark uses in 2026.
        </p>
        <p>{SHIPPING.note}</p>
        <p>
          Pieces leave from the Houston area. We do not publish a street
          address. Oversize or over-5 lb upgrades are out of scope here; if a
          piece cannot go at the flat rate, we will text you before it ships.
        </p>
        <p>
          Need a shipping update? Call or text{" "}
          <a
            href={`tel:${CONTACT.phone}`}
            className="text-foreground underline-offset-4 hover:underline"
          >
            {CONTACT.phoneDisplay}
          </a>
          .
        </p>
      </div>
    </TrustPageShell>
  );
}
