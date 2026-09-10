import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  legacyProductSlug,
  productDisplayName,
  productSeoTitle,
  productSlug,
  slugify,
  stripSoldOutTitleMarkers,
} from "./product-slug.ts";

describe("legacy vs canonical slugs", () => {
  it("drops a duplicated brand prefix used by the old slug formula", () => {
    const product = {
      id: "posh_001_6a9fc631d776bd290d1daf8b",
      brand: "PacSun",
      name: "PACSUN NWT 2-tone Denim Shorts 23",
    };
    assert.equal(
      legacyProductSlug(product),
      `pacsun-pacsun-nwt-2-tone-denim-shorts-23-${product.id}`
    );
    assert.equal(
      productSlug(product),
      `pacsun-nwt-2-tone-denim-shorts-23-${product.id}`
    );
  });

  it("slugify still trims to 80 characters", () => {
    assert.ok(slugify("a".repeat(120)).length <= 80);
  });
});

describe("sold-out title cleanup", () => {
  it("strips marketplace sold-out markers from sellable titles", () => {
    assert.equal(
      stripSoldOutTitleMarkers(
        "Leopard Print Dome Cosmetic Case in Beige and Black *SOLD OUT ONLINE*"
      ),
      "Leopard Print Dome Cosmetic Case in Beige and Black"
    );
    assert.equal(
      stripSoldOutTitleMarkers(
        'CONSUELA 2017 "Sunkissed Market Tote" *DISCONTINUED AND SOLD OUT*'
      ),
      'CONSUELA 2017 "Sunkissed Market Tote"'
    );
    assert.equal(
      stripSoldOutTitleMarkers(
        "CLOVE Limited Edition SOLD OUT Pink/White Maeve Camo Nursing Shoe Size 6"
      ),
      "CLOVE Limited Edition Pink/White Maeve Camo Nursing Shoe Size 6"
    );
  });

  it("uses the cleaned name for PDP/SEO titles", () => {
    const product = {
      id: "posh_024_6a9e7317bd7d00b36f9a7a56",
      brand: "Consuela",
      name: "Leopard Print Dome Cosmetic Case in Beige and Black *SOLD OUT ONLINE*",
    };
    assert.equal(
      productDisplayName(product),
      "Leopard Print Dome Cosmetic Case in Beige and Black"
    );
    assert.equal(
      productSeoTitle(product),
      "Consuela Leopard Print Dome Cosmetic Case in Beige and Black | 2nd Chance Resale"
    );
  });
});
