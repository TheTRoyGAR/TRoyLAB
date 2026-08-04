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
Find 8 to 12 real, currently-advertised travel deals or vacation packages by
searching the web. Cover a mix of destinations and deal types (not all the
same region) — for example run separate searches like:
- "current flight and hotel package deals 2026"
- "best all-inclusive vacation deals this month"
- "travel deals Europe" / "travel deals Asia" / "travel deals Caribbean"
- "limited time travel campaign discount"

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
