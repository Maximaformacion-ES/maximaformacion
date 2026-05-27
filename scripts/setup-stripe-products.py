#!/usr/bin/env python3
"""
One-shot setup of the Stripe products and coupons the app expects, in the
client's Stripe account.

What it creates (idempotent — re-running won't duplicate):
  1. Product "Pro" with three prices:
       - month  → 18€/mes recurring (STRIPE_PRO_MONTHLY_PRICE_ID)
       - year   → 180€/año recurring (STRIPE_PRO_YEARLY_PRICE_ID)
       - trial  → 1€ ONE-TIME (STRIPE_PRO_TRIAL_PRICE_ID)
         Used as an extra line item alongside the recurring plan so Stripe
         Checkout charges 1€ immediately, then the recurring 18€/180€
         starts after the 7-day trial. Has to be one-time, not recurring —
         a recurring 1€ line would be re-charged every period.
  2. Coupon "Pro Plan Included" — 100% off, forever
       (STRIPE_PRO_INCLUDED_COUPON_ID)
  3. Coupon "Pro Course Discount" — 20% off, forever
       (STRIPE_PRO_COURSE_COUPON_ID)
  4. Coupon "Pro Annual Discount" — 20% off, forever
       (STRIPE_PRO_ANNUAL_COUPON_ID)
       Applied automatically when a user starts the trial on the yearly
       plan, so the post-trial billing is 172.80€ instead of 216€.

Dry-run by default: prints what it would create. Pass --apply to actually
create. After running with --apply, copy the printed IDs into Vercel's
Production environment variables and into Strapi Cloud's STRIPE_SECRET_KEY.

Usage:
  STRIPE_SECRET_KEY=sk_live_... python3 scripts/setup-stripe-products.py
  STRIPE_SECRET_KEY=sk_live_... python3 scripts/setup-stripe-products.py --apply

The script uses Stripe's REST API directly (no extra deps). Be sure the
key is the client's live key, not your own test key.
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

import certifi
import ssl


STRIPE_API = "https://api.stripe.com/v1"


# ── Edit these if the client wants different numbers ──────────────────────
PRO_PRODUCT_NAME = "Pro"
PRICE_MONTHLY_EUR = 18      # 18€/mes
PRICE_YEARLY_EUR = 216      # 216€/año = 18*12 base (el descuento de 20%
                            # se aplica vía pro_annual_discount coupon
                            # → cobro real anual = 172.80€)
PRICE_TRIAL_EUR = 1         # 1€ — one-time charged at checkout

COUPON_PRO_INCLUDED_ID = "pro_plan_included"   # custom id → 100% off forever
COUPON_PRO_INCLUDED_NAME = "Pro Plan Included"

COUPON_PRO_COURSE_ID = "pro_course_discount"    # custom id → 20% off forever
COUPON_PRO_COURSE_NAME = "Pro Course Discount"
PRO_COURSE_DISCOUNT_PCT = 20

COUPON_PRO_ANNUAL_ID = "pro_annual_discount"    # 20% off applied to the
COUPON_PRO_ANNUAL_NAME = "Pro Annual Discount"   # Pro yearly plan when the
PRO_ANNUAL_DISCOUNT_PCT = 20                     # trial flow starts it


# ── HTTP helpers ──────────────────────────────────────────────────────────

def stripe_request(method: str, path: str, body: dict | None = None) -> dict:
    """Call Stripe REST API. `body` is form-urlencoded as Stripe expects."""
    key = os.environ.get("STRIPE_SECRET_KEY")
    if not key:
        sys.exit("STRIPE_SECRET_KEY env var is required")

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
    ctx = ssl.create_default_context(cafile=certifi.where())
    try:
        with urllib.request.urlopen(req, timeout=30, context=ctx) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        try:
            err = json.loads(e.read())
        except Exception:
            err = {"raw": "could not decode error body"}
        raise SystemExit(f"Stripe API {method} {path} → {e.code}: {err}")


def _flatten_form(d: dict | None, prefix: str = "") -> list[tuple[str, str]]:
    """Stripe wants params like `recurring[interval]=month` not JSON."""
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


# ── Discovery: don't create what's already there ──────────────────────────

def find_pro_product() -> dict | None:
    """List products and return the one called PRO_PRODUCT_NAME, if any."""
    data = stripe_request("GET", f"/products?active=true&limit=100")
    for p in data.get("data", []):
        if p.get("name") == PRO_PRODUCT_NAME:
            return p
    return None


def find_price(
    product_id: str,
    *,
    recurring_interval: str | None,
    unit_amount: int,
) -> dict | None:
    """
    Find an existing price on the product matching the shape we'd create.
    Pass recurring_interval=None to look for one-time prices.
    """
    data = stripe_request("GET", f"/prices?product={product_id}&active=true&limit=100")
    for pr in data.get("data", []):
        rec = pr.get("recurring") or None
        if recurring_interval is None:
            # Looking for a one-time price
            if rec is None and pr.get("unit_amount") == unit_amount and pr.get("currency") == "eur":
                return pr
        else:
            if (
                rec is not None
                and rec.get("interval") == recurring_interval
                and pr.get("unit_amount") == unit_amount
                and pr.get("currency") == "eur"
            ):
                return pr
    return None


def find_coupon(coupon_id: str) -> dict | None:
    """Custom IDs make coupons addressable; GET returns 404 if absent."""
    try:
        return stripe_request("GET", f"/coupons/{coupon_id}")
    except SystemExit as e:
        # Crude check: 404 surfaces as "→ 404: …"
        if "404" in str(e):
            return None
        raise


# ── The work ──────────────────────────────────────────────────────────────

def ensure_pro_product(apply: bool) -> dict:
    existing = find_pro_product()
    if existing:
        print(f"  product 'Pro' already exists: {existing['id']}")
        return existing
    print("  would create product 'Pro' …")
    if not apply:
        return {"id": "(dry-run)", "name": PRO_PRODUCT_NAME}
    return stripe_request(
        "POST",
        "/products",
        {
            "name": PRO_PRODUCT_NAME,
            "description": "Plan Pro de Máxima Formación — acceso a cursos incluidos y 20% en otros.",
        },
    )


def ensure_price(
    product_id: str,
    *,
    label: str,
    interval: str | None,
    unit_amount: int,
    apply: bool,
) -> dict:
    """interval=None creates a one-time price."""
    period_desc = f"{interval}" if interval else "one-time"
    if product_id == "(dry-run)":
        print(f"  would create price '{label}' ({unit_amount/100:.2f}€/{period_desc}) — needs product first")
        return {"id": "(dry-run)"}
    existing = find_price(product_id, recurring_interval=interval, unit_amount=unit_amount)
    if existing:
        print(f"  price '{label}' already exists: {existing['id']}")
        return existing
    print(f"  would create price '{label}': {unit_amount/100:.2f}€/{period_desc}")
    if not apply:
        return {"id": "(dry-run)"}
    body: dict = {
        "product": product_id,
        "currency": "eur",
        "unit_amount": unit_amount,
        "nickname": label,
    }
    if interval is not None:
        body["recurring"] = {"interval": interval}
    return stripe_request("POST", "/prices", body)


def ensure_coupon(coupon_id: str, *, name: str, percent_off: int, apply: bool) -> dict:
    existing = find_coupon(coupon_id)
    if existing:
        print(f"  coupon '{coupon_id}' already exists ({existing.get('percent_off')}% off)")
        return existing
    print(f"  would create coupon '{coupon_id}': {percent_off}% off, forever")
    if not apply:
        return {"id": coupon_id}
    return stripe_request(
        "POST",
        "/coupons",
        {
            "id": coupon_id,
            "name": name,
            "percent_off": percent_off,
            "duration": "forever",
        },
    )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="Actually create in Stripe (otherwise dry-run)")
    args = ap.parse_args()

    if not args.apply:
        print("=== DRY-RUN — no changes will be made (pass --apply) ===\n")

    print("Product:")
    product = ensure_pro_product(args.apply)

    print("\nPrices:")
    monthly = ensure_price(
        product["id"], label="Pro Mensual", interval="month",
        unit_amount=PRICE_MONTHLY_EUR * 100, apply=args.apply,
    )
    yearly = ensure_price(
        product["id"], label="Pro Anual", interval="year",
        unit_amount=PRICE_YEARLY_EUR * 100, apply=args.apply,
    )
    trial = ensure_price(
        product["id"], label="Trial 1€ (one-time)", interval=None,
        unit_amount=PRICE_TRIAL_EUR * 100, apply=args.apply,
    )

    print("\nCoupons:")
    included = ensure_coupon(
        COUPON_PRO_INCLUDED_ID, name=COUPON_PRO_INCLUDED_NAME,
        percent_off=100, apply=args.apply,
    )
    course = ensure_coupon(
        COUPON_PRO_COURSE_ID, name=COUPON_PRO_COURSE_NAME,
        percent_off=PRO_COURSE_DISCOUNT_PCT, apply=args.apply,
    )
    annual = ensure_coupon(
        COUPON_PRO_ANNUAL_ID, name=COUPON_PRO_ANNUAL_NAME,
        percent_off=PRO_ANNUAL_DISCOUNT_PCT, apply=args.apply,
    )

    print("\n" + "=" * 60)
    print("Env vars to set in Vercel Production (and in Strapi Cloud for STRIPE_SECRET_KEY):")
    print("=" * 60)
    print(f"STRIPE_PRO_MONTHLY_PRICE_ID={monthly['id']}")
    print(f"STRIPE_PRO_YEARLY_PRICE_ID={yearly['id']}")
    print(f"STRIPE_PRO_TRIAL_PRICE_ID={trial['id']}")
    print(f"STRIPE_PRO_INCLUDED_COUPON_ID={included['id']}")
    print(f"STRIPE_PRO_COURSE_COUPON_ID={course['id']}")
    print(f"STRIPE_PRO_ANNUAL_COUPON_ID={annual['id']}")
    print()
    print("Plus (you set these yourself):")
    print("  STRIPE_SECRET_KEY      → sk_live_… (the client's secret key)")
    print("  STRIPE_WEBHOOK_SECRET  → whsec_… (after creating the webhook endpoint)")

    if not args.apply:
        print("\nRe-run with --apply to actually create the products + coupons.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
