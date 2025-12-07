"""
forecast_agent.py
-----------------
Predict crowd bottlenecks 15–20 minutes in advance using historical or live incident data.
"""

import datetime
import random

# Mock function for demo — replace with predictive model later
def predict_bottlenecks(incidents):
    """
    incidents: list of dicts {zone, type, severity}
    returns: list of predicted congested zones
    """
    predictions = []
    for incident in incidents:
        if incident["severity"] > 0.5 or random.random() > 0.7:
            eta = datetime.datetime.now() + datetime.timedelta(minutes=15)
            predictions.append({
                "zone": incident["zone"],
                "predicted_time": eta.isoformat(),
                "expected_severity": min(incident["severity"] + 0.1, 1.0)
            })
    return predictions


# Example usage
if __name__ == "__main__":
    sample_incidents = [
        {"zone": "A", "type": "crowd_surge", "severity": 0.7},
        {"zone": "B", "type": "injury", "severity": 0.6}
    ]
    print(predict_bottlenecks(sample_incidents))
