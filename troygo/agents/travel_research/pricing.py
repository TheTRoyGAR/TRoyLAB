"""Deterministic markup TRoyGO applies on top of real supplier prices.

Never invented by the LLM — this is a business pricing decision, applied
here in plain Python after validation, never inside the research prompt.
Tiered by real cruise-line market positioning (confirmed with TRoy
2026-08-21): premium/luxury/trending lines carry more margin since demand
is less price-sensitive; budget-mainstream lines stay closer to cost to
stay competitive on price. Adjust CRUISE_LINE_MARKUP directly to change
any line's margin — no code changes needed elsewhere.
"""

CRUISE_LINE_MARKUP: dict[str, float] = {
    # Mainstream & Family — price-sensitive, stay competitive
    "carnival cruise line": 0.08,
    "carnival": 0.08,
    "royal caribbean": 0.10,
    "norwegian cruise line": 0.09,
    "norwegian": 0.09,
    "disney cruise line": 0.12,  # premium family brand, holds demand
    "disney": 0.12,
    "msc cruises": 0.08,
    "msc": 0.08,
    # Premium
    "celebrity cruises": 0.13,
    "celebrity": 0.13,
    "princess cruises": 0.12,
    "princess": 0.12,
    "holland america line": 0.12,
    "holland america": 0.12,
    # Adults-Only & Niche — trendy, less price-sensitive
    "virgin voyages": 0.15,
    "cunard line": 0.14,
    "cunard": 0.14,
    # Luxury & Expedition — highest-margin, all-inclusive category
    "silversea": 0.18,
    "regent seven seas": 0.18,
    "hx expeditions": 0.17,
    "coral expeditions": 0.16,
}

DEFAULT_MARKUP = 0.10


def markup_rate(cruise_line: str) -> float:
    return CRUISE_LINE_MARKUP.get(cruise_line.strip().lower(), DEFAULT_MARKUP)


def apply_markup(amount: float, cruise_line: str) -> float:
    return round(amount * (1 + markup_rate(cruise_line)), 2)


def apply_dynamic_markup(amount: float, markup_percent: float) -> float:
    """Same idea as apply_markup, but the % comes from Finance's live
    PRICE_REVIEW decision instead of the static table above. Clamped to the
    same 5-25% band Finance is instructed to stay within, in case of a bad
    LLM response."""
    pct = max(5.0, min(25.0, markup_percent))
    return round(amount * (1 + pct / 100), 2)
