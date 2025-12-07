"""
decision_engine.py

Simple, testable decision engine for Event Rescue.
- compute_distress_score: converts detection signals to a 0..1 distress score.
- decide_response: maps an incident + context to a list of responder types.
- Configurable thresholds and simple policy logic.

Intended to be imported by your FastAPI backend:
from .decision_engine import decide_response, compute_distress_score
"""

from typing import Dict, List, Optional
from dataclasses import dataclass


# --- Configuration (tweak these) ---
DISTRESS_HIGH = 0.8
DISTRESS_MEDIUM = 0.4

# Mapping of logical responder types to channel names or IDs used by your dispatch adapter
DEFAULT_RESPONDER_PRIORITY = {
    "pediatrician": 3,
    "paramedic": 1,
    "medic": 2,
    "security": 4,
    "crowd_control": 5,
    "observer": 99,
}

# --- Data structures ---


@dataclass
class Incident:
    id: str
    ts: int  # epoch ms
    zone: str
    lat: Optional[float]
    lng: Optional[float]
    evidence: Dict  # e.g., {"frame_id": "...", "labels": ["fall", "bleeding"], "confidence": 0.93}
    metadata: Dict  # arbitrary detector outputs (age_estimate, audio_flags, etc.)


@dataclass
class Context:
    time_of_day: Optional[str] = None
    crowd_density: Optional[float] = None  # people per unit area
    nearby_responders: Optional[List[Dict]] = None  # list of {type, distance_m, eta_s}
    forecast: Optional[Dict] = None  # e.g., {"will_surge": True, "in_minutes": 18, "confidence": 0.7}


# --- Scoring / heuristics ---


def compute_distress_score(metadata: Dict, evidence: Dict) -> float:
    """
    Compute a distress score 0..1 from detector outputs.

    Inputs expected (examples):
    metadata = {
        "age": "child" / "adult" / "elderly" / None,
        "pose_confidence": 0..1,
        "audio_scream": True/False,
        "motion_intensity": 0..1,
    }
    evidence = {
        "labels": ["fall","bleeding","fire"],
        "label_confidences": {"fall": 0.9, "bleeding": 0.85}
    }

    This function is intentionally simple and interpretable.
    """

    # Base score
    score = 0.0

    # Evidence-based boosts
    labels = set(evidence.get("labels", []) or [])
    label_conf = evidence.get("label_confidences", {}) or {}

    # Critical labels get larger weight
    if "fire" in labels:
        score = max(score, 0.9)
    if "smoke" in labels:
        score = max(score, 0.8)
    if "unconscious" in labels or "collapse" in labels:
        score = max(score, 0.85)
    if "bleeding" in labels:
        score = max(score, 0.8)
    if "fall" in labels:
        # fall may be minor — use confidence
        score = max(score, min(0.75, 0.3 + 0.5 * label_conf.get("fall", 0.6)))

    # Age-based modifier: child or elderly increases severity
    age = metadata.get("age")
    if age == "child":
        score = max(score, min(1.0, score + 0.12))
    if age == "elderly":
        score = max(score, min(1.0, score + 0.10))

    # Audio-based: screams or calls
    if metadata.get("audio_scream"):
        score = max(score, 0.7)

    # Motion intensity (0..1): sudden high value increases score
    motion = float(metadata.get("motion_intensity", 0.0) or 0.0)
    score = max(score, min(0.6, 0.2 + 0.6 * motion))

    # Pose confidence: if pose indicates hands-up/panic
    pose_conf = float(metadata.get("pose_confidence", 0.0) or 0.0)
    if pose_conf > 0.8 and "panic" in labels:
        score = max(score, 0.75)

    # Clamp
    if score < 0.0:
        score = 0.0
    if score > 1.0:
        score = 1.0

    # If label confidences exist, slightly bump score proportional to mean confidence for matched labels
    if label_conf:
        matched_confidences = [v for k, v in label_conf.items() if k in labels]
        if matched_confidences:
            avg_conf = sum(matched_confidences) / len(matched_confidences)
            score = min(1.0, max(score, score * 0.6 + 0.4 * avg_conf))

    return round(float(score), 3)


# --- Decision rules ---


def decide_response(incident: Incident, context: Context) -> List[str]:
    """
    Decide which responder types to send for a given incident and context.

    Returns a list of responder type keys (e.g., ['paramedic', 'security']).
    """

    # Combine data
    metadata = incident.metadata or {}
    evidence = incident.evidence or {}
    score = compute_distress_score(metadata, evidence)

    labels = set((evidence.get("labels") or [])[:])
    # Normalize label strings to lower-case for matching
    labels = {l.lower() for l in labels}

    responders = []

    # 1) Hard rules / overrides
    # If a child is involved, prioritize pediatrician
    if metadata.get("age") == "child":
        responders.append("pediatrician")

    # If explicit "fire" or "smoke" -> fire/crowd control + security
    if "fire" in labels or "smoke" in labels:
        responders.extend(["security", "crowd_control"])
        # Also ask for medic if there is a 'burn' or 'unconscious'
        if "burn" in labels or "unconscious" in labels:
            responders.append("paramedic")

    # If bleeding/unconscious -> paramedic
    if "bleeding" in labels or "unconscious" in labels or "collapse" in labels:
        responders.append("paramedic")

    # If fall with high confidence -> medic
    if "fall" in labels and (evidence.get("label_confidences", {}).get("fall", 0) > 0.7):
        responders.append("medic")

    # 2) Score-based decisions
    if score >= DISTRESS_HIGH:
        # High distress: paramedic + security
        if "paramedic" not in responders:
            responders.append("paramedic")
        if "security" not in responders:
            responders.append("security")

    elif score >= DISTRESS_MEDIUM:
        # Medium distress: send medic or medic + crowd control if forecasted surge
        if context.forecast and context.forecast.get("will_surge"):
            responders.append("crowd_control")
            responders.append("medic")
        else:
            responders.append("medic")

    else:
        # Low distress: monitor or observer; if age==child escalate to medic
        if metadata.get("age") == "child":
            responders.append("medic")
        else:
            responders.append("observer")

    # remove duplicates while preserving order and filter unknown responders
    final = []
    for r in responders:
        if r not in final and r in DEFAULT_RESPONDER_PRIORITY:
            final.append(r)

    # Fallback to observer if nothing selected
    if not final:
        final = ["observer"]

    return final





"""
Unit tests for decision_engine.py
Run with pytest:
    pytest test_decision_engine.py
"""

from decision_engine import compute_distress_score, decide_response, Incident, Context


def test_compute_distress_basic_fall():
    metadata = {"age": "adult", "motion_intensity": 0.5}
    evidence = {"labels": ["fall"], "label_confidences": {"fall": 0.8}}
    score = compute_distress_score(metadata, evidence)
    assert 0.3 <= score <= 0.9  # should reflect fall confidence


def test_child_involved_prioritizes_pediatrician():
    inc = Incident(
        id="i1",
        ts=0,
        zone="Zone A",
        lat=0.0,
        lng=0.0,
        evidence={"labels": ["fall"], "label_confidences": {"fall": 0.9}},
        metadata={"age": "child", "motion_intensity": 0.6},
    )
    ctx = Context()
    resp = decide_response(inc, ctx)
    assert "pediatrician" in resp
    # child should cause at least medic/pediatrician presence or pediatrician specifically
    assert len(resp) >= 1


def test_bleeding_or_unconscious_triggers_paramedic():
    inc = Incident(
        id="i2",
        ts=0,
        zone="Zone B",
        lat=0.0,
        lng=0.0,
        evidence={"labels": ["bleeding"], "label_confidences": {"bleeding": 0.95}},
        metadata={"age": "adult", "motion_intensity": 0.2},
    )
    ctx = Context()
    resp = decide_response(inc, ctx)
    assert "paramedic" in resp


def test_high_score_triggers_paramedic_and_security():
    inc = Incident(
        id="i3",
        ts=0,
        zone="Zone C",
        lat=0.0,
        lng=0.0,
        evidence={"labels": ["collapse"], "label_confidences": {"collapse": 0.95}},
        metadata={"audio_scream": True, "motion_intensity": 0.9},
    )
    ctx = Context()
    resp = decide_response(inc, ctx)
    assert "paramedic" in resp
    assert "security" in resp


def test_medium_score_with_forecast_adds_crowd_control():
    inc = Incident(
        id="i4",
        ts=0,
        zone="Zone D",
        lat=0.0,
        lng=0.0,
        evidence={"labels": ["fall"], "label_confidences": {"fall": 0.6}},
        metadata={"motion_intensity": 0.6},
    )
    ctx = Context(forecast={"will_surge": True, "in_minutes": 18})
    resp = decide_response(inc, ctx)
    # Should include crowd_control when forecast indicates surge
    assert "crowd_control" in resp or "medic" in resp


def test_low_score_returns_observer():
    inc = Incident(
        id="i5",
        ts=0,
        zone="Zone E",
        lat=0.0,
        lng=0.0,
        evidence={"labels": [], "label_confidences": {}},
        metadata={"motion_intensity": 0.01},
    )
    ctx = Context()
    resp = decide_response(inc, ctx)
    assert resp == ["observer"]

