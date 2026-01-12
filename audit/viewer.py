"""Audit log viewer and query functions."""
import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from .logger import AuditEvent, AuditLogger, create_audit_logger


def get_audit_events(
    limit: int = 100,
    level: Optional[str] = None,
    action: Optional[str] = None,
    actor: Optional[str] = None,
    log_file: str = "storage/audit/audit.log"
) -> List[Dict[str, Any]]:
    """
    Get audit events with filtering.
    
    Returns events in reverse chronological order (newest first).
    """
    if not os.path.exists(log_file):
        return []
    
    events = []
    
    try:
        with open(log_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                
                try:
                    event_data = json.loads(line)
                    
                    # Apply filters
                    if level and event_data.get("level") != level:
                        continue
                    if action and event_data.get("action") != action:
                        continue
                    if actor and event_data.get("actor") != actor:
                        continue
                    
                    events.append(event_data)
                except json.JSONDecodeError:
                    continue
    except Exception:
        return []
    
    # Reverse to get newest first, then limit
    events.reverse()
    return events[:limit]


def get_events_for_case(case_id: str, log_file: str = "storage/audit/audit.log") -> List[Dict[str, Any]]:
    """Get all audit events for a case."""
    if not os.path.exists(log_file):
        return []
    
    events = []
    
    try:
        with open(log_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                
                try:
                    event_data = json.loads(line)
                    if event_data.get("case_id") == case_id:
                        events.append(event_data)
                except json.JSONDecodeError:
                    continue
    except Exception:
        return []
    
    # Reverse to get newest first
    events.reverse()
    return events


def query_audit_events(
    case_id: Optional[str] = None,
    level: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = 100,
    log_file: str = "storage/audit/audit.log"
) -> List[Dict[str, Any]]:
    """
    Unified query function for audit events.
    
    If case_id is provided, returns events for that case only.
    Otherwise, applies level/action filters.
    """
    if case_id:
        return get_events_for_case(case_id, log_file)
    else:
        return get_audit_events(limit=limit, level=level, action=action, log_file=log_file)


def get_events_for_device(device_id: str, log_file: str = "storage/audit/audit.log") -> List[Dict[str, Any]]:
    """Get all audit events for a device."""
    if not os.path.exists(log_file):
        return []
    
    events = []
    
    try:
        with open(log_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                
                try:
                    event_data = json.loads(line)
                    if event_data.get("device_id") == device_id:
                        events.append(event_data)
                except json.JSONDecodeError:
                    continue
    except Exception:
        return []
    
    # Reverse to get newest first
    events.reverse()
    return events


def export_audit_log(
    output_file: str,
    case_id: Optional[str] = None,
    device_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    log_file: str = "storage/audit/audit.log"
) -> str:
    """
    Export audit log to JSON file.
    
    Can filter by case_id, device_id, or date range.
    """
    events = []
    
    if case_id:
        events = get_events_for_case(case_id, log_file)
    elif device_id:
        events = get_events_for_device(device_id, log_file)
    else:
        events = get_audit_events(limit=10000, log_file=log_file)
    
    # Date filtering
    if start_date or end_date:
        filtered_events = []
        for event in events:
            event_date = event.get("timestamp", "")
            if start_date and event_date < start_date:
                continue
            if end_date and event_date > end_date:
                continue
            filtered_events.append(event)
        events = filtered_events
    
    # Write to file
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump({
            "exported_at": datetime.utcnow().isoformat() + "Z",
            "total_events": len(events),
            "filters": {
                "case_id": case_id,
                "device_id": device_id,
                "start_date": start_date,
                "end_date": end_date
            },
            "events": events
        }, f, indent=2, ensure_ascii=False)
    
    return output_file
