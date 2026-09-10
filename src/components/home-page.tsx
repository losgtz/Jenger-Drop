"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  LoaderCircle,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingBag,
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
import { hasStripePaymentLink } from "@/lib/stripe";
import { SHIPPING, shippingFeeForSubtotal } from "../../data/shipping";
import { productDisplayName, productSlug } from "@/lib/catalog";
import { CONTACT } from "@/lib/contact";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  ActiveFilterChips,
  CatalogFilterBar,
  CatalogFilterPanel,
  CatalogFiltersSheet,
} from "@/components/catalog-filters";
import {
  CATALOG_PAGE_SIZE,
  EMPTY_CATALOG_QUERY,
  activeFilterCount,
  buildFacetModel,
  catalogPageHref,
  describeActiveChips,
  filterCatalog,
  paginateCatalog,
  parseCatalogPage,
  parseCatalogQuery,
  writeCatalogQueryToUrl,
  type CatalogQuery,
} from "@/lib/catalog-query";
import {
  conditionLabel,
  deriveConditionId,
} from "@/lib/taxonomy";
import {
  RESALE_CATEGORY,
  resaleProducts,
  type Product,
} from "../../data/products";
import { isListedSold, SOLD_LABEL } from "@/lib/sold";
import { SoldBadge } from "@/components/sold-badge";

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

function useSoldIds() {
  const [soldIds, setSoldIds] = React.useState<Set<string>>(new Set());
  const [soldReady, setSoldReady] = React.useState(false);

  const refreshSold = React.useCallback(async () => {
    try {
      const response = await fetch(api("/api/sold"), { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      const ids = Array.isArray(data?.ids) ? data.ids.map(String) : [];
      setSoldIds(new Set(ids));
    } catch {
      // Keep last known set; catalog still renders from static stock.
    } finally {
      setSoldReady(true);
    }
  }, []);

  React.useEffect(() => {
    // Load the durable sold registry after mount (client catalog).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch then set
    void refreshSold();
  }, [refreshSold]);

  return { soldIds, soldReady, refreshSold };
}

const QUICK_FILTERS: {
  label: string;
  apply: (query: CatalogQuery) => CatalogQuery;
  isActive: (query: CatalogQuery) => boolean;
}[] = [
  {
    label: "Dresses",
    apply: (query) => ({ ...query, types: ["dresses"] }),
    isActive: (query) => query.types.length === 1 && query.types[0] === "dresses",
  },
  {
    label: "Tops",
    apply: (query) => ({ ...query, types: ["tops"] }),
    isActive: (query) => query.types.length === 1 && query.types[0] === "tops",
  },
  {
    label: "Swim",
    apply: (query) => ({ ...query, types: ["swim"] }),
    isActive: (query) => query.types.length === 1 && query.types[0] === "swim",
  },
  {
    label: "Shoes",
    apply: (query) => ({ ...query, types: ["shoes"] }),
    isActive: (query) => query.types.length === 1 && query.types[0] === "shoes",
  },
  {
    label: "Vintage",
    apply: (query) => ({ ...query, q: "vintage" }),
    isActive: (query) => query.q.trim().toLowerCase() === "vintage",
  },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const money = (n: number) => `$${n.toFixed(2)}`;

function resolveImage(product: Product): string {
  return product.image;
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
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null);
  const current = failedSrc === src ? "/placeholder.svg" : src;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailedSrc(src)}
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

export function HomePage({
  initialQuery = EMPTY_CATALOG_QUERY,
  initialPage = 1,
}: {
  initialQuery?: CatalogQuery;
  initialPage?: number;
}) {
  const [filters, setFilters] = React.useState<CatalogQuery>(initialQuery);
  const [page, setPage] = React.useState(initialPage);
  const [searchDraft, setSearchDraft] = React.useState(initialQuery.q);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);

  const [cart, setCart] = React.useState<CartItem[]>([]);
  const handledAdd = React.useRef<string | null>(null);
  const handledPaid = React.useRef(false);
  const { soldIds, soldReady, refreshSold } = useSoldIds();
  const shoppableCart = React.useMemo(
    () => cart.filter((item) => !isListedSold(item.product, soldIds)),
    [cart, soldIds]
  );
  const cartCount = shoppableCart.reduce((n, i) => n + i.qty, 0);

  const applyFilters = React.useCallback((next: CatalogQuery) => {
    setFilters(next);
    setPage(1);
    setSearchDraft((draft) => (next.q !== filters.q ? next.q : draft));
    writeCatalogQueryToUrl(next, 1);
  }, [filters.q]);

  React.useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const parsed = parseCatalogQuery(params);
      setFilters(parsed);
      setPage(parseCatalogPage(params));
      setSearchDraft(parsed.q);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const facets = React.useMemo(() => buildFacetModel(filters), [filters]);
  const matched = React.useMemo(() => filterCatalog(filters), [filters]);
  const results = React.useMemo(
    () => matched.map((item) => item.product),
    [matched]
  );
  const paged = React.useMemo(
    () => paginateCatalog(results, page, CATALOG_PAGE_SIZE),
    [results, page]
  );

  React.useEffect(() => {
    if (paged.page !== page) {
      // Clamp ?page=999 onto the last real page after filters shrink the set.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync URL to clamped page
      setPage(paged.page);
      writeCatalogQueryToUrl(filters, paged.page);
    }
  }, [filters, page, paged.page]);
  const chips = React.useMemo(
    () => describeActiveChips(filters, facets),
    [filters, facets]
  );
  const filterCount = activeFilterCount(filters);

  const runSearch = (term: string) => {
    applyFilters({ ...filters, q: term.trim() });
  };

  const clearAllFilters = () => {
    applyFilters({ ...EMPTY_CATALOG_QUERY });
  };

  const addToCart = React.useCallback((product: Product, qty: number = 1) => {
    if (isListedSold(product, soldIds)) return;
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
  }, [soldIds]);

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
    if (!soldReady) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "1" && !handledPaid.current) {
      handledPaid.current = true;
      void refreshSold();
    }
    const addId = params.get("add");
    if (!addId || handledAdd.current === addId) return;
    const product = resaleProducts.find((p) => p.id === addId);
    if (!product) return;
    handledAdd.current = addId;
    if (isListedSold(product, soldIds)) return;
    // PDP deep-link (?add=&checkout=) — hydrate bag after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot URL cart seed
    addToCart(product);
    if (params.get("checkout") === "1") {
      setCheckoutOpen(true);
    }
  }, [soldReady, soldIds, refreshSold, addToCart]);

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col bg-background pb-12 lg:max-w-6xl">
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
          query={searchDraft}
          setQuery={setSearchDraft}
          onSearch={() => runSearch(searchDraft)}
          filters={filters}
          onQuickFilter={(next) => applyFilters(next)}
        />

        <section id="closet" className="scroll-mt-28 space-y-4">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-serif text-xl tracking-wide">The closet</h2>
          </div>

          <CatalogFilterBar
            query={filters}
            resultCount={results.length}
            activeCount={filterCount}
            onChange={applyFilters}
            onOpenFilters={() => setFiltersOpen(true)}
          />
          <ActiveFilterChips
            chips={chips}
            query={filters}
            onChange={applyFilters}
            onClearAll={clearAllFilters}
          />

          <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-8">
            <aside className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-2">
              <CatalogFilterPanel
                query={filters}
                facets={facets}
                onChange={applyFilters}
                idPrefix="aside"
              />
            </aside>
            <div>
              {results.length > 0 ? (
                <ProductGrid
                  products={paged.items}
                  onAdd={addToCart}
                  soldIds={soldIds}
                  page={paged.page}
                  total={paged.total}
                  totalPages={paged.totalPages}
                  start={paged.start}
                  end={paged.end}
                  filters={filters}
                  onPageChange={(nextPage) => {
                    setPage(nextPage);
                    writeCatalogQueryToUrl(filters, nextPage);
                  }}
                />
              ) : (
                <NoResultFallback
                  failedQuery={filters.q}
                  onBrowse={clearAllFilters}
                />
              )}
            </div>
          </div>
        </section>

        <CatalogFiltersSheet
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          query={filters}
          facets={facets}
          resultCount={results.length}
          onChange={applyFilters}
          onClearAll={clearAllFilters}
        />
      </main>
      <SiteFooter />

      <CheckoutDrawer
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        cart={shoppableCart}
        updateQty={updateQty}
        onDone={() => setCart([])}
        soldIds={soldIds}
        onDropSold={(ids) =>
          setCart((prev) => prev.filter((item) => !ids.includes(item.product.id)))
        }
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
  filters,
  onQuickFilter,
}: {
  query: string;
  setQuery: (v: string) => void;
  onSearch: () => void;
  filters: CatalogQuery;
  onQuickFilter: (next: CatalogQuery) => void;
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
          One-of-a-kind pieces.
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
        {QUICK_FILTERS.map((chip) => {
          const active = chip.isActive(filters);
          return (
            <button
              key={chip.label}
              type="button"
              aria-pressed={active}
              onClick={() => {
                if (active) {
                  onQuickFilter(
                    chip.label === "Vintage"
                      ? { ...filters, q: "" }
                      : { ...filters, types: [] }
                  );
                  return;
                }
                onQuickFilter(chip.apply(filters));
              }}
              className={cn(
                "haptic rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {chip.label}
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
  onAdd,
  sold,
  priority = false,
}: {
  product: Product;
  onAdd: (p: Product) => void;
  sold: boolean;
  priority?: boolean;
}) {
  const [added, setAdded] = React.useState(false);
  const soldOut = sold;
  const displayName = productDisplayName(product);
  const conditionId = deriveConditionId(product.condition);
  const conditionText = conditionId
    ? conditionLabel(conditionId)
    : product.condition;
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
        aria-label={`View ${displayName}`}
      >
        <ProductImage
          src={resolveImage(product)}
          alt={displayName}
          priority={priority}
          className={cn(
            "h-full w-full object-cover transition-transform duration-300",
            !soldOut && "group-hover:scale-105"
          )}
        />
        {soldOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50">
            <SoldBadge />
          </span>
        )}
        {conditionText && !soldOut && (
          <span className="absolute top-2 left-2 rounded-full bg-background/85 px-2 py-0.5 text-[9px] font-semibold tracking-[0.12em] text-foreground uppercase backdrop-blur-sm">
            {conditionText}
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
          {displayName}
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
              {SOLD_LABEL}
            </Button>
          ) : (
            <Button
              size="icon-sm"
              className="haptic rounded-full"
              aria-label={`Add ${displayName}`}
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
  soldIds,
  page,
  total,
  totalPages,
  start,
  end,
  filters,
  onPageChange,
}: {
  products: Product[];
  onAdd: (p: Product) => void;
  soldIds: ReadonlySet<string>;
  page: number;
  total: number;
  totalPages: number;
  start: number;
  end: number;
  filters: CatalogQuery;
  onPageChange: (page: number) => void;
}) {
  const showingFrom = total === 0 ? 0 : start + 1;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {products.map((p, index) => (
          <ProductCard
            key={p.id}
            product={p}
            onAdd={onAdd}
            sold={isListedSold(p, soldIds)}
            priority={index < 4}
          />
        ))}
      </div>
      <nav
        aria-label="Closet pages"
        className="flex flex-col items-center gap-3 pt-1"
      >
        <p className="text-xs text-muted-foreground">
          Showing {showingFrom}–{end} of {total}
        </p>
        {totalPages > 1 && (
          <div className="flex w-full items-center justify-center gap-2">
            {page > 1 ? (
              <Link
                href={`${catalogPageHref(filters, page - 1)}#closet`}
                className="haptic inline-flex h-10 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium"
                onClick={(event) => {
                  event.preventDefault();
                  onPageChange(page - 1);
                  document.getElementById("closet")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                Previous
              </Link>
            ) : (
              <span className="inline-flex h-10 items-center justify-center rounded-xl border border-transparent px-4 text-sm text-muted-foreground">
                Previous
              </span>
            )}
            {page < totalPages ? (
              <Link
                href={`${catalogPageHref(filters, page + 1)}#closet`}
                className="haptic inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground sm:flex-none"
                onClick={(event) => {
                  event.preventDefault();
                  onPageChange(page + 1);
                  document.getElementById("closet")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                More pieces
              </Link>
            ) : (
              <span className="inline-flex h-10 items-center justify-center rounded-xl border border-transparent px-4 text-sm text-muted-foreground">
                End of closet
              </span>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}

function NoResultFallback({
  failedQuery,
  onBrowse,
}: {
  failedQuery: string;
  onBrowse: () => void;
}) {
  const lookingFor = failedQuery.trim() || "a piece from the closet";
  const smsHref = `sms:${CONTACT.phone}?&body=${encodeURIComponent(
    `Hello, I am looking for: ${lookingFor}`
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
          Nothing in the closet matches these filters right now. Clear them
          to browse available pieces, or send us a message.
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
  soldIds,
  onDropSold,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  updateQty: (id: string, delta: number) => void;
  onDone: () => void;
  soldIds: ReadonlySet<string>;
  onDropSold: (ids: string[]) => void;
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset drawer status when opened
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
        paymentProvider: "stripe",
        paymentStatus,
        stripeCheckoutUrl: "",
      }),
    });
  };

  const startStripeCheckout = async () => {
    setError(null);
    if (!name.trim() || !location.trim() || !phone.trim()) {
      setError("Add your name, shipping address, and phone number first.");
      return;
    }
    if (cart.length === 0) {
      setError("Your bag is empty.");
      return;
    }
    const soldInBag = cart
      .filter((item) => isListedSold(item.product, soldIds))
      .map((item) => item.product.id);
    if (soldInBag.length > 0) {
      onDropSold(soldInBag);
      setError("A piece in your bag has sold and was removed.");
      return;
    }

    setSubmitting(true);
    try {
      const stripeRes = await fetch(api("/api/stripe-checkout"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          subtotal,
          shippingFee,
          name,
          location,
          phone,
          instructions,
          items: cart.map((i) => ({
            id: i.product.id,
            name: i.product.name,
            price: i.product.price,
            qty: i.qty,
          })),
        }),
      });
      const stripeData = await stripeRes.json().catch(() => ({}));

      if (stripeRes.status === 409) {
        const rejected = Array.isArray(stripeData?.soldIds)
          ? stripeData.soldIds.map(String)
          : [];
        if (rejected.length > 0) onDropSold(rejected);
        setError(
          stripeData?.error ||
            "A piece in your bag has sold and was removed."
        );
        return;
      }

      if (!stripeRes.ok || !stripeData?.checkoutUrl) {
        setError(
          stripeData?.error ||
            "Stripe checkout is not configured. Set STRIPE_SECRET_KEY or NEXT_PUBLIC_STRIPE_PAYMENT_LINK (see .env.example). Payment is required."
        );
        return;
      }

      await finalizeOrder("stripe_checkout_opened");
      // eslint-disable-next-line react-hooks/immutability -- navigate to Stripe Checkout
      window.location.href = stripeData.checkoutUrl as string;
      setSuccess(true);
      onDone();
    } catch (err) {
      console.error("Stripe checkout failed:", err);
      setError("We could not start Stripe checkout. Please try again or text us.");
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
              Continue in Stripe
            </DialogTitle>
            <DialogDescription className="max-w-xs text-base">
              Complete payment in Stripe Checkout. Your order has been
              recorded, including shipping.
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
                Pay with Stripe. US shipping is added as a separate line.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 px-5 py-5">
              {cart.length === 0 ? (
                <p className="rounded-xl bg-secondary px-4 py-6 text-center text-sm text-muted-foreground">
                  Your bag is empty. Add an item from the shop to continue.
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
                          {productDisplayName(i.product)}
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
                  <StripeCheckoutPanel
                    total={total}
                    submitting={submitting}
                    error={error}
                    onPay={startStripeCheckout}
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

function StripeCheckoutPanel({
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
  const hosted = hasStripePaymentLink();
  return (
    <div className="space-y-3">
      <Label>Payment</Label>
      <div className="space-y-2 rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium">Pay with Stripe</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {hosted
            ? "Opens Stripe Checkout or your Payment Link to collect card payment."
            : "Stripe checkout is not configured on this deploy. Set STRIPE_SECRET_KEY (Checkout Session) or NEXT_PUBLIC_STRIPE_PAYMENT_LINK in Vercel / .env.local (see .env.example). Payment is required."}
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
              <LoaderCircle className="animate-spin" /> Starting Stripe…
            </>
          ) : (
            `Pay ${money(total)} with Stripe`
          )}
        </Button>
      </div>
    </div>
  );
}
