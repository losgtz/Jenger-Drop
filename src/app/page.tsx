"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  ExternalLink,
  LoaderCircle,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";

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
import { hasSquareCheckoutLink, SQUARE } from "@/lib/square";
import { SHIPPING, shippingFeeForSubtotal } from "../../data/shipping";
import { productSlug } from "@/lib/catalog";
import { CONTACT } from "@/lib/contact";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  RESALE_CATEGORY,
  resaleProducts,
  type Product,
} from "../../data/products";

/* -------------------------------------------------------------------------- */
/*  API base URL                                                              */
/* -------------------------------------------------------------------------- */

// On the web this stays empty (relative /api/... calls hit the same Next server).
// In the Capacitor/Android static build there is NO local server, so set
// NEXT_PUBLIC_API_BASE_URL to your deployed backend.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const api = (path: string) => `${API_BASE}${path}`;

/** Resale items are one-of-a-kind (qty locked to 1). */
function isResale(product: Product): boolean {
  return product.category === RESALE_CATEGORY;
}

/** Units available for a product (treat missing stock as unlimited). */
function stockOf(product: Product): number {
  return product.stock ?? Number.POSITIVE_INFINITY;
}

/** Whether a product is out of inventory. */
function isSoldOut(product: Product): boolean {
  return stockOf(product) <= 0;
}

const SYNONYMS: Record<string, string> = {
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

const CLOSET_SUGGESTIONS = [
  "vintage",
  "dress",
  "bikini",
  "sequin",
  "coach",
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const money = (n: number) => `$${n.toFixed(2)}`;

function resolveImage(product: Product): string {
  return product.image;
}

function searchProducts(raw: string, source: Product[]): Product[] {
  const q = raw.trim().toLowerCase();
  if (!q) return source;
  const mapped = SYNONYMS[q] ?? q;
  const terms = Array.from(new Set([q, mapped]));
  return source.filter((p) => {
    const hay =
      `${p.name} ${p.category} ${p.description} ${p.condition ?? ""} ${p.brand ?? ""}`.toLowerCase();
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
  const catalog = resaleProducts;

  const [query, setQuery] = React.useState("");
  const [activeQuery, setActiveQuery] = React.useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);

  const [cart, setCart] = React.useState<CartItem[]>([]);
  const cartCount = cart.reduce((n, i) => n + i.qty, 0);
  const handledAdd = React.useRef<string | null>(null);

  const isSearching = activeQuery !== null;

  const results = React.useMemo<Product[]>(() => {
    if (activeQuery !== null) return searchProducts(activeQuery, catalog);
    return [];
  }, [activeQuery, catalog]);

  const runSearch = (term: string) => {
    setQuery(term);
    setActiveQuery(term);
  };

  const clearSearch = () => {
    setActiveQuery(null);
    setQuery("");
  };

  const addToCart = (product: Product, qty: number = 1) => {
    if (isSoldOut(product)) return;
    const resale = isResale(product);
    const cap = resale ? 1 : stockOf(product);
    const amount = Math.max(1, qty);
    setCart((prev) => {
      const found = prev.find((i) => i.product.id === product.id);
      if (found) {
        if (found.qty >= cap) return prev;
        const nextQty = Math.min(found.qty + amount, cap);
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: nextQty } : i
        );
      }
      return [...prev, { product, qty: Math.min(amount, cap) }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product.id !== id) return i;
          if (delta > 0) {
            const cap = isResale(i.product) ? 1 : stockOf(i.product);
            if (i.qty >= cap) return i;
          }
          return { ...i, qty: i.qty + delta };
        })
        .filter((i) => i.qty > 0)
    );
  };

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const addId = params.get("add");
    if (!addId || handledAdd.current === addId) return;
    const product = resaleProducts.find((p) => p.id === addId);
    if (!product) return;
    handledAdd.current = addId;
    addToCart(product);
    if (params.get("checkout") === "1") {
      setCheckoutOpen(true);
    }
  }, []);

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col bg-background pb-12">
      <SiteHeader
        trailing={
          <Button
            variant="ghost"
            size="icon-sm"
            className="haptic relative"
            aria-label="Cart"
            onClick={() => setCheckoutOpen(true)}
          >
            <ShoppingBag />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Button>
        }
      />

      <main className="flex flex-col gap-10 px-5 pt-6">
        <Hero
          query={query}
          setQuery={setQuery}
          onSearch={() => runSearch(query)}
          onSuggestion={runSearch}
        />

        <PoshmarkBanner />

        {isSearching ? (
          <SearchResults
            title={`Results for “${activeQuery}”`}
            results={results}
            onClear={clearSearch}
            onAdd={addToCart}
            failedQuery={activeQuery ?? ""}
          />
        ) : (
          <TheEdit
            products={catalog}
            title="The closet"
            onAdd={addToCart}
          />
        )}
      </main>
      <SiteFooter />

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
          Jengerluxurious · 2nd Chance Resale
        </p>
        <h1 className="font-serif text-4xl leading-[1.05] tracking-tight text-foreground">
          2nd Chance Resale
        </h1>
        <p className="font-serif text-2xl leading-snug tracking-tight text-foreground">
          One-of-a-kind closet finds.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Pre-loved pieces from the Jengerluxurious closet. Condition and
          original price show when we have them.
        </p>
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
          placeholder="Search the closet"
          className="h-10 border-0 bg-transparent px-1 text-base shadow-none ring-0 focus-visible:ring-0"
          aria-label="Search the closet"
        />
        <Button
          type="submit"
          className="haptic h-10 rounded-xl px-5 text-sm font-semibold tracking-wide"
          size="lg"
        >
          Search
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {CLOSET_SUGGESTIONS.map((s) => (
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

function PoshmarkBanner() {
  return (
    <a
      href={CONTACT.poshmarkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="haptic flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3"
    >
      <span className="space-y-0.5">
        <span className="block text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          Also on Poshmark
        </span>
        <span className="block text-sm text-muted-foreground">
          Closet @{CONTACT.poshmarkHandle}
        </span>
      </span>
      <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
    </a>
  );
}

/* ========================================================================== */
/*  Product card + grid                                                        */
/* ========================================================================== */

function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (p: Product) => void;
}) {
  const [added, setAdded] = React.useState(false);
  const soldOut = isSoldOut(product);
  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-opacity",
        soldOut && "opacity-45 grayscale"
      )}
    >
      <Link
        href={`/product/${productSlug(product)}`}
        className="relative aspect-square overflow-hidden bg-secondary"
        aria-label={`View ${product.name}`}
      >
        <ProductImage
          src={resolveImage(product)}
          alt={product.name}
          className={cn(
            "h-full w-full object-cover transition-transform duration-300",
            !soldOut && "group-hover:scale-105"
          )}
        />
        {soldOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-background/90 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
              Sold Out
            </span>
          </span>
        )}
        {product.condition && !soldOut && (
          <span className="absolute top-2 left-2 rounded-full bg-background/85 px-2 py-0.5 text-[9px] font-semibold tracking-[0.12em] text-foreground uppercase backdrop-blur-sm">
            {product.condition}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link
          href={`/product/${productSlug(product)}`}
          className={cn(
            "text-left text-sm font-medium leading-snug line-clamp-2",
            soldOut && "text-muted-foreground"
          )}
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="flex items-baseline gap-1.5">
            <span className="font-serif text-base">{money(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {money(product.originalPrice)}
              </span>
            )}
          </span>
          {soldOut ? (
            <Button
              size="sm"
              variant="outline"
              disabled
              className="h-8 shrink-0 cursor-not-allowed rounded-full px-3 text-[10px] font-semibold tracking-wide opacity-70"
            >
              Sold Out
            </Button>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}

function ProductGrid({
  products,
  onAdd,
}: {
  products: Product[];
  onAdd: (p: Product) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onAdd={onAdd} />
      ))}
    </div>
  );
}

function TheEdit({
  products: items,
  title,
  onAdd,
}: {
  products: Product[];
  title: string;
  onAdd: (p: Product) => void;
}) {
  return (
    <section id="closet" className="space-y-3 scroll-mt-28">
      <h2 className="font-serif text-xl tracking-wide">{title}</h2>
      <ProductGrid products={items} onAdd={onAdd} />
    </section>
  );
}

function SearchResults({
  title,
  results,
  onClear,
  onAdd,
  failedQuery,
}: {
  title: string;
  results: Product[];
  onClear: () => void;
  onAdd: (p: Product) => void;
  failedQuery: string;
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
        <ProductGrid products={results} onAdd={onAdd} />
      ) : (
        <NoResultFallback failedQuery={failedQuery} onBrowse={onClear} />
      )}
    </section>
  );
}

function NoResultFallback({
  failedQuery,
  onBrowse,
}: {
  failedQuery: string;
  onBrowse: () => void;
}) {
  const smsHref = `sms:${CONTACT.phone}?&body=${encodeURIComponent(
    `Hello, I am looking for: ${failedQuery}`
  )}`;
  return (
    <div className="flex flex-col items-center gap-5 rounded-3xl border border-border bg-card px-6 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Search className="size-6" />
      </span>
      <div className="space-y-1">
        <h3 className="font-serif text-2xl tracking-tight">
          No matching listings
        </h3>
        <p className="text-sm text-muted-foreground">
          That search is not in the closet right now. Browse available pieces
          or send us a message.
        </p>
      </div>
      <div className="flex w-full flex-col gap-2.5">
        <Button
          size="lg"
          className="haptic h-12 w-full rounded-xl text-sm font-semibold"
          onClick={onBrowse}
        >
          Browse the closet
        </Button>
        <a
          href={smsHref}
          className="haptic inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <MessageCircle className="size-4" /> Text us
        </a>
      </div>
    </div>
  );
}

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
  const [success, setSuccess] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const subtotal = cart.reduce((n, i) => n + i.product.price * i.qty, 0);
  const shippingFee = shippingFeeForSubtotal(subtotal);
  const tax = 0;
  const total = subtotal + shippingFee + tax;

  React.useEffect(() => {
    if (open) {
      setSuccess(false);
      setError(null);
    }
  }, [open]);

  const finalizeOrder = async (paymentStatus: string) => {
    await fetch(api("/api/checkout"), {
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
        tax,
        subtotal,
        shippingFee,
        total,
        paymentProvider: "square",
        paymentStatus,
        squareCheckoutUrl: SQUARE.checkoutUrl || "",
      }),
    });
  };

  const startSquareCheckout = async () => {
    setError(null);
    if (!name.trim() || !location.trim() || !phone.trim()) {
      setError("Add your name, shipping address, and phone number first.");
      return;
    }
    if (cart.length === 0) {
      setError("Your bag is empty.");
      return;
    }

    setSubmitting(true);
    try {
      const squareRes = await fetch(api("/api/square-checkout"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          subtotal,
          shippingFee,
        }),
      });
      const squareData = await squareRes.json().catch(() => ({}));

      if (!squareRes.ok || !squareData?.checkoutUrl) {
        setError(
          squareData?.error ||
            "Square checkout is not configured. Set NEXT_PUBLIC_SQUARE_CHECKOUT_URL to a Square Payment Link / Online checkout URL. Payment is required — this is not a pay-later hold."
        );
        return;
      }

      await finalizeOrder("square_checkout_opened");
      window.open(squareData.checkoutUrl, "_blank", "noopener,noreferrer");
      setSuccess(true);
      onDone();
    } catch (err) {
      console.error("Square checkout failed:", err);
      setError("We could not start Square checkout. Please try again or text us.");
    } finally {
      setSubmitting(false);
    }
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
              Continue in Square
            </DialogTitle>
            <DialogDescription className="max-w-xs text-base">
              Complete payment in the Square checkout window. Your bag is logged
              with shipping included.
            </DialogDescription>
            <Button
              className="haptic mt-2 h-12 w-full rounded-xl text-sm font-semibold"
              onClick={() => onOpenChange(false)}
            >
              Back to the closet
            </Button>
          </div>
        ) : (
          <div className="no-scrollbar flex max-h-[92vh] flex-col overflow-y-auto">
            <DialogHeader className="border-b border-border px-5 py-4">
              <DialogTitle className="font-serif text-2xl tracking-tight">
                Checkout
              </DialogTitle>
              <DialogDescription>
                Pay with Square — same processor as jengerluxurious.com.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 px-5 py-5">
              {cart.length === 0 ? (
                <p className="rounded-xl bg-secondary px-4 py-6 text-center text-sm text-muted-foreground">
                  Your bag is empty. Add a closet piece first.
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
                          {i.product.originalPrice ? (
                            <span className="ml-1.5 line-through">
                              {money(i.product.originalPrice)}
                            </span>
                          ) : null}
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
                          disabled={isResale(i.product)}
                          onClick={() => updateQty(i.product.id, 1)}
                        >
                          <Plus />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="space-y-1.5 border-t border-border pt-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{money(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {SHIPPING.label}
                      </span>
                      <span className="font-medium">{money(shippingFee)}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {SHIPPING.note}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-serif text-lg">{money(total)}</span>
                    </div>
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
                    placeholder="Recipient name"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="co-location">Shipping address</Label>
                  <Input
                    id="co-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Street, city, state, ZIP"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="co-phone">Phone number</Label>
                  <Input
                    id="co-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Mobile number for order updates"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="co-instructions">
                    Notes{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                  <textarea
                    id="co-instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={3}
                    placeholder="Fit questions or a gift note"
                    className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                  />
                </div>

                {cart.length > 0 && (
                  <SquareCheckoutPanel
                    total={total}
                    submitting={submitting}
                    error={error}
                    onPay={startSquareCheckout}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SquareCheckoutPanel({
  total,
  submitting,
  error,
  onPay,
}: {
  total: number;
  submitting: boolean;
  error: string | null;
  onPay: () => void;
}) {
  const hosted = hasSquareCheckoutLink();
  return (
    <div className="space-y-3">
      <Label>Payment</Label>
      <div className="space-y-2 rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium">Pay with Square</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {hosted
            ? "Opens Square Online checkout / Payment Link to collect card payment (same processor as jengerluxurious.com)."
            : "Square checkout is not configured on this deploy. Set NEXT_PUBLIC_SQUARE_CHECKOUT_URL in .env.local to a Square Payment Link or Online checkout URL (see .env.example). Payment is required — this is not a hold."}
        </p>
        {error && <p className="text-xs text-primary">{error}</p>}
        <Button
          type="button"
          size="lg"
          onClick={onPay}
          disabled={submitting}
          className="haptic h-12 w-full rounded-xl text-base font-semibold"
        >
          {submitting ? (
            <>
              <LoaderCircle className="animate-spin" /> Starting Square…
            </>
          ) : (
            `Pay ${money(total)} with Square`
          )}
        </Button>
      </div>
    </div>
  );
}
