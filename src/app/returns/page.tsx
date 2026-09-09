import type { Metadata } from "next";
import { CONTACT } from "@/lib/contact";
import { TrustPageShell } from "@/components/trust-page-shell";

export const metadata: Metadata = {
  title: "Returns | 2nd Chance Resale",
  description:
    "Returns on 2nd Chance Resale: contact us if a piece arrives damaged or not as described.",
  alternates: { canonical: "/returns" },
  openGraph: {
    title: "Returns | 2nd Chance Resale",
    description:
      "Returns on 2nd Chance Resale: contact us if a piece arrives damaged or not as described.",
    url: "/returns",
    type: "website",
  },
};

export default function ReturnsPage() {
  return (
    <TrustPageShell>
      <p className="text-xs font-medium tracking-[0.22em] text-primary uppercase">
        One-of-a-kind
      </p>
      <h1 className="mt-2 font-serif text-3xl leading-tight tracking-tight">
        Returns
      </h1>
      <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Almost everything in this closet is a single pre-loved piece. Sales
          are generally final once an item ships, because we cannot restock the
          same listing.
        </p>
        <p>
          If your order arrives damaged or not as described (wrong item,
          condition that does not match the listing), text or call{" "}
          <a
            href={`tel:${CONTACT.phone}`}
            className="text-foreground underline-offset-4 hover:underline"
          >
            {CONTACT.phoneDisplay}
          </a>{" "}
          within a few days of delivery with photos. We will arrange a
          refund, store credit, or another resolution that fits the piece.
        </p>
        <p>
          Try-on returns for change of mind are not offered on resale. Measure
          against the size and photos on the listing, or ask us before you pay.
        </p>
      </div>
    </TrustPageShell>
  );
}
