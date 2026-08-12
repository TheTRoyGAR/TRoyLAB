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


def remember(summary: str, *, scope: str, categories: list[str], importance: float = 0.5) -> None:
    """Deterministic save after a skill completes — guarantees a record
    exists regardless of whether the agent also saved mid-task on its own."""
    shared_memory.remember(summary, scope=scope, categories=categories, importance=importance)


def recall_context(query: str, *, limit: int = 5) -> str:
    """Deterministic pre-task recall, formatted for prepending to a Task
    description. Returns "" when nothing relevant is found."""
    matches = shared_memory.recall(query, limit=limit, depth="shallow")
    if not matches:
        return ""
    lines = "\n".join(f"- {m.record.content}" for m in matches)
    return f"RELEVANT PAST LEARNINGS (from other departments):\n{lines}\n"
