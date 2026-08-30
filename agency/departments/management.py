from crewai import Agent, Task, Crew, Process
from agency.core.llm import get_llm
from agency.core.memory import shared_memory, remember, recall_context


class ManagementDepartment:
    """TRoyGO Management Department — CEO's Command Centre. 1 head + 4 specialists.
    Skills: DAILY_BRIEFING, COORDINATE.

    This is where cross-department work actually gets tied together —
    per the CEO's explicit direction, no department (including CTO) works
    in a silo. Management's job is watching shared memory across
    Marketing/Sales/Finance/CTO and surfacing what the CEO needs to know,
    plus catching anything that needs more than one department's help
    (e.g. Finance flags a stale listing → Marketing needs to stop
    promoting it → CTO needs to check why it wasn't caught automatically).
    """

    def __init__(self):
        llm = get_llm("haiku")

        self.management_head = Agent(
            role="Head of TRoyGO Management",
            goal="Coordinate all TRoyGO departments so nothing falls through the cracks, and keep the CEO informed.",
            backstory=(
                "You are the Head of Management at TRoyGO — the CEO's command centre for this "
                "company. TRoyGO's departments (Marketing, Sales, Finance, CTO) are not siloed: "
                "a data problem Finance finds should reach Marketing before a bad listing gets "
                "promoted further, a bug CTO finds should reach whoever owns that feature, and "
                "a hot lead Sales is working should be visible to Marketing's campaign timing.\n\n"
                "You possess two core skills:\n"
                "1. DAILY_BRIEFING — Pull together what every department has actually been doing "
                "(from shared memory) into one clear picture for the CEO.\n"
                "2. COORDINATE — Given a cross-department problem, identify which departments "
                "need to be involved and in what order, so it actually gets resolved instead of "
                "sitting in one department's queue.\n\n"
                "Operating rules: when asked about bookings or revenue, pull from the real Neon "
                "Postgres-backed data path — never estimate a booking count. Flag known real gaps "
                "openly (e.g. legacy placeholder agent/CRM data still on the public site) rather "
                "than reporting them as fixed. You operate under TROYGO Group's standing CEO "
                "directive (auto-injected into every task)."
            ),
            llm=llm,
            verbose=False,
        )

        self.project_manager = Agent(
            role="Project Manager",
            goal="Track cross-department tasks, blockers, and open items across TRoyGO.",
            backstory=(
                "You are the Project Manager at TRoyGO. You track what's open, what's blocked, "
                "and what's waiting on another department — nothing sits silently unresolved."
            ),
            llm=llm,
            verbose=False,
        )

        self.resource_coordinator = Agent(
            role="Resource Coordinator",
            goal="Route cross-department problems to the right department(s), in the right order.",
            backstory=(
                "You are the Resource Coordinator at TRoyGO. When a problem touches more than "
                "one department, you decide who acts first and who needs to be looped in."
            ),
            llm=llm,
            verbose=False,
        )

        self.report_generator = Agent(
            role="Report Generator",
            goal="Turn cross-department activity into a clear, concise CEO-readable report.",
            backstory=(
                "You are the Report Generator at TRoyGO. You compile real activity from every "
                "department into a report the CEO can act on in under a minute of reading."
            ),
            llm=llm,
            verbose=False,
        )

        self.process_optimizer = Agent(
            role="Process Optimizer",
            goal="Find and fix bottlenecks in how TRoyGO's departments work together.",
            backstory=(
                "You are the Process Optimizer at TRoyGO. You look at how departments actually "
                "hand off work and propose concrete fixes when something is slow or falls "
                "through — for example, listing verification not automatically pausing a stale "
                "deal's promotion."
            ),
            llm=llm,
            verbose=False,
        )

    # ── SKILL: DAILY_BRIEFING ─────────────────────────────────────────────────

    def daily_briefing(self, context: str = "") -> str:
        task_brief = Task(
            description=(
                f"{recall_context(context or 'recent cross-department activity at TRoyGO')}"
                f"Prepare today's CEO briefing for TRoyGO. Include: top 3 priorities, company "
                f"status across Marketing/Sales/Finance/CTO, any blockers, quick wins. "
                f"Additional context: {context or 'Standard daily briefing.'}"
            ),
            expected_output=(
                "A structured briefing: PRIORITIES, COMPANY STATUS (one line per department), "
                "BLOCKERS, QUICK WINS. Bullet points only. Max 300 words."
            ),
            agent=self.management_head,
        )
        task_report = Task(
            description="Summarize the current status of all open cross-department items.",
            expected_output="Bullet list of open items, each tagged with which department(s) are involved.",
            agent=self.project_manager,
        )
        crew = Crew(
            agents=[self.management_head, self.project_manager],
            tasks=[task_brief, task_report],
            process=Process.sequential,
            memory=shared_memory,
            verbose=False,
        )
        result = str(crew.kickoff())
        remember(
            f"Management DAILY_BRIEFING (context: '{context}'):\n{result}",
            scope="/dept/management/daily_briefing",
            categories=["management", "briefing"],
        )
        return result

    # ── SKILL: COORDINATE ─────────────────────────────────────────────────────

    def coordinate(self, problem: str) -> str:
        task = Task(
            description=(
                f"{recall_context(problem)}"
                f"COORDINATE: This cross-department problem needs resolving: {problem}\n\n"
                "Identify which department(s) (Marketing, Sales, Finance, CTO) need to act, in "
                "what order, and what each one specifically needs to do."
            ),
            expected_output=(
                "## Coordination Plan\n"
                "**Problem** — restated\n"
                "**Departments Involved** — in order of action\n"
                "**What each department does** — specific, one line each\n"
                "**Owner** — which department is accountable for closing this out"
            ),
            agent=self.resource_coordinator,
        )
        crew = Crew(
            agents=[self.resource_coordinator],
            tasks=[task],
            process=Process.sequential,
            memory=shared_memory,
            verbose=False,
        )
        result = str(crew.kickoff())
        remember(
            f"Management COORDINATE for '{problem}':\n{result}",
            scope="/dept/management/coordinate",
            categories=["management", "coordination"],
            importance=0.6,
        )
        return result
