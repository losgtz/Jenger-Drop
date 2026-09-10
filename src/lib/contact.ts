/** Public contact and storefront links. No invented street NAP. */
export const CONTACT = {
  phone: "3465257753",
  phoneDisplay: "(346) 525-7753",
  email: "jengerluxurious@gmail.com",
  emailDisplay: "jengerluxurious@gmail.com",
  instagram: "jengerluxurious.second.chance",
  instagramUrl: "https://instagram.com/jengerluxurious.second.chance",
  storeUrl: "https://www.jengerluxurious.com",
} as const;

export const TRUST_PAGES = [
  { href: "/about", label: "About" },
  { href: "/returns", label: "Returns" },
] as const;

/** Single primary nav: the resale shop plus policy pages. */
export const PRIMARY_NAV = [
  { href: "/", label: "Shop" },
  ...TRUST_PAGES,
] as const;
