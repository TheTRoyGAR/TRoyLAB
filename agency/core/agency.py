from agency.departments.marketing import MarketingDepartment
from agency.departments.sales import SalesDepartment
from agency.departments.finance import FinanceDepartment
from agency.departments.cto import CTODepartment
from agency.departments.management import ManagementDepartment


class TRoyGOAgency:
    """TRoyGO — AI-run travel agency. Core Orchestrator (Management) + 5
    departments: Marketing, Sales, Finance, CTO, Management.

    TRoyGO resells real third-party travel inventory. No separate Email
    department exists — Marketing and Sales each own their own outreach
    content. Departments are not siloed: they share one memory store
    (agency/core/memory.py) so a Finance finding can inform Marketing, a
    CTO bug report can reach whoever owns that feature, etc.

    This backend is internal-only — the CEO's own command dashboard, not
    anything customers see on troytravelagency.com.
    """

    CEO = "I. Ertan Govdeli"
    NAME = "TRoyGO"

    def __init__(self):
        self.marketing = MarketingDepartment()
        self.sales = SalesDepartment()
        self.finance = FinanceDepartment()
        self.cto = CTODepartment()
        self.management = ManagementDepartment()

    # ── DEPARTMENT SHORTCUTS ────────────────────────────────────────────────

    def research_deals(self, brief: str = "current global travel deals") -> str:
        return self.marketing.research_deals(brief)

    def campaign_content(self, deal_description: str) -> str:
        return self.marketing.campaign_content(deal_description)

    def outreach_content(self, audience: str = "past customers") -> str:
        return self.marketing.outreach_content(audience)

    def qualify_lead(self, lead_context: str) -> str:
        return self.sales.qualify_lead(lead_context)

    def booking_followup(self, inquiry_context: str) -> str:
        return self.sales.booking_followup(inquiry_context)

    def objection_handler(self, objection: str) -> str:
        return self.sales.objection_handler(objection)

    def verify_listings(self) -> str:
        return self.finance.verify_listings()

    def commission_track(self, booking_context: str) -> str:
        return self.finance.commission_track(booking_context)

    def roi_report(self, period: str = "this week") -> str:
        return self.finance.roi_report(period)

    def audit_codebase(self, target_dir: str = ".") -> str:
        return self.cto.audit_codebase(target_dir)

    def workflow_map(self, brief: str) -> str:
        return self.cto.workflow_map(brief)

    def deploy_plan(self, what: str) -> str:
        return self.cto.deploy_plan(what)

    def daily_briefing(self, context: str = "") -> str:
        return self.management.daily_briefing(context)

    def coordinate(self, problem: str) -> str:
        return self.management.coordinate(problem)

    # ── STATUS ───────────────────────────────────────────────────────────────

    def status(self) -> dict:
        return {
            "agency": self.NAME,
            "ceo": self.CEO,
            "departments": 5,
            "agents_per_department": "5 (Marketing/Sales/Finance/CTO/Management)",
            "total_agents": 25,
            "department_skills": {
                "marketing": ["RESEARCH_DEALS", "CAMPAIGN_CONTENT", "OUTREACH_CONTENT (email, no separate Email dept)"],
                "sales": ["QUALIFY_LEAD", "BOOKING_FOLLOWUP (email)", "OBJECTION_HANDLER"],
                "finance": ["VERIFY_LISTINGS (real re-check against live source pages)", "COMMISSION_TRACK", "ROI_REPORT"],
                "cto": ["AUDIT_CODEBASE (read-only scan & report)", "WORKFLOW_MAP", "DEPLOY_PLAN"],
                "management": ["DAILY_BRIEFING", "COORDINATE (cross-department problem routing)"],
            },
            "shared_memory": "all 5 departments read/write one cross-department knowledge store (agency/core/memory.py) — not siloed",
            "business_model": "reseller — real 3rd-party flights/hotels/cruises/packages, TRoyGO takes commission per booking",
            "status": "online",
        }
