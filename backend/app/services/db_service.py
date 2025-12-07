"""
Simple in-memory database service for Event Rescue
ALL DATA IS STORED IN MEMORY - will be lost when server restarts.
For production, use PostgreSQL, MySQL, or MongoDB.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
import hashlib

# In-memory storage for incidents, lost&found, and users
_incidents: List[Dict[str, Any]] = []
_lost_found_reports: List[Dict[str, Any]] = []
_users: List[Dict[str, Any]] = []  # Store user accounts (users and admins)

def add_incident(incident_data: Dict[str, Any]) -> Dict[str, Any]:
    """Add a new incident to the database."""
    incident = {
        "id": len(_incidents) + 1,
        "timestamp": datetime.now().isoformat(),
        **incident_data
    }
    _incidents.append(incident)
    return incident

def list_incidents() -> List[Dict[str, Any]]:
    """List all incidents."""
    return _incidents.copy()

def get_incident_by_id(incident_id: str) -> Optional[Dict[str, Any]]:
    """Get incident by ID."""
    try:
        id_int = int(incident_id)
        for incident in _incidents:
            if incident.get("id") == id_int:
                return incident
    except ValueError:
        pass
    return None

def update_incident(incident_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Update an incident."""
    incident = get_incident_by_id(incident_id)
    if incident:
        incident.update(updates)
        return incident
    return None

def delete_incident(incident_id: str) -> bool:
    """Delete an incident."""
    try:
        id_int = int(incident_id)
        for i, incident in enumerate(_incidents):
            if incident.get("id") == id_int:
                del _incidents[i]
                return True
    except ValueError:
        pass
    return False

# Lost & Found storage helpers
def add_lost_found(report: Dict[str, Any]) -> Dict[str, Any]:
    item = {
        "id": len(_lost_found_reports) + 1,
        "timestamp": datetime.now().isoformat(),
        **report,
    }
    _lost_found_reports.append(item)
    return item

def list_lost_found() -> List[Dict[str, Any]]:
    return list(_lost_found_reports)

def delete_lost_found(report_id: str) -> bool:
    """Delete a lost & found report by ID and resolve associated alerts."""
    global _lost_found_reports, _incidents
    try:
        id_int = int(report_id)
        for i, report in enumerate(_lost_found_reports):
            if report.get("id") == id_int:
                # Delete the report
                del _lost_found_reports[i]
                print(f"✅ Deleted lost & found report #{id_int}")
                
                # Also resolve any active alerts for this report
                alerts_resolved = 0
                for incident in _incidents:
                    if incident.get('matched_report_id') == id_int and incident.get('status') == 'active':
                        incident['status'] = 'resolved'
                        alerts_resolved += 1
                        print(f"  ✅ Auto-resolved alert #{incident.get('id')} for deleted report")
                
                if alerts_resolved > 0:
                    print(f"✅ Resolved {alerts_resolved} alert(s) for report #{id_int}")
                
                return True
    except ValueError:
        pass
    print(f"❌ Failed to delete report #{report_id} - not found")
    return False

# User Management Functions
def hash_password(password: str) -> str:
    """Hash password with SHA-256."""
    return hashlib.sha256(password.encode()).hexdigest()

def create_user(name: str, email: str, password: str, role: str, phone: str = "") -> Optional[Dict[str, Any]]:
    """Create a new user account."""
    global _users
    
    # Check if email already exists
    if any(u.get("email") == email for u in _users):
        return None
    
    user = {
        "id": len(_users) + 1,
        "name": name,
        "email": email,
        "password_hash": hash_password(password),
        "role": role,  # 'user' or 'admin'
        "phone": phone,
        "created_at": datetime.now().isoformat(),
        "last_login": None
    }
    _users.append(user)
    print(f"✅ Created {role} account: {email}")
    return user

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate user with email and password."""
    password_hash = hash_password(password)
    
    for user in _users:
        if user.get("email") == email and user.get("password_hash") == password_hash:
            # Update last login
            user["last_login"] = datetime.now().isoformat()
            print(f"✅ User authenticated: {email}")
            return {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
                "phone": user.get("phone", "")
            }
    
    print(f"❌ Authentication failed for: {email}")
    return None

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email."""
    for user in _users:
        if user.get("email") == email:
            return user
    return None

def list_all_users() -> List[Dict[str, Any]]:
    """List all users (without password hashes)."""
    return [
        {
            "id": u["id"],
            "name": u["name"],
            "email": u["email"],
            "role": u["role"],
            "phone": u.get("phone", ""),
            "created_at": u.get("created_at", "")
        }
        for u in _users
    ]
