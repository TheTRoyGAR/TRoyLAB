from crewai import Agent, Task, Crew, Process
from agency.core.llm import get_llm
from agency.core.memory import shared_memory, remember, recall_context
from agency.tools import search, scrape, write


class MarketingDepartment:
    """TRoyGO Marketing Department — 1 head + 4 specialists.
    Skills: RESEARCH_DEALS, CAMPAIGN_CONTENT, OUTREACH_CONTENT.

    TRoyGO resells real third-party travel inventory (flights, hotels,
    cruises, packages from real suppliers) — Marketing's job is finding
    genuinely current, sellable deals and writing content that promotes
    them, not inventing destinations or offers. No separate Email
    department exists for TRoyGO; outreach/newsletter content is this
    department's own responsibility (OUTREACH_CONTENT below).
    """

    def __init__(self):
        llm = get_llm("sonnet")

        self.marketing_head = Agent(
            role="Head of TRoyGO Marketing",
            goal="Find real, sellable travel deals and turn them into campaigns that drive real bookings.",
            backstory=(
                "You are the Head of Marketing at TRoyGO, a real travel agency that resells "
                "flights, hotels, cruises, and packages from real airlines, cruise lines, and "
                "tour operators. TRoyGO takes a commission on every booking — the deals you "
                "promote must be real, currently bookable offers, never invented ones.\n\n"
                "You possess three core skills:\n"
                "1. RESEARCH_DEALS — Search the live web for currently-advertised travel deals "
                "and campaigns. Every deal must be verified by actually visiting its source page "
                "before it's included — never invent a price, date, or destination.\n"
                "2. CAMPAIGN_CONTENT — Turn a verified real deal into promotional copy (social "
                "posts, homepage banners, landing-page copy) that drives clicks toward booking.\n"
                "3. OUTREACH_CONTENT — Write email/newsletter content promoting real deals to "
                "past and prospective customers (TRoyGO has no separate Email department — this "
                "is Marketing's own responsibility).\n\n"
                "Coordinate with Sales so outreach messaging matches what Sales is actively "
                "working, and with Finance so nothing is promoted that Finance has flagged as "
                "stale or price-changed."
            ),
            llm=llm,
            tools=[search, scrape],
            verbose=False,
        )

        self.deal_researcher = Agent(
            role="Deal Researcher",
            goal="Find and verify genuinely current travel deals via live web search — never invent one.",
            backstory=(
                "You are the Deal Researcher at TRoyGO. Your only job is finding real, "
                "currently-advertised travel deals by searching the live web and actually "
                "opening the source page to confirm destination, price, and dates. A deal you "
                "cannot verify by visiting its real source does not belong in your output."
            ),
            llm=llm,
            tools=[search, scrape],
            verbose=False,
        )

        self.content_creator = Agent(
            role="Content Creator",
            goal="Write compelling, honest promotional copy for TRoyGO's real travel deals.",
            backstory=(
                "You are the Content Creator at TRoyGO. You write social posts, banners, and "
                "landing-page copy that promote real deals — never fabricating a feature, "
                "hotel name, or activity that wasn't actually in the source listing."
            ),
            llm=llm,
            tools=[write],
            verbose=False,
        )

        self.social_manager = Agent(
            role="Social Media Manager",
            goal="Build TRoyGO's presence on Instagram, Facebook, and TikTok around real trips and deals.",
            backstory=(
                "You are the Social Media Manager at TRoyGO. You create platform-specific "
                "content around real destinations and real deals TRoyGO is currently selling."
            ),
            llm=llm,
            verbose=False,
        )

        self.newsletter_writer = Agent(
            role="Newsletter & Outreach Writer",
            goal="Write email content that turns TRoyGO's subscriber list into real bookings.",
            backstory=(
                "You are the Newsletter & Outreach Writer at TRoyGO. There is no separate "
                "Email department here — you own all customer-facing email/newsletter content, "
                "always built around real, currently-bookable deals."
            ),
            llm=llm,
            tools=[write],
            verbose=False,
        )

    # ── SKILL: RESEARCH_DEALS ─────────────────────────────────────────────────

    def research_deals(self, brief: str = "current global travel deals") -> str:
        task = Task(
            description=(
                f"{recall_context(brief)}"
                f"RESEARCH_DEALS: Find 5-10 real, currently-advertised travel deals for: {brief}\n\n"
                "For each candidate: search for it, open the real source page with the scrape "
                "tool, and confirm destination/price/dates are actually stated there. Drop "
                "anything you cannot verify on a real page."
            ),
            expected_output=(
                "## Verified Deals\n"
                "For each deal: **Name**, **Destination**, **Price**, **Source URL** "
                "(the exact page you scraped to confirm it), **Why it's a strong deal**."
            ),
            agent=self.deal_researcher,
        )
        task_review = Task(
            description="Rank these deals by likely conversion appeal and flag the top 3 for immediate campaign content.",
            expected_output="Ranked list (best first) with a one-line reason per deal, top 3 marked CAMPAIGN-READY.",
            agent=self.marketing_head,
            context=[task],
        )
        crew = Crew(
            agents=[self.deal_researcher, self.marketing_head],
            tasks=[task, task_review],
            process=Process.sequential,
            memory=shared_memory,
            verbose=False,
        )
        result = str(crew.kickoff())
        remember(
            f"Marketing RESEARCH_DEALS for '{brief}':\n{result}",
            scope="/dept/marketing/research_deals",
            categories=["marketing", "deals"],
            importance=0.6,
        )
        return result

    # ── SKILL: CAMPAIGN_CONTENT ───────────────────────────────────────────────

    def campaign_content(self, deal_description: str) -> str:
        task = Task(
            description=(
                f"{recall_context(deal_description)}"
                f"CAMPAIGN_CONTENT: Write promotional content for this real, verified deal: "
                f"{deal_description}\n\n"
                "Produce: 1 homepage banner headline+subhead, 3 social posts (Instagram, "
                "Facebook, TikTok caption style), 1 short landing-page intro paragraph."
            ),
            expected_output=(
                "## Campaign Content\n"
                "**Homepage Banner** — headline + subhead\n"
                "**Instagram Post** — caption + suggested hashtags\n"
                "**Facebook Post** — caption\n"
                "**TikTok Caption** — short, hook-first\n"
                "**Landing Page Intro** — 2-3 sentences"
            ),
            agent=self.content_creator,
        )
        task_social = Task(
            description="Review the social posts for platform fit and suggest one improvement per platform.",
            expected_output="3 improvement notes, one per platform, each under 20 words.",
            agent=self.social_manager,
            context=[task],
        )
        crew = Crew(
            agents=[self.content_creator, self.social_manager],
            tasks=[task, task_social],
            process=Process.sequential,
            memory=shared_memory,
            verbose=False,
        )
        result = str(crew.kickoff())
        remember(
            f"Marketing CAMPAIGN_CONTENT for '{deal_description}':\n{result}",
            scope="/dept/marketing/campaign_content",
            categories=["marketing", "campaign"],
        )
        return result

    # ── SKILL: OUTREACH_CONTENT ───────────────────────────────────────────────

    def outreach_content(self, audience: str = "past customers") -> str:
        task = Task(
            description=(
                f"{recall_context(audience)}"
                f"OUTREACH_CONTENT: Write a newsletter/email promoting TRoyGO's current real "
                f"deals to this audience: {audience}\n\n"
                "TRoyGO has no separate Email department — this content is sent directly. "
                "Build it around real deals already researched (check past learnings above); "
                "if none are available, note that RESEARCH_DEALS should run first."
            ),
            expected_output=(
                "## Outreach Email\n"
                "**Subject line** (under 60 chars)\n"
                "**Preview text**\n"
                "**Body** — scannable, real deals only, one clear CTA per deal\n"
                "**CTA button text**"
            ),
            agent=self.newsletter_writer,
        )
        crew = Crew(
            agents=[self.newsletter_writer],
            tasks=[task],
            process=Process.sequential,
            memory=shared_memory,
            verbose=False,
        )
        result = str(crew.kickoff())
        remember(
            f"Marketing OUTREACH_CONTENT for audience '{audience}':\n{result}",
            scope="/dept/marketing/outreach_content",
            categories=["marketing", "outreach", "email"],
        )
        return result
