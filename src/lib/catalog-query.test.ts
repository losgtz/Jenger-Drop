import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CATALOG_PAGE_SIZE,
  paginateCatalog,
  parseCatalogPageValue,
} from "./catalog-page.ts";

describe("closet pagination", () => {
  it("keeps the first page small enough for the homepage HTML payload", () => {
    assert.equal(CATALOG_PAGE_SIZE, 24);
    const items = Array.from({ length: 955 }, (_, i) => i);
    const first = paginateCatalog(items, 1);
    assert.equal(first.items.length, 24);
    assert.equal(first.start, 0);
    assert.equal(first.end, 24);
    assert.equal(first.totalPages, Math.ceil(955 / 24));

    const second = paginateCatalog(items, 2);
    assert.deepEqual(second.items, items.slice(24, 48));
  });

  it("clamps out-of-range pages", () => {
    assert.equal(parseCatalogPageValue("0"), 1);
    assert.equal(parseCatalogPageValue("abc"), 1);
    assert.equal(parseCatalogPageValue("3"), 3);

    const empty = paginateCatalog([], 4);
    assert.equal(empty.page, 1);
    assert.equal(empty.items.length, 0);
  });
});
