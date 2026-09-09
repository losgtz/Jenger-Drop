import type { Metadata } from "next";
import { CONTACT } from "@/lib/contact";
import { TrustPageShell } from "@/components/trust-page-shell";

export const metadata: Metadata = {
  title: "About | 2nd Chance Resale",
  description:
    "Houston-based luxury resale from Jengerluxurious. One-of-a-kind pieces on 2nd Chance Resale.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <TrustPageShell>
      <p className="text-xs font-medium tracking-[0.22em] text-primary uppercase">
        Jengerluxurious
      </p>
      <h1 className="mt-2 font-serif text-3xl leading-tight tracking-tight">
        About
      </h1>
      <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          2nd Chance Resale is the web closet for{" "}
          <span className="text-foreground">Jengerluxurious</span> — Houston-based
          luxury and contemporary resale. Pieces are one-of-a-kind. Condition and
          original price show when we have them.
        </p>
        <p>
          Shop here, on our{" "}
          <a
            href={CONTACT.storeUrl}
            className="text-primary underline-offset-4 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Square storefront
          </a>
          , or the Poshmark closet{" "}
          <a
            href={CONTACT.poshmarkUrl}
            className="text-primary underline-offset-4 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            @{CONTACT.poshmarkHandle}
          </a>
          .
        </p>
        <p>
          Questions about a listing? Text or call{" "}
          <a
            href={`tel:${CONTACT.phone}`}
            className="text-foreground underline-offset-4 hover:underline"
          >
            {CONTACT.phoneDisplay}
          </a>{" "}
          or DM{" "}
          <a
            href={CONTACT.instagramUrl}
            className="text-primary underline-offset-4 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            @{CONTACT.instagram}
          </a>
          . We list a city, not a public storefront street address.
        </p>
      </div>
    </TrustPageShell>
  );
}
