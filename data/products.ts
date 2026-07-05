export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  sizes: string[];
  colors?: string[];
  description: string;
  condition?: string;
  originalPrice?: number;
  /** Units on hand. 0 = sold out. If omitted, a mock default is applied below. */
  stock?: number;
};

/**
 * Jenger Drop = the emergency delivery side.
 * Only these categories are surfaced on the Jenger Drop homepage.
 * (The resale clothing lives on the external "Jengerluxurious 2nd Chance" storefront.)
 */
export const DROP_CATEGORIES = [
  "Fashion Fix",
  "Beauty Fix",
  "Game Day & Going Out",
  "Essentials",
] as const;

export type DropCategory = (typeof DROP_CATEGORIES)[number];

const rawProducts: Product[] = [
  // =========================================================
  //  JENGER DROP — EMERGENCY SUPPLIES (retail, immediate delivery)
  // =========================================================

  // --- FASHION FIX ---
  {
    id: "item_031",
    name: "Fashion tape",
    price: 9.0,
    image: "/boob_tape---e15735e4-761e-4a45-9035-2c0848b33538.jpg",
    category: "Fashion Fix",
    sizes: ["OS"],
    description: "High-quality, sweat-resistant double-sided fashion tape. Keeps everything exactly where it should be.",
    condition: "NEW",
  },
  {
    id: "item_032",
    name: "Pasties",
    price: 9.0,
    image: "/placeholder.jpg",
    category: "Fashion Fix",
    sizes: ["OS"],
    description: "Seamless silicone pasties. Invisible under anything.",
    condition: "NEW",
  },
  {
    id: "item_033",
    name: "Mini sewing kit",
    price: 7.0,
    image: "/mini_sewing_kit---dd80f4e7-6b93-4a26-a96c-c0868497623f.jpg",
    category: "Fashion Fix",
    sizes: ["OS"],
    description: "Emergency repair kit for popped buttons and busted seams.",
    condition: "NEW",
  },
  {
    id: "item_034",
    name: "Safety pins pack",
    price: 5.0,
    image: "/safety_pins---e12086a6-b086-4477-8bc5-6e21f1c22682.jpg",
    category: "Fashion Fix",
    sizes: ["OS"],
    description: "Assorted sizes for last-minute wardrobe saves.",
    condition: "NEW",
  },

  // --- BEAUTY FIX ---
  {
    id: "item_035",
    name: "Lash glue",
    price: 6.0,
    image: "/lash_glue---e35b53a3-42b7-41e5-a690-4d1e61503881.jpg",
    category: "Beauty Fix",
    sizes: ["OS"],
    description: "Strong-hold clear lash adhesive.",
    condition: "NEW",
  },
  {
    id: "item_036",
    name: "Lashes (1 pair)",
    price: 8.0,
    image: "/lashes---8d5587ef-8948-4c02-a2b3-c0cebb5fe217.jpg",
    category: "Beauty Fix",
    sizes: ["OS"],
    description: "Fluffy faux-mink lashes for an instant glam moment.",
    condition: "NEW",
  },
  {
    id: "item_037",
    name: "Lip gloss",
    price: 8.0,
    image: "/lip_gloss---a662e684-d9fb-4c3f-9a9f-5a57d946c179.jpg",
    category: "Beauty Fix",
    sizes: ["OS"],
    description: "High-shine clear gloss.",
    condition: "NEW",
  },
  {
    id: "item_038",
    name: "Lip balm",
    price: 5.0,
    image: "/lip_balm---3c8b39f6-ac8a-4280-a725-fe1be86b5028.jpg",
    category: "Beauty Fix",
    sizes: ["OS"],
    description: "Hydrating recovery balm.",
    condition: "NEW",
  },
  {
    id: "item_039",
    name: "Oil-blotting sheets",
    price: 6.0,
    image: "/oil_blotting_sheets---39970307-38c3-466d-8b36-e28dc44f8c35.jpg",
    category: "Beauty Fix",
    sizes: ["OS"],
    description: "Removes shine instantly without ruining your makeup.",
    condition: "NEW",
  },
  {
    id: "item_040",
    name: "Makeup remover wipes (travel)",
    price: 7.0,
    image: "/makeup_wipes---73bf1a20-ba99-4acb-86bd-37d5feb93050.jpg",
    category: "Beauty Fix",
    sizes: ["OS"],
    description: "Gentle cleansing wipes for a quick reset.",
    condition: "NEW",
  },

  // --- GAME DAY & GOING OUT ---
  {
    id: "item_041",
    name: "Clear stadium bag",
    price: 18.0,
    image: "/clear_purse---9254c583-bd95-4c48-89d5-840f19894ece.jpg",
    category: "Game Day & Going Out",
    sizes: ["OS"],
    description: "Chic clear PVC stadium bag — meets every venue's clear-bag policy.",
    condition: "NEW",
  },
  {
    id: "item_042",
    name: "Face stickers / eye black",
    price: 6.0,
    image: "/eye_black---0b707dca-48a6-491a-82f3-e939618e117a.jpg",
    category: "Game Day & Going Out",
    sizes: ["OS"],
    description: "Game day spirit in a stick.",
    condition: "NEW",
  },
  {
    id: "item_043",
    name: "Electrolyte packet",
    price: 4.0,
    image: "/electrolyte_packet---60fcb1e9-310b-4f6b-8ea1-27075fd0a911.jpg",
    category: "Game Day & Going Out",
    sizes: ["OS"],
    description: "Rapid hydration powder. The unofficial hangover kit.",
    condition: "NEW",
  },
  {
    id: "item_044",
    name: "Sunscreen packet",
    price: 4.0,
    image: "/sunscreen_packet---76e6bcbd-edaf-42bc-b8d9-26954fecab89.jpg",
    category: "Game Day & Going Out",
    sizes: ["OS"],
    description: "SPF 50 travel packet for all-day tailgates.",
    condition: "NEW",
  },

  // --- ESSENTIALS ---
  {
    id: "item_045",
    name: "Phone charger cable",
    price: 14.0,
    image: "/phone_charger---51e11673-53f6-4e3d-9938-feb9e8325f41.jpg",
    category: "Essentials",
    sizes: ["OS"],
    description: "Fast-charging iPhone cable so you never miss the ride home.",
    condition: "NEW",
  },
  {
    id: "item_046",
    name: "Pain reliever 2-pack",
    price: 5.0,
    image: "/pain_reliever---fe000a2e-c4b7-4626-8585-625ae9c9565c.jpg",
    category: "Essentials",
    sizes: ["OS"],
    description: "Travel-size ibuprofen for the morning after.",
    condition: "NEW",
  },
  {
    id: "item_047",
    name: "Tampons / pads pack",
    price: 8.0,
    image: "/feminine_care---4845ec5f-d371-4028-8a52-774d289ad1cf.jpg",
    category: "Essentials",
    sizes: ["OS"],
    description: "Feminine care emergency kit.",
    condition: "NEW",
  },

  // =========================================================
  //  JENGERLUXURIOUS 2ND CHANCE — RESALE CLOTHING
  //  (surfaced on the external storefront only; kept here for data completeness)
  // =========================================================

  // --- RUSH / EVENT DRESSES ---
  {
    id: "item_001",
    name: "XSCAPE Open Back Floral Mini Party Dress",
    price: 45.0,
    image: "/item_001_xscape_floral.jpg",
    images: [
      "/item_001_xscape_floral.jpg",
      "/item_001_details/interior_lining.jpg",
      "/item_001_details/tags.jpg",
    ],
    category: "2nd Chance Resale",
    sizes: ["4"],
    description: "NWT. Perfect for rush or party events.",
    condition: "NEW WITH TAGS",
  },
  {
    id: "item_002",
    name: "DEREK HEART Striped Ribbed Tank Midi Dress",
    price: 25.0,
    image: "/item_002_derek_heart_striped.jpg",
    images: [
      "/item_002_derek_heart_striped.jpg",
      "/item_002_details/front.jpg",
      "/item_002_details/back.jpg",
      "/item_002_details/top_front.jpg",
      "/item_002_details/tag.jpg",
      "/item_002_details/metrics.jpg",
    ],
    category: "2nd Chance Resale",
    sizes: ["M"],
    description: "Casual rush or daytime events. Can be styled as a long top.",
    condition: "GENTLY LOVED",
  },
  {
    id: "item_003",
    name: "JESSICA SIMPSON Orange Ruffle Maxi Dress",
    price: 55.0,
    image: "/item_003_jessica_simpson_maxi.jpg",
    images: [
      "/item_003_jessica_simpson_maxi.jpg",
      "/item_003_details/model_shot.jpg",
      "/item_003_details/back.jpg",
      "/item_003_details/bodice_detail.jpg",
    ],
    category: "2nd Chance Resale",
    sizes: ["S"],
    description: "NWT. Statement dress for dressy rush days.",
    condition: "NEW WITH TAGS",
  },
  {
    id: "item_004",
    name: "B.Des Grey Polka Dotted Sheer Panel Dress",
    price: 30.0,
    image: "/mini_sewing_kit---dd80f4e7-6b93-4a26-a96c-c0868497623f.jpg",
    category: "2nd Chance Resale",
    sizes: ["XS"],
    description: "Cute event dress with sheer detailing.",
    condition: "GENTLY LOVED",
  },
  {
    id: "item_005",
    name: "NEW YORK & COMPANY Orange/Brown Aztec A-line Dress",
    price: 28.0,
    image: "/safety_pins---e12086a6-b086-4477-8bc5-6e21f1c22682.jpg",
    category: "2nd Chance Resale",
    sizes: ["XS"],
    description: "Fun day look for campus.",
    condition: "GENTLY LOVED",
  },
  {
    id: "item_006",
    name: "Francesca's AYLA \u201cIzabella\u201d Striped 2-Tier Dress",
    price: 35.0,
    image: "/lash_glue---e35b53a3-42b7-41e5-a690-4d1e61503881.jpg",
    category: "2nd Chance Resale",
    sizes: ["XXS"],
    description: "NWT. Very college-coded and lightweight.",
    condition: "NEW WITH TAGS",
  },
  {
    id: "item_007",
    name: "GAP Blue Floral One-Piece Swimsuit",
    price: 20.0,
    image: "/lashes---8d5587ef-8948-4c02-a2b3-c0cebb5fe217.jpg",
    category: "2nd Chance Resale",
    sizes: ["XS"],
    description: "Fits the pool/day party vibe perfectly.",
    condition: "GENTLY LOVED",
  },

  // --- GAME DAY / TOPS & BOTTOMS ---
  {
    id: "item_008",
    name: "DIVIDED H&M White Off-Shoulder Ruffle Blouse",
    price: 18.0,
    image: "/item_008_hm_white_ruffle.jpg",
    images: [
      "/item_008_hm_white_ruffle.jpg",
      "/item_008_details/front_full.jpg",
      "/item_008_details/bodice_front.jpg",
      "/item_008_details/sleeve_cuff.jpg",
      "/item_008_details/lifestyle.jpg",
    ],
    category: "2nd Chance Resale",
    sizes: ["3XS"],
    description: "Very game-day and feminine.",
    condition: "GENTLY LOVED",
  },
  {
    id: "item_009",
    name: "H&M DIVIDED Orange Bohemian Graphic Crop Top",
    price: 15.0,
    image: "/lip_gloss---a662e684-d9fb-4c3f-9a9f-5a57d946c179.jpg",
    category: "2nd Chance Resale",
    sizes: ["S"],
    description: "On-trend crop tee for tailgates.",
    condition: "GENTLY LOVED",
  },
  {
    id: "item_010",
    name: "DOUBLE ZERO Cream Scalloped Blouse",
    price: 22.0,
    image: "/lip_balm---3c8b39f6-ac8a-4280-a725-fe1be86b5028.jpg",
    category: "2nd Chance Resale",
    sizes: ["M"],
    description: "Cute neutral top, easy to pair.",
    condition: "GENTLY LOVED",
  },
  {
    id: "item_011",
    name: "ANTHROPOLOGIE MAEVE \u201cOrli\u201d Floral Paisley Blouse",
    price: 40.0,
    image: "/item_011_maeve_blouse.jpg",
    images: [
      "/item_011_maeve_blouse.jpg",
      "/item_011_details/flat.jpg",
      "/item_011_details/collar.jpg",
      "/item_011_details/hem.jpg",
      "/item_011_details/tag.jpg",
    ],
    category: "2nd Chance Resale",
    sizes: ["L"],
    description: "Nice statement top for day class or going out.",
    condition: "EXCELLENT",
  },
  {
    id: "item_012",
    name: "NEWPORT NEWS Black Sheer Floral Beach Blouse",
    price: 20.0,
    image: "/oil_blotting_sheets---39970307-38c3-466d-8b36-e28dc44f8c35.jpg",
    category: "2nd Chance Resale",
    sizes: ["M"],
    description: "Great for layered going-out looks.",
    condition: "GENTLY LOVED",
  },
  {
    id: "item_013",
    name: "MOD REF Denim Camel Skirted Overall",
    price: 35.0,
    image: "/makeup_wipes---73bf1a20-ba99-4acb-86bd-37d5feb93050.jpg",
    category: "2nd Chance Resale",
    sizes: ["S"],
    description: "Unique, on-trend piece.",
    condition: "GENTLY LOVED",
  },
  {
    id: "item_014",
    name: "ALEX COLMAN Vintage Yellow/Black Pattern Midi Skirt",
    price: 45.0,
    image: "/eye_black---0b707dca-48a6-491a-82f3-e939618e117a.jpg",
    category: "2nd Chance Resale",
    sizes: ["XS"],
    description: "Vintage statement skirt.",
    condition: "VINTAGE",
  },
  {
    id: "item_015",
    name: "OLIVACEOUS Floral Elastic Waist Silky Pants",
    price: 30.0,
    image: "/electrolyte_packet---60fcb1e9-310b-4f6b-8ea1-27075fd0a911.jpg",
    category: "2nd Chance Resale",
    sizes: ["S"],
    description: "Dressy fun pant.",
    condition: "EXCELLENT",
  },
  {
    id: "item_016",
    name: "METRO WEAR Red Perforated Pleated Skirt",
    price: 25.0,
    image: "/sunscreen_packet---76e6bcbd-edaf-42bc-b8d9-26954fecab89.jpg",
    category: "2nd Chance Resale",
    sizes: ["S", "M"],
    description: "The ultimate game-day red skirt.",
    condition: "GENTLY LOVED",
  },

  // --- GOING OUT / SPECIAL PIECES ---
  {
    id: "item_017",
    name: "& OTHER STORIES Cream Embellished Sequin Sweater",
    price: 65.0,
    image: "/pain_reliever---fe000a2e-c4b7-4626-8585-625ae9c9565c.jpg",
    category: "2nd Chance Resale",
    sizes: ["XS"],
    description: "Big statement piece for night events.",
    condition: "EXCELLENT",
  },
  {
    id: "item_018",
    name: "ANTHROPOLOGIE ett:twa Floral Puffer Coat",
    price: 85.0,
    image: "/feminine_care---4845ec5f-d371-4028-8a52-774d289ad1cf.jpg",
    category: "2nd Chance Resale",
    sizes: ["XS"],
    description: "Perfect for cooler game days and nights.",
    condition: "EXCELLENT",
  },
  {
    id: "item_019",
    name: "McQ Alexander McQueen Yellow Striped Turtleneck",
    price: 120.0,
    image: "/placeholder.jpg",
    category: "2nd Chance Resale",
    sizes: ["XS"],
    description: "High-end fashion-forward statement.",
    condition: "LIKE NEW",
  },
  {
    id: "item_020",
    name: "H&M Ocher Brown Wool Blend Sweater",
    price: 28.0,
    image: "/placeholder.jpg",
    category: "2nd Chance Resale",
    sizes: ["XS"],
    description: "Ideal for cold-weather bar nights.",
    condition: "GENTLY LOVED",
  },
  {
    id: "item_021",
    name: "BCBG MAXAZRIA Pearle Two-Tone Floral Lace Crop Top",
    price: 55.0,
    image: "/item_021_bcbg_lace_crop.jpg",
    images: [
      "/item_021_bcbg_lace_crop.jpg",
      "/item_021_details/model_front.jpg",
      "/item_021_details/model_back.jpg",
      "/item_021_details/flat_lay_1.jpg",
      "/item_021_details/flat_lay_2.jpg",
      "/item_021_details/tag.jpg",
    ],
    category: "2nd Chance Resale",
    sizes: ["XS"],
    description: "The staple going-out piece.",
    condition: "EXCELLENT",
  },
  {
    id: "item_022",
    name: "TOMMY HILFIGER 90s Vintage Denim Grey Logo Tshirt",
    price: 35.0,
    image: "/placeholder.jpg",
    category: "2nd Chance Resale",
    sizes: ["XXL"],
    description: "Vintage oversize tee.",
    condition: "VINTAGE",
  },
  {
    id: "item_023",
    name: "PSYCHO BUNNY Blue/Yellow Tshirt",
    price: 25.0,
    image: "/placeholder.jpg",
    category: "2nd Chance Resale",
    sizes: ["M"],
    description: "Unisex casual.",
    condition: "GENTLY LOVED",
  },

  // --- VINTAGE & STATEMENT JACKETS/BAGS ---
  {
    id: "item_024",
    name: "LAURENCE KAZAR Vintage 80s Sequin Blazer",
    price: 95.0,
    image: "/placeholder.jpg",
    category: "2nd Chance Resale",
    sizes: ["XL"],
    description: "Huge statement piece.",
    condition: "VINTAGE",
  },
  {
    id: "item_025",
    name: "SANDY STARKMAN Vintage Patchwork Jacket",
    price: 75.0,
    image: "/placeholder.jpg",
    category: "2nd Chance Resale",
    sizes: ["XS"],
    description: "Artsy and highly unique.",
    condition: "VINTAGE",
  },
  {
    id: "item_026",
    name: "WHEREMI MICHAEL HOBAN American Flag Bomber",
    price: 150.0,
    image: "/placeholder.jpg",
    category: "2nd Chance Resale",
    sizes: ["M"],
    description: "Insane statement, ultimate US tailgate jacket.",
    condition: "VINTAGE",
  },
  {
    id: "item_027",
    name: "DOONEY & BOURKE 90s Petite Pebble \u201cSac\u201d",
    price: 65.0,
    image: "/placeholder.jpg",
    category: "2nd Chance Resale",
    sizes: ["OS"],
    description: "Classic 90s vintage bag.",
    condition: "VINTAGE",
  },
  {
    id: "item_028",
    name: "COACH Vintage 90s Mini Bag Brown/Red Flower",
    price: 85.0,
    image: "/placeholder.jpg",
    category: "2nd Chance Resale",
    sizes: ["OS"],
    description: "Classic campus bag.",
    condition: "VINTAGE",
  },
  {
    id: "item_029",
    name: "BRIGHTON \u201cIn Love We Trust\u201d Canvas Tote",
    price: 45.0,
    image: "/placeholder.jpg",
    category: "2nd Chance Resale",
    sizes: ["OS"],
    description: "Quirky, eye-catching tote.",
    condition: "GENTLY LOVED",
  },
  {
    id: "item_030",
    name: "KATE SPADE Winking Camel Pouch",
    price: 55.0,
    image: "/placeholder.jpg",
    category: "2nd Chance Resale",
    sizes: ["OS"],
    description: "High-ticket novelty piece.",
    condition: "EXCELLENT",
  },

  // --- NEWER RESALE ADDITIONS (multi-image galleries) ---
  {
    id: "item_048",
    name: "Black Bralette Lace Crochet Crop Top",
    price: 35.0,
    image: "/item_new_black_lace_bralette.jpg",
    images: [
      "/item_new_black_lace_bralette.jpg",
      "/item_new_details/model_studio.jpg",
      "/item_new_details/model_cafe.jpg",
      "/item_new_details/straps.jpg",
      "/item_new_details/flat_1.jpg",
    ],
    category: "2nd Chance Resale",
    sizes: ["XS"],
    description: "Intricate black lace crochet bralette crop top. Perfect for layering or wearing out.",
    condition: "EXCELLENT",
  },
  {
    id: "item_049",
    name: "Black Shimmer Chain-Link Bikini Set",
    price: 45.0,
    image: "/item_049_black_chain_bikini.jpg",
    images: [
      "/item_049_black_chain_bikini.jpg",
      "/item_new_details/black_bikini_top.jpg",
      "/item_new_details/black_bikini_bottoms.jpg",
      "/item_new_details/black_bikini_bottoms_back.jpg",
    ],
    category: "2nd Chance Resale",
    sizes: ["S"],
    description: "Black shimmer bikini set with gold and silver chain-link hip details. Perfect for pool parties.",
    condition: "EXCELLENT",
  },
  {
    id: "item_050",
    name: "SKYE Blue/Pink Striped Bandeau Bikini Set",
    price: 40.0,
    image: "/item_new_skye_bikini.jpg",
    images: [
      "/item_new_skye_bikini.jpg",
      "/item_new_details/skye_top.jpg",
      "/item_new_details/skye_bottoms.jpg",
      "/item_new_details/skye_bottoms_back.jpg",
    ],
    category: "2nd Chance Resale",
    sizes: ["S"],
    description: "Vibrant blue and pink striped bandeau bikini set by SKYE with side-tie bottoms.",
    condition: "EXCELLENT",
  },
  {
    id: "item_051",
    name: "Tropical Floral & Zebra Monokini",
    price: 45.0,
    image: "/item_new_monokini_floral.jpg",
    images: [
      "/item_new_monokini_floral.jpg",
      "/item_new_details/monokini_floral_back.jpg",
    ],
    category: "2nd Chance Resale",
    sizes: ["S"],
    description: "Vibrant tropical floral and zebra print monokini swimsuit with brown rectangular rings.",
    condition: "EXCELLENT",
  },
];

/**
 * Mock inventory levels: resale items are one-of-a-kind (stock 1), emergency
 * items are stocked deeper (stock 5). Any item can override this by setting an
 * explicit `stock` above (including `stock: 0` to force "Sold Out").
 */
export const products: Product[] = rawProducts.map((p) => ({
  ...p,
  stock: p.stock ?? (p.category === "2nd Chance Resale" ? 1 : 5),
}));

/** Items shown on the Jenger Drop (emergency delivery) homepage. */
export const dropProducts: Product[] = products.filter((p) =>
  (DROP_CATEGORIES as readonly string[]).includes(p.category)
);

/** The single category that holds all resale clothing on the 2nd Chance tab. */
export const RESALE_CATEGORY = "2nd Chance Resale";

/** Items shown on the Jengerluxurious 2nd Chance (resale) tab. */
export const resaleProducts: Product[] = products.filter(
  (p) => p.category === RESALE_CATEGORY
);

/** Group Jenger Drop items by their category, preserving DROP_CATEGORIES order. */
export const dropProductsByCategory: { category: DropCategory; items: Product[] }[] =
  DROP_CATEGORIES.map((category) => ({
    category,
    items: dropProducts.filter((p) => p.category === category),
  }));

/** A curated set of "trending" emergency items for the homepage carousel. */
export const trendingProductIds = [
  "item_045", // phone charger
  "item_031", // fashion tape
  "item_043", // electrolyte
  "item_041", // clear stadium bag
  "item_047", // tampons/pads
  "item_035", // lash glue
];

export const trendingProducts: Product[] = trendingProductIds
  .map((id) => dropProducts.find((p) => p.id === id))
  .filter((p): p is Product => Boolean(p));
