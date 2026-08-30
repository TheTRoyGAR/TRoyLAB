from crewai import Agent, Task, Crew, Process
from agency.core.llm import get_llm
from agency.core.memory import shared_memory, remember, recall_context
from agency.tools import search, write, read_file, list_dir


class CTODepartment:
    """TRoyGO CTO Department — 1 head + 4 specialists.
    Skills: AUDIT_CODEBASE (read-only scan & report), WORKFLOW_MAP.

    Same read-only-first posture as TRoyAI's CTO department: this
    department finds and reports real bugs across the whole TRoyGO repo
    (the troygo/ site, the agency/ backend, the worker/ flight proxy) — it
    does not write or deploy on its own. Bug-fixing at TRoyGO is meant to
    be cross-department (per the CEO's explicit direction), not siloed to
    CTO alone — other departments' skills call back into shared memory
    where CTO's findings live, so anyone can act on them.
    """

    def __init__(self):
        llm_opus = get_llm("opus")
        llm = get_llm("haiku")

        self.cto_head = Agent(
            role="Head of TRoyGO CTO",
            goal="Keep TRoyGO's real site, backend, and infrastructure correct, secure, and actually working end to end.",
            backstory=(
                "You are the Head of the CTO Department at TRoyGO, a real travel agency selling "
                "real bookings through troytravelagency.com. Broken pages or wrong data cost "
                "real bookings and real trust — you take bug reports seriously and make sure "
                "they reach whichever department can actually fix them.\n\n"
                "You possess two core skills:\n"
                "1. AUDIT_CODEBASE — Read and review the real TRoyGO codebase (the site, the "
                "agency backend, the flight-proxy worker) for real bugs: dead links, unwired "
                "features, silent failures, security issues.\n"
                "2. WORKFLOW_MAP — Design implementable technical blueprints for new features "
                "(e.g. live flight tracking, listing verification automation).\n\n"
                "You are careful and honest: you never invent a bug to pad a report, and you "
                "never claim something is fixed without it actually being verified.\n\n"
                "Operating rules: remember Cloudflare Pages has no GitHub integration here — a "
                "git push alone does not deploy; only a manual `wrangler pages deploy --branch=main` "
                "does. Treat the Neon Postgres bookings table as containing real customer data — "
                "security review must flag any exposure risk, not just code style. You operate "
                "under TROYGO Group's standing CEO directive (auto-injected into every task)."
            ),
            llm=llm_opus,
            tools=[search],
            verbose=False,
        )

        self.developer = Agent(
            role="Software Developer",
            goal="Design real, working fixes for bugs found across TRoyGO's codebase.",
            backstory=(
                "You are the Software Developer at TRoyGO. You know the real stack: Next.js "
                "static export (troygo/), a Python/CrewAI backend (agency/), and a Cloudflare "
                "Worker (worker/) proxying live flight data."
            ),
            llm=llm_opus,
            tools=[search, write],
            verbose=False,
        )

        self.code_reviewer = Agent(
            role="Code Reviewer",
            goal="Find real bugs in TRoyGO's codebase — dead links, unwired features, silent failures.",
            backstory=(
                "You are the Code Reviewer at TRoyGO. You review the real code for bugs and "
                "maintainability issues — you are READ-ONLY, you have no write tool and must "
                "never claim to have fixed anything, only report what you find."
            ),
            llm=llm,
            tools=[read_file, list_dir],
            verbose=False,
        )

        self.security_auditor = Agent(
            role="Security Auditor",
            goal="Find security vulnerabilities across TRoyGO's real systems.",
            backstory=(
                "You are the Security Auditor at TRoyGO. You check for OWASP Top 10 issues, "
                "exposed keys, and unsafe patterns. You never reproduce the actual contents of "
                "secret/credential files (.env, keys, tokens) — only note that one exists and "
                "where, never its value."
            ),
            llm=llm,
            tools=[read_file, list_dir],
            verbose=False,
        )

        self.devops = Agent(
            role="DevOps Engineer",
            goal="Plan real deployments to Cloudflare (Pages/Workers/DNS) for TRoyGO.",
            backstory=(
                "You are the DevOps Engineer at TRoyGO. You know the real deploy pipeline: "
                "static export to the gh-pages branch, GitHub Pages custom domain "
                "(troytravelagency.com), and the Cloudflare Worker flight proxy."
            ),
            llm=llm,
            verbose=False,
        )

    # ── SKILL: AUDIT_CODEBASE (scan & report only — never writes/deploys) ────

    def audit_codebase(self, target_dir: str = ".") -> str:
        target_dir = target_dir.strip() or "."
        task_scan = Task(
            description=(
                f"{recall_context(target_dir)}"
                f"AUDIT_CODEBASE: Read and review the real code under '{target_dir}' "
                "(relative to the TRoyLAB repo root — covers the troygo/ site, agency/ backend, "
                "and worker/ Cloudflare Worker). List the directory structure first, then open "
                "and read the files that matter most. Look for real bugs: features that look "
                "built but aren't wired up, dead links, dead code, broken logic, silently "
                "unhandled cases, inconsistencies between related files.\n\n"
                "Hard rules: you are READ-ONLY. Do not attempt to write, edit, or modify any "
                "file — you have no write tool and must not ask for one. If you encounter a "
                ".env, credentials, or key/token file, note only that it exists and its path — "
                "never quote or reproduce its contents."
            ),
            expected_output=(
                "## Codebase Audit — <target_dir>\n"
                "For each real finding: **File** (path) · **Issue** (what's wrong) · "
                "**Suggested Fix** (described in words, not applied) · **Severity** "
                "(HIGH/MEDIUM/LOW). If nothing meaningful is found, say so plainly — "
                "do not invent issues to pad the report."
            ),
            agent=self.code_reviewer,
        )
        task_security = Task(
            description=(
                "Review the same area specifically for security issues: hardcoded secrets, "
                "injection risks, missing auth checks, exposed internal endpoints. Same "
                "read-only rules apply — never reproduce secret values, only flag their "
                "presence and location."
            ),
            expected_output="## Security Findings\nPASS, or a list of: **File** · **Risk** · **Fix** · **Severity**.",
            agent=self.security_auditor,
            context=[task_scan],
        )
        crew = Crew(
            agents=[self.code_reviewer, self.security_auditor],
            tasks=[task_scan, task_security],
            process=Process.sequential,
            memory=shared_memory,
            verbose=False,
        )
        result = str(crew.kickoff())
        remember(
            f"CTO AUDIT_CODEBASE for '{target_dir}':\n{result}",
            scope="/dept/cto/audit_codebase",
            categories=["cto", "audit"],
            importance=0.6,
        )
        return result

    # ── SKILL: WORKFLOW_MAP ───────────────────────────────────────────────────

    def workflow_map(self, brief: str) -> str:
        task = Task(
            description=(
                f"{recall_context(brief)}"
                f"WORKFLOW_MAP: Design a step-by-step, implementable blueprint for this real "
                f"feature: {brief}\n\n"
                "Cover: trigger, steps, decision points, data flow, error handling, and how it "
                "fits TRoyGO's real stack (Next.js static export, Python/CrewAI backend, "
                "Cloudflare Worker)."
            ),
            expected_output=(
                "## Workflow Blueprint\n**Trigger**\n**Steps** — numbered, with actor per step\n"
                "**Decision Points**\n**Data Flow**\n**Error Handling**\n**Fit with TRoyGO's stack**"
            ),
            agent=self.cto_head,
        )
        task_review = Task(
            description="Review the workflow for security risks: data exposure, auth gaps, rate-limit abuse.",
            expected_output="Security review: PASS or RISKS FOUND, with specific issues and fixes.",
            agent=self.security_auditor,
            context=[task],
        )
        crew = Crew(
            agents=[self.cto_head, self.security_auditor],
            tasks=[task, task_review],
            process=Process.sequential,
            memory=shared_memory,
            verbose=False,
        )
        result = str(crew.kickoff())
        remember(
            f"CTO WORKFLOW_MAP for '{brief}':\n{result}",
            scope="/dept/cto/workflow_map",
            categories=["cto", "workflow"],
        )
        return result

    # ── SKILL: DEPLOY ──────────────────────────────────────────────────────────

    def deploy_plan(self, what: str) -> str:
        task = Task(
            description=f"Create a deployment plan and real commands for: {what}. Target: Cloudflare/GitHub Pages.",
            expected_output="Step-by-step deployment commands with verification steps.",
            agent=self.devops,
        )
        crew = Crew(
            agents=[self.devops],
            tasks=[task],
            process=Process.sequential,
            memory=shared_memory,
            verbose=False,
        )
        result = str(crew.kickoff())
        remember(
            f"CTO deploy plan for '{what}':\n{result}",
            scope="/dept/cto/deploy_plan",
            categories=["cto", "deployment"],
        )
        return result
