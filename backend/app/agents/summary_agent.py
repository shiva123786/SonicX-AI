"""
summary_agent.py
----------------
Generates AI-powered summaries for zones or incidents.
Can be called by Puter.js frontend or backend API.
"""

from typing import List

def generate_summary(zone: str, incidents: List[dict]) -> str:
    if not incidents:
        return f"No active incidents in Zone {zone}."

    summary_lines = [f"Zone {zone} Summary:"]
    for inc in incidents:
        line = f"- {inc['type'].replace('_', ' ').title()} (Severity: {inc['severity']})"
        summary_lines.append(line)

    critical_count = sum(1 for inc in incidents if inc["severity"] > 0.7)
    summary_lines.append(f"⚠ Critical incidents: {critical_count}")

    return "\n".join(summary_lines)


# Example usage
if __name__ == "__main__":
    incidents = [
        {"type": "crowd_surge", "severity": 0.8},
        {"type": "injury", "severity": 0.6}
    ]
    print(generate_summary("A", incidents))
