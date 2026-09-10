import { CONTACT } from "@/lib/contact";
import { cn } from "@/lib/utils";

const contactLinkClass = "text-foreground underline-offset-4 hover:underline";

export function ContactPhoneLink({ className }: { className?: string }) {
  return (
    <a href={`tel:${CONTACT.phone}`} className={cn(contactLinkClass, className)}>
      {CONTACT.phoneDisplay}
    </a>
  );
}

export function ContactEmailLink({ className }: { className?: string }) {
  return (
    <a
      href={`mailto:${CONTACT.email}`}
      className={cn(contactLinkClass, className)}
    >
      {CONTACT.emailDisplay}
    </a>
  );
}

/** Listing questions CTA: phone + email only (no Instagram DM). */
export function ContactBar({ className }: { className?: string }) {
  return (
    <p className={cn("text-sm leading-relaxed text-muted-foreground", className)}>
      Questions about a listing? Text or call <ContactPhoneLink /> or email{" "}
      <ContactEmailLink />.
    </p>
  );
}
