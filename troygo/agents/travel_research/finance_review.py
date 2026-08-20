"""Calls TRoyAI's Finance department (PRICE_REVIEW skill) so a real agent —
not a static table — sets the markup % and campaign flag for each batch of
freshly-researched, real-cost items before they go live on TRoyGO. See
pricing.py for the static fallback used when this call can't be reached
(backend down, no credit, etc.) — a pricing decision should never block a
research run from shipping real data.
"""

import json
import os
import sys
import time

import httpx

BACKEND_URL = os.getenv("BACKEND_URL", "https://backend.troyaiagent.com")
BACKEND_API_KEY = os.getenv("BACKEND_API_KEY", "")


def _strip_code_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1]) if len(lines) > 2 else text
    return text.strip()


def _extract_json_array(text: str) -> str:
    text = text.strip()
    end = text.rfind("]")
    if end == -1:
        return text
    depth = 0
    i = end
    while i >= 0:
        if text[i] == "]":
            depth += 1
        elif text[i] == "[":
            depth -= 1
            if depth == 0:
                return text[i : end + 1]
        i -= 1
    return text


def fetch_price_review(items: list[dict], timeout: float = 240.0) -> dict[str, dict]:
    """items: list of {"name": str, "category": str, "basePrice": float}.
    Returns {name.lower(): {"markupPercent": float, "campaignFlag": bool,
    "note": str}}. Returns {} (never raises) on any failure — callers must
    fall back to the static pricing.py table so a Finance/network hiccup
    never blocks a research run from producing real data."""
    if not BACKEND_API_KEY or not items:
        return {}
    try:
        resp = httpx.post(
            f"{BACKEND_URL}/finance/price-review",
            json={
                "task_id": f"cruise-price-review-{int(time.time())}",
                "brief": json.dumps(items),
            },
            headers={"x-backend-key": BACKEND_API_KEY},
            timeout=timeout,
        )
        resp.raise_for_status()
        result_text = resp.json().get("result", "")
        cleaned = _strip_code_fences(result_text)
        try:
            decisions = json.loads(cleaned)
        except json.JSONDecodeError:
            decisions = json.loads(_extract_json_array(cleaned))
        if not isinstance(decisions, list):
            return {}
        out = {}
        for d in decisions:
            if isinstance(d, dict) and "name" in d and "markupPercent" in d:
                out[str(d["name"]).strip().lower()] = d
        return out
    except Exception as e:
        print(f"WARNING: Finance price-review call failed ({e}); using static markup table instead.", file=sys.stderr)
        return {}
