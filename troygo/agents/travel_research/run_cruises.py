"""CLI entrypoint: runs the cruise research crew, validates its output, and writes:
  - ../../src/lib/data/cruises-live.json    (consumed by the Next.js site)
  - output/run-cruises-<timestamp>.log.json (audit trail: raw output + sources)

Each run REPLACES the live cruise list with a fresh set of currently-real
itineraries/prices. Re-run this periodically to refresh.
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
from schema import CRUISE_GRADIENT_PALETTE, ResearchedCruise, Cruise  # noqa: E402

HERE = Path(__file__).parent
LIVE_JSON_PATH = HERE / ".." / ".." / "src" / "lib" / "data" / "cruises-live.json"
OUTPUT_DIR = HERE / "output"


def strip_code_fences(text: str) -> str:
    text = text.strip()
    match = re.match(r"^```(?:json)?\s*(.*?)\s*```$", text, re.DOTALL)
    return match.group(1) if match else text


def extract_json_array(text: str) -> str:
    start = text.find("[")
    end = text.rfind("]")
    if start == -1 or end == -1 or end < start:
        return text
    return text[start : end + 1]


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

    final_cruises: list[Cruise] = []
    for i, c in enumerate(validated, start=1):
        final_cruises.append(
            Cruise(
                id=i,
                name=c.name,
                ship=c.ship,
                cruiseLine=c.cruiseLine,
                itinerary=c.itinerary,
                duration=c.duration,
                price=c.price,
                originalPrice=c.originalPrice,
                cabinTypes=c.cabinTypes,
                rating=round(min(5.0, max(0.0, c.rating)), 2),
                reviewCount=c.reviewCount,
                departurePort=c.departurePort,
                includes=c.includes,
                amenities=c.amenities,
                imageGradient=CRUISE_GRADIENT_PALETTE[(i - 1) % len(CRUISE_GRADIENT_PALETTE)],
                category=c.category,
                description=c.description,
            )
        )

    live_json = [c.model_dump(mode="json") for c in final_cruises]
    LIVE_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    LIVE_JSON_PATH.write_text(json.dumps(live_json, indent=2), encoding="utf-8")
    print(f"Wrote {len(final_cruises)} real cruises to {LIVE_JSON_PATH.resolve()}")

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
                    for c, src in zip(final_cruises, validated)
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
