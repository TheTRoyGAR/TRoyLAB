from crewai import Agent, Task, Crew, Process
from crewai_tools import SerperDevTool, ScrapeWebsiteTool

from llm import get_llm

search = SerperDevTool()
scrape = ScrapeWebsiteTool()

RESEARCHER_BACKSTORY = (
    "You are a travel deals researcher for TRoyGO, a real travel agency. "
    "Your only job is finding genuinely current, real travel deals and "
    "campaigns by searching the live web — never inventing one. A deal you "
    "cannot verify by actually visiting its source page does not belong in "
    "your output. Fewer real deals is always better than more invented ones."
)

TASK_DESCRIPTION = """\
Find 9 to 12 real, currently-advertised travel deals or vacation packages by
searching the web. Cover a mix of destinations and deal types (not all the
same region) — for example run separate searches like:
- "current flight and hotel package deals 2026"
- "best all-inclusive vacation deals this month"
- "travel deals Europe" / "travel deals Asia" / "travel deals Caribbean"
- "Darwin Northern Territory tour packages Kakadu Litchfield deals"
- "Troy ancient city Turkey tour package" / "Aegean coast Turkey tour deals"
- "Anatolia Turkey tour package" / "Istanbul Cappadocia holiday package deals"
- "Big Sky Montana travel package deals" / "Okinawa Japan tour package deals"
- "Sardinia Italy vacation package deals" / "Madeira Portugal travel deals"
- "Bangkok Thailand tour package deals" / "New Zealand travel package deals"
- "limited time travel campaign discount"

Darwin/Northern Territory and Turkey's Troy/Aegean/Anatolia region must
each be represented by at least one real, verified deal in the final
results — search specifically for both rather than treating them as
optional alongside the other regions.

Also specifically search for deals in these currently-trending destinations
(per real 2026 travel industry data — Big Sky, Okinawa, and Sardinia are this
year's fastest-rising searches; Madeira, Bangkok, and New Zealand are the
current top trending/most-booked destinations globally): Big Sky Montana,
Okinawa Japan, Sardinia Italy, Madeira, Bangkok, New Zealand. At least one of
these six should be represented if a real, verifiable deal can be found.

For every candidate deal:
1. Search for it, find a real source page (a travel site, airline, hotel
   chain, or deal-aggregator article).
2. Actually open that page with the scrape tool and confirm the destination,
   price, and any dates are really stated there — not just implied by a
   search snippet.
3. If you cannot confirm it on a real page, drop it. Do not include it.

For each CONFIRMED deal, produce one JSON object with these exact fields:

- name (string): the deal/package name as it actually appears, or a clear
  descriptive name if the source doesn't give one a name
- destination (string): the primary destination
- countries (array of strings): country or countries involved
- duration (integer, days): stated on the source if given; otherwise a
  reasonable estimate for that kind of trip (do not leave it blank)
- price (number, USD per person): the actual price found on the source.
  Never invent this number.
- originalPrice (number, USD per person): the "before discount" price if the
  source states one; otherwise repeat `price` (no invented markup)
- rating (number, 0-5): omit invented precision — if the source doesn't give
  a rating, use 4.5 as a neutral placeholder, do not fabricate a specific
  decimal like 4.87
- reviewCount (integer): if unknown, use 0
- includes (object with boolean fields: flights, hotel, transfers, meals,
  guide): set each true/false based on what the source actually describes
  as included
- highlights (array of strings, 3-5 items): real activities/features
  mentioned on the source page — do not invent a specific named restaurant,
  hotel, or activity that wasn't mentioned
- departureDates (array of ISO date strings, e.g. "2026-09-15"): dates
  actually stated on the source; if none are given, this can be an empty array
- maxGroupSize (integer): if unknown, use a reasonable default like 12
- difficulty ("easy" | "moderate" | "challenging"): a reasonable judgment
  call based on the destination/activity type
- category ("adventure" | "luxury" | "family" | "cultural" | "honeymoon" |
  "beach"): pick the single best fit
- description (string, 1-2 sentences): summarize what the source actually
  says about the deal
- itinerary (array of objects with day/title/description): a short, generic
  day-by-day outline consistent with the real destination and duration — do
  not invent specific named venues that weren't in the source
- sourceUrl (string, required): the exact URL you scraped to confirm this
  deal. This is mandatory — never include a deal without one.

Return ONLY a JSON array of these objects, nothing else — no markdown code
fences, no commentary before or after.
"""


def build_agent() -> Agent:
    return Agent(
        role="Travel Deals Researcher",
        goal="Find real, currently-advertised travel deals via live web search — never invent one.",
        backstory=RESEARCHER_BACKSTORY,
        llm=get_llm("sonnet"),
        tools=[search, scrape],
        verbose=True,
    )


def build_task(agent: Agent) -> Task:
    return Task(
        description=TASK_DESCRIPTION,
        expected_output="A JSON array of real travel deal objects, each with a verified sourceUrl.",
        agent=agent,
    )


def run() -> str:
    agent = build_agent()
    task = build_task(agent)
    crew = Crew(agents=[agent], tasks=[task], process=Process.sequential, verbose=True)
    result = crew.kickoff()
    return str(result)


# ── HOTELS ────────────────────────────────────────────────────────────────

HOTEL_RESEARCHER_BACKSTORY = (
    "You are a hotel deals researcher for TRoyGO, a real travel agency. "
    "Your only job is finding genuinely real, currently-bookable hotels and "
    "their actual current rates by searching the live web — never inventing "
    "one. A hotel or price you cannot verify by actually visiting its source "
    "page does not belong in your output. Fewer real hotels is always better "
    "than more invented ones."
)

HOTEL_TASK_DESCRIPTION = """\
Find 8 to 12 real, currently-bookable hotels by searching the web. Cover a
mix of destinations, star ratings, and hotel types (not all luxury, not all
one city) — for example run separate searches like:
- "best hotels [major city] 2026 current rates"
- "top rated boutique hotels [region]"
- "budget hostels [popular backpacker destination]"
- "luxury resorts [beach destination] current prices"
- "best hotels Sydney Australia current rates"
- "best hotels Darwin Northern Territory current rates"
- "best hotels Istanbul Cappadocia Turkey current rates"

At least one real Sydney hotel and one real Darwin hotel should be included
in the results if you can confirm them — the site currently has zero
Australian hotels despite already offering flights and tours there.

For every candidate hotel:
1. Search for it, find a real source page (the hotel's own site, a real
   booking platform, or a real hotel review/ranking article).
2. Actually open that page with the scrape tool and confirm the location,
   price, star rating, and amenities are really stated there — not just
   implied by a search snippet.
3. If you cannot confirm it on a real page, drop it. Do not include it.

For each CONFIRMED hotel, produce one JSON object with these exact fields:

- name (string): the hotel's real name as it actually appears
- location (object: city, country, address): real location as stated on the
  source. If the exact street address isn't given, use the city/area name.
- stars (3, 4, or 5): as stated on the source, or a reasonable judgment call
  based on how the hotel is described
- rating (number, 0-10): the real review score if the source states one
  (many review sites use 0-10); if only a 5-star scale is given, convert
  (multiply by 2); if no rating exists, use 8.5 as a neutral placeholder
- reviewCount (integer): real count if stated; otherwise 0
- pricePerNight (number, USD): the actual current nightly rate found on the
  source. Never invent this number.
- originalPrice (number, USD): the "before discount" rate if the source
  states one; otherwise repeat pricePerNight (no invented markup)
- roomTypes (array of {name, price, capacity, bedType}, 2-3 items): real
  room options as described on the source — do not invent a room type that
  wasn't mentioned
- amenities (array of strings): real amenities listed on the source
- description (string, 1-2 sentences): summarize what the source actually
  says about the hotel
- nearbyAttractions (array of strings, 2-4 items): real nearby
  landmarks/attractions if the source mentions the location clearly enough
  to name them accurately; otherwise a shorter list is fine
- checkInTime / checkOutTime (string, e.g. "15:00"): as stated on the
  source; if unknown, use "15:00" / "11:00" as reasonable defaults
- cancellationPolicy ("Free cancellation" | "Non-refundable" | "24h
  cancellation"): as stated on the source; if unknown, use "Free
  cancellation" as a neutral default
- type ("hotel" | "resort" | "hostel" | "boutique"): pick the single best
  fit based on how the source describes it
- sourceUrl (string, required): the exact URL you scraped to confirm this
  hotel. This is mandatory — never include a hotel without one.

Return ONLY a JSON array of these objects, nothing else — no markdown code
fences, no commentary before or after.
"""


def build_hotel_agent() -> Agent:
    return Agent(
        role="Hotel Deals Researcher",
        goal="Find real, currently-bookable hotels with real current rates via live web search — never invent one.",
        backstory=HOTEL_RESEARCHER_BACKSTORY,
        llm=get_llm("sonnet"),
        tools=[search, scrape],
        verbose=True,
    )


def build_hotel_task(agent: Agent) -> Task:
    return Task(
        description=HOTEL_TASK_DESCRIPTION,
        expected_output="A JSON array of real hotel objects, each with a verified sourceUrl.",
        agent=agent,
    )


def run_hotels() -> str:
    agent = build_hotel_agent()
    task = build_hotel_task(agent)
    crew = Crew(agents=[agent], tasks=[task], process=Process.sequential, verbose=True)
    result = crew.kickoff()
    return str(result)


# ── CARS ──────────────────────────────────────────────────────────────────

CAR_RESEARCHER_BACKSTORY = (
    "You are a car rental deals researcher for TRoyGO, a real travel agency. "
    "Your only job is finding genuinely real, currently-listed rental cars "
    "and their actual current daily rates by searching the live web — never "
    "inventing one. A listing or price you cannot verify by actually "
    "visiting its source page does not belong in your output."
)

CAR_TASK_DESCRIPTION = """\
Find 8 to 10 real, currently-listed rental cars by searching the web. Cover
a mix of car types (Economy, Compact, SUV, Luxury, Van) and real rental
suppliers (Hertz, Avis, Enterprise, Sixt, Budget, National, Europcar, etc.)
— for example run separate searches like:
- "Hertz car rental prices [major city] 2026"
- "Enterprise SUV rental daily rate"
- "Sixt luxury car rental current prices"
- "budget car rental deals [popular destination]"
- "car rental Sydney Australia current rates"
- "car rental Darwin Northern Territory current rates"

At least one real Sydney rental and one real Darwin rental should be
included if you can confirm them.

For every candidate listing:
1. Search for it, find a real source page (the rental supplier's own site,
   or a real car rental comparison/booking platform).
2. Actually open that page with the scrape tool and confirm the car model,
   daily price, and supplier are really stated there — not just implied by
   a search snippet.
3. If you cannot confirm it on a real page, drop it. Do not include it.

For each CONFIRMED listing, produce one JSON object with these exact fields:

- name (string): the car make and model as it actually appears (e.g.
  "Toyota Corolla")
- model (string): model year if stated, e.g. "2025"; otherwise a reasonable
  current year
- type ("Economy" | "Compact" | "SUV" | "Luxury" | "Van"): pick the single
  best fit based on how the source describes it
- transmission ("Automatic" | "Manual"): as stated; if unknown, "Automatic"
  is a reasonable default
- seats (integer): real seat count for that model
- bags (integer): real luggage capacity if stated; otherwise a reasonable
  estimate for that car type
- doors (integer): real door count for that model
- ac (boolean): true unless the source specifically says otherwise
- pricePerDay (number, USD): the actual current daily rate found on the
  source. Never invent this number.
- supplier (string): the real rental company name
- supplierLogo (string): a 1-2 letter abbreviation of the supplier name
  (e.g. "H" for Hertz, "EP" for Europcar)
- features (array of strings, 2-4 items): real features mentioned on the
  source — do not invent one that wasn't mentioned
- pickupLocations (array of strings, 1-3 items): the real city name plus
  location type, e.g. "Sydney Airport", "Sydney Downtown" — always include
  the actual city, never a bare generic label like "Airport" on its own
  (the site matches these against searched destination cities, so a bare
  "Airport" can never match anything)
- fuelPolicy (string): as stated on the source; if unknown, "Full-to-Full"
  is the industry-standard default
- mileage (string): as stated on the source (e.g. "Unlimited", "200
  miles/day"); if unknown, "Unlimited" is a reasonable default
- sourceUrl (string, required): the exact URL you scraped to confirm this
  listing. This is mandatory — never include a listing without one.

Return ONLY a JSON array of these objects, nothing else — no markdown code
fences, no commentary before or after.
"""


def build_car_agent() -> Agent:
    return Agent(
        role="Car Rental Deals Researcher",
        goal="Find real, currently-listed rental cars with real current daily rates via live web search — never invent one.",
        backstory=CAR_RESEARCHER_BACKSTORY,
        llm=get_llm("sonnet"),
        tools=[search, scrape],
        verbose=True,
    )


def build_car_task(agent: Agent) -> Task:
    return Task(
        description=CAR_TASK_DESCRIPTION,
        expected_output="A JSON array of real car rental objects, each with a verified sourceUrl.",
        agent=agent,
    )


def run_cars() -> str:
    agent = build_car_agent()
    task = build_car_task(agent)
    crew = Crew(agents=[agent], tasks=[task], process=Process.sequential, verbose=True)
    result = crew.kickoff()
    return str(result)


# ── CRUISES ───────────────────────────────────────────────────────────────

CRUISE_RESEARCHER_BACKSTORY = (
    "You are a cruise deals researcher for TRoyGO, a real travel agency. "
    "Your only job is finding genuinely real, currently-sold cruise itineraries "
    "and their actual current prices by searching the live web — never "
    "inventing one. A cruise or price you cannot verify by actually visiting "
    "its source page does not belong in your output."
)

CRUISE_TASK_DESCRIPTION = """\
Find 10 to 14 real, currently-sold cruise itineraries by searching the web.
Cover a genuine spread across these real cruise lines and tiers — do not
default to just 2-3 of them, aim for coverage across every tier below over
the course of a run:

Mainstream & Family: Carnival Cruise Line, Royal Caribbean, Norwegian
Cruise Line, Disney Cruise Line, MSC Cruises
Premium: Celebrity Cruises, Princess Cruises, Holland America Line
Adults-Only & Niche: Virgin Voyages, Cunard Line
Luxury & Expedition: Silversea, Regent Seven Seas, HX Expeditions, Coral
Expeditions

Run separate searches per line, for example:
- "Carnival Cruise Line current deals prices 2026"
- "Royal Caribbean cruise deals 2026 current prices"
- "Norwegian Cruise Line Caribbean current deals"
- "Disney Cruise Line current itinerary prices"
- "MSC Cruises Mediterranean itinerary prices"
- "Celebrity Cruises current itinerary prices"
- "Princess Cruises current deals"
- "Holland America Line current itinerary prices"
- "Virgin Voyages current prices"
- "Cunard Line current voyage prices"
- "Silversea OR Regent Seven Seas current itinerary prices"
- "HX Expeditions OR Coral Expeditions current prices"

ALSO specifically search for real cruises that transit the Dardanelles
Strait and/or Bosphorus (Istanbul), including ones that continue into the
Black Sea to ports like Odessa, Constanta, Varna, Sochi or Batumi — this is
a real, high-demand route TRoy has direct travel-agent experience with.
Include at least 1-2 of these if any real, currently-sold ones can be
confirmed. Example searches:
- "Istanbul Bosphorus cruise itinerary current prices"
- "Black Sea cruise 2026 Istanbul Odessa Constanta current prices"
- "Cunard OR MSC OR Celebrity Black Sea Istanbul cruise itinerary"
- "Dardanelles Bosphorus Black Sea cruise current deals"
Note: due to the Russia-Ukraine war, most Black Sea itineraries have been
suspended by major lines for years — if you cannot find a real, currently
operating one, say so and do not force an entry. Never invent a Black Sea
sailing that isn't actually confirmed live on a real source page.

For every candidate cruise:
1. Search for it, find a real source page (the cruise line's own site, or a
   real cruise booking/comparison platform).
2. Actually open that page with the scrape tool and confirm the ship,
   itinerary ports, and cabin prices are really stated there — not just
   implied by a search snippet.
3. If you cannot confirm it on a real page, drop it. Do not include it.

For each CONFIRMED cruise, produce one JSON object with these exact fields:

- name (string): the cruise/itinerary name as it actually appears, or a
  clear descriptive name if the source doesn't give one
- ship (string): the real ship name
- cruiseLine (string): the real cruise line name
- itinerary (array of {port, country, arrivalTime, departureTime,
  highlights}, 3-8 stops): real ports of call as listed on the source. Use
  "embarkation"/"disembarkation" for arrivalTime/departureTime on the first
  and last stops. highlights should be 1-3 real attractions per port if
  known, otherwise an empty array — do not invent one.
- duration (integer, nights): as stated on the source
- price (number, USD): the actual current lowest cabin price found on the
  source. Never invent this number.
- originalPrice (number, USD): the "before discount" price if the source
  states one; otherwise repeat price (no invented markup)
- cabinTypes (array of {name, price, description}, 2-4 items): real cabin
  categories and prices as listed on the source — do not invent one
- rating (number, 0-5): if the source doesn't give one, use 4.5 as a
  neutral placeholder, do not fabricate a specific decimal
- reviewCount (integer): if unknown, use 0
- departurePort (string): the real embarkation port/city
- includes (array of strings, 3-6 items): what's real stated as included
  (meals, entertainment, etc.)
- amenities (array of strings, 3-8 items): real onboard amenities mentioned
  on the source
- category (string): a short descriptor of the cruise region/style (e.g.
  "Mediterranean", "Caribbean", "Expedition", "River")
- description (string, 1-2 sentences): summarize what the source actually
  says about the cruise
- sourceUrl (string, required): the exact URL you scraped to confirm this
  cruise. This is mandatory — never include a cruise without one.

Return ONLY a JSON array of these objects, nothing else — no markdown code
fences, no commentary before or after.
"""


def build_cruise_agent() -> Agent:
    return Agent(
        role="Cruise Deals Researcher",
        goal="Find real, currently-sold cruise itineraries with real current prices via live web search — never invent one.",
        backstory=CRUISE_RESEARCHER_BACKSTORY,
        llm=get_llm("sonnet"),
        tools=[search, scrape],
        verbose=True,
    )


def build_cruise_task(agent: Agent) -> Task:
    return Task(
        description=CRUISE_TASK_DESCRIPTION,
        expected_output="A JSON array of real cruise objects, each with a verified sourceUrl.",
        agent=agent,
    )


def run_cruises() -> str:
    agent = build_cruise_agent()
    task = build_cruise_task(agent)
    crew = Crew(agents=[agent], tasks=[task], process=Process.sequential, verbose=True)
    result = crew.kickoff()
    return str(result)
