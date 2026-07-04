"use client";

import * as React from "react";
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Menu as MenuIcon,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  DROP_CATEGORIES,
  dropProducts,
  dropProductsByCategory,
  resaleProducts,
  trendingProducts,
  type Product,
} from "../../data/products";

/* -------------------------------------------------------------------------- */
/*  Brand + contact config                                                    */
/* -------------------------------------------------------------------------- */

// Stripe publishable key (falls back to Stripe's public sample test key).
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
    "pk_test_TYooMQauvdEDq54NiTphI7jx"
);

const CONTACT = {
  phone: "+15550123456",
  phoneDisplay: "(555) 012-3456",
  instagram: "jengerluxurious.second.chance",
  instagramUrl: "https://instagram.com/jengerluxurious.second.chance",
  // The 2nd Chance resale storefront lives on a separate site.
  secondChanceUrl: "http://www.jengerluxurious.com",
};

/* -------------------------------------------------------------------------- */
/*  Synonym logic (mocked) — slang maps to real inventory terms               */
/* -------------------------------------------------------------------------- */

const SYNONYMS: Record<string, string> = {
  "boob tape": "fashion tape",
  "double sided tape": "fashion tape",
  "double-sided tape": "fashion tape",
  "titty tape": "fashion tape",
  "clear purse": "clear stadium",
  "clear bag": "clear stadium",
  "stadium bag": "clear stadium",
  "phone cord": "charger",
  "phone charger": "charger",
  "phone died": "charger",
  charger: "charger",
  "nipple covers": "pasties",
  "nip covers": "pasties",
  "red top": "red game day top",
  hangover: "electrolyte",
  "hangover kit": "electrolyte",
  advil: "pain reliever",
  tylenol: "pain reliever",
  ibuprofen: "pain reliever",
  midol: "pain reliever",
  tampon: "tampons",
  period: "tampons",
  chapstick: "lip balm",
  gloss: "lip gloss",
  eyelashes: "lashes",
  spf: "sunscreen",
};

const SLANG_SUGGESTIONS = [
  "fashion tape",
  "clear purse",
  "phone died",
  "hangover kit",
  "nipple covers",
];

const CATEGORY_META: Record<string, { image: string; blurb: string }> = {
  "Fashion Fix": {
    image: "/boob_tape---e15735e4-761e-4a45-9035-2c0848b33538.jpg",
    blurb: "Tape, pins & quick saves",
  },
  "Beauty Fix": {
    image: "/lip_gloss---a662e684-d9fb-4c3f-9a9f-5a57d946c179.jpg",
    blurb: "Lashes, gloss & glow",
  },
  "Game Day & Going Out": {
    image: "/clear_purse---9254c583-bd95-4c48-89d5-840f19894ece.jpg",
    blurb: "Clear bags & hydration",
  },
  Essentials: {
    image: "/phone_charger---51e11673-53f6-4e3d-9938-feb9e8325f41.jpg",
    blurb: "Chargers, meds & more",
  },
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const money = (n: number) => `$${n.toFixed(2)}`;

/* -------------------------------------------------------------------------- */
/*  Images — load the paths straight from products.ts                          */
/* -------------------------------------------------------------------------- */

/** The product's own image path from the data file. */
function resolveImage(product: Product): string {
  return product.image;
}

/** The product's own gallery from the data file (falls back to its single image). */
function resolveGallery(product: Product): string[] {
  return product.images && product.images.length > 0
    ? product.images
    : [product.image];
}

function searchProducts(raw: string, source: Product[]): Product[] {
  const q = raw.trim().toLowerCase();
  if (!q) return source;
  const mapped = SYNONYMS[q] ?? q;
  const terms = Array.from(new Set([q, mapped]));
  return source.filter((p) => {
    const hay = `${p.name} ${p.category} ${p.description}`.toLowerCase();
    return terms.some((t) => hay.includes(t));
  });
}

/** Bottom-sheet styling shared by the drawer-style dialogs. */
const sheetClass =
  "top-auto bottom-0 left-1/2 max-w-md -translate-x-1/2 translate-y-0 gap-0 rounded-b-none rounded-t-3xl p-0 sm:max-w-md";

/* -------------------------------------------------------------------------- */
/*  Image with graceful fallback                                              */
/* -------------------------------------------------------------------------- */

function ProductImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [current, setCurrent] = React.useState(src);
  React.useEffect(() => setCurrent(src), [src]);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      loading="lazy"
      onError={() => setCurrent("/placeholder.svg")}
      className={className}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Cart types                                                                */
/* -------------------------------------------------------------------------- */

type CartItem = { product: Product; qty: number };

/* ========================================================================== */
/*  PAGE                                                                       */
/* ========================================================================== */

export default function Home() {
  // Top-level tab: emergency delivery vs. resale
  const [activeTab, setActiveTab] = React.useState<"drop" | "resale">("drop");
  const isDrop = activeTab === "drop";
  const catalog = isDrop ? dropProducts : resaleProducts;

  // Search / browse state
  const [query, setQuery] = React.useState("");
  const [activeQuery, setActiveQuery] = React.useState<string | null>(null);
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  // Modals & drawers
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [requestOpen, setRequestOpen] = React.useState(false);
  const [requestPrefill, setRequestPrefill] = React.useState("");
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);

  // Cart
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const cartCount = cart.reduce((n, i) => n + i.qty, 0);

  const isSearching = activeQuery !== null || activeCategory !== null;

  const results = React.useMemo<Product[]>(() => {
    if (activeCategory) {
      return catalog.filter((p) => p.category === activeCategory);
    }
    if (activeQuery !== null) return searchProducts(activeQuery, catalog);
    return [];
  }, [activeQuery, activeCategory, catalog]);

  const runSearch = (term: string) => {
    setQuery(term);
    setActiveQuery(term);
    setActiveCategory(null);
  };

  const pickCategory = (cat: string) => {
    // toggle off if the same pill is tapped again
    setActiveCategory((prev) => (prev === cat ? null : cat));
    setActiveQuery(null);
    setQuery("");
  };

  const clearSearch = () => {
    setActiveQuery(null);
    setActiveCategory(null);
    setQuery("");
  };

  const switchTab = (tab: "drop" | "resale") => {
    setActiveTab(tab);
    // Reset any active search/category so the grid shows the new tab's catalog.
    setActiveQuery(null);
    setActiveCategory(null);
    setQuery("");
  };

  const addToCart = (product: Product, qty: number = 1) => {
    const amount = Math.max(1, qty);
    setCart((prev) => {
      const found = prev.find((i) => i.product.id === product.id);
      if (found) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + amount } : i
        );
      }
      return [...prev, { product, qty: amount }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.product.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const openRequest = (prefill: string) => {
    setRequestPrefill(prefill);
    setRequestOpen(true);
  };

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col bg-background pb-28">
      <Header
        cartCount={cartCount}
        activeTab={activeTab}
        onSelectTab={switchTab}
        onOpenMenu={() => setMenuOpen(true)}
        onOpenCart={() => setCheckoutOpen(true)}
      />

      <main className="flex flex-col gap-10 px-5 pt-6">
        <Hero
          query={query}
          setQuery={setQuery}
          onSearch={() => runSearch(query)}
          onSuggestion={runSearch}
        />

        {isDrop && (
          <CategoryLauncher active={activeCategory} onPick={pickCategory} />
        )}

        {isSearching ? (
          <SearchResults
            title={activeCategory ? activeCategory : `Results for “${activeQuery}”`}
            results={results}
            onClear={clearSearch}
            onSelect={setSelectedProduct}
            onAdd={addToCart}
            failedQuery={activeQuery ?? ""}
            onRequest={openRequest}
            onOpenMenu={() => setMenuOpen(true)}
          />
        ) : (
          <>
            <TrendingCarousel
              items={isDrop ? trendingProducts : resaleProducts.slice(0, 6)}
              title={isDrop ? "Trending now" : "Fresh on 2nd Chance"}
              onSelect={setSelectedProduct}
              onAdd={addToCart}
            />
            <TheEdit
              products={catalog}
              title={isDrop ? "The Edit" : "2nd Chance Resale"}
              onSelect={setSelectedProduct}
              onAdd={addToCart}
            />
          </>
        )}
      </main>

      <ContactBar
        onOpenMenu={() => setMenuOpen(true)}
        failedQuery={activeQuery ?? ""}
      />

      {/* --- Drawers & modals --- */}
      <FullMenuDrawer
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onSelect={(p) => {
          setMenuOpen(false);
          setSelectedProduct(p);
        }}
        onAdd={addToCart}
      />

      <RequestItemModal
        open={requestOpen}
        onOpenChange={setRequestOpen}
        prefill={requestPrefill}
      />

      <ProductDetailModal
        product={selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
        onAdd={(p, qty) => {
          addToCart(p, qty);
          setSelectedProduct(null);
        }}
        onBuy={(p, qty) => {
          addToCart(p, qty);
          setSelectedProduct(null);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutDrawer
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        cart={cart}
        updateQty={updateQty}
        onDone={() => setCart([])}
      />
    </div>
  );
}

/* ========================================================================== */
/*  Header + tabs                                                              */
/* ========================================================================== */

function Header({
  cartCount,
  activeTab,
  onSelectTab,
  onOpenMenu,
  onOpenCart,
}: {
  cartCount: number;
  activeTab: "drop" | "resale";
  onSelectTab: (tab: "drop" | "resale") => void;
  onOpenMenu: () => void;
  onOpenCart: () => void;
}) {
  const tabs: { id: "drop" | "resale"; label: string }[] = [
    { id: "drop", label: "Jenger Drop" },
    { id: "resale", label: "2nd Chance" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="flex items-center justify-between px-5 pt-4">
        <span className="font-serif text-sm tracking-[0.28em] text-muted-foreground uppercase">
          Jengerluxurious
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="haptic"
            aria-label="Menu"
            onClick={onOpenMenu}
          >
            <MenuIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="haptic relative"
            aria-label="Cart"
            onClick={onOpenCart}
          >
            <ShoppingBag />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs toggle the product grid between Emergency Drop & 2nd Chance Resale */}
      <nav className="flex items-center gap-6 px-5 pt-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={cn(
                "haptic relative pb-2.5 text-base font-semibold transition-colors",
                isActive
                  ? "text-foreground"
                  : "font-medium text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

/* ========================================================================== */
/*  Hero + search                                                              */
/* ========================================================================== */

function Hero({
  query,
  setQuery,
  onSearch,
  onSuggestion,
}: {
  query: string;
  setQuery: (v: string) => void;
  onSearch: () => void;
  onSuggestion: (term: string) => void;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-[0.22em] text-primary uppercase">
          Emergency drop • delivered fast
        </p>
        <h1 className="font-serif text-4xl leading-[1.05] tracking-tight text-foreground">
          O sh!t!
          <br />
          What do you need
          <br />
          right now?
        </h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
        className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm ring-1 ring-black/5"
      >
        <Search className="ml-2 size-5 shrink-0 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="O sh!t! What do you need right now?"
          className="h-10 border-0 bg-transparent px-1 text-base shadow-none ring-0 focus-visible:ring-0"
          aria-label="Search for an item"
        />
        <Button
          type="submit"
          className="haptic h-10 rounded-xl px-5 text-sm font-semibold tracking-wide"
          size="lg"
        >
          Go
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {SLANG_SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSuggestion(s)}
            className="haptic rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  Category launcher                                                          */
/* ========================================================================== */

function CategoryLauncher({
  active,
  onPick,
}: {
  active: string | null;
  onPick: (cat: string) => void;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-serif text-xl tracking-wide">Shop by moment</h2>
      <div className="grid grid-cols-2 gap-3">
        {DROP_CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat];
          const isActive = active === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onPick(cat)}
              className={cn(
                "haptic group relative flex h-32 flex-col justify-end overflow-hidden rounded-2xl border text-left transition-all",
                isActive
                  ? "border-primary ring-2 ring-primary/60"
                  : "border-border/60 hover:border-primary/40"
              )}
            >
              {/* Photo thumbnail */}
              <ProductImage
                src={meta?.image ?? "/placeholder.svg"}
                alt={cat}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Luxe gradient scrim for legibility */}
              <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />
              {isActive && (
                <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" />
                </span>
              )}
              <span className="relative z-10 flex flex-col gap-0.5 p-3.5">
                <span className="font-serif text-base leading-tight tracking-wide text-white">
                  {cat}
                </span>
                <span className="text-[11px] text-white/70">{meta?.blurb}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  Product card + grid                                                        */
/* ========================================================================== */

function ProductCard({
  product,
  onSelect,
  onAdd,
}: {
  product: Product;
  onSelect: (p: Product) => void;
  onAdd: (p: Product) => void;
}) {
  const [added, setAdded] = React.useState(false);
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => onSelect(product)}
        className="relative aspect-square overflow-hidden bg-secondary"
        aria-label={`View ${product.name}`}
      >
        <ProductImage
          src={resolveImage(product)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.condition && (
          <span className="absolute top-2 left-2 rounded-full bg-background/85 px-2 py-0.5 text-[9px] font-semibold tracking-[0.12em] text-foreground uppercase backdrop-blur-sm">
            {product.condition}
          </span>
        )}
      </button>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <button
          type="button"
          onClick={() => onSelect(product)}
          className="text-left text-sm font-medium leading-snug line-clamp-2"
        >
          {product.name}
        </button>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="flex items-baseline gap-1.5">
            <span className="font-serif text-base">{money(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {money(product.originalPrice)}
              </span>
            )}
          </span>
          <Button
            size="icon-sm"
            className="haptic rounded-full"
            aria-label={`Add ${product.name}`}
            onClick={() => {
              onAdd(product);
              setAdded(true);
              window.setTimeout(() => setAdded(false), 1200);
            }}
          >
            {added ? <Check /> : <Plus />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProductGrid({
  products,
  onSelect,
  onAdd,
}: {
  products: Product[];
  onSelect: (p: Product) => void;
  onAdd: (p: Product) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onSelect={onSelect} onAdd={onAdd} />
      ))}
    </div>
  );
}

/* ========================================================================== */
/*  Trending carousel                                                          */
/* ========================================================================== */

function TrendingCarousel({
  items,
  title,
  onSelect,
  onAdd,
}: {
  items: Product[];
  title: string;
  onSelect: (p: Product) => void;
  onAdd: (p: Product) => void;
}) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-xl tracking-wide">{title}</h2>
        <span className="text-xs text-muted-foreground">Grabbed most tonight</span>
      </div>
      <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
        {items.map((p) => (
          <div key={p.id} className="w-36 shrink-0 snap-start">
            <ProductCard product={p} onSelect={onSelect} onAdd={onAdd} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  The Edit (full grid)                                                       */
/* ========================================================================== */

function TheEdit({
  products: items,
  title,
  onSelect,
  onAdd,
}: {
  products: Product[];
  title: string;
  onSelect: (p: Product) => void;
  onAdd: (p: Product) => void;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-serif text-xl tracking-wide">{title}</h2>
      <ProductGrid products={items} onSelect={onSelect} onAdd={onAdd} />
    </section>
  );
}

/* ========================================================================== */
/*  Search results + no-result fallback                                        */
/* ========================================================================== */

function SearchResults({
  title,
  results,
  onClear,
  onSelect,
  onAdd,
  failedQuery,
  onRequest,
  onOpenMenu,
}: {
  title: string;
  results: Product[];
  onClear: () => void;
  onSelect: (p: Product) => void;
  onAdd: (p: Product) => void;
  failedQuery: string;
  onRequest: (prefill: string) => void;
  onOpenMenu: () => void;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl tracking-wide">{title}</h2>
        <Button
          variant="ghost"
          size="sm"
          className="haptic gap-1 text-muted-foreground"
          onClick={onClear}
        >
          <X className="size-3.5" /> Clear
        </Button>
      </div>

      {results.length > 0 ? (
        <ProductGrid products={results} onSelect={onSelect} onAdd={onAdd} />
      ) : (
        <NoResultFallback
          failedQuery={failedQuery}
          onRequest={onRequest}
          onOpenMenu={onOpenMenu}
        />
      )}
    </section>
  );
}

function NoResultFallback({
  failedQuery,
  onRequest,
  onOpenMenu,
}: {
  failedQuery: string;
  onRequest: (prefill: string) => void;
  onOpenMenu: () => void;
}) {
  const smsHref = `sms:${CONTACT.phone}?&body=${encodeURIComponent(
    `Hi Jenger Drop! I need: ${failedQuery}`
  )}`;
  return (
    <div className="flex flex-col items-center gap-5 rounded-3xl border border-border bg-card px-6 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Search className="size-6" />
      </span>
      <div className="space-y-1">
        <h3 className="font-serif text-2xl tracking-tight">
          We don&apos;t have that yet.
        </h3>
        <p className="text-sm text-muted-foreground">
          But we can probably still get it to you. Tell us what you need.
        </p>
      </div>
      <div className="flex w-full flex-col gap-2.5">
        <Button
          size="lg"
          className="haptic h-12 w-full rounded-xl text-sm font-semibold"
          onClick={() => onRequest(failedQuery)}
        >
          Request this item
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="haptic h-12 w-full rounded-xl text-sm font-semibold"
          onClick={onOpenMenu}
        >
          Open full menu
        </Button>
        <a
          href={smsHref}
          className="haptic inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <MessageCircle className="size-4" /> Text us what you need
        </a>
      </div>
    </div>
  );
}

/* ========================================================================== */
/*  Full Menu drawer (grouped by category)                                     */
/* ========================================================================== */

function FullMenuDrawer({
  open,
  onOpenChange,
  onSelect,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (p: Product) => void;
  onAdd: (p: Product) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(sheetClass, "h-[88vh]")}>
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="font-serif text-2xl tracking-tight">
            The full menu
          </DialogTitle>
          <DialogDescription>
            Everything Jenger Drop can bring you tonight.
          </DialogDescription>
        </DialogHeader>

        <div className="no-scrollbar flex-1 space-y-8 overflow-y-auto px-5 py-5">
          {dropProductsByCategory.map(({ category, items }) => {
            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="size-8 shrink-0 overflow-hidden rounded-full ring-1 ring-border">
                    <ProductImage
                      src={CATEGORY_META[category]?.image ?? "/placeholder.svg"}
                      alt={category}
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <h3 className="font-serif text-lg tracking-wide">{category}</h3>
                  <span className="text-xs text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {items.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onSelect={onSelect}
                      onAdd={onAdd}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ========================================================================== */
/*  Request Item modal                                                         */
/* ========================================================================== */

function RequestItemModal({
  open,
  onOpenChange,
  prefill,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefill: string;
}) {
  const [submitted, setSubmitted] = React.useState(false);
  const [itemName, setItemName] = React.useState(prefill);
  const [need, setNeed] = React.useState("tonight");

  React.useEffect(() => {
    if (open) {
      setItemName(prefill);
      setSubmitted(false);
      setNeed("tonight");
    }
  }, [open, prefill]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check className="size-7" />
            </span>
            <DialogTitle className="font-serif text-2xl">Request sent</DialogTitle>
            <DialogDescription>
              We&apos;ll text you the moment we can source it.
            </DialogDescription>
            <Button
              className="haptic mt-2 h-11 w-full rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl tracking-tight">
                Request this item
              </DialogTitle>
              <DialogDescription>
                Can&apos;t find it? We&apos;ll hunt it down for you.
              </DialogDescription>
            </DialogHeader>

            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="req-item">Item name</Label>
                <Input
                  id="req-item"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="What are you looking for?"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Need it by</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: "tonight", l: "Tonight" },
                    { v: "this-week", l: "This week" },
                    { v: "exploring", l: "Just exploring" },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setNeed(opt.v)}
                      className={cn(
                        "haptic rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors",
                        need === opt.v
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="req-details">Details (optional)</Label>
                <Input
                  id="req-details"
                  placeholder="Size, color, notes…"
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="req-contact">Phone or email</Label>
                <Input
                  id="req-contact"
                  placeholder="So we can reach you"
                  className="h-11"
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="haptic h-12 w-full rounded-xl text-sm font-semibold"
              >
                Send request
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ========================================================================== */
/*  Product detail modal with image gallery                                    */
/* ========================================================================== */

function ProductDetailModal({
  product,
  onOpenChange,
  onAdd,
  onBuy,
}: {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
  onAdd: (p: Product, qty: number) => void;
  onBuy: (p: Product, qty: number) => void;
}) {
  const [index, setIndex] = React.useState(0);
  const [qty, setQty] = React.useState(1);
  const gallery = React.useMemo(
    () => (product ? resolveGallery(product) : []),
    [product]
  );

  // Reset the gallery + quantity whenever a different product opens.
  React.useEffect(() => {
    setIndex(0);
    setQty(1);
  }, [product]);

  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent className={cn(sheetClass, "max-h-[92vh] overflow-hidden")}>
        {product && (
          <div className="no-scrollbar flex max-h-[92vh] flex-col overflow-y-auto">
            <div className="relative aspect-square w-full shrink-0 bg-secondary">
              <ProductImage
                src={gallery[index]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() =>
                      setIndex((i) => (i - 1 + gallery.length) % gallery.length)
                    }
                    className="haptic absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() => setIndex((i) => (i + 1) % gallery.length)}
                    className="haptic absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {gallery.map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "size-1.5 rounded-full transition-colors",
                          i === index ? "bg-primary" : "bg-background/70"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-4 p-5">
              <div className="space-y-1">
                {product.condition && (
                  <span className="inline-block rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    {product.condition}
                  </span>
                )}
                <DialogTitle className="font-serif text-2xl leading-tight tracking-tight">
                  {product.name}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Product details for {product.name}
                </DialogDescription>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xl">{money(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {money(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>

              {product.sizes?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <span
                      key={s}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-medium">Quantity</span>
                <div className="flex items-center gap-3">
                  <Button
                    size="icon-sm"
                    variant="outline"
                    className="haptic rounded-full"
                    aria-label="Decrease quantity"
                    disabled={qty <= 1}
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    <Minus />
                  </Button>
                  <span className="w-6 text-center text-base font-semibold tabular-nums">
                    {qty}
                  </span>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    className="haptic rounded-full"
                    aria-label="Increase quantity"
                    onClick={() => setQty((q) => q + 1)}
                  >
                    <Plus />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2.5">
                <Button
                  variant="outline"
                  size="lg"
                  className="haptic h-12 flex-1 rounded-xl text-sm font-semibold"
                  onClick={() => onAdd(product, qty)}
                >
                  Add to bag
                </Button>
                <Button
                  size="lg"
                  className="haptic h-12 flex-1 rounded-xl text-sm font-semibold"
                  onClick={() => onBuy(product, qty)}
                >
                  Get it now
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ========================================================================== */
/*  Checkout drawer (frictionless MVP: location + phone -> Place Order)        */
/* ========================================================================== */

function CheckoutDrawer({
  open,
  onOpenChange,
  cart,
  updateQty,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  updateQty: (id: string, delta: number) => void;
  onDone: () => void;
}) {
  const [name, setName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [instructions, setInstructions] = React.useState("");
  const [locating, setLocating] = React.useState(false);
  const [locateError, setLocateError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Stripe payment intent state
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [secretError, setSecretError] = React.useState<string | null>(null);

  const subtotal = cart.reduce((n, i) => n + i.product.price * i.qty, 0);

  React.useEffect(() => {
    if (open) setSuccess(false);
  }, [open]);

  // Create (or refresh) the PaymentIntent whenever the drawer opens with items.
  const createIntent = React.useCallback(async () => {
    if (cart.length === 0) return;
    setSecretError(null);
    setClientSecret(null);
    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: subtotal }),
      });
      const data = await res.json();
      if (data?.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        console.error("No clientSecret returned from server:", data);
        setSecretError("Couldn't start the payment. Tap to retry.");
      }
    } catch (err) {
      console.error("create-payment-intent request failed:", err);
      setSecretError("Couldn't reach the payment server. Tap to retry.");
    }
  }, [cart.length, subtotal]);

  React.useEffect(() => {
    if (open && !success && cart.length > 0) {
      createIntent();
    }
  }, [open, success, cart.length, createIntent]);

  const stripeOptions = React.useMemo(
    () =>
      clientSecret
        ? {
            clientSecret,
            appearance: {
              theme: "night" as const,
              variables: {
                colorPrimary: "#ef2b3d",
                colorBackground: "#141414",
                colorText: "#fafafa",
                borderRadius: "10px",
              },
            },
          }
        : undefined,
    [clientSecret]
  );

  // Log the order once payment has succeeded, then show the confirmation.
  const finalizeOrder = async (paymentIntentId: string) => {
    try {
      await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({
            id: i.product.id,
            name: i.product.name,
            price: i.product.price,
            qty: i.qty,
          })),
          name,
          location,
          phone,
          instructions,
          subtotal,
          paymentIntentId,
          paymentStatus: "paid",
        }),
      });
    } catch (err) {
      console.error("Order logging failed:", err);
    }
    setSuccess(true);
    onDone();
  };

  const locateMe = () => {
    setLocateError(null);
    if (!("geolocation" in navigator)) {
      setLocateError("Location isn't available on this device — type it below.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation(
          `📍 https://maps.google.com/?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`
        );
        setLocating(false);
      },
      (error) => {
        // Deep-debug logging for geolocation failures
        console.error("Geolocation error:", error.code, error.message);
        setLocating(false);
        setLocateError(
          "Couldn't grab your location — no worries, just type your address."
        );
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(sheetClass, "max-h-[92vh] overflow-hidden")}>
        {success ? (
          <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check className="size-8" />
            </span>
            <DialogTitle className="font-serif text-3xl tracking-tight">
              Order Received
            </DialogTitle>
            <DialogDescription className="max-w-xs text-base">
              We&apos;re on the way. Keep an eye on your texts.
            </DialogDescription>
            <Button
              className="haptic mt-2 h-12 w-full rounded-xl text-sm font-semibold"
              onClick={() => onOpenChange(false)}
            >
              Back to Jenger Drop
            </Button>
          </div>
        ) : (
          <div className="no-scrollbar flex max-h-[92vh] flex-col overflow-y-auto">
            <DialogHeader className="border-b border-border px-5 py-4">
              <DialogTitle className="font-serif text-2xl tracking-tight">
                Checkout
              </DialogTitle>
              <DialogDescription>
                Tell us where you are — we&apos;ll handle the rest.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 px-5 py-5">
              {/* Cart review */}
              {cart.length === 0 ? (
                <p className="rounded-xl bg-secondary px-4 py-6 text-center text-sm text-muted-foreground">
                  Your bag is empty. Add something from the drop first.
                </p>
              ) : (
                <div className="space-y-3">
                  {cart.map((i) => (
                    <div key={i.product.id} className="flex items-center gap-3">
                      <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
                        <ProductImage
                          src={resolveImage(i.product)}
                          alt={i.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {i.product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {money(i.product.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="icon-xs"
                          variant="outline"
                          className="haptic rounded-full"
                          aria-label="Decrease"
                          onClick={() => updateQty(i.product.id, -1)}
                        >
                          <Minus />
                        </Button>
                        <span className="w-5 text-center text-sm font-medium">
                          {i.qty}
                        </span>
                        <Button
                          size="icon-xs"
                          variant="outline"
                          className="haptic rounded-full"
                          aria-label="Increase"
                          onClick={() => updateQty(i.product.id, 1)}
                        >
                          <Plus />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-serif text-lg">{money(subtotal)}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="co-name">Name</Label>
                  <Input
                    id="co-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Who's this delivery for?"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="co-location">Delivery location</Label>
                    <button
                      type="button"
                      onClick={locateMe}
                      disabled={locating}
                      className="haptic inline-flex items-center gap-1 text-xs font-semibold text-primary disabled:opacity-60"
                    >
                      {locating ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : (
                        <span>📍</span>
                      )}
                      Locate me
                    </button>
                  </div>
                  <Input
                    id="co-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Dorm, building, or address"
                    className="h-11"
                    required
                  />
                  {locateError && (
                    <p className="text-xs text-primary">{locateError}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="co-phone">Phone number</Label>
                  <Input
                    id="co-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="So we can text you when we arrive"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="co-instructions">
                    Delivery instructions / Unit #{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                  <textarea
                    id="co-instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={3}
                    placeholder="Apt/unit #, gate code, where to meet you…"
                    className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                  />
                </div>

                {/* Stripe card payment — a successful charge is required to order */}
                {cart.length > 0 && (
                  <div className="space-y-2">
                    <Label>Card details</Label>
                    {secretError ? (
                      <button
                        type="button"
                        onClick={createIntent}
                        className="haptic w-full rounded-xl border border-border py-4 text-sm text-primary"
                      >
                        {secretError}
                      </button>
                    ) : !clientSecret || !stripeOptions ? (
                      <div className="flex items-center justify-center gap-2 rounded-xl border border-border py-6 text-sm text-muted-foreground">
                        <LoaderCircle className="size-4 animate-spin" /> Loading
                        secure card form…
                      </div>
                    ) : (
                      <Elements stripe={stripePromise} options={stripeOptions}>
                        <StripeCheckoutForm
                          name={name}
                          location={location}
                          phone={phone}
                          subtotal={subtotal}
                          onPaid={finalizeOrder}
                        />
                      </Elements>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stripe payment form (rendered inside <Elements>)                           */
/* -------------------------------------------------------------------------- */

function StripeCheckoutForm({
  name,
  location,
  phone,
  subtotal,
  onPaid,
}: {
  name: string;
  location: string;
  phone: string;
  subtotal: number;
  onPaid: (paymentIntentId: string) => Promise<void> | void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handlePlaceOrder = async () => {
    setError(null);

    if (!name.trim() || !location.trim() || !phone.trim()) {
      setError("Add your name, delivery address, and phone number first.");
      return;
    }
    if (!stripe || !elements) {
      setError("Payment form is still loading — one moment.");
      return;
    }

    setPaying(true);
    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (confirmError) {
        console.error("Stripe confirmPayment error:", confirmError);
        setError(
          confirmError.message ??
            "Payment failed. Please check your card details and try again."
        );
        setPaying(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        await onPaid(paymentIntent.id);
      } else {
        console.error("Unexpected PaymentIntent status:", paymentIntent?.status);
        setError("Payment didn't complete. Please try again.");
        setPaying(false);
      }
    } catch (err) {
      console.error("Payment confirmation threw:", err);
      setError("Something went wrong processing your card. Please try again.");
      setPaying(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-card p-3">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {error && <p className="text-xs text-primary">{error}</p>}

      <Button
        type="button"
        size="lg"
        onClick={handlePlaceOrder}
        disabled={paying || !stripe || !elements}
        className="haptic h-12 w-full rounded-xl text-base font-semibold"
      >
        {paying ? (
          <>
            <LoaderCircle className="animate-spin" /> Processing payment…
          </>
        ) : (
          `Pay ${money(subtotal)} & Place Order`
        )}
      </Button>
    </div>
  );
}

/* ========================================================================== */
/*  Sticky contact bar                                                         */
/* ========================================================================== */

function ContactBar({
  onOpenMenu,
  failedQuery,
}: {
  onOpenMenu: () => void;
  failedQuery: string;
}) {
  const smsHref = `sms:${CONTACT.phone}${
    failedQuery
      ? `?&body=${encodeURIComponent(`Hi Jenger Drop! I need: ${failedQuery}`)}`
      : ""
  }`;
  const actions = [
    { label: "Text", icon: MessageCircle, href: smsHref },
    { label: "Call", icon: Phone, href: `tel:${CONTACT.phone}` },
    { label: "DM", icon: Camera, href: CONTACT.instagramUrl, external: true },
  ];
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-4 pb-4">
      <div className="flex items-center justify-around gap-1 rounded-2xl border border-border bg-background/90 p-1.5 shadow-lg ring-1 ring-black/5 backdrop-blur-md">
        {actions.map((a) => (
          <a
            key={a.label}
            href={a.href}
            target={a.external ? "_blank" : undefined}
            rel={a.external ? "noopener noreferrer" : undefined}
            className="haptic flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <a.icon className="size-5" />
            {a.label}
          </a>
        ))}
        <button
          type="button"
          onClick={onOpenMenu}
          className="haptic flex flex-1 flex-col items-center gap-1 rounded-xl bg-primary py-2 text-[11px] font-semibold text-primary-foreground"
        >
          <MenuIcon className="size-5" />
          Menu
        </button>
      </div>
    </div>
  );
}
