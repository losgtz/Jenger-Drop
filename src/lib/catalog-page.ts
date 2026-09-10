/** Closet cards (and images) rendered in one homepage HTML payload. */
export const CATALOG_PAGE_SIZE = 24;

export function parseCatalogPageValue(raw: string): number {
  const n = Number.parseInt(raw, 10);
  if (!Number.isInteger(n) || n < 1) return 1;
  return n;
}

export function paginateCatalog<T>(
  items: T[],
  page: number,
  pageSize = CATALOG_PAGE_SIZE
): {
  page: number;
  total: number;
  totalPages: number;
  start: number;
  end: number;
  items: T[];
} {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize;
  return {
    page: safePage,
    total,
    totalPages,
    start,
    end: Math.min(start + pageSize, total),
    items: items.slice(start, start + pageSize),
  };
}
