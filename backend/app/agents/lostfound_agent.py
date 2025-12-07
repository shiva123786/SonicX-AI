"""
lostfound_agent.py
------------------
Matches a photo of a missing person with live video feeds to locate them.
"""

from typing import List
import random

# Mock database of detected faces (replace with real face recognition later)
DETECTED_FACES = [
    {"zone": "A", "face_id": "face001"},
    {"zone": "B", "face_id": "face002"},
    {"zone": "C", "face_id": "face003"},
]

def match_missing_person(photo_encoding: str) -> dict:
    """
    photo_encoding: string or vector representing the missing person's face
    returns: matched zone or None
    """
    # Demo: pick random face as “match”
    matched = random.choice(DETECTED_FACES)
    return {
        "matched_face": matched["face_id"],
        "zone": matched["zone"],
        "confidence": round(random.uniform(0.7, 0.95), 2)
    }


# Example usage
if __name__ == "__main__":
    result = match_missing_person("dummy_encoding")
    print(f"Missing person located in Zone {result['zone']} with confidence {result['confidence']}")
