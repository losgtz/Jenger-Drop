import type { Metadata } from "next";
import { ContactBar } from "@/components/contact-bar";
import { TrustPageShell } from "@/components/trust-page-shell";

export const metadata: Metadata = {
  title: "About | 2nd Chance Resale",
  description:
    "2nd Chance Resale is the online closet for Jengerluxurious — one-of-a-kind pre-loved clothing.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About | 2nd Chance Resale",
    description:
      "2nd Chance Resale is the online closet for Jengerluxurious — one-of-a-kind pre-loved clothing.",
    url: "/about",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "About | 2nd Chance Resale",
    description:
      "2nd Chance Resale is the online closet for Jengerluxurious — one-of-a-kind pre-loved clothing.",
  },
};

export default function AboutPage() {
  return (
    <TrustPageShell>
      <p className="text-xs font-medium tracking-[0.22em] text-primary uppercase">
        Jengerluxurious
      </p>
      <h1 className="mt-2 font-serif text-3xl leading-tight tracking-tight">
        About 2nd Chance Resale
      </h1>
      <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          2nd Chance Resale is the web closet for{" "}
          <span className="text-foreground">Jengerluxurious</span> — luxury and
          contemporary resale. Pieces are one-of-a-kind. Condition and original
          price show when we have them.
        </p>
        <ContactBar />
      </div>
    </TrustPageShell>
  );
}
