import {
  APPAREL_TYPES,
  catalogItems,
  CONDITIONS,
  SIZE_GROUPS,
  UNBRANDED_ID,
  conditionLabel,
  searchMatches,
  type ApparelTypeId,
  type CatalogItem,
  type ConditionId,
  type SizeGroupId,
} from "@/lib/taxonomy";
import { parseCatalogPageValue } from "@/lib/catalog-page";

export { CATALOG_PAGE_SIZE, paginateCatalog } from "@/lib/catalog-page";

export const SORT_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "brand-asc", label: "Brand A–Z" },
  { id: "newest", label: "Newest" },
] as const;

export type SortId = (typeof SORT_OPTIONS)[number]["id"];

export const PRICE_PRESETS = [
  { id: "under-25", label: "Under $25", min: 0, max: 24.99 },
  { id: "25-50", label: "$25–50", min: 25, max: 50 },
  { id: "50-100", label: "$50–100", min: 50, max: 100 },
  { id: "100-200", label: "$100–200", min: 100, max: 200 },
  { id: "200-plus", label: "$200+", min: 200, max: null },
] as const;

export type CatalogQuery = {
  q: string;
  types: ApparelTypeId[];
  brands: string[];
  sizes: string[];
  conditions: ConditionId[];
  colors: string[];
  min: number | null;
  max: number | null;
  sort: SortId;
};

export const EMPTY_CATALOG_QUERY: CatalogQuery = {
  q: "",
  types: [],
  brands: [],
  sizes: [],
  conditions: [],
  colors: [],
  min: null,
  max: null,
  sort: "featured",
};

const FILTER_KEYS = [
  "q",
  "type",
  "brand",
  "size",
  "condition",
  "color",
  "min",
  "max",
  "sort",
  "page",
] as const;

const TYPE_IDS = new Set<string>(APPAREL_TYPES.map((t) => t.id));
const CONDITION_IDS = new Set<string>(CONDITIONS.map((c) => c.id));
const SORT_IDS = new Set<string>(SORT_OPTIONS.map((s) => s.id));

export type SearchParamSource =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

function readParam(source: SearchParamSource, key: string): string {
  if (source instanceof URLSearchParams) {
    return source.get(key) ?? "";
  }
  const value = source[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function splitList(raw: string): string[] {
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseMoney(raw: string): number | null {
  if (!raw.trim()) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export function parseCatalogQuery(source: SearchParamSource): CatalogQuery {
  const types = splitList(readParam(source, "type")).filter((id): id is ApparelTypeId =>
    TYPE_IDS.has(id)
  );
  const conditions = splitList(readParam(source, "condition")).filter(
    (id): id is ConditionId => CONDITION_IDS.has(id)
  );
  const sortRaw = readParam(source, "sort");
  const sort: SortId = SORT_IDS.has(sortRaw) ? (sortRaw as SortId) : "featured";

  return {
    q: readParam(source, "q").trim(),
    types,
    brands: splitList(readParam(source, "brand")),
    sizes: splitList(readParam(source, "size")),
    conditions,
    colors: splitList(readParam(source, "color")),
    min: parseMoney(readParam(source, "min")),
    max: parseMoney(readParam(source, "max")),
    sort,
  };
}

export function parseCatalogPage(source: SearchParamSource): number {
  return parseCatalogPageValue(readParam(source, "page"));
}

function csv(values: string[]): string | null {
  return values.length ? values.join(",") : null;
}

/** Write filter params onto an existing URLSearchParams, preserving add/checkout. */
export function applyQueryToSearchParams(
  params: URLSearchParams,
  query: CatalogQuery,
  page = 1
): URLSearchParams {
  for (const key of FILTER_KEYS) params.delete(key);

  const set = (key: string, value: string | null) => {
    if (value) params.set(key, value);
  };

  set("q", query.q.trim() || null);
  set("type", csv(query.types));
  set("brand", csv(query.brands));
  set("size", csv(query.sizes));
  set("condition", csv(query.conditions));
  set("color", csv(query.colors));
  set("min", query.min != null ? String(query.min) : null);
  set("max", query.max != null ? String(query.max) : null);
  set("sort", query.sort === "featured" ? null : query.sort);
  if (page > 1) params.set("page", String(page));
  return params;
}

export function catalogQueryToSearch(
  query: CatalogQuery,
  currentSearch = "",
  page = 1
): string {
  const params = new URLSearchParams(currentSearch);
  applyQueryToSearchParams(params, query, page);
  return params.toString();
}

export function catalogPageHref(query: CatalogQuery, page: number): string {
  const qs = catalogQueryToSearch(query, "", page);
  return qs ? `/?${qs}` : "/";
}

export function writeCatalogQueryToUrl(query: CatalogQuery, page = 1): void {
  if (typeof window === "undefined") return;
  const qs = catalogQueryToSearch(query, window.location.search, page);
  const next = qs ? `?${qs}` : window.location.pathname || "/";
  window.history.replaceState(null, "", next);
}

export function itemMatchesQuery(item: CatalogItem, query: CatalogQuery): boolean {
  if (query.q && !searchMatches(item, query.q)) return false;
  if (query.types.length && !query.types.includes(item.apparelType)) return false;
  if (query.brands.length && !query.brands.includes(item.brandId)) return false;
  if (query.sizes.length && !query.sizes.some((id) => item.sizeIds.includes(id))) {
    return false;
  }
  if (query.conditions.length) {
    if (!item.conditionId || !query.conditions.includes(item.conditionId)) {
      return false;
    }
  }
  if (query.colors.length && !query.colors.some((id) => item.colorIds.includes(id))) {
    return false;
  }
  if (query.min != null && item.product.price < query.min) return false;
  if (query.max != null && item.product.price > query.max) return false;
  return true;
}

function compareBrand(a: CatalogItem, b: CatalogItem): number {
  const aUn = a.brandId === UNBRANDED_ID;
  const bUn = b.brandId === UNBRANDED_ID;
  if (aUn !== bUn) return aUn ? 1 : -1;
  return a.brandLabel.localeCompare(b.brandLabel, "en", { sensitivity: "base" });
}

export function sortCatalogItems(items: CatalogItem[], sort: SortId): CatalogItem[] {
  const next = items.slice();
  switch (sort) {
    case "price-asc":
      next.sort((a, b) => a.product.price - b.product.price);
      break;
    case "price-desc":
      next.sort((a, b) => b.product.price - a.product.price);
      break;
    case "brand-asc":
      next.sort(compareBrand);
      break;
    case "newest":
      next.sort((a, b) => a.newestIndex - b.newestIndex);
      break;
    case "featured":
    default:
      break;
  }
  return next;
}

export function filterCatalog(query: CatalogQuery, source = catalogItems): CatalogItem[] {
  const matched = source.filter((item) => itemMatchesQuery(item, query));
  return sortCatalogItems(matched, query.sort);
}

export function hasActiveFilters(query: CatalogQuery): boolean {
  return (
    query.q.trim().length > 0 ||
    query.types.length > 0 ||
    query.brands.length > 0 ||
    query.sizes.length > 0 ||
    query.conditions.length > 0 ||
    query.colors.length > 0 ||
    query.min != null ||
    query.max != null ||
    query.sort !== "featured"
  );
}

export function activeFilterCount(query: CatalogQuery): number {
  return (
    (query.q.trim() ? 1 : 0) +
    query.types.length +
    query.brands.length +
    query.sizes.length +
    query.conditions.length +
    query.colors.length +
    (query.min != null || query.max != null ? 1 : 0)
  );
}

export type FacetOption = {
  id: string;
  label: string;
  count: number;
};

export type SizeFacetGroup = {
  id: SizeGroupId;
  label: string;
  options: FacetOption[];
};

function countMatching(
  items: CatalogItem[],
  predicate: (item: CatalogItem) => boolean
): number {
  let n = 0;
  for (const item of items) {
    if (predicate(item)) n += 1;
  }
  return n;
}

function without<K extends keyof CatalogQuery>(
  query: CatalogQuery,
  key: K,
  empty: CatalogQuery[K]
): CatalogQuery {
  return { ...query, [key]: empty };
}

export function buildFacetModel(query: CatalogQuery, source = catalogItems) {
  const typeBase = source.filter((item) =>
    itemMatchesQuery(item, without(query, "types", []))
  );
  const types: FacetOption[] = APPAREL_TYPES.map((type) => ({
    id: type.id,
    label: type.label,
    count: countMatching(typeBase, (item) => item.apparelType === type.id),
  })).filter((opt) => opt.count > 0 || query.types.includes(opt.id as ApparelTypeId));

  const brandBase = source.filter((item) =>
    itemMatchesQuery(item, without(query, "brands", []))
  );
  const brandCounts = new Map<string, { label: string; count: number }>();
  for (const item of brandBase) {
    const prev = brandCounts.get(item.brandId);
    if (prev) prev.count += 1;
    else brandCounts.set(item.brandId, { label: item.brandLabel, count: 1 });
  }
  const brands: FacetOption[] = Array.from(brandCounts, ([id, meta]) => ({
    id,
    label: meta.label,
    count: meta.count,
  })).sort((a, b) => {
    if (a.id === UNBRANDED_ID) return 1;
    if (b.id === UNBRANDED_ID) return -1;
    return b.count - a.count || a.label.localeCompare(b.label, "en");
  });

  const sizeBase = source.filter((item) =>
    itemMatchesQuery(item, without(query, "sizes", []))
  );
  const sizeCounts = new Map<string, { label: string; group: SizeGroupId; count: number }>();
  for (const item of sizeBase) {
    for (const size of item.sizes) {
      const prev = sizeCounts.get(size.id);
      if (prev) prev.count += 1;
      else sizeCounts.set(size.id, { label: size.label, group: size.group, count: 1 });
    }
  }
  const sizes: SizeFacetGroup[] = SIZE_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    options: Array.from(sizeCounts)
      .filter(([, meta]) => meta.group === group.id)
      .map(([id, meta]) => ({ id, label: meta.label, count: meta.count }))
      .filter((opt) => opt.count > 0 || query.sizes.includes(opt.id))
      .sort((a, b) => sizeLabelSort(group.id, a, b)),
  })).filter((group) => group.options.length > 0);

  const conditionBase = source.filter((item) =>
    itemMatchesQuery(item, without(query, "conditions", []))
  );
  const conditions: FacetOption[] = CONDITIONS.map((condition) => ({
    id: condition.id,
    label: condition.label,
    count: countMatching(
      conditionBase,
      (item) => item.conditionId === condition.id
    ),
  })).filter(
    (opt) => opt.count > 0 || query.conditions.includes(opt.id as ConditionId)
  );

  const colorBase = source.filter((item) =>
    itemMatchesQuery(item, without(query, "colors", []))
  );
  const colorCounts = new Map<string, { label: string; count: number }>();
  for (const item of colorBase) {
    for (const color of item.colors) {
      const prev = colorCounts.get(color.id);
      if (prev) prev.count += 1;
      else colorCounts.set(color.id, { label: color.label, count: 1 });
    }
  }
  const colors: FacetOption[] = Array.from(colorCounts, ([id, meta]) => ({
    id,
    label: meta.label,
    count: meta.count,
  }))
    .filter((opt) => opt.count > 0 || query.colors.includes(opt.id))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "en"));

  return { types, brands, sizes, conditions, colors };
}

function sizeLabelSort(group: SizeGroupId, a: FacetOption, b: FacetOption): number {
  if (group === "letter") {
    const order = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
    return order.indexOf(a.label) - order.indexOf(b.label);
  }
  const aNum = Number.parseFloat(a.label);
  const bNum = Number.parseFloat(b.label);
  if (Number.isFinite(aNum) && Number.isFinite(bNum) && aNum !== bNum) {
    return aNum - bNum;
  }
  return a.label.localeCompare(b.label, "en", { numeric: true });
}

export type ActiveChip = {
  key: string;
  label: string;
  onRemove: (query: CatalogQuery) => CatalogQuery;
};

export function describeActiveChips(
  query: CatalogQuery,
  facets: ReturnType<typeof buildFacetModel>
): ActiveChip[] {
  const chips: ActiveChip[] = [];
  const brandLabel = (id: string) =>
    facets.brands.find((b) => b.id === id)?.label ?? id;
  const sizeLabel = (id: string) => {
    for (const group of facets.sizes) {
      const found = group.options.find((opt) => opt.id === id);
      if (found) return found.label;
    }
    return id;
  };
  const colorLabel = (id: string) =>
    facets.colors.find((c) => c.id === id)?.label ?? id;
  const typeLabel = (id: string) =>
    APPAREL_TYPES.find((t) => t.id === id)?.label ?? id;

  if (query.q.trim()) {
    chips.push({
      key: "q",
      label: `“${query.q.trim()}”`,
      onRemove: (q) => ({ ...q, q: "" }),
    });
  }
  for (const id of query.types) {
    chips.push({
      key: `type:${id}`,
      label: typeLabel(id),
      onRemove: (q) => ({ ...q, types: q.types.filter((t) => t !== id) }),
    });
  }
  for (const id of query.brands) {
    chips.push({
      key: `brand:${id}`,
      label: brandLabel(id),
      onRemove: (q) => ({ ...q, brands: q.brands.filter((b) => b !== id) }),
    });
  }
  for (const id of query.sizes) {
    chips.push({
      key: `size:${id}`,
      label: `Size ${sizeLabel(id)}`,
      onRemove: (q) => ({ ...q, sizes: q.sizes.filter((s) => s !== id) }),
    });
  }
  for (const id of query.conditions) {
    chips.push({
      key: `condition:${id}`,
      label: conditionLabel(id),
      onRemove: (q) => ({
        ...q,
        conditions: q.conditions.filter((c) => c !== id),
      }),
    });
  }
  for (const id of query.colors) {
    chips.push({
      key: `color:${id}`,
      label: colorLabel(id),
      onRemove: (q) => ({ ...q, colors: q.colors.filter((c) => c !== id) }),
    });
  }
  if (query.min != null || query.max != null) {
    const min = query.min != null ? `$${query.min}` : "";
    const max = query.max != null ? `$${query.max}` : "";
    const label =
      query.min != null && query.max != null
        ? `${min}–${max}`
        : query.min != null
          ? `${min}+`
          : `Up to ${max}`;
    chips.push({
      key: "price",
      label,
      onRemove: (q) => ({ ...q, min: null, max: null }),
    });
  }
  return chips;
}

export function toggleListValue<T extends string>(list: T[], id: T): T[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function matchingPricePreset(query: CatalogQuery): string | null {
  for (const preset of PRICE_PRESETS) {
    const min = preset.min === 0 ? query.min == null || query.min === 0 : query.min === preset.min;
    const max = query.max === preset.max;
    if (min && max) return preset.id;
  }
  return null;
}
