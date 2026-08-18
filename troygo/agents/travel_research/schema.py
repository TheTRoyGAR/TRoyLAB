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


# ── HOTELS ────────────────────────────────────────────────────────────────

# Copied verbatim from the existing (fake) entries in
# ../../src/lib/data/hotels.ts — known-good Tailwind gradient classes.
# Same reasoning as GRADIENT_PALETTE above: never let the LLM invent one.
HOTEL_GRADIENT_PALETTE = [
    "from-blue-900 via-indigo-800 to-purple-900",
    "from-red-900 via-rose-800 to-pink-900",
    "from-cyan-800 via-teal-700 to-emerald-800",
    "from-yellow-700 via-amber-600 to-orange-700",
    "from-slate-700 via-gray-600 to-zinc-700",
    "from-amber-800 via-yellow-700 to-lime-800",
    "from-green-800 via-emerald-700 to-teal-800",
    "from-orange-800 via-amber-700 to-yellow-800",
    "from-sky-600 via-cyan-500 to-teal-600",
    "from-zinc-700 via-stone-600 to-neutral-700",
    "from-red-700 via-rose-600 to-pink-700",
    "from-violet-800 via-purple-700 to-indigo-800",
    "from-rose-800 via-pink-700 to-fuchsia-800",
    "from-indigo-800 via-blue-700 to-sky-800",
    "from-lime-800 via-green-700 to-emerald-800",
]


class RoomType(BaseModel):
    name: str
    price: float = Field(gt=0)
    capacity: int = Field(gt=0)
    bedType: str


class HotelLocation(BaseModel):
    city: str
    country: str
    address: str


class ResearchedHotel(BaseModel):
    """What the LLM is asked to produce for one real hotel. id/images
    (gradient) are deliberately NOT here — assigned deterministically after
    validation, same reasoning as ResearchedPackage above."""

    name: str
    location: HotelLocation
    stars: Literal[3, 4, 5]
    rating: float = Field(ge=0, le=10)
    reviewCount: int = Field(ge=0)
    pricePerNight: float = Field(gt=0)
    originalPrice: float = Field(gt=0)
    roomTypes: list[RoomType]
    amenities: list[str]
    description: str
    nearbyAttractions: list[str]
    checkInTime: str
    checkOutTime: str
    cancellationPolicy: Literal["Free cancellation", "Non-refundable", "24h cancellation"]
    type: Literal["hotel", "resort", "hostel", "boutique"]
    # Required — same "strongest signal of fabrication" reasoning as
    # ResearchedPackage.sourceUrl.
    sourceUrl: HttpUrl


class ResearchedCarRental(BaseModel):
    """What the LLM is asked to produce for one real car rental listing.
    id/gradient are deliberately NOT here — assigned deterministically after
    validation, same reasoning as the other Researched* models above."""

    name: str
    model: str
    type: Literal["Economy", "Compact", "SUV", "Luxury", "Van"]
    transmission: Literal["Automatic", "Manual"]
    seats: int = Field(gt=0)
    bags: int = Field(ge=0)
    doors: int = Field(gt=0)
    ac: bool
    pricePerDay: float = Field(gt=0)
    supplier: str
    supplierLogo: str = Field(description="1-2 letter abbreviation of the supplier name")
    features: list[str]
    pickupLocations: list[str]
    fuelPolicy: str
    mileage: str
    sourceUrl: HttpUrl


class CarRental(BaseModel):
    """Exact mirror of the TypeScript CarRental interface in
    ../../src/app/cars/page.tsx (now src/lib/data/cars.ts). Written to
    cars-live.json (sourceUrl stripped — see run_cars.py)."""

    id: str
    name: str
    model: str
    type: Literal["Economy", "Compact", "SUV", "Luxury", "Van"]
    transmission: Literal["Automatic", "Manual"]
    seats: int
    bags: int
    doors: int
    ac: bool
    pricePerDay: float
    supplier: str
    supplierLogo: str
    gradient: str
    features: list[str]
    pickupLocations: list[str]
    fuelPolicy: str
    mileage: str


CAR_GRADIENT_PALETTE = [
    "from-slate-600 via-gray-500 to-zinc-600",
    "from-blue-700 via-blue-600 to-indigo-700",
    "from-red-700 via-rose-600 to-pink-700",
    "from-zinc-700 via-stone-600 to-neutral-700",
    "from-emerald-700 via-green-600 to-teal-700",
    "from-yellow-600 via-amber-500 to-orange-600",
    "from-indigo-700 via-violet-600 to-purple-700",
    "from-cyan-700 via-sky-600 to-blue-700",
    "from-teal-700 via-emerald-600 to-green-700",
    "from-slate-700 via-gray-600 to-slate-800",
]


# ── CRUISES ───────────────────────────────────────────────────────────────

CRUISE_GRADIENT_PALETTE = [
    "from-blue-400 to-indigo-600",
    "from-cyan-400 to-blue-600",
    "from-teal-400 to-green-600",
    "from-sky-400 to-blue-500",
    "from-indigo-500 to-purple-700",
    "from-cyan-300 to-teal-500",
    "from-blue-500 to-indigo-700",
    "from-sky-300 to-blue-500",
    "from-slate-400 to-blue-700",
    "from-blue-300 to-cyan-500",
]


class CabinType(BaseModel):
    name: str
    price: float = Field(gt=0)
    description: str


class PortStop(BaseModel):
    port: str
    country: str
    arrivalTime: str
    departureTime: str
    highlights: list[str]


class ResearchedCruise(BaseModel):
    """What the LLM is asked to produce for one real cruise. id/imageGradient
    are deliberately NOT here — assigned deterministically after validation,
    same reasoning as the other Researched* models above."""

    name: str
    ship: str
    cruiseLine: str
    itinerary: list[PortStop]
    duration: int = Field(gt=0, description="nights")
    price: float = Field(gt=0, description="USD per cabin, cheapest cabin")
    originalPrice: float = Field(gt=0)
    cabinTypes: list[CabinType]
    rating: float = Field(ge=0, le=5)
    reviewCount: int = Field(ge=0)
    departurePort: str
    includes: list[str]
    amenities: list[str]
    category: str
    description: str
    sourceUrl: HttpUrl


class Cruise(BaseModel):
    """Exact mirror of the TypeScript Cruise interface in
    ../../src/lib/data/packages.ts. Written to cruises-live.json (sourceUrl
    stripped — see run_cruises.py)."""

    id: int
    name: str
    ship: str
    cruiseLine: str
    itinerary: list[PortStop]
    duration: int
    price: float
    originalPrice: float
    cabinTypes: list[CabinType]
    rating: float
    reviewCount: int
    departurePort: str
    includes: list[str]
    amenities: list[str]
    imageGradient: str
    category: str
    description: str


class Hotel(BaseModel):
    """Exact mirror of the TypeScript Hotel interface in
    ../../src/lib/data/hotels.ts. This is what gets written to
    hotels-live.json (sourceUrl is stripped — see run_hotels.py)."""

    id: str
    name: str
    location: HotelLocation
    stars: Literal[3, 4, 5]
    rating: float
    reviewCount: int
    pricePerNight: float
    originalPrice: float
    roomTypes: list[RoomType]
    amenities: list[str]
    images: str
    description: str
    nearbyAttractions: list[str]
    checkInTime: str
    checkOutTime: str
    cancellationPolicy: Literal["Free cancellation", "Non-refundable", "24h cancellation"]
    type: Literal["hotel", "resort", "hostel", "boutique"]
