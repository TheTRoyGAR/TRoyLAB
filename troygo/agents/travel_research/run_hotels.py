"""CLI entrypoint: runs the hotel research crew, validates its output, and writes:
  - ../../src/lib/data/hotels-live.json    (consumed by the Next.js site)
  - output/run-hotels-<timestamp>.log.json (audit trail: raw output + sources)

Each run REPLACES the live hotel list with a fresh set of currently-real
hotels/rates — old runs aren't accumulated, since a rate that was current a
month ago usually isn't anymore. Re-run this periodically to refresh.
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
from schema import HOTEL_GRADIENT_PALETTE, ResearchedHotel, Hotel  # noqa: E402

HERE = Path(__file__).parent
LIVE_JSON_PATH = HERE / ".." / ".." / "src" / "lib" / "data" / "hotels-live.json"
OUTPUT_DIR = HERE / "output"


def strip_code_fences(text: str) -> str:
    text = text.strip()
    match = re.match(r"^```(?:json)?\s*(.*?)\s*```$", text, re.DOTALL)
    return match.group(1) if match else text


def extract_json_array(text: str) -> str:
    """The agent sometimes prepends a prose summary before the JSON array
    despite being told not to. Fall back to slicing out the first top-level
    [...] block rather than failing the whole run over a chatty preamble."""
    start = text.find("[")
    end = text.rfind("]")
    if start == -1 or end == -1 or end < start:
        return text
    return text[start : end + 1]


def main() -> int:
    if not os.getenv("ANTHROPIC_API_KEY") or not os.getenv("SERPER_API_KEY"):
        print("ERROR: ANTHROPIC_API_KEY and SERPER_API_KEY must both be set in .env", file=sys.stderr)
        return 1

    print("Running the hotel research crew — this makes real web searches and LLM calls...")
    raw_output = run_crew()

    cleaned = strip_code_fences(raw_output)
    try:
        raw_items = json.loads(cleaned)
    except json.JSONDecodeError:
        try:
            raw_items = json.loads(extract_json_array(cleaned))
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

    final_hotels: list[Hotel] = []
    for i, h in enumerate(validated, start=1):
        final_hotels.append(
            Hotel(
                id=f"HTL{i:03d}",
                name=h.name,
                location=h.location,
                stars=h.stars,
                rating=round(min(10.0, max(0.0, h.rating)), 2),
                reviewCount=h.reviewCount,
                pricePerNight=h.pricePerNight,
                originalPrice=h.originalPrice,
                roomTypes=h.roomTypes,
                amenities=h.amenities,
                images=HOTEL_GRADIENT_PALETTE[(i - 1) % len(HOTEL_GRADIENT_PALETTE)],
                description=h.description,
                nearbyAttractions=h.nearbyAttractions,
                checkInTime=h.checkInTime,
                checkOutTime=h.checkOutTime,
                cancellationPolicy=h.cancellationPolicy,
                type=h.type,
            )
        )

    live_json = [h.model_dump(mode="json") for h in final_hotels]
    LIVE_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    LIVE_JSON_PATH.write_text(json.dumps(live_json, indent=2), encoding="utf-8")
    print(f"Wrote {len(final_hotels)} real hotels to {LIVE_JSON_PATH.resolve()}")

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
                    for h, src in zip(final_hotels, validated)
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
