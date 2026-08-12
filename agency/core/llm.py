import os
from crewai import LLM

OPUS = "anthropic/claude-opus-4-8"
SONNET = "anthropic/claude-sonnet-4-6"
HAIKU = "anthropic/claude-haiku-4-5-20251001"


def get_llm(tier: str = "sonnet") -> LLM:
    model = {"opus": OPUS, "sonnet": SONNET, "haiku": HAIKU}.get(tier, SONNET)
    # Without an explicit max_tokens, this defaulted to 4096 — long tool
    # calls got truncated mid-generation into malformed JSON, which CrewAI
    # then retried forever instead of failing, burning real API spend on
    # every retry without ever completing. See TRoyAI's agency/core/llm.py
    # for the original incident this fix came from.
    kwargs = {"model": model, "api_key": os.getenv("ANTHROPIC_API_KEY"), "max_tokens": 8192}
    # The Opus tier rejects `temperature` outright (400: "temperature is
    # deprecated for this model") — only Sonnet/Haiku accept it.
    if tier != "opus":
        kwargs["temperature"] = 0.7
    return LLM(**kwargs)
