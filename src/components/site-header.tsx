import type { ReactNode } from "react";
import Link from "next/link";
import { PRIMARY_NAV } from "@/lib/contact";

export function SiteHeader({ trailing }: { trailing?: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="flex items-center justify-between px-5 pt-4">
        <Link
          href="/"
          className="font-serif text-sm tracking-[0.28em] text-muted-foreground uppercase"
        >
          Jengerluxurious
        </Link>
        {trailing ?? <span className="h-8 w-8" aria-hidden />}
      </div>
      <nav
        className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 pt-3 pb-3"
        aria-label="Primary"
      >
        {PRIMARY_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
