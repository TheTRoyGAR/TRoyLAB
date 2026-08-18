import os
from crewai import LLM

OPUS = "anthropic/claude-opus-4-8"
SONNET = "anthropic/claude-sonnet-4-6"
HAIKU = "anthropic/claude-haiku-4-5-20251001"


def get_llm(tier: str = "sonnet") -> LLM:
    model = {"opus": OPUS, "sonnet": SONNET, "haiku": HAIKU}.get(tier, SONNET)
    # Without an explicit max_tokens, this defaults to 4096 — long tool-call
    # output gets truncated mid-generation into malformed JSON, which CrewAI
    # then retries forever instead of failing, burning real API spend on
    # every retry without ever completing (this exact bug hit TRoyAI once).
    # 8192 wasn't enough once itineraries got detailed (9-12 packages x
    # 7-9 day-by-day entries each) — a real run got cut off mid-JSON-object
    # and crashed with an unrecoverable parse error. Bumped to 16000, still
    # well under Sonnet's real output ceiling.
    kwargs = {"model": model, "api_key": os.getenv("ANTHROPIC_API_KEY"), "max_tokens": 16000}
    # The Opus tier rejects `temperature` outright — only Sonnet/Haiku accept it.
    if tier != "opus":
        kwargs["temperature"] = 0.7
    return LLM(**kwargs)
