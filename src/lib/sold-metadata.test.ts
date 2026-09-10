import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { packProductIds, unpackProductIds } from "./sold-metadata.ts";
import { isListedSold, schemaAvailability, SOLD_LABEL } from "./sold.ts";
import type { Product } from "../../data/products.ts";

function stub(partial: Partial<Product> & Pick<Product, "id">): Product {
  return {
    name: "Test piece",
    price: 10,
    image: "/placeholder.svg",
    category: "2nd Chance Resale",
    sizes: [],
    description: "Test",
    stock: 1,
    ...partial,
  };
}

describe("sold metadata", () => {
  it("round-trips product ids", () => {
    const ids = ["posh_001_abc", "posh_002_def"];
    const packed = packProductIds(ids);
    assert.equal(packed.productIds, "posh_001_abc,posh_002_def");
    assert.deepEqual(unpackProductIds(packed), ids);
  });

  it("chunks long id lists under Stripe's 500-char cap", () => {
    const ids = Array.from({ length: 40 }, (_, i) => `posh_${String(i).padStart(3, "0")}_${"x".repeat(24)}`);
    const packed = packProductIds(ids);
    const values = Object.values(packed);
    assert.ok(values.length >= 2);
    for (const value of values) {
      assert.ok(value.length <= 490);
    }
    assert.deepEqual(unpackProductIds(packed), ids);
  });

  it("dedupes empty and repeated ids", () => {
    assert.deepEqual(unpackProductIds(packProductIds(["a", "a", "", "b"])), [
      "a",
      "b",
    ]);
  });
});

describe("isListedSold", () => {
  it("uses the Sold label for one-of-a-kind copy", () => {
    assert.equal(SOLD_LABEL, "Sold");
  });

  it("treats registry hits as sold even when stock is 1", () => {
    const product = stub({ id: "posh_001_abc", stock: 1 });
    assert.equal(isListedSold(product, new Set(["posh_001_abc"])), true);
    assert.equal(isListedSold(product, new Set()), false);
  });

  it("treats static stock 0 as sold", () => {
    const product = stub({ id: "posh_009_xyz", stock: 0 });
    assert.equal(isListedSold(product, new Set()), true);
  });

  it("maps sold state to Product schema availability", () => {
    assert.equal(schemaAvailability(false), "https://schema.org/InStock");
    assert.equal(schemaAvailability(true), "https://schema.org/OutOfStock");
  });
});
