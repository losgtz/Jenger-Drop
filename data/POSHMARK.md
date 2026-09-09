# Poshmark import

Live closet: [@jengerluxuri0us](https://poshmark.com/closet/jengerluxuri0us)

## Batches in the shop now

- `poshmark-batch-1.psv` — items 1–100 (verbatim scrape of 500 saved; closet advertises 955 available / 2,366 total)
- `poshmark-batch-2.psv` — items 101–200
- `poshmark-batch-3.psv` — items 201–300
- `poshmark-batch-4.psv` — items 301–400
- `poshmark-batch-5.psv` — items 401–500

`scripts/map-poshmark-psv.py` maps one or more PSV files to `poshmark-import.json`. The shop loads those rows as the primary `resaleProducts` catalog. Remote Cloudfront `imageUrl` values are used as-is (`<img>`; falls back to `/placeholder.svg` on error).

```bash
python3 scripts/map-poshmark-psv.py data/poshmark-batch-1.psv data/poshmark-batch-2.psv data/poshmark-batch-3.psv data/poshmark-batch-4.psv data/poshmark-batch-5.psv data/poshmark-import.json
```

Condition codes: `nwt` → NEW WITH TAGS, `ug` → USED — GOOD, `uln` → USED — LIKE NEW, `uf` → USED — FAIR.

Earlier local/demo SKUs stay in `demoResaleProducts` and are not shoppable.

The shop currently holds these five saved batches (500 listings). Do not invent photos or prices.

## Inventory rule

- Do **not** import more Poshmark rows on this foundation pass.
- Grow toward **1000** only via later CoS-fed batches (same mapper).
- After 1000, freeze the catalog until Carlos green-lights more.
