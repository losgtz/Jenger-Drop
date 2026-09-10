"use client";

import * as React from "react";
import { SlidersHorizontal, X } from "lucide-react";

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
  PRICE_PRESETS,
  SORT_OPTIONS,
  activeFilterCount,
  matchingPricePreset,
  toggleListValue,
  type CatalogQuery,
  type FacetOption,
  type SizeFacetGroup,
} from "@/lib/catalog-query";
import { COLOR_SWATCH } from "@/lib/taxonomy";

const sheetClass =
  "top-auto bottom-0 left-1/2 flex max-h-[92vh] w-full max-w-md -translate-x-1/2 translate-y-0 flex-col gap-0 rounded-b-none rounded-t-3xl p-0 sm:max-w-md";

type FilterChange = (next: CatalogQuery) => void;

type Facets = {
  types: FacetOption[];
  brands: FacetOption[];
  sizes: SizeFacetGroup[];
  conditions: FacetOption[];
  colors: FacetOption[];
};

export function CatalogFilterPanel({
  query,
  facets,
  onChange,
  idPrefix,
}: {
  query: CatalogQuery;
  facets: Facets;
  onChange: FilterChange;
  idPrefix: string;
}) {
  const [brandSearch, setBrandSearch] = React.useState("");
  const brandQ = brandSearch.trim().toLowerCase();
  const brands = React.useMemo(() => {
    if (!brandQ) return facets.brands;
    return facets.brands.filter((b) => b.label.toLowerCase().includes(brandQ));
  }, [facets.brands, brandQ]);

  const activePreset = matchingPricePreset(query);

  return (
    <div className="space-y-7">
      {facets.types.length > 0 && (
        <FacetBlock title="Shop by type" hint="Garment type from the listing title">
          <ul className="space-y-1">
            {facets.types.map((opt) => (
              <CheckRow
                key={opt.id}
                id={`${idPrefix}-type-${opt.id}`}
                label={opt.label}
                count={opt.count}
                checked={query.types.includes(opt.id as CatalogQuery["types"][number])}
                onChange={() =>
                  onChange({
                    ...query,
                    types: toggleListValue(
                      query.types,
                      opt.id as CatalogQuery["types"][number]
                    ),
                  })
                }
              />
            ))}
          </ul>
        </FacetBlock>
      )}

      {facets.brands.length > 0 && (
        <FacetBlock title="Brand">
          <Label htmlFor={`${idPrefix}-brand-search`} className="sr-only">
            Search brands
          </Label>
          <Input
            id={`${idPrefix}-brand-search`}
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            placeholder="Search brands"
            className="mb-2 h-9"
          />
          <ul className="no-scrollbar max-h-56 space-y-1 overflow-y-auto pr-1">
            {brands.length === 0 ? (
              <li className="px-1 py-2 text-xs text-muted-foreground">
                No brands match that search.
              </li>
            ) : (
              brands.map((opt) => (
                <CheckRow
                  key={opt.id}
                  id={`${idPrefix}-brand-${opt.id}`}
                  label={opt.label}
                  count={opt.count}
                  checked={query.brands.includes(opt.id)}
                  onChange={() =>
                    onChange({
                      ...query,
                      brands: toggleListValue(query.brands, opt.id),
                    })
                  }
                />
              ))
            )}
          </ul>
        </FacetBlock>
      )}

      {facets.sizes.length > 0 && (
        <FacetBlock title="Size">
          <div className="space-y-3">
            {facets.sizes.map((group) => (
              <div key={group.id} className="space-y-1.5">
                <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.options.map((opt) => (
                    <TogglePill
                      key={opt.id}
                      pressed={query.sizes.includes(opt.id)}
                      onClick={() =>
                        onChange({
                          ...query,
                          sizes: toggleListValue(query.sizes, opt.id),
                        })
                      }
                    >
                      {opt.label}
                    </TogglePill>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FacetBlock>
      )}

      {facets.conditions.length > 0 && (
        <FacetBlock title="Condition">
          <div className="flex flex-wrap gap-1.5">
            {facets.conditions.map((opt) => (
              <TogglePill
                key={opt.id}
                pressed={query.conditions.includes(
                  opt.id as CatalogQuery["conditions"][number]
                )}
                onClick={() =>
                  onChange({
                    ...query,
                    conditions: toggleListValue(
                      query.conditions,
                      opt.id as CatalogQuery["conditions"][number]
                    ),
                  })
                }
              >
                {opt.label}
              </TogglePill>
            ))}
          </div>
        </FacetBlock>
      )}

      {facets.colors.length > 0 && (
        <FacetBlock title="Color" hint="From the listing title when named">
          <div className="flex flex-wrap gap-1.5">
            {facets.colors.map((opt) => {
              const swatch = COLOR_SWATCH[opt.id];
              const pressed = query.colors.includes(opt.id);
              return (
                <TogglePill
                  key={opt.id}
                  pressed={pressed}
                  onClick={() =>
                    onChange({
                      ...query,
                      colors: toggleListValue(query.colors, opt.id),
                    })
                  }
                >
                  <span
                    aria-hidden
                    className="size-2.5 rounded-full ring-1 ring-foreground/20"
                    style={{
                      background: swatch ?? "#888",
                    }}
                  />
                  {opt.label}
                </TogglePill>
              );
            })}
          </div>
        </FacetBlock>
      )}

      <FacetBlock title="Price">
        <div className="flex flex-wrap gap-1.5">
          {PRICE_PRESETS.map((preset) => (
            <TogglePill
              key={preset.id}
              pressed={activePreset === preset.id}
              onClick={() =>
                onChange({
                  ...query,
                  min: activePreset === preset.id ? null : preset.min === 0 ? null : preset.min,
                  max: activePreset === preset.id ? null : preset.max,
                })
              }
            >
              {preset.label}
            </TogglePill>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor={`${idPrefix}-min`} className="text-xs text-muted-foreground">
              Min
            </Label>
            <Input
              id={`${idPrefix}-min`}
              type="number"
              inputMode="decimal"
              min={0}
              step="1"
              placeholder="0"
              className="h-9"
              value={query.min ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                const n = Number(value);
                onChange({
                  ...query,
                  min: value === "" || !Number.isFinite(n) ? null : n,
                });
              }}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${idPrefix}-max`} className="text-xs text-muted-foreground">
              Max
            </Label>
            <Input
              id={`${idPrefix}-max`}
              type="number"
              inputMode="decimal"
              min={0}
              step="1"
              placeholder="Any"
              className="h-9"
              value={query.max ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                const n = Number(value);
                onChange({
                  ...query,
                  max: value === "" || !Number.isFinite(n) ? null : n,
                });
              }}
            />
          </div>
        </div>
      </FacetBlock>
    </div>
  );
}

export function CatalogFilterBar({
  query,
  resultCount,
  activeCount,
  onChange,
  onOpenFilters,
}: {
  query: CatalogQuery;
  resultCount: number;
  activeCount: number;
  onChange: FilterChange;
  onOpenFilters: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Button
        type="button"
        variant="outline"
        className="haptic h-9 gap-2 rounded-full px-3 lg:hidden"
        onClick={onOpenFilters}
        aria-haspopup="dialog"
      >
        <SlidersHorizontal className="size-3.5" />
        Filters
        {activeCount > 0 && (
          <span className="rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </Button>
      <p
        className="text-sm text-muted-foreground"
        aria-live="polite"
      >
        <span className="font-medium text-foreground">{resultCount}</span>
        {resultCount === 1 ? " piece" : " pieces"}
      </p>
      <div className="ml-auto flex items-center gap-2">
        <Label htmlFor="catalog-sort" className="sr-only">
          Sort
        </Label>
        <select
          id="catalog-sort"
          value={query.sort}
          onChange={(e) =>
            onChange({
              ...query,
              sort: e.target.value as CatalogQuery["sort"],
            })
          }
          className="h-9 rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function ActiveFilterChips({
  chips,
  onChange,
  query,
  onClearAll,
}: {
  chips: { key: string; label: string; onRemove: (query: CatalogQuery) => CatalogQuery }[];
  query: CatalogQuery;
  onChange: FilterChange;
  onClearAll: () => void;
}) {
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onChange(chip.onRemove(query))}
          className="haptic inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/40"
        >
          {chip.label}
          <X className="size-3 text-muted-foreground" />
          <span className="sr-only">Remove {chip.label}</span>
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}

export function CatalogFiltersSheet({
  open,
  onOpenChange,
  query,
  facets,
  resultCount,
  onChange,
  onClearAll,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: CatalogQuery;
  facets: Facets;
  resultCount: number;
  onChange: FilterChange;
  onClearAll: () => void;
}) {
  const count = activeFilterCount(query);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(sheetClass, "overflow-hidden")}
        showCloseButton
      >
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="font-serif text-2xl tracking-tight">
            Filters
          </DialogTitle>
          <DialogDescription>
            Narrow the closet. {resultCount}{" "}
            {resultCount === 1 ? "piece" : "pieces"} match.
          </DialogDescription>
        </DialogHeader>
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <CatalogFilterPanel
            query={query}
            facets={facets}
            onChange={onChange}
            idPrefix="sheet"
          />
        </div>
        <div className="flex items-center gap-2 border-t border-border px-5 py-3">
          <Button
            type="button"
            variant="ghost"
            className="haptic"
            onClick={onClearAll}
            disabled={count === 0 && query.sort === "featured"}
          >
            Clear all
          </Button>
          <Button
            type="button"
            className="haptic ml-auto h-10 rounded-xl px-5 text-sm font-semibold"
            onClick={() => onOpenChange(false)}
          >
            Show {resultCount} {resultCount === 1 ? "piece" : "pieces"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FacetBlock({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="font-serif text-base tracking-wide text-foreground">
        {title}
      </legend>
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
      {children}
    </fieldset>
  );
}

function CheckRow({
  id,
  label,
  count,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <li>
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1 text-sm hover:bg-secondary/60"
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="size-3.5 rounded border-border accent-primary"
        />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <span className="text-[11px] text-muted-foreground tabular-nums">{count}</span>
      </label>
    </li>
  );
}

function TogglePill({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "haptic inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        pressed
          ? "border-primary bg-primary/15 text-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
