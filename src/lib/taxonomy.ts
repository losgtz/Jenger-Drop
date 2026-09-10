import { slugify } from "@/lib/catalog";
import { resaleProducts, type Product } from "../../data/products";

/**
 * Lightweight closet taxonomy for storefront filters.
 *
 * Why this file exists
 * --------------------
 * Every imported listing uses the single shop category "2nd Chance Resale",
 * so Category / type filters cannot read `product.category` as-is. Colors are
 * also absent on the Product type (the import never populated `colors`).
 * This module derives *only* what shoppers need to browse, using deterministic
 * rules. It does not invent brands, prices, or inventory.
 *
 * Apparel type (title only)
 * -------------------------
 * Scan the listing title, not the description. Most descriptions are import
 * boilerplate and are not reliable garment signals. Normalize the title to
 * spaced tokens, then apply first-match-wins phrase lists from most specific
 * (jewelry, shoes, bags) to most generic (tops). A title that matches nothing
 * becomes "other". Phrase lists are word-boundary matches on the normalized
 * haystack — "short" is not used because it would hit "short sleeve".
 *
 * Brand
 * -----
 * Uses the stored `brand` field only. Empty / "?" / "??" / "n/a" collapse to
 * the Unbranded bucket. Spellings are not invented or renamed.
 *
 * Size
 * ----
 * Raw size strings are messy (letter, numeric, denim waist, shoe decimals,
 * bra cups, jewelry "J" codes, one-size). Each raw value maps to one or more
 * normalized tokens in a group. Unknown strings land in "other" rather than
 * being guessed into letter/numeric.
 *
 * Condition
 * ---------
 * Maps known import values (and leftover NWT / NWOT / UG-style tokens if they
 * appear) onto shopper labels. Unknown values are omitted from the facet.
 *
 * Color
 * -----
 * No `colors[]` on products today. High-confidence color words are taken from
 * the title only (whole-token match against a closed list). No guess from
 * photos or descriptions. If a title has no listed color word, the item
 * simply has no color tokens and will not appear when a color filter is on.
 */

export const APPAREL_TYPES = [
  { id: "dresses", label: "Dresses" },
  { id: "tops", label: "Tops" },
  { id: "bottoms", label: "Bottoms" },
  { id: "outerwear", label: "Outerwear" },
  { id: "activewear", label: "Activewear" },
  { id: "swim", label: "Swim" },
  { id: "bags-accessories", label: "Bags & Accessories" },
  { id: "shoes", label: "Shoes" },
  { id: "jewelry", label: "Jewelry" },
  { id: "intimates", label: "Intimates" },
  { id: "jumpsuits", label: "Jumpsuits & Sets" },
  { id: "other", label: "Other" },
] as const;

export type ApparelTypeId = (typeof APPAREL_TYPES)[number]["id"];

export const APPAREL_TYPE_BY_ID: Record<ApparelTypeId, (typeof APPAREL_TYPES)[number]> =
  Object.fromEntries(APPAREL_TYPES.map((t) => [t.id, t])) as Record<
    ApparelTypeId,
    (typeof APPAREL_TYPES)[number]
  >;

/**
 * First match wins. Keep multi-word phrases in the list (they survive
 * normalization as spaced tokens, e.g. "sports bra", "one piece").
 */
const TYPE_RULES: { id: ApparelTypeId; phrases: string[] }[] = [
  {
    id: "jewelry",
    phrases: [
      "necklace",
      "earring",
      "earrings",
      "bracelet",
      "bangle",
      "bangles",
      "pendant",
      "choker",
      "jewelry",
      "jewellery",
      "jewelery",
      "charm",
      "rings",
      "ring",
    ],
  },
  {
    id: "shoes",
    phrases: [
      "shoe",
      "shoes",
      "boot",
      "boots",
      "sneaker",
      "sneakers",
      "heel",
      "heels",
      "sandal",
      "sandals",
      "loafer",
      "loafers",
      "flat",
      "flats",
      "pump",
      "pumps",
      "slide",
      "slides",
      "slipper",
      "slippers",
      "mule",
      "mules",
      "wedge",
      "wedges",
      "espadrille",
      "espadrilles",
      "rothys",
      "tieks",
    ],
  },
  {
    id: "bags-accessories",
    phrases: [
      "handbag",
      "crossbody",
      "backpack",
      "wristlet",
      "rucksack",
      "wallet",
      "clutch",
      "purse",
      "tote",
      "bag",
      "bags",
      "pouch",
      "belt",
      "scarf",
      "scarves",
      "headband",
      "sunglasses",
      "hat",
      "beanie",
      "watch",
      "socks",
      "tights",
      "gloves",
      "jibbitz",
      "charm pack",
      "cosmetic case",
      "cosmetic pouch",
      "train case",
    ],
  },
  {
    id: "swim",
    phrases: ["bikini", "swimsuit", "swimwear", "swim", "one piece", "cover up"],
  },
  {
    id: "activewear",
    phrases: ["sports bra", "athleisure", "workout", "activewear"],
  },
  {
    id: "dresses",
    phrases: ["dresses", "dress", "gown", "gowns", "kaftan"],
  },
  {
    id: "jumpsuits",
    phrases: ["jumpsuit", "romper", "onesie", "onesies", "onsie", "onsies", "overall", "overalls"],
  },
  {
    id: "intimates",
    phrases: [
      "lingerie",
      "bralette",
      "chemise",
      "shapewear",
      "panties",
      "panty",
      "underwear",
      "bras",
      "bra",
    ],
  },
  {
    id: "outerwear",
    phrases: [
      "jackets",
      "jacket",
      "coats",
      "coat",
      "blazers",
      "blazer",
      "trench",
      "parka",
      "cardigan",
      "windbreaker",
      "puffer",
      "fleece",
      "kimono",
    ],
  },
  {
    id: "bottoms",
    phrases: [
      "jeans",
      "jean",
      "pants",
      "trousers",
      "trouser",
      "shorts",
      "skirts",
      "skirt",
      "leggings",
      "legging",
      "joggers",
      "jogger",
      "chinos",
      "chino",
      "pant",
      "yoga band",
    ],
  },
  {
    id: "tops",
    phrases: [
      "blouse",
      "blouses",
      "t shirt",
      "tshirt",
      "tee",
      "tees",
      "tank top",
      "tanktop",
      "cami",
      "camisole",
      "sweater",
      "sweaters",
      "hoodie",
      "sweatshirt",
      "bodysuit",
      "corset",
      "tunic",
      "henley",
      "polo",
      "jersey",
      "turtleneck",
      "pullover",
      "crop top",
      "button up",
      "button down",
      "shirt",
      "shirts",
      "tanks",
      "tank",
      "top",
      "tops",
    ],
  },
];

export function normalizeHaystack(text: string): string {
  return ` ${text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

function includesPhrase(hay: string, phrase: string): boolean {
  return hay.includes(` ${phrase} `);
}

export function deriveApparelType(product: Product): ApparelTypeId {
  const hay = normalizeHaystack(product.name);
  for (const rule of TYPE_RULES) {
    if (rule.phrases.some((phrase) => includesPhrase(hay, phrase))) {
      return rule.id;
    }
    // "short" is not in the bottoms list because it would steal "short sleeve".
    if (
      rule.id === "bottoms" &&
      includesPhrase(hay, "short") &&
      !includesPhrase(hay, "sleeve") &&
      !includesPhrase(hay, "sleeved")
    ) {
      return "bottoms";
    }
  }
  return "other";
}

export const UNBRANDED_ID = "unbranded";
export const UNBRANDED_LABEL = "Unbranded";

const UNKNOWN_BRAND = new Set(["", "?", "??", "n/a", "na", "unknown", "none"]);

export function brandIdentity(raw: string | undefined): { id: string; label: string } {
  const trimmed = (raw ?? "").trim();
  if (!trimmed || UNKNOWN_BRAND.has(trimmed.toLowerCase())) {
    return { id: UNBRANDED_ID, label: UNBRANDED_LABEL };
  }
  return { id: slugify(trimmed), label: trimmed };
}

export const CONDITIONS = [
  { id: "new-with-tags", label: "New with tags" },
  { id: "like-new", label: "Like new" },
  { id: "gently-loved", label: "Gently loved" },
  { id: "fair", label: "Fair" },
] as const;

export type ConditionId = (typeof CONDITIONS)[number]["id"];

const CONDITION_BY_ID: Record<ConditionId, string> = Object.fromEntries(
  CONDITIONS.map((c) => [c.id, c.label])
) as Record<ConditionId, string>;

/**
 * Normalize import condition strings and leftover marketplace shorthand
 * (nwt / nwot / ug) into the four shopper-facing buckets.
 */
export function deriveConditionId(raw: string | undefined): ConditionId | null {
  if (!raw) return null;
  const key = raw
    .trim()
    .toLowerCase()
    .replace(/[—–]/g, "-")
    .replace(/\s+/g, " ");

  if (
    key.includes("new with tags") ||
    key === "nwt" ||
    /\bnwt\b/.test(key) ||
    key === "new"
  ) {
    return "new-with-tags";
  }
  if (key.includes("like new") || key === "nwot" || /\bnwot\b/.test(key)) {
    return "like-new";
  }
  if (
    key.includes("gently loved") ||
    key.includes("gently used") ||
    key.includes("good") ||
    key === "ug" ||
    /\bug\b/.test(key)
  ) {
    return "gently-loved";
  }
  if (key.includes("fair") || key.includes("acceptable")) {
    return "fair";
  }
  return null;
}

export function conditionLabel(id: ConditionId): string {
  return CONDITION_BY_ID[id];
}

export const SIZE_GROUPS = [
  { id: "letter", label: "Letter" },
  { id: "numeric", label: "Numeric" },
  { id: "denim", label: "Denim / waist" },
  { id: "shoes", label: "Shoes" },
  { id: "one-size", label: "One size" },
  { id: "plus", label: "Plus" },
  { id: "intimates", label: "Intimates" },
  { id: "jewelry", label: "Jewelry" },
  { id: "other", label: "Other" },
] as const;

export type SizeGroupId = (typeof SIZE_GROUPS)[number]["id"];

export type NormalizedSize = {
  id: string;
  label: string;
  group: SizeGroupId;
};

type LetterSizeLabel = "XXS" | "XS" | "S" | "M" | "L" | "XL" | "XXL" | "XXXL";

function letterSize(label: LetterSizeLabel): NormalizedSize {
  return { id: `let-${label.toLowerCase()}`, label, group: "letter" };
}

function numericSize(n: string): NormalizedSize {
  return { id: `num-${n}`, label: n, group: "numeric" };
}

function denimSize(n: string): NormalizedSize {
  return { id: `den-${n}`, label: n, group: "denim" };
}

function shoeSize(n: string): NormalizedSize {
  return { id: `shoe-${n.toLowerCase()}`, label: n, group: "shoes" };
}

const ONE_SIZE: NormalizedSize = { id: "os", label: "One size", group: "one-size" };

const LETTER_ALIAS: Record<string, LetterSizeLabel> = {
  xxxs: "XXS",
  xxs: "XXS",
  xs: "XS",
  s: "S",
  small: "S",
  m: "M",
  medium: "M",
  med: "M",
  l: "L",
  large: "L",
  lg: "L",
  xl: "XL",
  xxl: "XXL",
  "2xl": "XXL",
  xxxl: "XXXL",
  "3xl": "XXXL",
};

const JEWELRY_LETTER: Record<string, string> = {
  xsj: "XS",
  sj: "S",
  mj: "M",
  lj: "L",
  xlj: "XL",
};

function parseLeadingNumber(raw: string): string | null {
  const m = raw.match(/^(\d+(?:\.\d+)?)/);
  return m ? m[1] : null;
}

/**
 * Map a single raw size string to one or more shopper tokens.
 * Returns [] only when the string is empty.
 */
export function normalizeSizeValue(raw: string): NormalizedSize[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const collapsed = trimmed.replace(/\s+/g, " ");
  const upper = collapsed.toUpperCase();
  const compact = upper.replace(/[\s._]/g, "");

  if (
    compact === "OS" ||
    compact === "OSG" ||
    compact === "OSBB" ||
    compact.startsWith("OS(") ||
    compact === "ONESIZE" ||
    upper.includes("ONE SIZE") ||
    compact === "FREE" ||
    compact === "FREESIZE"
  ) {
    return [ONE_SIZE];
  }

  if (upper === "VARIOUS" || upper === "SEE MEASUREMENTS") {
    return [{ id: "sz-other-unlisted", label: "See listing", group: "other" }];
  }

  if (/^TOP:.+BOTTOM:/.test(upper)) {
    const parts = upper.split(/BOTTOM:/);
    return [
      ...normalizeSizeValue(parts[0].replace(/^TOP:/, "")),
      ...normalizeSizeValue(parts[1] ?? ""),
    ];
  }

  if (upper.includes(" AND ")) {
    return upper.split(/\s+AND\s+/).flatMap((part) => normalizeSizeValue(part));
  }

  if (upper.includes("/")) {
    const bits = collapsed.split("/").map((b) => b.trim()).filter(Boolean);
    if (bits.length === 2 && bits.every((b) => /^\d+$/.test(b))) {
      return bits.flatMap(normalizeSizeValue);
    }
    if (bits.some((b) => /BRA|PANTY|PANTIES/i.test(b))) {
      return bits.flatMap(normalizeSizeValue);
    }
  }

  if (/[×X]/.test(upper) && /\d/.test(upper) && /["”]/.test(collapsed)) {
    return [{ id: "sz-other-dims", label: "See listing", group: "other" }];
  }

  if (/WAIST/i.test(upper)) {
    const n = parseLeadingNumber(collapsed.replace(/"/g, ""));
    if (n) return [denimSize(n)];
  }

  if (JEWELRY_LETTER[compact.toLowerCase()]) {
    const label = JEWELRY_LETTER[compact.toLowerCase()];
    return [{ id: `jew-${label.toLowerCase()}`, label, group: "jewelry" }];
  }

  const jewNum = compact.match(/^(\d+(?:\.\d+)?)J$/);
  if (jewNum) {
    return [{ id: `jew-${jewNum[1]}`, label: jewNum[1], group: "jewelry" }];
  }

  if (/\bBRA\b/.test(upper) || /\bDDD?\b/.test(upper) || /\d{2}[A-K]/.test(upper)) {
    const cup = collapsed.replace(/^BRA\s+/i, "").trim();
    return [
      {
        id: `bra-${slugify(cup)}`,
        label: cup,
        group: "intimates",
      },
    ];
  }

  if (/[0-9]X\b/.test(upper) || compact === "0X" || compact === "OX" || compact === "1X" || compact === "2X" || compact === "3X") {
    const label = compact === "OX" ? "0X" : compact;
    return [{ id: `plus-${label.toLowerCase()}`, label, group: "plus" }];
  }

  if (LETTER_ALIAS[compact.toLowerCase()]) {
    return [letterSize(LETTER_ALIAS[compact.toLowerCase()])];
  }

  if (/^(S\/M|M\/L)$/i.test(compact)) {
    const [a, b] = compact.split("/");
    return [...normalizeSizeValue(a), ...normalizeSizeValue(b)];
  }

  if (/P$/.test(compact) && LETTER_ALIAS[compact.slice(0, -1).toLowerCase()]) {
    return [letterSize(LETTER_ALIAS[compact.slice(0, -1).toLowerCase()])];
  }

  // Shoe: decimals, youth/child/width suffixes (B, Y, C, G, GEU, EU).
  if (
    /^\d+\.\d+/.test(compact) ||
    /\d+(Y|C|B|G|GEU|EU)$/i.test(compact) ||
    /\d+\.\d+(Y|C|B|G)$/i.test(compact)
  ) {
    const label = collapsed.replace(/\s+/g, "");
    return [shoeSize(label)];
  }

  if (/^\d+$/.test(compact)) {
    const n = Number(compact);
    if (n >= 23 && n <= 34) return [denimSize(compact)];
    if (n >= 35 && n <= 42) return [shoeSize(compact)];
    if (n >= 0 && n <= 18) return [numericSize(compact)];
    return [denimSize(compact)];
  }

  if (/^\d+P$/.test(compact)) {
    return [numericSize(compact.slice(0, -1))];
  }

  if (/^\d+T$/.test(compact)) {
    return [{ id: `sz-other-${compact.toLowerCase()}`, label: collapsed, group: "other" }];
  }

  return [{ id: `sz-other-${slugify(collapsed)}`, label: collapsed, group: "other" }];
}

export function normalizeProductSizes(sizes: string[] | undefined): NormalizedSize[] {
  const seen = new Set<string>();
  const out: NormalizedSize[] = [];
  for (const raw of sizes ?? []) {
    for (const token of normalizeSizeValue(raw)) {
      if (seen.has(token.id)) continue;
      seen.add(token.id);
      out.push(token);
    }
  }
  return out;
}

/**
 * Closed list of garment-color words. Aliases fold to one id (grey→gray).
 * Only whole tokens in the title count — no substring hits, no description.
 */
const COLOR_ALIASES: Record<string, { id: string; label: string }> = {
  black: { id: "black", label: "Black" },
  white: { id: "white", label: "White" },
  ivory: { id: "ivory", label: "Ivory" },
  cream: { id: "cream", label: "Cream" },
  red: { id: "red", label: "Red" },
  burgundy: { id: "burgundy", label: "Burgundy" },
  maroon: { id: "maroon", label: "Maroon" },
  wine: { id: "wine", label: "Wine" },
  pink: { id: "pink", label: "Pink" },
  blush: { id: "blush", label: "Blush" },
  coral: { id: "coral", label: "Coral" },
  orange: { id: "orange", label: "Orange" },
  peach: { id: "peach", label: "Peach" },
  yellow: { id: "yellow", label: "Yellow" },
  gold: { id: "gold", label: "Gold" },
  green: { id: "green", label: "Green" },
  olive: { id: "olive", label: "Olive" },
  sage: { id: "sage", label: "Sage" },
  mint: { id: "mint", label: "Mint" },
  teal: { id: "teal", label: "Teal" },
  turquoise: { id: "turquoise", label: "Turquoise" },
  blue: { id: "blue", label: "Blue" },
  navy: { id: "navy", label: "Navy" },
  cobalt: { id: "cobalt", label: "Cobalt" },
  purple: { id: "purple", label: "Purple" },
  lavender: { id: "lavender", label: "Lavender" },
  lilac: { id: "lilac", label: "Lilac" },
  brown: { id: "brown", label: "Brown" },
  tan: { id: "tan", label: "Tan" },
  beige: { id: "beige", label: "Beige" },
  khaki: { id: "khaki", label: "Khaki" },
  camel: { id: "camel", label: "Camel" },
  taupe: { id: "taupe", label: "Taupe" },
  nude: { id: "nude", label: "Nude" },
  gray: { id: "gray", label: "Gray" },
  grey: { id: "gray", label: "Gray" },
  charcoal: { id: "charcoal", label: "Charcoal" },
  silver: { id: "silver", label: "Silver" },
  rust: { id: "rust", label: "Rust" },
  rainbow: { id: "multicolor", label: "Multicolor" },
  multicolor: { id: "multicolor", label: "Multicolor" },
  multi: { id: "multicolor", label: "Multicolor" },
};

export const COLOR_SWATCH: Record<string, string> = {
  black: "#111111",
  white: "#f4f4f4",
  ivory: "#f3ead8",
  cream: "#f0e6c8",
  red: "#c41e1e",
  burgundy: "#6d1a2c",
  maroon: "#7a1f2b",
  wine: "#722f37",
  pink: "#e38aae",
  blush: "#e4b3b3",
  coral: "#e36a5d",
  orange: "#d86b2a",
  peach: "#f0b48a",
  yellow: "#e3c84a",
  gold: "#c9a227",
  green: "#2f7d4a",
  olive: "#6b7a3a",
  sage: "#8aa381",
  mint: "#9ed4c0",
  teal: "#2a7a78",
  turquoise: "#3bb5b0",
  blue: "#2f5fa8",
  navy: "#1b2a4a",
  cobalt: "#2244aa",
  purple: "#6b3fa0",
  lavender: "#b7a2d8",
  lilac: "#c8a2c8",
  brown: "#6b3e26",
  tan: "#c4a574",
  beige: "#d8c4a8",
  khaki: "#c1b180",
  camel: "#c19a6b",
  taupe: "#b3a394",
  nude: "#e0c4b0",
  gray: "#8a8a8a",
  charcoal: "#3d3d3d",
  silver: "#c0c0c0",
  rust: "#b7410e",
  multicolor:
    "linear-gradient(135deg,#c41e1e,#e3c84a,#2f7d4a,#2f5fa8,#6b3fa0)",
};

export type DerivedColor = { id: string; label: string };

export function deriveColorsFromTitle(name: string): DerivedColor[] {
  const hay = normalizeHaystack(name);
  const seen = new Set<string>();
  const out: DerivedColor[] = [];
  for (const [token, meta] of Object.entries(COLOR_ALIASES)) {
    if (!includesPhrase(hay, token)) continue;
    if (seen.has(meta.id)) continue;
    seen.add(meta.id);
    out.push(meta);
  }
  return out;
}

export function listingNewestIndex(product: Product): number {
  const match = product.id.match(/^posh_(\d+)/i);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

export type CatalogItem = {
  product: Product;
  apparelType: ApparelTypeId;
  brandId: string;
  brandLabel: string;
  sizes: NormalizedSize[];
  sizeIds: string[];
  conditionId: ConditionId | null;
  colors: DerivedColor[];
  colorIds: string[];
  newestIndex: number;
  searchHay: string;
};

export function indexProduct(product: Product): CatalogItem {
  const apparelType = deriveApparelType(product);
  const brand = brandIdentity(product.brand);
  const sizes = normalizeProductSizes(product.sizes);
  const conditionId = deriveConditionId(product.condition);
  const colors =
    product.colors && product.colors.length > 0
      ? product.colors.map((c) => {
          const id = slugify(c);
          return { id, label: c };
        })
      : deriveColorsFromTitle(product.name);

  const typeLabel = APPAREL_TYPE_BY_ID[apparelType].label;
  const searchHay = [
    product.name,
    product.category,
    product.description,
    product.condition ?? "",
    product.brand ?? "",
    typeLabel,
    brand.label,
    sizes.map((s) => s.label).join(" "),
    colors.map((c) => c.label).join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return {
    product,
    apparelType,
    brandId: brand.id,
    brandLabel: brand.label,
    sizes,
    sizeIds: sizes.map((s) => s.id),
    conditionId,
    colors,
    colorIds: colors.map((c) => c.id),
    newestIndex: listingNewestIndex(product),
    searchHay,
  };
}

/** Precomputed once at module load — ~955 rows, safe to reuse on the client. */
export const catalogItems: CatalogItem[] = resaleProducts.map(indexProduct);

export const SEARCH_SYNONYMS: Record<string, string> = {
  dress: "dress",
  dresses: "dress",
  vintage: "vintage",
  sequin: "sequin",
  bikini: "bikini",
  swim: "bikini",
  swimsuit: "bikini",
  crop: "crop",
  blazer: "blazer",
  jacket: "jacket",
  bag: "bag",
  purse: "bag",
  coach: "coach",
};

export function searchMatches(item: CatalogItem, raw: string): boolean {
  const q = raw.trim().toLowerCase();
  if (!q) return true;
  const mapped = SEARCH_SYNONYMS[q] ?? q;
  const terms = Array.from(new Set([q, mapped]));
  return terms.some((t) => item.searchHay.includes(t));
}
