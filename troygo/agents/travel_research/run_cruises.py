"""CLI entrypoint: runs the cruise research crew, validates its output, and writes:
  - ../../src/lib/data/cruises-live.json    (consumed by the Next.js site)
  - output/run-cruises-<timestamp>.log.json (audit trail: raw output + sources)

Each run GROWS the live cruise list, merging new real finds in and skipping
anything already there by name (case-insensitive) — matches the additive
pattern in run.py (packages), so coverage keeps expanding across runs
instead of resetting.
"""

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from pydantic import ValidationError

load_dotenv()

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from crew import run_cruises as run_crew  # noqa: E402  (must follow load_dotenv())
from activity_log import record_run  # noqa: E402
from schema import CRUISE_GRADIENT_PALETTE, ResearchedCruise, Cruise  # noqa: E402
from pricing import apply_markup, apply_dynamic_markup  # noqa: E402
from finance_review import fetch_price_review  # noqa: E402

HERE = Path(__file__).parent
LIVE_JSON_PATH = HERE / ".." / ".." / "src" / "lib" / "data" / "cruises-live.json"
OUTPUT_DIR = HERE / "output"


def strip_code_fences(text: str) -> str:
    text = text.strip()
    match = re.match(r"^```(?:json)?\s*(.*?)\s*```$", text, re.DOTALL)
    return match.group(1) if match else text


def extract_json_array(text: str) -> str:
    """Walk backward from the LAST "]" and bracket-match to find its "[" —
    isolates the model's real final array even when its reasoning left
    earlier draft/incomplete JSON-looking fragments beforehand (a real car
    rental run did this: several partial arrays, one literally truncated
    with "...]" mid-reasoning, before the actual complete final answer)."""
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


def main() -> int:
    if not os.getenv("ANTHROPIC_API_KEY") or not os.getenv("SERPER_API_KEY"):
        print("ERROR: ANTHROPIC_API_KEY and SERPER_API_KEY must both be set in .env", file=sys.stderr)
        return 1

    print("Running the cruise research crew — this makes real web searches and LLM calls...")
    raw_output = run_crew()

    cleaned = strip_code_fences(raw_output)
    try:
        raw_items = json.loads(cleaned, strict=False)
    except json.JSONDecodeError:
        try:
            raw_items = json.loads(extract_json_array(cleaned), strict=False)
        except json.JSONDecodeError as e:
            print(f"ERROR: could not parse crew output as JSON: {e}", file=sys.stderr)
            print("--- raw output ---", file=sys.stderr)
            print(raw_output, file=sys.stderr)
            return 1

    if not isinstance(raw_items, list):
        print("ERROR: expected a JSON array from the crew, got something else", file=sys.stderr)
        return 1

    validated: list[ResearchedCruise] = []
    dropped: list[dict] = []
    for item in raw_items:
        try:
            validated.append(ResearchedCruise.model_validate(item))
        except ValidationError as e:
            dropped.append({"item": item, "error": str(e)})

    print(f"Crew returned {len(raw_items)} candidate cruises; {len(validated)} passed validation, {len(dropped)} dropped.")
    for d in dropped:
        name = d["item"].get("name", "<unknown>") if isinstance(d["item"], dict) else "<malformed>"
        print(f"  dropped: {name} — {d['error'].splitlines()[0]}")

    missing_source = [c for c in validated if not c.sourceUrl]
    if missing_source:
        print(f"ERROR: {len(missing_source)} validated items are missing sourceUrl — refusing to write output.", file=sys.stderr)
        return 1

    if not validated:
        print("ERROR: zero cruises survived validation — refusing to overwrite cruises-live.json with an empty list.", file=sys.stderr)
        print("(The site will keep serving its last-known-good data either way, thanks to the fallback in packages.ts.)", file=sys.stderr)
        return 1

    existing: list[dict] = []
    if LIVE_JSON_PATH.exists():
        try:
            existing = json.loads(LIVE_JSON_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            existing = []
    existing_by_name = {e["name"].strip().lower(): e for e in existing}
    next_id = max((e.get("id", 0) for e in existing), default=0) + 1

    print("Asking Finance to review pricing on this batch (falls back to the static markup table if unavailable)...")
    price_decisions = fetch_price_review(
        [{"name": c.name, "category": c.cruiseLine, "basePrice": c.price} for c in validated]
    )
    print(f"Finance returned decisions for {len(price_decisions)}/{len(validated)} items.")

    new_cruises: list[Cruise] = []
    new_validated: list[ResearchedCruise] = []
    updated_names: list[str] = []
    campaign_flagged: list[str] = []
    for c in validated:
        key = c.name.strip().lower()
        decision = price_decisions.get(key)
        if decision:
            markup_source = "finance"
            sell_price = apply_dynamic_markup(c.price, decision["markupPercent"])
            sell_original = apply_dynamic_markup(c.originalPrice, decision["markupPercent"])
            sell_cabins = [
                {"name": cab.name, "price": apply_dynamic_markup(cab.price, decision["markupPercent"]), "description": cab.description}
                for cab in c.cabinTypes
            ]
            if decision.get("campaignFlag"):
                campaign_flagged.append(c.name)
        else:
            markup_source = "static fallback"
            sell_price = apply_markup(c.price, c.cruiseLine)
            sell_original = apply_markup(c.originalPrice, c.cruiseLine)
            sell_cabins = [
                {"name": cab.name, "price": apply_markup(cab.price, c.cruiseLine), "description": cab.description}
                for cab in c.cabinTypes
            ]
        print(f"  {c.name}: cost ${c.price} -> sell ${sell_price} ({markup_source})")
        if key in existing_by_name:
            # Same cruise found again — refresh it in place so real price/
            # campaign changes at the source actually reach the site,
            # instead of being silently skipped forever after first find.
            entry = existing_by_name[key]
            if entry["price"] != sell_price or entry["originalPrice"] != sell_original:
                updated_names.append(c.name)
            entry["price"] = sell_price
            entry["originalPrice"] = sell_original
            entry["cabinTypes"] = sell_cabins
            entry["rating"] = round(min(5.0, max(0.0, c.rating)), 2)
            entry["reviewCount"] = c.reviewCount
            entry["description"] = c.description
            entry["departureDates"] = c.departureDates
            continue
        new_validated.append(c)
        new_cruises.append(
            Cruise(
                id=next_id,
                name=c.name,
                ship=c.ship,
                cruiseLine=c.cruiseLine,
                itinerary=c.itinerary,
                duration=c.duration,
                price=sell_price,
                originalPrice=sell_original,
                cabinTypes=sell_cabins,
                rating=round(min(5.0, max(0.0, c.rating)), 2),
                reviewCount=c.reviewCount,
                departurePort=c.departurePort,
                departureDates=c.departureDates,
                includes=c.includes,
                amenities=c.amenities,
                imageGradient=CRUISE_GRADIENT_PALETTE[(next_id - 1) % len(CRUISE_GRADIENT_PALETTE)],
                category=c.category,
                description=c.description,
            )
        )
        next_id += 1

    final_cruises = list(existing_by_name.values()) + [c.model_dump(mode="json") for c in new_cruises]
    LIVE_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    LIVE_JSON_PATH.write_text(json.dumps(final_cruises, indent=2), encoding="utf-8")
    print(f"Added {len(new_cruises)} new real cruises, refreshed price on {len(updated_names)} existing ones; {len(final_cruises)} total now in {LIVE_JSON_PATH.resolve()}")
    if campaign_flagged:
        print(f"Finance flagged {len(campaign_flagged)} as campaign-worthy this run: {', '.join(campaign_flagged)}")
    record_run("cruises", [c.name for c in new_cruises], len(validated) - len(new_cruises), len(final_cruises))

    OUTPUT_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    log_path = OUTPUT_DIR / f"run-cruises-{timestamp}.log.json"
    log_path.write_text(
        json.dumps(
            {
                "timestamp": timestamp,
                "raw_output": raw_output,
                "candidate_count": len(raw_items),
                "validated_count": len(validated),
                "dropped": [{"name": d["item"].get("name") if isinstance(d["item"], dict) else None, "error": d["error"]} for d in dropped],
                "cruises": [
                    {**c.model_dump(mode="json"), "sourceUrl": str(src.sourceUrl)}
                    for c, src in zip(new_cruises, new_validated)
                ],
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"Wrote audit log to {log_path.resolve()}")
    print("\nNext: spot-check a few sourceUrls in the log file, then commit + push (see run_and_deploy.ps1).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
