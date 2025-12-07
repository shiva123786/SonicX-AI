# 📊 Data Storage Information

## Where is Data Stored?

### Current Implementation: IN-MEMORY STORAGE

All data is currently stored **in memory** using Python lists and dictionaries in:
```
backend/app/services/db_service.py
```

### ⚠️ IMPORTANT: Data is NOT Persistent!
- **Data is lost when the backend server restarts**
- This is only for development/testing
- For production, you MUST use a real database

---

## What Data is Stored?

### 1. **User Accounts** (`_users` list)
Stores both regular users and admins:
```python
{
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "password_hash": "hashed_password_here",
    "role": "user" or "admin",
    "phone": "+1234567890",
    "created_at": "2024-01-01T00:00:00",
    "last_login": "2024-01-01T12:00:00"
}
```

### 2. **Lost & Found Reports** (`_lost_found_reports` list)
```python
{
    "id": 1,
    "reporter": "Jane Smith",
    "description": "Missing person - blue shirt",
    "timestamp": "2024-01-01T00:00:00",
    "image_path": "path/to/image.jpg",
    "hist": [0.1, 0.2, ...],  # Color histogram for matching
    "status": "reported" or "resolved"
}
```

### 3. **Incidents** (`_incidents` list)
```python
{
    "id": 1,
    "type": "fire_detected" or "missing_person_found" or "voice_help",
    "zone": "Zone A",
    "severity": 0.9,
    "confidence": 85,
    "timestamp": "2024-01-01T00:00:00",
    "description": "Fire detected in camera view",
    "lat": 40.7128,
    "lng": -74.0060
}
```

---

## How Long Does Data Last?

### Development (Current Setup):
- **Data persists ONLY while backend is running**
- Restarting the backend = ALL data is lost
- Users, reports, incidents all reset to empty

### Testing Between Devices:
When running on 2 devices locally:
1. Both devices connect to the SAME backend (e.g., `http://192.168.1.100:8000`)
2. They share the SAME in-memory data
3. Data syncs in real-time between devices
4. But still lost on backend restart

---

## 🚀 For Production: Use a Real Database

### Recommended Options:

#### Option 1: PostgreSQL (Best for Production)
```bash
# Install
pip install psycopg2-binary sqlalchemy

# Create database models
# Use SQLAlchemy ORM
# Persist data permanently
```

#### Option 2: MongoDB (NoSQL)
```bash
# Install
pip install pymongo motor

# Store JSON documents
# Good for flexible schemas
```

#### Option 3: SQLite (Simple File-Based)
```bash
# Built into Python
import sqlite3

# Stores in a .db file
# Good for small deployments
```

---

## 🔐 Security Notes

### Current Setup (DEVELOPMENT ONLY):
- ❌ Passwords hashed with SHA-256 (not secure enough!)
- ❌ No JWT tokens (using random strings)
- ❌ No HTTPS
- ❌ No rate limiting
- ❌ No email verification

### For Production (MUST IMPLEMENT):
- ✅ Use bcrypt or Argon2 for password hashing
- ✅ Implement JWT with refresh tokens
- ✅ Use HTTPS/TLS encryption
- ✅ Add rate limiting
- ✅ Implement email verification
- ✅ Add CORS properly
- ✅ Use environment variables for secrets

---

## 📱 Multi-Device Setup

### Running on 2 Devices Locally:

#### Device 1 (Backend + Authority):
```bash
# Start backend
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Find your IP address
ipconfig  # Windows
ifconfig  # Mac/Linux
# Example: 192.168.1.100
```

#### Device 2 (Participant):
```bash
# Start frontend with backend IP
cd frontend

# Update vite.config.ts to point to Device 1:
server: {
  proxy: {
    '/api': 'http://192.168.1.100:8000',
    '/incidents': 'http://192.168.1.100:8000'
  }
}

npm run dev
```

Both devices will share the same in-memory data!

---

## 🔄 Data Flow

```
Frontend (React)
    ↓
  HTTP Request
    ↓
Backend (FastAPI)
    ↓
db_service.py (In-Memory Lists)
    ↓
  _users = []
  _incidents = []
  _lost_found_reports = []
```

---

## ⚙️ Migration to Real Database

To migrate from in-memory to PostgreSQL:

1. **Install dependencies:**
```bash
pip install sqlalchemy psycopg2-binary alembic
```

2. **Create models:** (backend/app/models/user.py)
```python
from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)
    password_hash = Column(String)
    role = Column(String)
```

3. **Update db_service.py** to use SQLAlchemy sessions
4. **Run migrations** with Alembic
5. **Data persists permanently!**

---

## 📝 Summary

| Feature | Current (Dev) | Production |
|---------|--------------|------------|
| Storage | In-Memory | PostgreSQL/MongoDB |
| Persistence | Lost on restart | Permanent |
| Users | In `_users` list | Database table |
| Security | Basic hashing | bcrypt + JWT |
| Multi-device | Same backend IP | Cloud database |
| Scalability | Single server | Multiple servers + DB |

---

## 🎯 Quick Answer

**Q: Where is data saved?**
**A:** In memory (backend/app/services/db_service.py) - NOT permanent!

**Q: Where are users saved?**
**A:** `_users` list in memory

**Q: Where are admins saved?**
**A:** Same `_users` list (with `role: "admin"`)

**Q: How to make it permanent?**
**A:** Replace in-memory lists with a real database (PostgreSQL recommended)

---

For questions or migration help, check:
- `backend/app/services/db_service.py` - All storage code
- `backend/app/main.py` - Authentication endpoints
- This file for database migration guides
