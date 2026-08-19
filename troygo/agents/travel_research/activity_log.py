"""Shared helper: records a real entry every time a research script finishes,
so the TRoyGO dashboard can show genuine agent activity (last run, what was
found) instead of the fake mock "Workflows" data elsewhere in the dashboard.

Writes to ../../src/lib/data/agent-activity.json — same live-JSON-import
pattern already used for packages/hotels/cars/cruises, so the Next.js
dashboard reads it with zero runtime filesystem access.
"""

import json
from datetime import datetime, timezone
from pathlib import Path

ACTIVITY_JSON_PATH = Path(__file__).parent / ".." / ".." / "src" / "lib" / "data" / "agent-activity.json"
MAX_ENTRIES = 40


def record_run(category: str, added: list[str], already_existed: int, total_now: int) -> None:
    """category: 'packages' | 'hotels' | 'cars' | 'cruises'
    added: real names of the newly added items this run
    already_existed: how many candidates were duplicates of existing items
    total_now: total catalog size for this category after this run
    """
    entries: list[dict] = []
    if ACTIVITY_JSON_PATH.exists():
        try:
            entries = json.loads(ACTIVITY_JSON_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            entries = []

    entries.insert(
        0,
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "category": category,
            "addedCount": len(added),
            "addedNames": added[:5],
            "alreadyExisted": already_existed,
            "totalNow": total_now,
        },
    )
    entries = entries[:MAX_ENTRIES]

    ACTIVITY_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    ACTIVITY_JSON_PATH.write_text(json.dumps(entries, indent=2), encoding="utf-8")
