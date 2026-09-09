#!/usr/bin/env python3
"""Backfill extra Poshmark photos onto catalog listings.

Reads each listingUrl, parses window.__INITIAL_STATE__, and sets
`images` to cover_shot.path_large followed by pictures[].path_large.
Does not invent URLs. Existing cover (`image`) stays first if it already
matches a Cloudfront photo for that listing.

usage:
  python3 scripts/backfill-poshmark-images.py data/poshmark-import.json
  python3 scripts/backfill-poshmark-images.py --limit 10 data/poshmark-import.json
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

CDN = "https://di2ponv0v5otw.cloudfront.net/"
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)


def to_large_url(path: str) -> str:
    path = path.replace("\\u002F", "/").replace("\\/", "/").lstrip("/")
    if path.startswith("http://") or path.startswith("https://"):
        url = path
    else:
        url = CDN + path
    # Prefer the large JPEG the catalog already uses.
    url = re.sub(r"/(?:m|s)_wp_", "/l_", url)
    url = re.sub(r"/l_wp_", "/l_", url)
    url = re.sub(r"/(?:m|s)_", "/l_", url)
    url = re.sub(r"\.webp$", ".jpeg", url)
    return url


def unique_keep_order(urls: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for url in urls:
        if not url or url in seen:
            continue
        if "di2ponv0v5otw.cloudfront.net/posts/" not in url:
            continue
        seen.add(url)
        out.append(url)
    return out


def extract_gallery(html: str) -> list[str]:
    match = re.search(r"window\.__INITIAL_STATE__\s*=\s*", html)
    if not match:
        raise ValueError("no __INITIAL_STATE__")
    state, _ = json.JSONDecoder().raw_decode(html[match.end() :])
    details = (
        state.get("$_listing_details", {}).get("listingDetails")
        or {}
    )
    urls: list[str] = []
    cover = details.get("cover_shot") or {}
    if cover.get("path_large"):
        urls.append(to_large_url(cover["path_large"]))
    for pic in details.get("pictures") or []:
        path = pic.get("path_large") or pic.get("path")
        if path:
            urls.append(to_large_url(path))
    urls = unique_keep_order(urls)
    if not urls:
        raise ValueError("no pictures in listingDetails")
    return urls


def fetch(url: str, retries: int = 4) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
    delay = 2.0
    last_exc: Exception | None = None
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=25) as resp:
                return resp.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as exc:
            last_exc = exc
            if exc.code not in {429, 503, 502} or attempt == retries - 1:
                raise
            time.sleep(delay)
            delay = min(delay * 2, 30)
        except (urllib.error.URLError, TimeoutError) as exc:
            last_exc = exc
            if attempt == retries - 1:
                raise
            time.sleep(delay)
            delay = min(delay * 2, 30)
    raise last_exc or RuntimeError("fetch failed")


def save_catalog(path: Path, payload: dict) -> None:
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    tmp.replace(path)


def merge_images(existing_cover: str, scraped: list[str]) -> list[str]:
    cover = existing_cover.strip()
    rest = [u for u in scraped if u != cover]
    if cover and "di2ponv0v5otw.cloudfront.net/posts/" in cover:
        return unique_keep_order([cover, *rest])
    return scraped


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("catalog", type=Path)
    parser.add_argument("--limit", type=int, default=0, help="0 = all listings")
    parser.add_argument("--offset", type=int, default=0)
    parser.add_argument("--sleep", type=float, default=0.6)
    parser.add_argument(
        "--checkpoint",
        type=int,
        default=10,
        help="Write catalog after this many successful updates (resume-safe)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-fetch listings that already have more than one image",
    )
    args = parser.parse_args()

    payload = json.loads(args.catalog.read_text(encoding="utf-8"))
    listings = payload["listings"]
    end = len(listings) if args.limit <= 0 else min(len(listings), args.offset + args.limit)
    slice_ = listings[args.offset : end]
    targets = [
        listing
        for listing in slice_
        if args.force or len(listing.get("images") or []) <= 1
    ]
    skipped_done = len(slice_) - len(targets)

    updated = 0
    failed: list[str] = []
    since_checkpoint = 0

    print(
        f"scan={len(slice_)} todo={len(targets)} already_multi={skipped_done}",
        flush=True,
    )

    for i, listing in enumerate(targets, start=1):
        url = listing.get("listingUrl") or ""
        if not url:
            failed.append(listing.get("id", "?"))
            continue
        try:
            html = fetch(url)
            scraped = extract_gallery(html)
            images = merge_images(listing.get("image") or "", scraped)
            listing["images"] = images
            if images and not listing.get("image"):
                listing["image"] = images[0]
            updated += 1
            since_checkpoint += 1
            print(f"{i}/{len(targets)} {listing['id']}: {len(images)} photos", flush=True)
        except (
            urllib.error.HTTPError,
            urllib.error.URLError,
            TimeoutError,
            ValueError,
            json.JSONDecodeError,
        ) as exc:
            failed.append(f"{listing.get('id')}: {exc}")
            print(f"{i}/{len(targets)} {listing.get('id')}: FAIL {exc}", file=sys.stderr, flush=True)
        if since_checkpoint >= args.checkpoint:
            save_catalog(args.catalog, payload)
            multi = sum(1 for row in listings if len(row.get("images") or []) > 1)
            print(f"checkpoint: multi={multi}/{len(listings)} updated={updated}", flush=True)
            since_checkpoint = 0
        if i < len(targets) and args.sleep:
            time.sleep(args.sleep)

    save_catalog(args.catalog, payload)
    multi = sum(1 for row in listings if len(row.get("images") or []) > 1)
    print(
        f"Wrote {args.catalog}: updated={updated} skipped_done={skipped_done} "
        f"failed={len(failed)} multi={multi}/{len(listings)}",
        flush=True,
    )
    if failed:
        print("failures:", *failed[:40], sep="\n  ")


if __name__ == "__main__":
    main()
