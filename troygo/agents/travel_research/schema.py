import re
from typing import Literal

from pydantic import BaseModel, Field, HttpUrl

# Every one of these is copied verbatim from the existing (fake) entries in
# ../../src/lib/data/packages.ts — known-good Tailwind gradient classes that
# already render correctly. The LLM is never asked to invent one of these;
# the script assigns them round-robin (see run.py) to avoid a whole class of
# "made-up Tailwind class that doesn't exist" bugs.
GRADIENT_PALETTE = [
    "from-violet-500 to-purple-700",
    "from-pink-500 to-rose-600",
    "from-red-400 to-pink-600",
    "from-green-500 to-emerald-700",
    "from-cyan-400 to-blue-600",
    "from-amber-500 to-orange-700",
    "from-blue-400 to-indigo-600",
    "from-yellow-400 to-amber-600",
    "from-orange-500 to-red-700",
    "from-teal-400 to-green-600",
    "from-yellow-300 to-orange-500",
    "from-slate-400 to-blue-700",
    "from-rose-400 to-pink-600",
    "from-green-400 to-teal-600",
    "from-orange-400 to-pink-600",
    "from-sky-400 to-blue-500",
    "from-blue-500 to-indigo-700",
    "from-cyan-300 to-teal-500",
    "from-lime-400 to-green-600",
    "from-sky-300 to-blue-500",
    "from-cyan-400 to-teal-600",
    "from-slate-400 to-blue-600",
    "from-indigo-500 to-purple-700",
    "from-amber-400 to-orange-600",
    "from-sky-400 to-blue-600",
    "from-yellow-400 to-green-600",
    "from-red-500 to-rose-700",
    "from-orange-400 to-red-600",
    "from-yellow-300 to-red-500",
    "from-blue-300 to-cyan-500",
]


def slugify(name: str) -> str:
    s = name.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


class Includes(BaseModel):
    flights: bool
    hotel: bool
    transfers: bool
    meals: bool
    guide: bool


class ItineraryDay(BaseModel):
    day: int
    title: str
    description: str


class ResearchedPackage(BaseModel):
    """What the LLM is asked to produce for one real deal. id/slug/imageGradient
    are deliberately NOT here — the script assigns those deterministically
    after validation (see run.py), never trusting the LLM to generate them."""

    name: str
    destination: str
    countries: list[str]
    duration: int = Field(gt=0)
    price: float = Field(gt=0)
    originalPrice: float = Field(gt=0)
    rating: float = Field(ge=0, le=5)
    reviewCount: int = Field(ge=0)
    includes: Includes
    highlights: list[str]
    departureDates: list[str]
    maxGroupSize: int = Field(gt=0)
    difficulty: Literal["easy", "moderate", "challenging"]
    category: Literal["adventure", "luxury", "family", "cultural", "honeymoon", "beach"]
    description: str
    itinerary: list[ItineraryDay]
    # Required, not optional — a missing sourceUrl is the strongest signal
    # of a fabricated entry slipping through (see run.py's hard-fail check).
    sourceUrl: HttpUrl


class TravelPackage(BaseModel):
    """Exact mirror of the TypeScript TravelPackage interface in
    ../../src/lib/data/packages.ts. This is what actually gets written to
    packages-live.json (sourceUrl is stripped — see run.py)."""

    id: int
    name: str
    slug: str
    destination: str
    countries: list[str]
    duration: int
    price: float
    originalPrice: float
    currency: Literal["USD"] = "USD"
    rating: float
    reviewCount: int
    imageGradient: str
    includes: Includes
    highlights: list[str]
    departureDates: list[str]
    maxGroupSize: int
    difficulty: Literal["easy", "moderate", "challenging"]
    category: Literal["adventure", "luxury", "family", "cultural", "honeymoon", "beach"]
    description: str
    itinerary: list[ItineraryDay]
