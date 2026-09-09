# Poshmark import

Live closet: [@jengerluxuri0us](https://poshmark.com/closet/jengerluxuri0us)

## Batches in the shop now

- `poshmark-batch-1.psv` — items 1–100 (verbatim scrape of 500 saved; closet advertises 955 available / 2,366 total)
- `poshmark-batch-2.psv` — items 101–200
- `poshmark-batch-3.psv` — items 201–300
- `poshmark-batch-4.psv` — items 301–400
- `poshmark-batch-5.psv` — items 401–500
- `poshmark-batch-6.psv` — items 501–600
- `poshmark-batch-7.psv` — items 601–700
- `poshmark-batch-8.psv` — items 701–800
- `poshmark-batch-9.psv` — items 801–900
- `poshmark-batch-10.psv` — items 901–955 (final 55 closet-order rows after item 900)

`scripts/map-poshmark-psv.py` maps one or more PSV files to `poshmark-import.json`. The shop loads those rows as the primary `resaleProducts` catalog. Remote Cloudfront `imageUrl` values are used as-is (`<img>`; falls back to `/placeholder.svg` on error).

The PSV only stores the closet **cover** (`image` + a one-item `images` array). Extra Poshmark photos are not in `jenger-resale/poshmark-closet-available-full.json` (that file is not in this repo). Backfill them from each live `listingUrl`:

```bash
# sample
python3 scripts/backfill-poshmark-images.py --limit 10 data/poshmark-import.json
# full closet (polite delay; do not invent URLs)
python3 scripts/backfill-poshmark-images.py data/poshmark-import.json
```

The script reads `window.__INITIAL_STATE__.$_listing_details.listingDetails` and writes `cover_shot.path_large` plus `pictures[].path_large`. Re-run the mapper **overwrites** galleries back to a single cover — run the backfill after a remap.

```bash
python3 scripts/map-poshmark-psv.py data/poshmark-batch-{1..10}.psv data/poshmark-import.json
```

Condition codes: `nwt` → NEW WITH TAGS, `ug` → USED — GOOD, `uln` → USED — LIKE NEW, `uf` → USED — FAIR.

The shop currently holds batches 1–10 of 10 (**955** listings). Do not invent photos or prices. Seed and demo SKUs are not in the catalog.

## Inventory rule

- Carlos said GO for remaining CoS-fed batches (6–10). Append only; dedupe by `listingUrl`.
- Catalog ends at **955** (closet advertised size). Do not invent extras to reach 1000.
- After batches 6–10, inventory is **FROZEN** until Carlos green-lights more.
