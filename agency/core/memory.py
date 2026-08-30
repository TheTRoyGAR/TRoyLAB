import os

from crewai.memory.storage.lancedb_storage import LanceDBStorage
from crewai.memory.unified_memory import Memory

from agency.core.llm import get_llm

_STORAGE_DIR = os.path.join(os.path.dirname(__file__), ".memory_store")

# One flat, shared store for TRoyGO — no per-department root_scope. All 5
# departments (Marketing, Sales, Finance, CTO, Management) read/write the
# same store so they can actually talk to each other, not work in silos.
# This is TRoyGO's own store, separate from TRoyAI's — each company gets
# its own memory, per the fork-per-company model.
shared_memory = Memory(
    llm=get_llm("haiku"),
    storage=LanceDBStorage(path=_STORAGE_DIR),
    embedder={"provider": "sentence-transformer", "config": {"model_name": "all-MiniLM-L6-v2"}},
    root_scope=None,
)


# Standing CEO directive — prepended to EVERY task across EVERY department,
# unconditionally. Added 2026-08-30 after a real incident where a Finance
# skill fabricated signed clients and revenue for a NAB loan application
# (in TRoyAI — see reports/DELETED_fake_finance_memory_backup.json).
STANDING_DIRECTIVE = (
    "STANDING RULES FROM TROY (CEO, TROYGO Group™) — apply to every task, every department, no exceptions:\n"
    "1. NEVER fabricate clients, revenue, signed contracts, or financial figures. A cold-outreach "
    "prospect is NEVER a signed client or active retainer unless TRoy has explicitly confirmed a "
    "real signed agreement exists. If no real client/revenue is confirmed, state it as $0 — do "
    "not invent a plausible-sounding number to fill the gap.\n"
    "2. In any cost or financial report, separate CONFIRMED real costs (real, verifiable, published "
    "vendor pricing) from ESTIMATED costs (real category, needs a real quote) — never blend them, "
    "never present an estimate as if it were confirmed.\n"
    "3. If you don't have real data to answer something, say so plainly and flag what's needed to "
    "get the real answer — do not guess and present the guess as fact.\n"
    "4. The group umbrella brand is TROYGO Group™ (TRoyAI™, TRoyGO™, TRoyMAR™, TRoyMEDIA™).\n"
)


def remember(summary: str, *, scope: str, categories: list[str], importance: float = 0.5) -> None:
    """Deterministic save after a skill completes — guarantees a record
    exists regardless of whether the agent also saved mid-task on its own."""
    shared_memory.remember(summary, scope=scope, categories=categories, importance=importance)


def recall_context(query: str, *, limit: int = 5) -> str:
    """Deterministic pre-task recall, formatted for prepending to a Task
    description. Always includes the standing directive."""
    matches = shared_memory.recall(query, limit=limit, depth="shallow")
    if not matches:
        return STANDING_DIRECTIVE
    lines = "\n".join(f"- {m.record.content}" for m in matches)
    return (
        STANDING_DIRECTIVE
        + f"\nRELEVANT PAST LEARNINGS (from other departments):\n{lines}\n"
    )
