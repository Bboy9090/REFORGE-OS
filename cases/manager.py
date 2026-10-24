"""Case management - repair shop cases/tickets with device tracking."""
import os
import json
import uuid
import tempfile
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional


BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "storage", "cases")
os.makedirs(BASE_DIR, exist_ok=True)

CASES_FILE = os.path.join(BASE_DIR, "cases.json")
DEVICES_FILE = os.path.join(BASE_DIR, "case_devices.json")


class CaseStorageError(RuntimeError):
    """Stored repair records could not be safely read or written."""


def _load_records(path: str) -> Dict[str, Any]:
    """Only a missing store is empty; damaged records require recovery."""
    try:
        with open(path, "r", encoding="utf-8") as stream:
            records = json.load(stream)
    except FileNotFoundError:
        return {}
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise CaseStorageError(
            f"Cannot read repair records from {os.path.basename(path)}. "
            "Existing records were preserved; restore a verified backup before retrying."
        ) from error
    if not isinstance(records, dict) or any(
        not isinstance(record, dict) for record in records.values()
    ):
        raise CaseStorageError(
            f"Invalid repair record structure in {os.path.basename(path)}. "
            "Existing records were preserved; restore a verified backup before retrying."
        )
    return records


def _save_records(path: str, records: Dict[str, Any]) -> None:
    """Replace a store only after the complete new contents reach disk."""
    temporary_path = None
    try:
        # A sibling file keeps replacement on the same filesystem. mkstemp
        # also creates private files rather than exposing customer records.
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=os.path.dirname(path),
            prefix=f".{os.path.basename(path)}.", suffix=".tmp", delete=False
        ) as stream:
            temporary_path = stream.name
            json.dump(records, stream, indent=2, ensure_ascii=False)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary_path, path)
        temporary_path = None
    except (OSError, TypeError, ValueError) as error:
        raise CaseStorageError(
            f"Cannot save repair records to {os.path.basename(path)}. "
            "The previous store was preserved."
        ) from error
    finally:
        if temporary_path is not None:
            try:
                os.unlink(temporary_path)
            except OSError:
                pass


def _load_cases() -> Dict[str, Any]:
    return _load_records(CASES_FILE)


def _save_cases(data: Dict[str, Any]) -> None:
    _save_records(CASES_FILE, data)


def _load_devices() -> Dict[str, Any]:
    return _load_records(DEVICES_FILE)


def _save_devices(data: Dict[str, Any]) -> None:
    _save_records(DEVICES_FILE, data)


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
