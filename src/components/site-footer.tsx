import Link from "next/link";
import { ContactBar } from "@/components/contact-bar";
import { CONTACT, TRUST_PAGES } from "@/lib/contact";

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-border/70 px-5 py-8">
      <p className="font-serif text-sm tracking-[0.22em] text-muted-foreground uppercase">
        Jengerluxurious
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        2nd Chance Resale · one-of-a-kind pre-loved clothing
      </p>
      <nav
        aria-label="Trust and policies"
        className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium"
      >
        {TRUST_PAGES.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="text-primary underline-offset-4 hover:underline"
          >
            {page.label}
          </Link>
        ))}
      </nav>
      <ContactBar className="mt-4" />
      <div className="mt-4 flex flex-col gap-1.5 text-sm">
        <a
          href={CONTACT.storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline-offset-4 hover:underline"
        >
          jengerluxurious.com
        </a>
        <a
          href={CONTACT.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline-offset-4 hover:underline"
        >
          Instagram @{CONTACT.instagram}
        </a>
      </div>
    </footer>
  );
}
