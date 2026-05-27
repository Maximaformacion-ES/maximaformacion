#!/usr/bin/env python3
"""
"Ping" every program in Strapi so its lifecycle afterUpdate fires and the
program ends up with stripeProductId / stripePriceId populated against the
Stripe account that Strapi Cloud currently points at.

This is a one-shot run we only do when:
  - Strapi Cloud has STRIPE_SECRET_KEY=sk_live_... already configured.
  - All 19 existing programs still have stripeProductId/stripePriceId = null.

What it does for each program: PUT /api/programs/{documentId} with an empty
data object. Strapi v5 accepts the PUT and fires `afterUpdate`. The lifecycle
guard `onlyStripeFieldsUpdated` evaluates to false (no fields in data, so
`updatedFields.length > 0` is false), so syncProgramToStripe runs and writes
back the new IDs. The program's content (title, description, etc.) is not
touched because no field was sent.

Dry-run by default. Pass --apply to send the PUTs.

Required env (process env or ../.env):
  STRAPI_URL
  STRAPI_API_TOKEN
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import certifi
import ssl


PAGE_SIZE = 100
MAX_PAGES = 50


def load_env() -> tuple[str, str]:
    url = os.environ.get("STRAPI_URL")
    token = os.environ.get("STRAPI_API_TOKEN")
    if not (url and token):
        env_path = Path(__file__).resolve().parents[1] / ".env"
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, _, v = line.partition("=")
                v = v.strip().strip('"').strip("'")
                if k == "STRAPI_URL" and not url:
                    url = v
                elif k == "STRAPI_API_TOKEN" and not token:
                    token = v
    if not (url and token):
        sys.exit("STRAPI_URL and STRAPI_API_TOKEN must be set (env or ../.env)")
    return url.rstrip("/"), token


def _ssl_ctx() -> ssl.SSLContext:
    return ssl.create_default_context(cafile=certifi.where())


def strapi_call(
    base: str,
    token: str,
    method: str,
    path: str,
    body: dict | None = None,
) -> dict:
    url = f"{base}{path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(
        url=url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60, context=_ssl_ctx()) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        try:
            err = json.loads(e.read())
        except Exception:
            err = {"raw": e.read().decode("utf-8", errors="replace") if hasattr(e, "read") else str(e)}
        raise SystemExit(f"Strapi {method} {path} → {e.code}: {err}")


def fetch_programs(base: str, token: str) -> list[dict]:
    fields = ["documentId", "title", "price", "stripeProductId", "stripePriceId"]
    qs_fields = "&".join(
        f"fields%5B{i}%5D={urllib.parse.quote(f)}" for i, f in enumerate(fields)
    )
    rows: list[dict] = []
    for page in range(1, MAX_PAGES + 1):
        path = (
            f"/api/programs?{qs_fields}"
            f"&pagination%5Bpage%5D={page}"
            f"&pagination%5BpageSize%5D={PAGE_SIZE}"
        )
        data = strapi_call(base, token, "GET", path)
        chunk = data.get("data") or []
        rows.extend(chunk)
        meta = (data.get("meta") or {}).get("pagination") or {}
        if page >= int(meta.get("pageCount", 1) or 1):
            break
    return rows


def fetch_one(base: str, token: str, document_id: str) -> dict:
    """Re-read one program to see whether Stripe IDs got populated."""
    qs_fields = (
        "fields%5B0%5D=documentId"
        "&fields%5B1%5D=title"
        "&fields%5B2%5D=stripeProductId"
        "&fields%5B3%5D=stripePriceId"
    )
    data = strapi_call(
        base, token, "GET", f"/api/programs/{document_id}?{qs_fields}"
    )
    return (data.get("data") or {}) if isinstance(data, dict) else {}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--apply",
        action="store_true",
        help="Actually send the PUTs (otherwise dry-run).",
    )
    ap.add_argument(
        "--only-empty",
        action="store_true",
        default=True,
        help="Only ping programs whose stripePriceId is currently null (default).",
    )
    ap.add_argument(
        "--all",
        action="store_true",
        help="Ping every program, even those that already have Stripe IDs.",
    )
    ap.add_argument(
        "--delay",
        type=float,
        default=0.4,
        help="Seconds to wait between requests (gentle on Strapi Cloud).",
    )
    args = ap.parse_args()
    only_empty = not args.all

    base, token = load_env()
    if not args.apply:
        print("=== DRY-RUN — no PUTs will be sent (pass --apply) ===\n")

    programs = fetch_programs(base, token)
    print(f"Found {len(programs)} programs in Strapi.\n")

    if only_empty:
        targets = [p for p in programs if not p.get("stripePriceId")]
        print(f"  {len(targets)} have stripePriceId=null and will be pinged.")
        print(f"  {len(programs) - len(targets)} already have IDs and will be skipped.\n")
    else:
        targets = programs

    counts = {"ok": 0, "got_ids": 0, "still_null": 0, "errors": 0}

    for p in targets:
        doc_id = p.get("documentId")
        title = (p.get("title") or "")[:60]
        if not doc_id:
            print(f"  ⚠️  skip (no documentId): {title}")
            counts["errors"] += 1
            continue

        if not args.apply:
            print(f"  would ping  {title}")
            continue

        try:
            strapi_call(base, token, "PUT", f"/api/programs/{doc_id}", {"data": {}})
            counts["ok"] += 1
        except SystemExit as e:
            print(f"  ❌ failed   {title}: {e}")
            counts["errors"] += 1
            continue

        # Re-read to see if the lifecycle populated the Stripe IDs.
        time.sleep(args.delay)
        after = fetch_one(base, token, doc_id)
        new_price = after.get("stripePriceId")
        new_prod = after.get("stripeProductId")
        if new_price and new_prod:
            counts["got_ids"] += 1
            print(f"  ✅ synced   {title}  → product={new_prod}  price={new_price}")
        else:
            counts["still_null"] += 1
            print(f"  ⚠️  no IDs   {title}  (lifecycle may have failed silently)")

        time.sleep(args.delay)

    print("\n" + "=" * 60)
    print("Summary:")
    for k, v in counts.items():
        print(f"  {k:14s}  {v}")

    if not args.apply:
        print("\nRe-run with --apply to actually trigger the lifecycle on each program.")
    elif counts["still_null"] > 0:
        print(
            "\n⚠️  Some programs were pinged but came back with Stripe IDs still null."
            "\n   That usually means STRIPE_SECRET_KEY is missing in Strapi Cloud,"
            "\n   or `price` is 0 in those programs (the lifecycle skips price<=0)."
        )
    else:
        print("\nDone — every targeted program now has Stripe IDs.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
