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


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
    with urllib.request.urlopen(req, timeout=25) as resp:
        return resp.read().decode("utf-8", errors="replace")


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
    parser.add_argument("--sleep", type=float, default=0.45)
    args = parser.parse_args()

    payload = json.loads(args.catalog.read_text(encoding="utf-8"))
    listings = payload["listings"]
    end = len(listings) if args.limit <= 0 else min(len(listings), args.offset + args.limit)
    targets = listings[args.offset : end]

    updated = 0
    unchanged = 0
    failed: list[str] = []

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
            print(f"{listing['id']}: {len(images)} photos")
        except (urllib.error.URLError, TimeoutError, ValueError, json.JSONDecodeError) as exc:
            failed.append(f"{listing.get('id')}: {exc}")
            print(f"{listing.get('id')}: FAIL {exc}", file=sys.stderr)
            unchanged += 1
        if i < len(targets) and args.sleep:
            time.sleep(args.sleep)

    args.catalog.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(
        f"Wrote {args.catalog}: updated={updated} unchanged={unchanged} "
        f"failed={len(failed)} scanned={len(targets)}"
    )
    if failed:
        print("failures:", *failed[:20], sep="\n  ")


if __name__ == "__main__":
    main()
