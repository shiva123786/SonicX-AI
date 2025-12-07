from fastapi import APIRouter
from app.agents.decision_engine import decide_response
from app.agents.dispatch_adapter import dispatch_incident
from app.agents.summary_agent import summarize_zone

router = APIRouter()

@router.post("/agent/dispatch")
def trigger_dispatch(incident: dict):
    decision = decide_response(incident, context={})
    return {"incident_id": incident.get("id"), "decision": decision}

@router.get("/agent/summary/{zone_id}")
def get_summary(zone_id: str):
    summary = summarize_zone(zone_id)
    return {"zone": zone_id, "summary": summary}

# backend/app/routes/agents.py
from fastapi import APIRouter, HTTPException
from typing import List
from app.services.db_service import get_responders, register_responder, get_responder_by_id, assign_responder, release_responder
from app.models.responder_model import Responder

@router.get("/", summary="List responders")
def list_responders():
    return {"responders": get_responders()}

@router.post("/register", summary="Register responder")
def register(r: Responder):
    register_responder(r.dict())
    return {"status":"ok","responder": r.dict()}

@router.post("/assign/{responder_id}/{incident_id}", summary="Assign responder")
def assign(responder_id: str, incident_id: str):
    r = assign_responder(responder_id, incident_id)
    if not r:
        raise HTTPException(status_code=404, detail="responder not found")
    return {"status":"assigned", "responder": r}

@router.post("/release/{responder_id}", summary="Release responder")
def release(responder_id: str):
    r = release_responder(responder_id)
    if not r:
        raise HTTPException(status_code=404, detail="responder not found")
    return {"status":"released", "responder": r}
