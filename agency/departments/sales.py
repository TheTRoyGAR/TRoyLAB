from crewai import Agent, Task, Crew, Process
from agency.core.llm import get_llm
from agency.core.memory import shared_memory, remember, recall_context
from agency.tools import search


class SalesDepartment:
    """TRoyGO Sales Department — 1 head + 4 specialists.
    Skills: QUALIFY_LEAD, BOOKING_FOLLOWUP, OBJECTION_HANDLER.

    TRoyGO's "sale" is a real booking of real third-party travel inventory
    (flight/hotel/cruise/package) — Sales' job is converting a site inquiry
    or CRM lead into a completed, paid booking. No separate Email
    department exists; follow-up email content is this department's own
    responsibility (BOOKING_FOLLOWUP below).
    """

    def __init__(self):
        llm = get_llm("haiku")

        self.sales_head = Agent(
            role="Head of TRoyGO Sales",
            goal="Convert leads and inquiries into completed, paid travel bookings.",
            backstory=(
                "You are the Head of Sales at TRoyGO, a real travel agency that resells real "
                "flights, hotels, cruises, and packages. Every closed deal is a real booking "
                "with a real supplier — you are never inventing availability or pricing; if "
                "Finance or Marketing has flagged a listing as stale, you do not sell it until "
                "it's re-verified.\n\n"
                "You possess three core skills:\n"
                "1. QUALIFY_LEAD — Score inbound leads/inquiries (from the CRM dashboard) on "
                "budget, urgency, and destination fit, so the team focuses on real buyers.\n"
                "2. BOOKING_FOLLOWUP — Write follow-up emails that move an inquiry through to a "
                "completed booking (TRoyGO has no separate Email department — this is Sales' own "
                "responsibility).\n"
                "3. OBJECTION_HANDLER — Handle real objections (price, dates, trust in an unknown "
                "agency) with honest, specific responses — never overpromise what TRoyGO can't "
                "deliver.\n\n"
                "Coordinate with Marketing so follow-up messaging matches current campaigns, and "
                "with Finance to confirm pricing before quoting a customer."
            ),
            llm=llm,
            tools=[search],
            verbose=False,
        )

        self.lead_qualifier = Agent(
            role="Lead Qualifier",
            goal="Score and rank real customer inquiries based on fit, budget, and urgency.",
            backstory=(
                "You are the Lead Qualifier at TRoyGO. You evaluate each real inquiry from the "
                "CRM/dashboard against qualification criteria and assign priority scores so the "
                "team focuses its energy on the highest-value real bookings."
            ),
            llm=llm,
            verbose=False,
        )

        self.booking_specialist = Agent(
            role="Booking Specialist",
            goal="Guide a qualified lead through the real booking flow to a completed purchase.",
            backstory=(
                "You are the Booking Specialist at TRoyGO. You know the real booking flow "
                "(flight/hotel/cruise/package selection through payment) and help customers "
                "complete it, flagging anything that needs Finance or supplier confirmation "
                "before checkout."
            ),
            llm=llm,
            verbose=False,
        )

        self.followup_writer = Agent(
            role="Follow-up & Outreach Writer",
            goal="Write email content that moves real inquiries toward a completed booking.",
            backstory=(
                "You are the Follow-up Writer at TRoyGO. There is no separate Email department "
                "here — you own all customer-facing follow-up email content, always specific to "
                "the real deal or booking the customer inquired about."
            ),
            llm=llm,
            verbose=False,
        )

        self.deal_closer = Agent(
            role="Deal Closer",
            goal="Handle objections and close hesitant leads into confirmed real bookings.",
            backstory=(
                "You are the Deal Closer at TRoyGO. You handle real objections — price, trust, "
                "timing — honestly, and design follow-up sequences that move prospects from "
                "interest to a confirmed booking without overpromising."
            ),
            llm=llm,
            verbose=False,
        )

    # ── SKILL: QUALIFY_LEAD ───────────────────────────────────────────────────

    def qualify_lead(self, lead_context: str) -> str:
        task = Task(
            description=(
                f"{recall_context(lead_context)}"
                f"QUALIFY_LEAD: Score this real inquiry/lead: {lead_context}\n\n"
                "Score on: budget fit, urgency, destination/deal fit. Flag if it should go "
                "straight to a Booking Specialist or needs more nurturing first."
            ),
            expected_output=(
                "## Lead Qualification\n"
                "**Score** (1-10) — with reasoning\n"
                "**Budget Fit** — Low/Medium/High\n"
                "**Urgency** — Low/Medium/High\n"
                "**Recommended Next Step** — direct to booking, or nurture sequence"
            ),
            agent=self.lead_qualifier,
        )
        crew = Crew(
            agents=[self.lead_qualifier],
            tasks=[task],
            process=Process.sequential,
            memory=shared_memory,
            verbose=False,
        )
        result = str(crew.kickoff())
        remember(
            f"Sales QUALIFY_LEAD for '{lead_context}':\n{result}",
            scope="/dept/sales/qualify_lead",
            categories=["sales", "leads"],
        )
        return result

    # ── SKILL: BOOKING_FOLLOWUP ───────────────────────────────────────────────

    def booking_followup(self, inquiry_context: str) -> str:
        task = Task(
            description=(
                f"{recall_context(inquiry_context)}"
                f"BOOKING_FOLLOWUP: Write a follow-up email sequence for this real inquiry: "
                f"{inquiry_context}\n\n"
                "Goal: move them to a completed booking. Reference the specific real deal they "
                "inquired about — never generic filler."
            ),
            expected_output=(
                "## Follow-up Sequence\n"
                "**Immediate reply** (within the hour) — subject + body\n"
                "**Day 2 nudge** — subject + body, if no reply\n"
                "**Day 5 last call** — subject + body, honest, no pressure"
            ),
            agent=self.followup_writer,
        )
        crew = Crew(
            agents=[self.followup_writer],
            tasks=[task],
            process=Process.sequential,
            memory=shared_memory,
            verbose=False,
        )
        result = str(crew.kickoff())
        remember(
            f"Sales BOOKING_FOLLOWUP for '{inquiry_context}':\n{result}",
            scope="/dept/sales/booking_followup",
            categories=["sales", "followup", "email"],
        )
        return result

    # ── SKILL: OBJECTION_HANDLER ──────────────────────────────────────────────

    def objection_handler(self, objection: str) -> str:
        task = Task(
            description=(
                f"{recall_context(objection)}"
                f'OBJECTION_HANDLER: Create an honest response to this real customer objection: '
                f'"{objection}"\n\n'
                "Produce a call script and an email version. Never overpromise or invent a "
                "guarantee TRoyGO can't back."
            ),
            expected_output=(
                "## Objection Handler\n"
                "**Objection:** [restated]\n"
                "**Honest response strategy**\n"
                "**Call Script** — acknowledge → clarify → real answer → ask\n"
                "**Email Version** — subject + body under 100 words"
            ),
            agent=self.sales_head,
        )
        task_close = Task(
            description="Suggest one concrete way to de-risk this objection for the customer (e.g. cancellation policy, price-match).",
            expected_output="One specific de-risking offer, only if TRoyGO can realistically honor it.",
            agent=self.deal_closer,
            context=[task],
        )
        crew = Crew(
            agents=[self.sales_head, self.deal_closer],
            tasks=[task, task_close],
            process=Process.sequential,
            memory=shared_memory,
            verbose=False,
        )
        result = str(crew.kickoff())
        remember(
            f"Sales OBJECTION_HANDLER for '{objection}':\n{result}",
            scope="/dept/sales/objection_handler",
            categories=["sales", "objection"],
        )
        return result
