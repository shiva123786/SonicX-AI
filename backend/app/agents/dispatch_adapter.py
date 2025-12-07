"""
dispatch_adapter.py
Automated Help Dispatch for Event Rescue
----------------------------------------
Routes critical incidents to the right responder type
using Google Maps API (for ETA/distance) and async notification dispatch.
"""

import asyncio
import httpx
from typing import Dict, Any

# Optional: Twilio or Puter notifications later
# from twilio.rest import Client

GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"  # replace later
HELP_TEAMS = {
    "medical": {"lat": 12.9716, "lng": 77.5946},
    "fire": {"lat": 12.9750, "lng": 77.5920},
    "security": {"lat": 12.9690, "lng": 77.5980},
}


async def get_eta_from_maps(dest_lat: float, dest_lng: float) -> Dict[str, Any]:
    """Fetch ETA for each response team using Google Distance Matrix API."""
    base_url = "https://maps.googleapis.com/maps/api/distancematrix/json"
    etas = {}

    async with httpx.AsyncClient() as client:
        for team, loc in HELP_TEAMS.items():
            params = {
                "origins": f"{loc['lat']},{loc['lng']}",
                "destinations": f"{dest_lat},{dest_lng}",
                "key": GOOGLE_MAPS_API_KEY,
            }
            try:
                r = await client.get(base_url, params=params)
                data = r.json()
                eta_text = data["rows"][0]["elements"][0]["duration"]["text"]
                etas[team] = eta_text
            except Exception as e:
                etas[team] = "unknown"
                print(f"[Error] ETA fetch failed for {team}: {e}")
    return etas


async def dispatch_help(incident: Dict[str, Any]) -> Dict[str, Any]:
    """Decide and dispatch help based on incident type."""
    zone = incident.get("zone")
    incident_type = incident.get("type")
    severity = incident.get("severity", 0)
    lat, lng = incident.get("lat", 12.9716), incident.get("lng", 77.5946)

    # Decide responder
    if "fire" in incident_type:
        team = "fire"
    elif "injury" in incident_type or "medical" in incident_type:
        team = "medical"
    else:
        team = "security"

    etas = await get_eta_from_maps(lat, lng)
    eta = etas.get(team, "unknown")

    # Mock notification (replace with Twilio / Push)
    print(f"🚨 Dispatching {team.upper()} team to Zone {zone} (ETA: {eta})")

    # Example: Twilio SMS later
    # client = Client(account_sid, auth_token)
    # client.messages.create(
    #     body=f"Dispatch {team.upper()} team to Zone {zone}! Severity: {severity}",
    #     from_="+1234567890", to="+919876543210"
    # )

    return {
        "zone": zone,
        "type": incident_type,
        "team_dispatched": team,
        "eta": eta,
        "severity": severity,
    }


# For testing locally
if __name__ == "__main__":
    test_incident = {
        "zone": "A",
        "type": "injury",
        "severity": 0.8,
        "lat": 12.972,
        "lng": 77.593,
    }
    asyncio.run(dispatch_help(test_incident))
