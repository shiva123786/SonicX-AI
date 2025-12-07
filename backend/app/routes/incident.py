# backend/app/routes/incident.py
from fastapi import APIRouter, HTTPException
from typing import List
from app.services.db_service import (
    add_incident, list_incidents, get_incident_by_id, update_incident, delete_incident
)
from app.models.incident_model import IncidentCreate, Incident
from app.services.pubsub_service import broadcaster
from app.agents.dispatch_adapter import dispatch_help  # async function

router = APIRouter()

@router.get("/", summary="List incidents")
def get_incidents():
    return {"incidents": list_incidents()}

@router.get("/{incident_id}", summary="Get incident")
def get_incident(incident_id: str):
    inc = get_incident_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="incident not found")
    return inc

@router.post("/", summary="Create incident")
def create_incident(payload: IncidentCreate):
    data = payload.dict()
    inc = add_incident(data)
    # broadcast
    try:
        # best-effort schedule
        import asyncio
        asyncio.create_task(broadcaster.broadcast({"type":"incident","incident":inc}))
    except Exception:
        pass
    return inc

@router.post("/dispatch/{incident_id}", summary="Dispatch to incident")
async def dispatch_endpoint(incident_id: str):
    # dispatch_help will find responders and assign
    decision = await dispatch_help(incident_id)
    # send update snapshot for clients
    try:
        await broadcaster.broadcast({"type": "dispatch", "incident_id": incident_id, "decision": decision})
    except Exception:
        pass
    return decision

@router.delete("/{incident_id}", summary="Delete incident")
def remove_incident(incident_id: str):
    removed = delete_incident(incident_id)
    if not removed:
        raise HTTPException(status_code=404, detail="incident not found")
    return {"status": "deleted", "id": incident_id}
