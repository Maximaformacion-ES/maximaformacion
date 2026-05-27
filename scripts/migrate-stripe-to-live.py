#!/usr/bin/env python3
"""
Migrate Stripe product/price references on Strapi programs from the sandbox
account to a new (live) account.

For every program in Strapi that has stripeProductId / stripePriceId pointing
at the sandbox Stripe account, this script:

  1. Reads the source product + price from the sandbox account.
  2. Recreates them in the live account, tagging the live copy with
     metadata.migratedFromSandboxProductId / migratedFromSandboxPriceId so
     a second run reuses the same live IDs instead of creating duplicates.
  3. PATCHes the program in Strapi with the new live IDs.

Re-running is safe: each step checks before creating.

Dry-run by default — prints what it would do. Pass --apply to actually write.

Required env (process env or ../.env in this repo):

  STRIPE_SANDBOX_KEY   sk_test_... — current sandbox account (where Strapi
                                     IDs currently live)
  STRIPE_LIVE_KEY      sk_live_... — destination account
  STRAPI_URL           Strapi base URL (must be the same instance the
                                     production frontend talks to)
  STRAPI_API_TOKEN     Strapi token with write access to /api/programs

Usage:
  python3 scripts/migrate-stripe-to-live.py            # dry-run, prints plan
  python3 scripts/migrate-stripe-to-live.py --apply    # do it
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import certifi
import ssl


STRIPE_API = "https://api.stripe.com/v1"
PAGE_SIZE = 100
MAX_PAGES = 50


# ── env loading (mirrors import-redirects.py) ─────────────────────────────


def load_env() -> dict[str, str]:
    required = [
        "STRIPE_SANDBOX_KEY",
        "STRIPE_LIVE_KEY",
        "STRAPI_URL",
        "STRAPI_API_TOKEN",
    ]
    out: dict[str, str] = {}
    for k in required:
        v = os.environ.get(k)
        if v:
            out[k] = v

    if not all(k in out for k in required):
        env_path = Path(__file__).resolve().parents[1] / ".env"
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, _, v = line.partition("=")
                v = v.strip().strip('"').strip("'")
                if k in required and k not in out:
                    out[k] = v

    missing = [k for k in required if k not in out]
    if missing:
        sys.exit(f"Missing env vars: {', '.join(missing)} (set in env or ../.env)")

    out["STRAPI_URL"] = out["STRAPI_URL"].rstrip("/")

    if not out["STRIPE_SANDBOX_KEY"].startswith("sk_test_"):
        print(f"⚠️  STRIPE_SANDBOX_KEY does not start with sk_test_ — is this really the sandbox key?")
    if not out["STRIPE_LIVE_KEY"].startswith("sk_live_"):
        print(f"⚠️  STRIPE_LIVE_KEY does not start with sk_live_ — is this really the live key?")

    return out


# ── HTTP helpers ──────────────────────────────────────────────────────────


def _flatten_form(d: dict | None, prefix: str = "") -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    if d is None:
        return out
    for k, v in d.items():
        key = f"{prefix}[{k}]" if prefix else k
        if isinstance(v, dict):
            out.extend(_flatten_form(v, key))
        elif isinstance(v, list):
            for i, item in enumerate(v):
                if isinstance(item, dict):
                    out.extend(_flatten_form(item, f"{key}[{i}]"))
                else:
                    out.append((f"{key}[{i}]", str(item)))
        elif v is True:
            out.append((key, "true"))
        elif v is False:
            out.append((key, "false"))
        elif v is None:
            continue
        else:
            out.append((key, str(v)))
    return out


def _ssl_ctx() -> ssl.SSLContext:
    return ssl.create_default_context(cafile=certifi.where())


def stripe_call(
    key: str,
    method: str,
    path: str,
    body: dict | None = None,
    *,
    allow_404: bool = False,
) -> dict | None:
    url = f"{STRIPE_API}{path}"
    data = urllib.parse.urlencode(_flatten_form(body)).encode("utf-8") if body else None
    req = urllib.request.Request(
        url=url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30, context=_ssl_ctx()) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        if e.code == 404 and allow_404:
            return None
        try:
            err = json.loads(e.read())
        except Exception:
            err = {"raw": "could not decode error body"}
        raise SystemExit(f"Stripe {method} {path} → {e.code}: {err}")


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
        with urllib.request.urlopen(req, timeout=30, context=_ssl_ctx()) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        try:
            err = json.loads(e.read())
        except Exception:
            err = {"raw": e.read().decode("utf-8", errors="replace")}
        raise SystemExit(f"Strapi {method} {path} → {e.code}: {err}")


# ── Strapi: list every program with its Stripe IDs ────────────────────────


def fetch_programs(base: str, token: str) -> list[dict]:
    """
    Page through /api/programs and return rows that carry Stripe IDs we need
    to migrate. We pull fields explicitly so we don't have to populate
    relations we don't care about.
    """
    fields = [
        "documentId",
        "title",
        "price",
        "description",
        "stripeProductId",
        "stripePriceId",
    ]
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


# ── Stripe live: find-or-create with metadata-keyed idempotency ───────────


def find_live_product(live_key: str, sandbox_product_id: str) -> dict | None:
    """
    Use Stripe Search to find a live product previously migrated from this
    sandbox product. Returns None if we haven't migrated it yet.
    """
    q = f"metadata['migratedFromSandboxProductId']:'{sandbox_product_id}'"
    res = stripe_call(
        live_key,
        "GET",
        "/products/search?query=" + urllib.parse.quote(q),
    )
    items = (res or {}).get("data") or []
    return items[0] if items else None


def find_live_price(live_key: str, sandbox_price_id: str) -> dict | None:
    q = f"metadata['migratedFromSandboxPriceId']:'{sandbox_price_id}'"
    res = stripe_call(
        live_key,
        "GET",
        "/prices/search?query=" + urllib.parse.quote(q),
    )
    items = (res or {}).get("data") or []
    return items[0] if items else None


def create_live_product(live_key: str, sandbox_product: dict, strapi_program_id: str) -> dict:
    body: dict = {
        "name": sandbox_product.get("name") or "Untitled Course",
        "metadata": {
            "migratedFromSandboxProductId": sandbox_product["id"],
            "strapiProgramId": strapi_program_id,
            "source": "migrate-stripe-to-live",
        },
    }
    if sandbox_product.get("description"):
        body["description"] = sandbox_product["description"]
    return stripe_call(live_key, "POST", "/products", body)


def create_live_price(live_key: str, sandbox_price: dict, live_product_id: str) -> dict:
    body: dict = {
        "product": live_product_id,
        "currency": sandbox_price.get("currency") or "eur",
        "unit_amount": sandbox_price["unit_amount"],
        "metadata": {
            "migratedFromSandboxPriceId": sandbox_price["id"],
            "source": "migrate-stripe-to-live",
        },
    }
    rec = sandbox_price.get("recurring")
    if rec:
        body["recurring"] = {"interval": rec.get("interval")}
        if rec.get("interval_count") and rec["interval_count"] != 1:
            body["recurring"]["interval_count"] = rec["interval_count"]
    return stripe_call(live_key, "POST", "/prices", body)


# ── Per-program migration ─────────────────────────────────────────────────


def migrate_program(
    *,
    program: dict,
    sandbox_key: str,
    live_key: str,
    strapi_base: str,
    strapi_token: str,
    apply: bool,
) -> dict:
    """
    Returns a small status dict that the caller prints.
    """
    document_id = program.get("documentId")
    title = program.get("title") or "(no title)"
    sandbox_product_id = program.get("stripeProductId")
    sandbox_price_id = program.get("stripePriceId")

    if not sandbox_product_id and not sandbox_price_id:
        return {"title": title, "status": "skip-no-stripe-ids"}

    # If both IDs already resolve in live, this row is already migrated.
    if sandbox_product_id:
        already_live_prod = stripe_call(
            live_key, "GET", f"/products/{sandbox_product_id}", allow_404=True
        )
    else:
        already_live_prod = None
    if sandbox_price_id:
        already_live_price = stripe_call(
            live_key, "GET", f"/prices/{sandbox_price_id}", allow_404=True
        )
    else:
        already_live_price = None
    if already_live_prod and already_live_price:
        return {"title": title, "status": "already-live", "product": sandbox_product_id, "price": sandbox_price_id}

    # Pull the source objects from sandbox.
    sandbox_product = (
        stripe_call(sandbox_key, "GET", f"/products/{sandbox_product_id}", allow_404=True)
        if sandbox_product_id
        else None
    )
    sandbox_price = (
        stripe_call(sandbox_key, "GET", f"/prices/{sandbox_price_id}", allow_404=True)
        if sandbox_price_id
        else None
    )

    if not sandbox_product:
        return {"title": title, "status": "missing-in-sandbox", "product": sandbox_product_id}
    if not sandbox_price:
        return {"title": title, "status": "missing-price-in-sandbox", "price": sandbox_price_id}

    # Find-or-create product in live.
    live_product = find_live_product(live_key, sandbox_product["id"])
    created_product = False
    if not live_product:
        if apply:
            live_product = create_live_product(
                live_key, sandbox_product, strapi_program_id=str(program.get("id") or "")
            )
        else:
            live_product = {"id": "(dry-run-product)"}
        created_product = True

    # Find-or-create price in live.
    live_price = find_live_price(live_key, sandbox_price["id"])
    created_price = False
    if not live_price:
        if apply:
            live_price = create_live_price(live_key, sandbox_price, live_product["id"])
        else:
            live_price = {"id": "(dry-run-price)"}
        created_price = True

    # Push new IDs back to Strapi.
    if apply:
        if not document_id:
            return {
                "title": title,
                "status": "no-documentId-cannot-update",
                "product": live_product["id"],
                "price": live_price["id"],
            }
        strapi_call(
            strapi_base,
            strapi_token,
            "PUT",
            f"/api/programs/{document_id}",
            {
                "data": {
                    "stripeProductId": live_product["id"],
                    "stripePriceId": live_price["id"],
                }
            },
        )

    return {
        "title": title,
        "status": "migrated" if apply else "would-migrate",
        "from_product": sandbox_product["id"],
        "to_product": live_product["id"],
        "from_price": sandbox_price["id"],
        "to_price": live_price["id"],
        "created_product": created_product,
        "created_price": created_price,
    }


# ── Entrypoint ────────────────────────────────────────────────────────────


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--apply",
        action="store_true",
        help="Actually create live products/prices and PATCH Strapi (otherwise dry-run).",
    )
    args = ap.parse_args()

    env = load_env()

    if not args.apply:
        print("=== DRY-RUN — no changes will be made (pass --apply) ===\n")

    programs = fetch_programs(env["STRAPI_URL"], env["STRAPI_API_TOKEN"])
    print(f"Found {len(programs)} programs in Strapi.\n")

    counts: dict[str, int] = {}
    for p in programs:
        result = migrate_program(
            program=p,
            sandbox_key=env["STRIPE_SANDBOX_KEY"],
            live_key=env["STRIPE_LIVE_KEY"],
            strapi_base=env["STRAPI_URL"],
            strapi_token=env["STRAPI_API_TOKEN"],
            apply=args.apply,
        )
        status = result["status"]
        counts[status] = counts.get(status, 0) + 1

        title = result["title"][:60]
        if status in ("migrated", "would-migrate"):
            print(
                f"  {status:14s}  {title}\n"
                f"      product: {result['from_product']} → {result['to_product']}"
                f"{' (new)' if result['created_product'] else ' (reused)'}\n"
                f"      price:   {result['from_price']} → {result['to_price']}"
                f"{' (new)' if result['created_price'] else ' (reused)'}"
            )
        elif status == "already-live":
            print(f"  {status:14s}  {title} (IDs resolve in live already)")
        elif status == "skip-no-stripe-ids":
            print(f"  {status:14s}  {title}")
        else:
            print(f"  {status:14s}  {title} — {result}")

    print("\n" + "=" * 60)
    print("Summary:")
    for s, n in sorted(counts.items()):
        print(f"  {s:30s}  {n}")

    if not args.apply:
        print("\nRe-run with --apply to perform the migration.")
    else:
        print("\nDone. Next: rotate STRIPE_SECRET_KEY in Vercel + Strapi Cloud and redeploy.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
