import type { ReactNode } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";

export function TrustPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="flex items-center justify-between px-5 py-4">
          <Link
            href="/"
            className="font-serif text-sm tracking-[0.28em] text-muted-foreground uppercase"
          >
            Jengerluxurious
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold tracking-[0.14em] text-primary uppercase"
          >
            Back to closet
          </Link>
        </div>
      </header>
      <main className="flex flex-1 flex-col px-5 py-8">{children}</main>
      <SiteFooter />
    </div>
  );
}
