"""Immutable audit logging - append-only audit trail."""
import json
import os
import hashlib
from dataclasses import dataclass, asdict
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from enum import Enum


class AuditLevel(Enum):
    """Audit event level."""
    INFO = "info"
    WARN = "warn"
    ERROR = "error"
    CRITICAL = "critical"


@dataclass
class AuditEvent:
    """Audit event structure."""
    event_id: str
    timestamp: str
    level: str
    actor: str
    action: str
    resource_type: str  # "case", "device", "job", "diagnostics"
    resource_id: Optional[str] = None
    case_id: Optional[str] = None
    device_id: Optional[str] = None
    job_id: Optional[str] = None
    message: str = ""
    metadata: Dict[str, Any] = None
    prev_hash: Optional[str] = None
    hash: Optional[str] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)
    
    def compute_hash(self, prev_hash: Optional[str] = None) -> str:
        """Compute hash for this event (chained)."""
        # Create hash input: prev_hash + event data
        hash_input = {
            "prev_hash": prev_hash or "",
            "event_id": self.event_id,
            "timestamp": self.timestamp,
            "level": self.level,
            "actor": self.actor,
            "action": self.action,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "message": self.message,
            "metadata": self.metadata
        }
        hash_str = json.dumps(hash_input, sort_keys=True, ensure_ascii=False)
        return hashlib.sha256(hash_str.encode("utf-8")).hexdigest()


class AuditLogger:
    """Immutable audit logger - append-only."""
    
    def __init__(self, log_file: str = "storage/audit/audit.log"):
        """Initialize audit logger."""
        self.log_file = log_file
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        
        # Ensure log file exists
        if not os.path.exists(log_file):
            with open(log_file, "w", encoding="utf-8") as f:
                f.write("")  # Create empty file
    
    def _get_last_hash(self) -> Optional[str]:
        """Get hash of last event in log (for chaining)."""
        if not os.path.exists(self.log_file):
            return None
        
        try:
            with open(self.log_file, "r", encoding="utf-8") as f:
                lines = f.readlines()
                # Read last line
                for line in reversed(lines):
                    line = line.strip()
                    if line:
                        try:
                            event_data = json.loads(line)
                            return event_data.get("hash")
                        except json.JSONDecodeError:
                            continue
        except Exception:
            pass
        
        return None
    
    def log(
        self,
        level: AuditLevel,
        actor: str,
        action: str,
        resource_type: str,
        resource_id: Optional[str] = None,
        case_id: Optional[str] = None,
        device_id: Optional[str] = None,
        job_id: Optional[str] = None,
        message: str = "",
        metadata: Optional[Dict[str, Any]] = None
    ) -> AuditEvent:
        """
        Log an audit event (append-only).
        
        Events are hash-chained for tamper detection.
        """
        import uuid
        
        event_id = str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Get previous hash for chaining
        prev_hash = self._get_last_hash()
        
        # Create event
        event = AuditEvent(
            event_id=event_id,
            timestamp=timestamp,
            level=level.value,
            actor=actor,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            case_id=case_id,
            device_id=device_id,
            job_id=job_id,
            message=message,
            metadata=metadata or {},
            prev_hash=prev_hash
        )
        
        # Compute hash
        event.hash = event.compute_hash(prev_hash)
        
        # Append to log (append-only)
        with open(self.log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(event.to_dict(), ensure_ascii=False) + "\n")
        
        return event
    
    def verify_chain(self) -> Dict[str, Any]:
        """
        Verify hash chain integrity.
        
        Returns:
            Dict with 'valid', 'total_events', 'broken_links'
        """
        if not os.path.exists(self.log_file):
            return {"valid": True, "total_events": 0, "broken_links": []}
        
        broken_links = []
        events = []
        
        try:
            with open(self.log_file, "r", encoding="utf-8") as f:
                prev_hash = None
                for line_num, line in enumerate(f, 1):
                    line = line.strip()
                    if not line:
                        continue
                    
                    try:
                        event_data = json.loads(line)
                        event = AuditEvent(**{k: v for k, v in event_data.items() if k != "hash"})
                        event.hash = event_data.get("hash")
                        
                        # Verify hash chain
                        if prev_hash is not None and event.prev_hash != prev_hash:
                            broken_links.append({
                                "line": line_num,
                                "event_id": event.event_id,
                                "expected_prev_hash": prev_hash,
                                "actual_prev_hash": event.prev_hash
                            })
                        
                        # Verify event hash
                        computed_hash = event.compute_hash(event.prev_hash)
                        if event.hash != computed_hash:
                            broken_links.append({
                                "line": line_num,
                                "event_id": event.event_id,
                                "hash_mismatch": True,
                                "expected_hash": computed_hash,
                                "actual_hash": event.hash
                            })
                        
                        prev_hash = event.hash
                        events.append(event)
                    except json.JSONDecodeError:
                        broken_links.append({"line": line_num, "error": "Invalid JSON"})
                    except Exception as e:
                        broken_links.append({"line": line_num, "error": str(e)})
        
        except Exception as e:
            return {"valid": False, "error": str(e), "total_events": 0, "broken_links": []}
        
        return {
            "valid": len(broken_links) == 0,
            "total_events": len(events),
            "broken_links": broken_links
        }


# Global logger instance
_global_logger: Optional[AuditLogger] = None


def create_audit_logger(log_file: str = "storage/audit/audit.log") -> AuditLogger:
    """Create or get global audit logger."""
    global _global_logger
    if _global_logger is None:
        _global_logger = AuditLogger(log_file)
    return _global_logger
