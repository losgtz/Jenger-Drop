# Poshmark import

Live closet: [@jengerluxuri0us](https://poshmark.com/closet/jengerluxuri0us)

## Batch 1/5 (in the shop now)

`poshmark-batch-1.psv` is the verbatim scrape (items 1–100 of 500 saved; closet advertises 955 available / 2,366 total).

`scripts/map-poshmark-psv.py` maps that file to `poshmark-import.json`. The shop loads those 100 rows as the primary `resaleProducts` catalog. Remote Cloudfront `imageUrl` values are used as-is (`<img>`; falls back to `/placeholder.svg` on error).

Condition codes: `nwt` → NEW WITH TAGS, `ug` → USED — GOOD, `uln` → USED — LIKE NEW, `uf` → USED — FAIR.

Earlier local/demo SKUs stay in `demoResaleProducts` and are not shoppable.

Later batches (2–5) should append to the same JSON using the same mapper. Do not invent photos or prices.
