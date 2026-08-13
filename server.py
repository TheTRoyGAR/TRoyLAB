"""
TRoyGO Agency Execution Server
Exposes CrewAI department skills as REST endpoints for the private command
centre dashboard (troygo-dashboard.pages.dev) to call.
Run with: python server.py
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import logging
import os
import hmac
from dotenv import load_dotenv
from agency.core.agency import TRoyGOAgency
from agency.core.memory import shared_memory

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="TRoyGO Agency Server",
    description="Execute TRoyGO's CrewAI department skills and return results",
    version="1.0.0"
)

# The dashboard (troygo-dashboard.pages.dev, Basic-Auth-protected) calls this
# server directly from the browser — needs real CORS, not just curl-style
# server-to-server access. Both the stable production URL and per-deploy
# preview URLs (*.troygo-dashboard.pages.dev) are allowed.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://([a-z0-9-]+\.)?troygo-dashboard\.pages\.dev",
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Backend-Key"],
)

# Exposed to the internet via a Cloudflare Tunnel (backend.troytravelagency.com),
# so every route except /health must present the shared key the dashboard sends.
BACKEND_API_KEY = os.getenv("BACKEND_API_KEY", "")


@app.on_event("shutdown")
def _drain_shared_memory():
    shared_memory.close()


@app.middleware("http")
async def require_backend_key(request: Request, call_next):
    # CORS preflight requests never carry custom headers like X-Backend-Key
    # (browsers strip them by design) — CORSMiddleware handles the actual
    # preflight response, but only if this auth check doesn't intercept it
    # first and return 401 before CORSMiddleware gets a chance to run.
    if request.method == "OPTIONS":
        return await call_next(request)

    if request.url.path in ("/health", "/docs", "/openapi.json", "/redoc"):
        return await call_next(request)

    if not BACKEND_API_KEY:
        logger.warning("BACKEND_API_KEY is not set — refusing all non-health requests.")
        return JSONResponse(status_code=503, content={"detail": "Server not configured: BACKEND_API_KEY missing"})

    provided = request.headers.get("x-backend-key", "")
    if not hmac.compare_digest(provided, BACKEND_API_KEY):
        return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

    return await call_next(request)


agency = TRoyGOAgency()


class TaskRequest(BaseModel):
    task_id: str
    brief: str
    department: str = ""
    skill: str = ""


class TaskResponse(BaseModel):
    task_id: str
    status: str
    result: str


@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "TRoyGO Agency Executor",
        "agency_version": "1.0.0"
    }


@app.get("/status")
def agency_status():
    return agency.status()


@app.get("/memory/records")
def memory_records(limit: int = 100):
    records = shared_memory.list_records()
    records.sort(key=lambda r: r.created_at, reverse=True)
    return {
        "count": len(records),
        "records": [
            {
                "id": r.id,
                "scope": r.scope,
                "categories": r.categories,
                "content": r.content,
                "importance": r.importance,
                "created_at": r.created_at.isoformat() if hasattr(r.created_at, "isoformat") else str(r.created_at),
            }
            for r in records[:limit]
        ],
    }


@app.post("/execute", response_model=TaskResponse)
def execute_task(request: TaskRequest) -> TaskResponse:
    """Runs synchronously — TRoyGO's skills are cheaper/shorter than TRoyAI's
    multi-agent orchestrations, so no background-thread/callback pattern is
    needed yet. Revisit if a skill starts running long enough to risk a
    request timeout."""
    try:
        logger.info(f"Executing task {request.task_id}: {request.department}.{request.skill}")
        result = route_and_execute(request.department, request.skill, request.brief)
        logger.info(f"Task {request.task_id} completed successfully")
        return TaskResponse(task_id=request.task_id, status="completed", result=result)
    except Exception as e:
        logger.error(f"Task {request.task_id} failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ── Department-specific endpoints ──

@app.post("/marketing/research-deals", response_model=TaskResponse)
def marketing_research_deals(request: TaskRequest) -> TaskResponse:
    try:
        result = agency.research_deals(request.brief or "current global travel deals")
        return TaskResponse(task_id=request.task_id, status="completed", result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/marketing/campaign-content", response_model=TaskResponse)
def marketing_campaign_content(request: TaskRequest) -> TaskResponse:
    try:
        result = agency.campaign_content(request.brief)
        return TaskResponse(task_id=request.task_id, status="completed", result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/marketing/outreach-content", response_model=TaskResponse)
def marketing_outreach_content(request: TaskRequest) -> TaskResponse:
    try:
        result = agency.outreach_content(request.brief or "past customers")
        return TaskResponse(task_id=request.task_id, status="completed", result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/sales/qualify-lead", response_model=TaskResponse)
def sales_qualify_lead(request: TaskRequest) -> TaskResponse:
    try:
        result = agency.qualify_lead(request.brief)
        return TaskResponse(task_id=request.task_id, status="completed", result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/sales/booking-followup", response_model=TaskResponse)
def sales_booking_followup(request: TaskRequest) -> TaskResponse:
    try:
        result = agency.booking_followup(request.brief)
        return TaskResponse(task_id=request.task_id, status="completed", result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/sales/objection-handler", response_model=TaskResponse)
def sales_objection_handler(request: TaskRequest) -> TaskResponse:
    try:
        result = agency.objection_handler(request.brief)
        return TaskResponse(task_id=request.task_id, status="completed", result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/finance/verify-listings", response_model=TaskResponse)
def finance_verify_listings(request: TaskRequest) -> TaskResponse:
    try:
        result = agency.verify_listings()
        return TaskResponse(task_id=request.task_id, status="completed", result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/finance/commission-track", response_model=TaskResponse)
def finance_commission_track(request: TaskRequest) -> TaskResponse:
    try:
        result = agency.commission_track(request.brief)
        return TaskResponse(task_id=request.task_id, status="completed", result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/finance/roi-report", response_model=TaskResponse)
def finance_roi_report(request: TaskRequest) -> TaskResponse:
    try:
        result = agency.roi_report(request.brief or "this week")
        return TaskResponse(task_id=request.task_id, status="completed", result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/cto/audit-codebase", response_model=TaskResponse)
def cto_audit_codebase(request: TaskRequest) -> TaskResponse:
    """Read-only — scans and reports, never writes or deploys. brief doubles
    as the target directory (relative to the TRoyLAB repo root; empty
    defaults to the whole repo)."""
    try:
        result = agency.audit_codebase(request.brief or ".")
        return TaskResponse(task_id=request.task_id, status="completed", result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/cto/workflow-map", response_model=TaskResponse)
def cto_workflow_map(request: TaskRequest) -> TaskResponse:
    try:
        result = agency.workflow_map(request.brief)
        return TaskResponse(task_id=request.task_id, status="completed", result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/management/daily-briefing", response_model=TaskResponse)
def management_daily_briefing(request: TaskRequest) -> TaskResponse:
    try:
        result = agency.daily_briefing(request.brief)
        return TaskResponse(task_id=request.task_id, status="completed", result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/management/coordinate", response_model=TaskResponse)
def management_coordinate(request: TaskRequest) -> TaskResponse:
    try:
        result = agency.coordinate(request.brief)
        return TaskResponse(task_id=request.task_id, status="completed", result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def route_and_execute(department: str, skill: str, brief: str) -> str:
    department = department.lower()
    skill = skill.lower()

    routes = {
        "marketing": {
            "research_deals": agency.research_deals,
            "campaign_content": agency.campaign_content,
            "outreach_content": agency.outreach_content,
        },
        "sales": {
            "qualify_lead": agency.qualify_lead,
            "booking_followup": agency.booking_followup,
            "objection_handler": agency.objection_handler,
        },
        "finance": {
            "verify_listings": lambda _brief: agency.verify_listings(),
            "commission_track": agency.commission_track,
            "roi_report": agency.roi_report,
        },
        "cto": {
            "audit_codebase": agency.audit_codebase,
            "workflow_map": agency.workflow_map,
        },
        "management": {
            "daily_briefing": agency.daily_briefing,
            "coordinate": agency.coordinate,
        },
    }

    handler = routes.get(department, {}).get(skill)
    if handler is None:
        raise ValueError(f"Unknown department/skill: {department}/{skill}")
    return handler(brief)


if __name__ == "__main__":
    import sys
    import uvicorn

    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8")

    print("========================================================")
    print("  TRoyGO Agency Execution Server")
    print("  Starting at http://localhost:8001")
    print("  API docs at http://localhost:8001/docs")
    print("========================================================")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        log_level="info"
    )
