# Poshmark import

Live closet: [@jengerluxuri0us](https://poshmark.com/closet/jengerluxuri0us)

## Batches in the shop now

- `poshmark-batch-1.psv` — items 1–100 (verbatim scrape of 500 saved; closet advertises 955 available / 2,366 total)
- `poshmark-batch-2.psv` — items 101–200
- `poshmark-batch-3.psv` — items 201–300

`scripts/map-poshmark-psv.py` maps one or more PSV files to `poshmark-import.json`. The shop loads those rows as the primary `resaleProducts` catalog. Remote Cloudfront `imageUrl` values are used as-is (`<img>`; falls back to `/placeholder.svg` on error).

```bash
python3 scripts/map-poshmark-psv.py data/poshmark-batch-1.psv data/poshmark-batch-2.psv data/poshmark-batch-3.psv data/poshmark-import.json
```

Condition codes: `nwt` → NEW WITH TAGS, `ug` → USED — GOOD, `uln` → USED — LIKE NEW, `uf` → USED — FAIR.

Earlier local/demo SKUs stay in `demoResaleProducts` and are not shoppable.

Later batches (4–5) should append to the same JSON using the same mapper. Do not invent photos or prices.
