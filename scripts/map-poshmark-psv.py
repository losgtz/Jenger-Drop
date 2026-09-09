#!/usr/bin/env python3
"""Map Poshmark PSV (n|title|price|originalPrice|size|brand|condition|listingUrl|imageUrl) to catalog JSON."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

CONDITIONS = {
    "nwt": "NEW WITH TAGS",
    "ug": "USED — GOOD",
    "uln": "USED — LIKE NEW",
    "uf": "USED — FAIR",
}

INVISIBLES = re.compile(r"[\u200b-\u200f\u202a-\u202e\u2060\u2066-\u2069\ufeff\u00a0\u202f\u2007]+")


def clean(value: str) -> str:
    text = INVISIBLES.sub(" ", value)
    text = text.replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-")
    return re.sub(r"\s+", " ", text).strip()


def parse_price(value: str) -> float | None:
    value = clean(value)
    if not value:
        return None
    return float(value)


def listing_id(url: str) -> str:
    return url.rstrip("/").rsplit("/", 1)[-1]


def map_row(cols: list[str]) -> dict:
    n, title, price, original, size, brand, condition, listing_url, image_url = cols
    cond_key = clean(condition).lower()
    mapped_condition = CONDITIONS.get(cond_key)
    brand_name = clean(brand)
    if brand_name.lower() in {"none", ""}:
        brand_name = ""
    original_price = parse_price(original)
    size_label = clean(size) or "OS"
    product: dict = {
        "id": f"posh_{int(n):03d}_{listing_id(listing_url)}",
        "poshmarkId": listing_id(listing_url),
        "name": clean(title),
        "price": parse_price(price),
        "image": clean(image_url),
        "images": [clean(image_url)],
        "category": "2nd Chance Resale",
        "sizes": [size_label],
        "description": "From the @jengerluxuri0us Poshmark closet.",
        "listingUrl": clean(listing_url),
        "stock": 1,
    }
    if original_price is not None:
        product["originalPrice"] = original_price
    if brand_name:
        product["brand"] = brand_name
    if mapped_condition:
        product["condition"] = mapped_condition
    return product


def map_file(src: Path) -> list[dict]:
    lines = src.read_text(encoding="utf-8").splitlines()
    header = lines[0]
    expected = "n|title|price|originalPrice|size|brand|condition|listingUrl|imageUrl"
    if header != expected:
        raise SystemExit(f"{src}: unexpected header: {header!r}")
    products = []
    for line in lines[1:]:
        if not line.strip():
            continue
        cols = line.split("|")
        if len(cols) != 9:
            raise SystemExit(f"{src}: bad column count ({len(cols)}): {line[:80]!r}")
        products.append(map_row(cols))
    return products


def main() -> None:
    if len(sys.argv) < 3:
        raise SystemExit(
            "usage: map-poshmark-psv.py <batch.psv> [<batch.psv> ...] <dest.json>"
        )
    sources = [Path(p) for p in sys.argv[1:-1]]
    dest = Path(sys.argv[-1])
    products: list[dict] = []
    ns: list[int] = []
    for src in sources:
        chunk = map_file(src)
        products.extend(chunk)
        for line in src.read_text(encoding="utf-8").splitlines()[1:]:
            if line.strip():
                ns.append(int(line.split("|", 1)[0]))
    lo, hi = min(ns), max(ns)
    batches = len(sources)
    payload = {
        "source": "poshmark",
        "closet": "jengerluxuri0us",
        "closetUrl": "https://poshmark.com/closet/jengerluxuri0us",
        "batch": f"{batches}/5",
        "range": f"{lo}-{hi}",
        "count": len(products),
        "listings": products,
    }
    dest.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(products)} listings ({lo}-{hi}, {batches}/5) to {dest}")


if __name__ == "__main__":
    main()
