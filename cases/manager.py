"""Case management - repair shop cases/tickets with device tracking."""
import os
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional


BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "storage", "cases")
os.makedirs(BASE_DIR, exist_ok=True)

CASES_FILE = os.path.join(BASE_DIR, "cases.json")
DEVICES_FILE = os.path.join(BASE_DIR, "case_devices.json")


def _load_cases() -> Dict[str, Any]:
    """Load cases."""
    if not os.path.exists(CASES_FILE):
        return {}
    try:
        with open(CASES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return {}


def _save_cases(data: Dict[str, Any]) -> None:
    """Save cases."""
    with open(CASES_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def _load_devices() -> Dict[str, Any]:
    """Load case devices."""
    if not os.path.exists(DEVICES_FILE):
        return {}
    try:
        with open(DEVICES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return {}


def _save_devices(data: Dict[str, Any]) -> None:
    """Save case devices."""
    with open(DEVICES_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def create_case(
    customer_name: str,
    customer_email: str = "",
    customer_phone: str = "",
    notes: str = "",
    created_by: str = "system"
) -> str:
    """Create a new repair case."""
    cases = _load_cases()
    case_id = str(uuid.uuid4())
    
    case = {
        "id": case_id,
        "customer_name": customer_name,
        "customer_email": customer_email,
        "customer_phone": customer_phone,
        "status": "intake",
        "notes": notes,
        "created_by": created_by,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    cases[case_id] = case
    _save_cases(cases)
    return case_id


def get_case(case_id: str) -> Optional[Dict[str, Any]]:
    """Get a case by ID."""
    cases = _load_cases()
    return cases.get(case_id)


def list_cases(status: Optional[str] = None) -> List[Dict[str, Any]]:
    """List all cases, optionally filtered by status."""
    cases = _load_cases()
    case_list = list(cases.values())
    
    if status:
        case_list = [c for c in case_list if c.get("status") == status]
    
    # Sort by created_at descending (newest first)
    case_list.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return case_list


def update_case_status(case_id: str, status: str) -> bool:
    """Update case status."""
    valid_statuses = ["intake", "in-progress", "waiting-parts", "completed", "closed"]
    if status not in valid_statuses:
        raise ValueError(f"Invalid status: {status}. Must be one of {valid_statuses}")
    
    cases = _load_cases()
    if case_id not in cases:
        return False
    
    cases[case_id]["status"] = status
    cases[case_id]["updated_at"] = datetime.now(timezone.utc).isoformat()
    _save_cases(cases)
    return True


def update_case(case_id: str, **kwargs) -> bool:
    """Update case fields."""
    cases = _load_cases()
    if case_id not in cases:
        return False
    
    allowed_fields = ["customer_name", "customer_email", "customer_phone", "notes", "status"]
    for key, value in kwargs.items():
        if key in allowed_fields:
            cases[case_id][key] = value
    
    cases[case_id]["updated_at"] = datetime.now(timezone.utc).isoformat()
    _save_cases(cases)
    return True


def add_device_to_case(
    case_id: str,
    platform: str,
    model: Optional[str] = None,
    serial: Optional[str] = None,
    imei: Optional[str] = None,
    os_version: Optional[str] = None,
    connection_state: str = "none",
    trust_state: Optional[Dict[str, Any]] = None,
    passport: Optional[Dict[str, Any]] = None
) -> str:
    """Add a device to a case."""
    # Verify case exists
    cases = _load_cases()
    if case_id not in cases:
        raise ValueError(f"Case not found: {case_id}")
    
    devices = _load_devices()
    device_id = str(uuid.uuid4())
    
    device = {
        "id": device_id,
        "case_id": case_id,
        "platform": platform,
        "model": model,
        "serial": serial,
        "imei": imei,
        "os_version": os_version,
        "connection_state": connection_state,
        "trust_state": trust_state or {},
        "passport": passport or {},
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    devices[device_id] = device
    _save_devices(devices)
    return device_id


def get_case_devices(case_id: str) -> List[Dict[str, Any]]:
    """Get all devices for a case."""
    devices = _load_devices()
    return [d for d in devices.values() if d.get("case_id") == case_id]


def get_device(device_id: str) -> Optional[Dict[str, Any]]:
    """Get a device by ID."""
    devices = _load_devices()
    return devices.get(device_id)
