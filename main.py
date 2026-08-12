#!/usr/bin/env python3
"""TRoyGO Agency — Entry Point (internal CEO command dashboard, not customer-facing)"""
import sys
import json
from dotenv import load_dotenv

load_dotenv()

# Windows' console defaults stdout to cp1252, which can't encode characters
# agent output sometimes contains (✅, emoji, curly quotes, etc.) — this
# crashed real runs with UnicodeEncodeError after the crew had already done
# real, costly work, right at the final print(). Force UTF-8 unconditionally
# rather than relying on PYTHONIOENCODING being set by whoever invokes this.
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from agency.core.agency import TRoyGOAgency
from agency.core.memory import shared_memory


def main():
    agency = TRoyGOAgency()
    try:
        _run(agency)
    finally:
        # Memory saves happen via a background thread pool — without this,
        # the last write of a run can be silently lost when the CLI exits.
        shared_memory.close()


def _run(agency):
    if len(sys.argv) < 2:
        print(json.dumps(agency.status(), indent=2))
        print()
        print("Usage: python main.py <command> [args]")
        print("Commands:")
        print("  research_deals  [brief]        — Marketing: RESEARCH_DEALS")
        print("  campaign        <deal>          — Marketing: CAMPAIGN_CONTENT")
        print("  outreach        [audience]      — Marketing: OUTREACH_CONTENT (email)")
        print("  qualify_lead    <lead context>  — Sales: QUALIFY_LEAD")
        print("  booking_followup <inquiry>      — Sales: BOOKING_FOLLOWUP (email)")
        print("  objection       <objection>     — Sales: OBJECTION_HANDLER")
        print("  verify_listings                 — Finance: VERIFY_LISTINGS (real re-check)")
        print("  commission      <booking>       — Finance: COMMISSION_TRACK")
        print("  roi             [period]        — Finance: ROI_REPORT")
        print("  audit           [target_dir]    — CTO: AUDIT_CODEBASE (read-only)")
        print("  workflow_map    <brief>         — CTO: WORKFLOW_MAP")
        print("  deploy_plan     <what>          — CTO: DEPLOY_PLAN")
        print("  briefing        [context]       — Management: DAILY_BRIEFING")
        print("  coordinate      <problem>       — Management: COORDINATE")
        print("  status                          — Agency status")
        return

    command = sys.argv[1]
    args = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else ""

    if command == "research_deals":
        print(agency.research_deals(args or "current global travel deals"))
    elif command == "campaign":
        print(agency.campaign_content(args))
    elif command == "outreach":
        print(agency.outreach_content(args or "past customers"))
    elif command == "qualify_lead":
        print(agency.qualify_lead(args))
    elif command == "booking_followup":
        print(agency.booking_followup(args))
    elif command == "objection":
        print(agency.objection_handler(args))
    elif command == "verify_listings":
        print(agency.verify_listings())
    elif command == "commission":
        print(agency.commission_track(args))
    elif command == "roi":
        print(agency.roi_report(args or "this week"))
    elif command == "audit":
        print(agency.audit_codebase(args or "."))
    elif command == "workflow_map":
        print(agency.workflow_map(args))
    elif command == "deploy_plan":
        print(agency.deploy_plan(args))
    elif command == "briefing":
        print(agency.daily_briefing(args))
    elif command == "coordinate":
        print(agency.coordinate(args))
    elif command == "status":
        print(json.dumps(agency.status(), indent=2))
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)


if __name__ == "__main__":
    main()
