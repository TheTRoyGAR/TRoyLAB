"""CLI entrypoint: runs the car rental research crew, validates its output, and writes:
  - ../../src/lib/data/cars-live.json    (consumed by the Next.js site)
  - output/run-cars-<timestamp>.log.json (audit trail: raw output + sources)

Each run GROWS the live car list, merging new real finds in and skipping
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

from crew import run_cars as run_crew  # noqa: E402  (must follow load_dotenv())
from activity_log import record_run  # noqa: E402
from schema import CAR_GRADIENT_PALETTE, ResearchedCarRental, CarRental  # noqa: E402

HERE = Path(__file__).parent
LIVE_JSON_PATH = HERE / ".." / ".." / "src" / "lib" / "data" / "cars-live.json"
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

    print("Running the car rental research crew — this makes real web searches and LLM calls...")
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

    validated: list[ResearchedCarRental] = []
    dropped: list[dict] = []
    for item in raw_items:
        try:
            validated.append(ResearchedCarRental.model_validate(item))
        except ValidationError as e:
            dropped.append({"item": item, "error": str(e)})

    print(f"Crew returned {len(raw_items)} candidate cars; {len(validated)} passed validation, {len(dropped)} dropped.")
    for d in dropped:
        name = d["item"].get("name", "<unknown>") if isinstance(d["item"], dict) else "<malformed>"
        print(f"  dropped: {name} — {d['error'].splitlines()[0]}")

    missing_source = [c for c in validated if not c.sourceUrl]
    if missing_source:
        print(f"ERROR: {len(missing_source)} validated items are missing sourceUrl — refusing to write output.", file=sys.stderr)
        return 1

    if not validated:
        print("ERROR: zero cars survived validation — refusing to overwrite cars-live.json with an empty list.", file=sys.stderr)
        print("(The site will keep serving its last-known-good data either way, thanks to the fallback in cars.ts.)", file=sys.stderr)
        return 1

    # Grow the catalog rather than replace it — same additive pattern as
    # run.py (packages): load whatever's already live, skip anything
    # already there by name (case-insensitive), and continue the id
    # sequence from the highest existing CARnnn number.
    existing: list[dict] = []
    if LIVE_JSON_PATH.exists():
        try:
            existing = json.loads(LIVE_JSON_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            existing = []
    existing_names = {e["name"].strip().lower() for e in existing}

    def existing_id_number(car: dict) -> int:
        match = re.match(r"CAR(\d+)$", car.get("id", ""))
        return int(match.group(1)) if match else 0

    next_id = max((existing_id_number(e) for e in existing), default=0) + 1

    new_cars: list[CarRental] = []
    new_validated: list[ResearchedCarRental] = []
    for c in validated:
        if c.name.strip().lower() in existing_names:
            continue
        new_validated.append(c)
        new_cars.append(
            CarRental(
                id=f"CAR{next_id:03d}",
                name=c.name,
                model=c.model,
                type=c.type,
                transmission=c.transmission,
                seats=c.seats,
                bags=c.bags,
                doors=c.doors,
                ac=c.ac,
                pricePerDay=c.pricePerDay,
                supplier=c.supplier,
                supplierLogo=c.supplierLogo,
                gradient=CAR_GRADIENT_PALETTE[(next_id - 1) % len(CAR_GRADIENT_PALETTE)],
                features=c.features,
                pickupLocations=c.pickupLocations,
                fuelPolicy=c.fuelPolicy,
                mileage=c.mileage,
            )
        )
        next_id += 1

    final_cars = existing + [c.model_dump(mode="json") for c in new_cars]
    LIVE_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    LIVE_JSON_PATH.write_text(json.dumps(final_cars, indent=2), encoding="utf-8")
    print(f"Added {len(new_cars)} new real cars ({len(validated) - len(new_cars)} were already in the catalog); {len(final_cars)} total now in {LIVE_JSON_PATH.resolve()}")
    record_run("cars", [c.name for c in new_cars], len(validated) - len(new_cars), len(final_cars))

    OUTPUT_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    log_path = OUTPUT_DIR / f"run-cars-{timestamp}.log.json"
    log_path.write_text(
        json.dumps(
            {
                "timestamp": timestamp,
                "raw_output": raw_output,
                "candidate_count": len(raw_items),
                "validated_count": len(validated),
                "dropped": [{"name": d["item"].get("name") if isinstance(d["item"], dict) else None, "error": d["error"]} for d in dropped],
                "cars": [
                    {**c.model_dump(mode="json"), "sourceUrl": str(src.sourceUrl)}
                    for c, src in zip(new_cars, new_validated)
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
