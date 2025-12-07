# Event Rescue — Prototype

This repository is a runnable prototype of the Event Rescue realtime situational-awareness system.
It contains a FastAPI backend (mock detectors + websocket) and a React + Tailwind frontend dashboard.

## Structure
See the provided tree in the project root.

## Quick start (backend)
1. cd backend
2. python -m venv .venv
3. source .venv/bin/activate  # Windows: .venv\Scripts\activate
4. pip install -r requirements.txt
5. uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

## Quick start (frontend)
1. cd frontend
2. npm install
3. npm start

## Notes
- Replace Firebase and cloud model placeholders with your credentials.
- The detectors are mock implementations meant for rapid prototyping.
