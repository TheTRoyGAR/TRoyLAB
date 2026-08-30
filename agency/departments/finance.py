import json
from pathlib import Path

from crewai import Agent, Task, Crew, Process
from agency.core.llm import get_llm
from agency.core.memory import shared_memory, remember, recall_context
from agency.tools import search, scrape, write

_HERE = Path(__file__).resolve()
_TROYGO_ROOT = _HERE.parents[2] / "troygo"
_LIVE_PACKAGES = _TROYGO_ROOT / "src" / "lib" / "data" / "packages-live.json"
_RESEARCH_OUTPUT_DIR = _TROYGO_ROOT / "agents" / "travel_research" / "output"


class FinanceDepartment:
    """TRoyGO Finance Department — 1 head + 4 specialists.
    Skills: VERIFY_LISTINGS, COMMISSION_TRACK, ROI_REPORT.

    TRoyGO resells real third-party inventory — every listing on the site
    is a promise about a real supplier's real price and availability. If
    that changes at the source and nobody notices, TRoyGO sells against
    wrong data. VERIFY_LISTINGS is the real check for that: it re-opens
    each listing's actual source page and confirms the price/deal is
    still what the site says, rather than just trusting the last research
    run forever.
    """

    def __init__(self):
        llm = get_llm("haiku")

        self.finance_head = Agent(
            role="Head of TRoyGO Finance",
            goal="Protect TRoyGO from selling against stale or wrong supplier data, and track real commission economics.",
            backstory=(
                "You are the Head of Finance at TRoyGO, a real travel agency that resells real "
                "flights, hotels, cruises, and packages from real suppliers, keeping a "
                "commission on every booking and paying the supplier their cut.\n\n"
                "You possess three core skills:\n"
                "1. VERIFY_LISTINGS — Re-check that live site listings still match their real "
                "source pages (price, availability, key details). A listing that's gone stale "
                "must be flagged before it's sold again.\n"
                "2. COMMISSION_TRACK — Model the real commission/margin on a booking: what "
                "TRoyGO collects from the customer vs. what it owes the supplier.\n"
                "3. ROI_REPORT — Summarize which deals/campaigns are actually converting into "
                "real bookings and real margin, not just traffic.\n\n"
                "You never approve selling a listing you can't currently verify.\n\n"
                "Operating rules: split CONFIRMED (published Duffel/vendor pricing) from "
                "ESTIMATED (needs a quote) every time. State real current revenue plainly, "
                "including $0, until a real paid booking exists. You operate under TROYGO Group's "
                "standing CEO directive (auto-injected into every task)."
            ),
            llm=llm,
            tools=[write],
            verbose=False,
        )

        self.listing_auditor = Agent(
            role="Listing Auditor",
            goal="Re-verify real travel listings against their live source pages.",
            backstory=(
                "You are the Listing Auditor at TRoyGO. You take each listing's original source "
                "URL, open it for real, and compare what's on the page right now against what "
                "TRoyGO's site currently shows — flagging CONFIRMED, PRICE CHANGED, or PAGE GONE "
                "per listing. You never guess; you only report what the live page actually says."
            ),
            llm=llm,
            tools=[scrape, search],
            verbose=False,
        )

        self.bookkeeper = Agent(
            role="Bookkeeper",
            goal="Record and categorize real commission income and supplier payouts.",
            backstory=(
                "You are the Bookkeeper at TRoyGO. You track real commission earned per booking "
                "and what's owed to each real supplier, keeping the books audit-ready."
            ),
            llm=llm,
            verbose=False,
        )

        self.cost_optimizer = Agent(
            role="Cost Optimizer",
            goal="Find ways to improve TRoyGO's real margin without misrepresenting any listing.",
            backstory=(
                "You are the Cost Optimizer at TRoyGO. You look for real margin improvements — "
                "better commission terms, higher-margin supplier partners — never by cutting "
                "corners on listing accuracy."
            ),
            llm=llm,
            verbose=False,
        )

    # ── SKILL: VERIFY_LISTINGS (real, not narrative — actually re-scrapes) ────

    def verify_listings(self) -> str:
        """Reads the real live packages + the most recent research audit log
        (which has each package's real sourceUrl), and has an agent actually
        re-open each source page to confirm it still matches. This is the
        concrete answer to 'don't let anyone sell wrong data' — a real check,
        not just a report that claims to have checked."""
        if not _LIVE_PACKAGES.exists():
            return "No packages-live.json found — nothing to verify yet."

        live = json.loads(_LIVE_PACKAGES.read_text(encoding="utf-8"))
        if not live:
            return "packages-live.json is empty (site is serving fallback data) — nothing real to verify yet."

        # Pull sourceUrls from the newest research-run audit log, matched by
        # package name — packages-live.json itself doesn't carry sourceUrl
        # (see troygo/agents/travel_research/schema.py), the log does.
        source_urls: dict[str, str] = {}
        if _RESEARCH_OUTPUT_DIR.exists():
            logs = sorted(_RESEARCH_OUTPUT_DIR.glob("run-*.log.json"))
            if logs:
                latest = json.loads(logs[-1].read_text(encoding="utf-8"))
                for pkg in latest.get("packages", []):
                    if pkg.get("name") and pkg.get("sourceUrl"):
                        source_urls[pkg["name"]] = pkg["sourceUrl"]

        listings_block = "\n".join(
            f"- {p['name']} — listed price ${p['price']} — source: {source_urls.get(p['name'], 'UNKNOWN (no audit log match)')}"
            for p in live
        )

        task = Task(
            description=(
                f"VERIFY_LISTINGS: For each real listing below, open its source URL with the "
                f"scrape tool and confirm whether the price/deal shown still matches what "
                f"TRoyGO's site currently displays. If a source is UNKNOWN, say so — do not "
                f"guess or search for a replacement.\n\n{listings_block}\n\n"
                "Report CONFIRMED / PRICE CHANGED / PAGE GONE / UNVERIFIABLE per listing, with "
                "the current price found if it changed."
            ),
            expected_output=(
                "## Listing Verification\n"
                "One line per listing: **Name** — **Status** (CONFIRMED/PRICE CHANGED/PAGE "
                "GONE/UNVERIFIABLE) — note.\n"
                "**Summary** — how many need action before they're sold again."
            ),
            agent=self.listing_auditor,
        )
        task_action = Task(
            description="For any listing NOT confirmed, state plainly whether it should be pulled from sale until re-verified.",
            expected_output="Action list: listing name → PULL FROM SALE or KEEP LIVE, one line each. Empty list if all confirmed.",
            agent=self.finance_head,
            context=[task],
        )
        crew = Crew(
            agents=[self.listing_auditor, self.finance_head],
            tasks=[task, task_action],
            process=Process.sequential,
            memory=shared_memory,
            verbose=False,
        )
        result = str(crew.kickoff())
        remember(
            f"Finance VERIFY_LISTINGS ({len(live)} listings checked):\n{result}",
            scope="/dept/finance/verify_listings",
            categories=["finance", "verification", "data-integrity"],
            importance=0.8,
        )
        return result

    # ── SKILL: COMMISSION_TRACK ───────────────────────────────────────────────

    def commission_track(self, booking_context: str) -> str:
        task = Task(
            description=(
                f"{recall_context(booking_context)}"
                f"COMMISSION_TRACK: Model the real commission economics for this booking: "
                f"{booking_context}\n\n"
                "State: customer-facing price, supplier cost/payout, TRoyGO's margin ($ and %). "
                "State assumptions explicitly if exact commission rate isn't given."
            ),
            expected_output=(
                "## Commission Model\n"
                "**Customer Price**\n**Supplier Payout**\n**TRoyGO Margin** — $ and %\n"
                "**Assumptions**"
            ),
            agent=self.bookkeeper,
        )
        crew = Crew(
            agents=[self.bookkeeper],
            tasks=[task],
            process=Process.sequential,
            memory=shared_memory,
            verbose=False,
        )
        result = str(crew.kickoff())
        remember(
            f"Finance COMMISSION_TRACK for '{booking_context}':\n{result}",
            scope="/dept/finance/commission_track",
            categories=["finance", "commission"],
        )
        return result

    # ── SKILL: ROI_REPORT ─────────────────────────────────────────────────────

    def roi_report(self, period: str = "this week") -> str:
        task = Task(
            description=(
                f"ROI_REPORT: Summarize TRoyGO's real deal/campaign performance for {period}, "
                "using whatever real campaign and booking context is available in shared memory."
            ),
            expected_output=(
                "## ROI Report\n**Top-performing deals**\n**Real bookings vs. traffic**\n"
                "**Recommendations for next period**"
            ),
            agent=self.finance_head,
        )
        task_optimize = Task(
            description="Suggest 2 real margin improvements based on this report.",
            expected_output="2 specific margin-improvement actions.",
            agent=self.cost_optimizer,
            context=[task],
        )
        crew = Crew(
            agents=[self.finance_head, self.cost_optimizer],
            tasks=[task, task_optimize],
            process=Process.sequential,
            memory=shared_memory,
            verbose=False,
        )
        result = str(crew.kickoff())
        remember(
            f"Finance ROI_REPORT ({period}):\n{result}",
            scope="/dept/finance/roi_report",
            categories=["finance", "reporting"],
        )
        return result
