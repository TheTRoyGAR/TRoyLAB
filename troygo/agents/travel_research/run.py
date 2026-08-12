"""CLI entrypoint: runs the research crew, validates its output, and writes:
  - ../../src/lib/data/packages-live.json  (consumed by the Next.js site)
  - output/run-<timestamp>.log.json        (audit trail: raw output + sources)

Each run REPLACES the live package list with a fresh set of currently-real
deals — old runs aren't accumulated, since a deal that was "current" a month
ago usually isn't anymore. Re-run this periodically to refresh.
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

from crew import run as run_crew  # noqa: E402  (must follow load_dotenv())
from schema import GRADIENT_PALETTE, ResearchedPackage, TravelPackage, slugify  # noqa: E402

HERE = Path(__file__).parent
LIVE_JSON_PATH = HERE / ".." / ".." / "src" / "lib" / "data" / "packages-live.json"
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

    print("Running the travel research crew — this makes real web searches and LLM calls...")
    raw_output = run_crew()

    cleaned = strip_code_fences(raw_output)
    try:
        raw_items = json.loads(cleaned)
    except json.JSONDecodeError:
        # The agent sometimes adds a prose summary before the array despite
        # being told not to — retry against just the [...] slice before
        # giving up entirely.
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

    validated: list[ResearchedPackage] = []
    dropped: list[dict] = []
    for item in raw_items:
        try:
            validated.append(ResearchedPackage.model_validate(item))
        except ValidationError as e:
            dropped.append({"item": item, "error": str(e)})

    print(f"Crew returned {len(raw_items)} candidate deals; {len(validated)} passed validation, {len(dropped)} dropped.")
    for d in dropped:
        name = d["item"].get("name", "<unknown>") if isinstance(d["item"], dict) else "<malformed>"
        print(f"  dropped: {name} — {d['error'].splitlines()[0]}")

    # ResearchedPackage.sourceUrl is a required field, so anything in
    # `validated` already has one — this loop is a final explicit sanity
    # check, not the only thing enforcing it.
    missing_source = [p for p in validated if not p.sourceUrl]
    if missing_source:
        print(f"ERROR: {len(missing_source)} validated items are missing sourceUrl — refusing to write output.", file=sys.stderr)
        return 1

    if not validated:
        print("ERROR: zero deals survived validation — refusing to overwrite packages-live.json with an empty list.", file=sys.stderr)
        print("(The site will keep serving its last-known-good data either way, thanks to the fallback in packages.ts.)", file=sys.stderr)
        return 1

    final_packages: list[TravelPackage] = []
    for i, p in enumerate(validated, start=1):
        final_packages.append(
            TravelPackage(
                id=i,
                name=p.name,
                slug=slugify(p.name),
                destination=p.destination,
                countries=p.countries,
                duration=p.duration,
                price=p.price,
                originalPrice=p.originalPrice,
                rating=round(min(5.0, max(0.0, p.rating)), 2),
                reviewCount=p.reviewCount,
                imageGradient=GRADIENT_PALETTE[(i - 1) % len(GRADIENT_PALETTE)],
                includes=p.includes,
                highlights=p.highlights,
                departureDates=p.departureDates,
                maxGroupSize=p.maxGroupSize,
                difficulty=p.difficulty,
                category=p.category,
                description=p.description,
                itinerary=p.itinerary,
            )
        )

    live_json = [pkg.model_dump(mode="json") for pkg in final_packages]
    LIVE_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    LIVE_JSON_PATH.write_text(json.dumps(live_json, indent=2), encoding="utf-8")
    print(f"Wrote {len(final_packages)} real packages to {LIVE_JSON_PATH.resolve()}")

    OUTPUT_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    log_path = OUTPUT_DIR / f"run-{timestamp}.log.json"
    log_path.write_text(
        json.dumps(
            {
                "timestamp": timestamp,
                "raw_output": raw_output,
                "candidate_count": len(raw_items),
                "validated_count": len(validated),
                "dropped": [{"name": d["item"].get("name") if isinstance(d["item"], dict) else None, "error": d["error"]} for d in dropped],
                "packages": [
                    {**pkg.model_dump(mode="json"), "sourceUrl": str(src.sourceUrl)}
                    for pkg, src in zip(final_packages, validated)
                ],
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"Wrote audit log to {log_path.resolve()}")
    print("\nNext: spot-check a few sourceUrls in the log file, then rebuild + redeploy the site (see run_and_deploy.ps1).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
