"""CLI entrypoint: runs the hotel research crew, validates its output, and writes:
  - ../../src/lib/data/hotels-live.json    (consumed by the Next.js site)
  - output/run-hotels-<timestamp>.log.json (audit trail: raw output + sources)

Each run GROWS the live hotel list, merging new real finds in and skipping
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

# Same Windows console encoding fix as run.py — real scraped content
# commonly contains characters (★, curly quotes) that crash cp1252 stdout.
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from crew import run_hotels as run_crew  # noqa: E402  (must follow load_dotenv())
from activity_log import record_run  # noqa: E402
from schema import HOTEL_GRADIENT_PALETTE, ResearchedHotel, Hotel  # noqa: E402

HERE = Path(__file__).parent
LIVE_JSON_PATH = HERE / ".." / ".." / "src" / "lib" / "data" / "hotels-live.json"
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

    print("Running the hotel research crew — this makes real web searches and LLM calls...")
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

    validated: list[ResearchedHotel] = []
    dropped: list[dict] = []
    for item in raw_items:
        try:
            validated.append(ResearchedHotel.model_validate(item))
        except ValidationError as e:
            dropped.append({"item": item, "error": str(e)})

    print(f"Crew returned {len(raw_items)} candidate hotels; {len(validated)} passed validation, {len(dropped)} dropped.")
    for d in dropped:
        name = d["item"].get("name", "<unknown>") if isinstance(d["item"], dict) else "<malformed>"
        print(f"  dropped: {name} — {d['error'].splitlines()[0]}")

    missing_source = [h for h in validated if not h.sourceUrl]
    if missing_source:
        print(f"ERROR: {len(missing_source)} validated items are missing sourceUrl — refusing to write output.", file=sys.stderr)
        return 1

    if not validated:
        print("ERROR: zero hotels survived validation — refusing to overwrite hotels-live.json with an empty list.", file=sys.stderr)
        print("(The site will keep serving its last-known-good data either way, thanks to the fallback in hotels.ts.)", file=sys.stderr)
        return 1

    existing: list[dict] = []
    if LIVE_JSON_PATH.exists():
        try:
            existing = json.loads(LIVE_JSON_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            existing = []
    existing_names = {e["name"].strip().lower() for e in existing}

    def existing_id_number(hotel: dict) -> int:
        match = re.match(r"HTL(\d+)$", hotel.get("id", ""))
        return int(match.group(1)) if match else 0

    next_id = max((existing_id_number(e) for e in existing), default=0) + 1

    new_hotels: list[Hotel] = []
    new_validated: list[ResearchedHotel] = []
    for h in validated:
        if h.name.strip().lower() in existing_names:
            continue
        new_validated.append(h)
        new_hotels.append(
            Hotel(
                id=f"HTL{next_id:03d}",
                name=h.name,
                location=h.location,
                stars=h.stars,
                rating=round(min(10.0, max(0.0, h.rating)), 2),
                reviewCount=h.reviewCount,
                pricePerNight=h.pricePerNight,
                originalPrice=h.originalPrice,
                roomTypes=h.roomTypes,
                amenities=h.amenities,
                images=HOTEL_GRADIENT_PALETTE[(next_id - 1) % len(HOTEL_GRADIENT_PALETTE)],
                description=h.description,
                nearbyAttractions=h.nearbyAttractions,
                checkInTime=h.checkInTime,
                checkOutTime=h.checkOutTime,
                cancellationPolicy=h.cancellationPolicy,
                type=h.type,
            )
        )
        next_id += 1

    final_hotels = existing + [h.model_dump(mode="json") for h in new_hotels]
    LIVE_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    LIVE_JSON_PATH.write_text(json.dumps(final_hotels, indent=2), encoding="utf-8")
    print(f"Added {len(new_hotels)} new real hotels ({len(validated) - len(new_hotels)} were already in the catalog); {len(final_hotels)} total now in {LIVE_JSON_PATH.resolve()}")
    record_run("hotels", [h.name for h in new_hotels], len(validated) - len(new_hotels), len(final_hotels))

    OUTPUT_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    log_path = OUTPUT_DIR / f"run-hotels-{timestamp}.log.json"
    log_path.write_text(
        json.dumps(
            {
                "timestamp": timestamp,
                "raw_output": raw_output,
                "candidate_count": len(raw_items),
                "validated_count": len(validated),
                "dropped": [{"name": d["item"].get("name") if isinstance(d["item"], dict) else None, "error": d["error"]} for d in dropped],
                "hotels": [
                    {**h.model_dump(mode="json"), "sourceUrl": str(src.sourceUrl)}
                    for h, src in zip(new_hotels, new_validated)
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
