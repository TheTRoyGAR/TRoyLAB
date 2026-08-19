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

# Windows' console defaults stdout to cp1252, which can't encode characters
# real scraped content commonly contains (star ratings like ★, emoji, curly
# quotes). CrewAI's own verbose logging prints scraped tool output directly,
# so a single ★ in a real review snippet crashes the whole run with
# UnicodeEncodeError after real, costly API calls already happened. Same fix
# already applied to the department server's main.py — belongs here too,
# not just relied on via a PYTHONIOENCODING env var at invocation time.
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

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
    """The agent sometimes reasons out loud with several draft/incomplete
    JSON-looking fragments before its real final array (seen for real: a
    car-rental run left partial arrays literally ending in "...]" mid-
    reasoning before the actual answer). Naively spanning from the first
    "[" to the last "]" swallows all of that into one invalid blob. Instead,
    walk backward from the LAST "]" and bracket-match to find its
    corresponding "[" — that always isolates the real final array, since
    it's whatever the model wrote last."""
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

    print("Running the travel research crew — this makes real web searches and LLM calls...")
    raw_output = run_crew()

    cleaned = strip_code_fences(raw_output)
    # strict=False: the agent occasionally emits an unescaped literal newline
    # inside a string value (e.g. a highlight description that wraps mid-
    # string) — real Anthropic API output, not malformed on purpose, but
    # Python's default strict JSON parser rejects raw control characters
    # inside strings. This is the standard, safe way to accept that specific
    # real-world LLM-output quirk without loosening anything else about
    # validation (Pydantic still rejects genuinely wrong data afterward).
    try:
        raw_items = json.loads(cleaned, strict=False)
    except json.JSONDecodeError:
        # The agent sometimes adds a prose summary before the array despite
        # being told not to — retry against just the [...] slice before
        # giving up entirely.
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

    # Grow the catalog rather than replace it — load whatever's already
    # live and merge new real finds in, skipping anything that's already
    # there by name (case-insensitive). This is deliberately different from
    # the original "each run replaces the list" design: the CEO explicitly
    # wants coverage to keep growing (new regions/destinations added over
    # successive runs), not reset every time.
    existing: list[dict] = []
    if LIVE_JSON_PATH.exists():
        try:
            existing = json.loads(LIVE_JSON_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            existing = []
    existing_names = {e["name"].strip().lower() for e in existing}

    new_packages: list[TravelPackage] = []
    new_validated: list[ResearchedPackage] = []
    next_id = max((e.get("id", 0) for e in existing), default=0) + 1
    for p in validated:
        if p.name.strip().lower() in existing_names:
            continue
        new_validated.append(p)
        new_packages.append(
            TravelPackage(
                id=next_id,
                name=p.name,
                slug=slugify(p.name),
                destination=p.destination,
                countries=p.countries,
                duration=p.duration,
                price=p.price,
                originalPrice=p.originalPrice,
                rating=round(min(5.0, max(0.0, p.rating)), 2),
                reviewCount=p.reviewCount,
                imageGradient=GRADIENT_PALETTE[(next_id - 1) % len(GRADIENT_PALETTE)],
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
        next_id += 1

    final_packages = existing + [pkg.model_dump(mode="json") for pkg in new_packages]
    LIVE_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    LIVE_JSON_PATH.write_text(json.dumps(final_packages, indent=2), encoding="utf-8")
    print(f"Added {len(new_packages)} new real packages ({len(validated) - len(new_packages)} were already in the catalog); {len(final_packages)} total now in {LIVE_JSON_PATH.resolve()}")

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
                    for pkg, src in zip(new_packages, new_validated)
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
