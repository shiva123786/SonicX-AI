# backend/app/routes/camera.py
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
import asyncio
from typing import Dict, Any

from app.camera_feed_analyzer import analyze_feed  # must be async generator
from app.services.db_service import add_incident
from app.services.pubsub_service import broadcaster

router = APIRouter()

# track running tasks per zone
_running_tasks: Dict[str, asyncio.Task] = {}

class StartFeedRequest(BaseModel):
    zone: str
    source: str = "simulated"

@router.post("/start")
async def start_feed(req: StartFeedRequest, background_tasks: BackgroundTasks):
    zone = req.zone

    # Map common source aliases
    source = req.source
    if isinstance(source, str) and source.lower() in ("webcam", "camera", "0"):
        source = 0  # default webcam device index

    async def run_feed():
        async for anomaly in analyze_feed(source, zone):
            inc = add_incident(anomaly)
            await broadcaster.broadcast({"type": "incident", "incident": inc})

    if zone in _running_tasks:
        return {"status": "already_running", "zone": zone}

    task = asyncio.create_task(run_feed())
    _running_tasks[zone] = task
    return {"status": "started", "zone": zone}

@router.post("/stop/{zone}")
async def stop_feed(zone: str):
    task = _running_tasks.get(zone)
    if not task:
        return {"status": "not_running", "zone": zone}
    task.cancel()
    del _running_tasks[zone]
    return {"status": "stopped", "zone": zone}
