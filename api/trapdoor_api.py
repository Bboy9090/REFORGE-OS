"""Trapdoor API - Admin/Secret Room Endpoints
COMPLIANCE-FIRST: Workflow orchestration and shadow logging only.
All operations are logged and require authorization.
"""
import os
import json
import uuid
import hashlib
import base64
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Header, Body, Query
from pydantic import BaseModel

# AES-256-GCM encryption for shadow logs
try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    from cryptography.hazmat.backends import default_backend
    CRYPTO_AVAILABLE = True
except ImportError:
    CRYPTO_AVAILABLE = False
    print("WARNING: cryptography not available. Shadow logs will not be encrypted.")


# ============================================================================
# MODELS
# ============================================================================

class WorkflowExecutionRequest(BaseModel):
    deviceSerial: str
    category: Optional[str] = None
    workflowId: Optional[str] = None
    authorization: Optional[Dict[str, Any]] = None


class WorkflowExecutionResponse(BaseModel):
    success: bool
    workflow: str
    results: List[Dict[str, Any]]
    auditReference: Optional[str] = None


class BatchExecutionRequest(BaseModel):
    deviceSerial: str
    throttle: Optional[int] = None
    commands: List[Dict[str, Any]]


class ShadowLogEntry(BaseModel):
    timestamp: str
    operation: str
    deviceSerial: Optional[str] = None
    userId: Optional[str] = None
    authorization: Optional[str] = None
    success: bool
    metadata: Optional[Dict[str, Any]] = None
    tampered: bool
    recordVersion: str


# ============================================================================
# CONFIGURATION
# ============================================================================

# Admin API Key (in production, use environment variable)
TRAPDOOR_API_KEY = os.getenv("TRAPDOOR_API_KEY", "default-trapdoor-key-change-in-production")

# Shadow logs directory
SHADOW_LOGS_DIR = os.path.join(os.path.dirname(__file__), "..", "storage", "shadow-logs")
os.makedirs(SHADOW_LOGS_DIR, exist_ok=True)

# Rate limiting (requests per minute per IP)
RATE_LIMIT = 10

# AES-256-GCM encryption key for shadow logs (32 bytes)
SHADOW_LOG_KEY = os.getenv("SHADOW_LOG_KEY", os.urandom(32).hex())
if len(SHADOW_LOG_KEY) < 64:
    SHADOW_LOG_KEY = hashlib.sha256(SHADOW_LOG_KEY.encode()).hexdigest()


# ============================================================================
# WORKFLOW DEFINITIONS
# ============================================================================

WORKFLOWS = [
    {
        "id": "frp_bypass",
        "name": "FRP Bypass Workflow",
        "category": "android",
        "platform": "android",
        "risk_level": "high",
        "requires_authorization": True,
        "description": "Factory Reset Protection bypass workflow (requires ownership verification)"
    },
    {
        "id": "bootloader_unlock",
        "name": "Bootloader Unlock",
        "category": "android",
        "platform": "android",
        "risk_level": "high",
        "requires_authorization": True,
        "description": "Bootloader unlock workflow (requires ownership verification)"
    },
    {
        "id": "dfu_exit",
        "name": "DFU Mode Exit",
        "category": "ios",
        "platform": "ios",
        "risk_level": "medium",
        "requires_authorization": False,
        "description": "Exit device from DFU (Device Firmware Update) mode"
    },
    {
        "id": "recovery_access",
        "name": "Recovery Mode Access",
        "category": "recovery",
        "platform": "multi",
        "risk_level": "medium",
        "requires_authorization": False,
        "description": "Access device recovery mode for troubleshooting"
    }
]


# ============================================================================
# SHADOW LOGGING (AES-256-GCM Encrypted)
# ============================================================================

def _get_aesgcm() -> Optional[AESGCM]:
    """Get AESGCM instance if cryptography is available."""
    if not CRYPTO_AVAILABLE:
        return None
    key_bytes = bytes.fromhex(SHADOW_LOG_KEY[:64])  # Use first 32 bytes
    return AESGCM(key_bytes)


def _encrypt_shadow_log(data: bytes) -> bytes:
    """Encrypt shadow log entry using AES-256-GCM."""
    aesgcm = _get_aesgcm()
    if not aesgcm:
        # If crypto not available, return base64 encoded (not secure, but works)
        return base64.b64encode(data)
    
    nonce = os.urandom(12)  # 12 bytes for GCM
    encrypted = aesgcm.encrypt(nonce, data, None)
    return nonce + encrypted


def _decrypt_shadow_log(encrypted_data: bytes) -> bytes:
    """Decrypt shadow log entry."""
    aesgcm = _get_aesgcm()
    if not aesgcm:
        # If crypto not available, try base64 decode
        try:
            return base64.b64decode(encrypted_data)
        except:
            return encrypted_data
    
    nonce = encrypted_data[:12]
    ciphertext = encrypted_data[12:]
    return aesgcm.decrypt(nonce, ciphertext, None)


def _write_shadow_log(entry: Dict[str, Any]) -> None:
    """Write shadow log entry (encrypted)."""
    today = datetime.now(timezone.utc).date().isoformat()
    log_file = os.path.join(SHADOW_LOGS_DIR, f"shadow-{today}.log")
    
    # Create entry with tamper detection
    entry["recordVersion"] = "1.0"
    entry["timestamp"] = datetime.now(timezone.utc).isoformat()
    
    # Calculate hash for tamper detection
    entry_str = json.dumps(entry, sort_keys=True)
    entry_hash = hashlib.sha256(entry_str.encode()).hexdigest()
    entry["_hash"] = entry_hash
    entry["tampered"] = False
    
    # Encrypt entry
    entry_json = json.dumps(entry).encode('utf-8')
    encrypted = _encrypt_shadow_log(entry_json)
    encrypted_b64 = base64.b64encode(encrypted).decode('utf-8')
    
    # Append to log file
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(encrypted_b64 + "\n")


def _read_shadow_logs(date: Optional[str] = None) -> List[Dict[str, Any]]:
    """Read shadow logs for a specific date."""
    if date:
        target_date = date
    else:
        target_date = datetime.now(timezone.utc).date().isoformat()
    
    log_file = os.path.join(SHADOW_LOGS_DIR, f"shadow-{target_date}.log")
    
    if not os.path.exists(log_file):
        return []
    
    entries = []
    with open(log_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            
            try:
                # Decrypt entry
                encrypted = base64.b64decode(line)
                decrypted = _decrypt_shadow_log(encrypted)
                entry = json.loads(decrypted.decode('utf-8'))
                
                # Verify hash (tamper detection)
                stored_hash = entry.pop("_hash", None)
                entry_str = json.dumps(entry, sort_keys=True)
                calculated_hash = hashlib.sha256(entry_str.encode()).hexdigest()
                
                entry["tampered"] = (stored_hash != calculated_hash)
                entries.append(entry)
            except Exception as e:
                # Log decryption error but continue
                print(f"Error decrypting shadow log entry: {e}")
                continue
    
    return entries


def _get_shadow_log_stats() -> Dict[str, Any]:
    """Get statistics about shadow logs."""
    log_files = [f for f in os.listdir(SHADOW_LOGS_DIR) if f.startswith("shadow-") and f.endswith(".log")]
    
    total_entries = 0
    tampered_entries = 0
    
    for log_file in log_files:
        log_path = os.path.join(SHADOW_LOGS_DIR, log_file)
        entries = _read_shadow_logs(log_file.replace("shadow-", "").replace(".log", ""))
        total_entries += len(entries)
        tampered_entries += sum(1 for e in entries if e.get("tampered", False))
    
    return {
        "shadowLogs": len(log_files),
        "publicLogs": 0,  # Public logs are in audit system
        "retentionDays": 90,  # Configurable
        "anonymousMode": False,
        "logDirectory": SHADOW_LOGS_DIR,
        "totalEntries": total_entries,
        "tamperedEntries": tampered_entries
    }


# ============================================================================
# AUTHENTICATION & AUTHORIZATION
# ============================================================================

def verify_trapdoor_auth(api_key: Optional[str] = None) -> bool:
    """Verify Trapdoor API key."""
    if not api_key:
        return False
    return api_key == TRAPDOOR_API_KEY


def require_trapdoor_auth(x_api_key: Optional[str] = None) -> str:
    """Dependency to require Trapdoor API authentication."""
    if not verify_trapdoor_auth(x_api_key):
        raise HTTPException(status_code=401, detail="Invalid or missing Trapdoor API key")
    return x_api_key or ""


# ============================================================================
# WORKFLOW EXECUTION (ANALYSIS-ONLY - NO ACTUAL BYPASS/UNLOCK)
# ============================================================================

def execute_workflow_step(step_id: str, step_name: str, device_serial: str) -> Dict[str, Any]:
    """
    Execute a single workflow step.
    
    COMPLIANCE NOTE: This is a mock execution that simulates workflow steps.
    In production, this would orchestrate tool execution, but for compliance
    this platform only performs analysis and routing, not actual bypass/unlock.
    """
    # Mock execution - returns analysis result only
    # In real implementation, this would call actual tools via subprocess/API
    
    return {
        "stepId": step_id,
        "stepName": step_name,
        "stepIndex": 0,
        "success": True,
        "output": f"Analysis complete for {step_name} on device {device_serial}",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


def execute_frp_workflow(device_serial: str, authorization: Dict[str, Any]) -> WorkflowExecutionResponse:
    """Execute FRP bypass workflow (analysis only)."""
    if not authorization.get("confirmed"):
        raise HTTPException(status_code=403, detail="Authorization not confirmed")
    
    # Log to shadow logs
    _write_shadow_log({
        "operation": "frp_bypass_workflow",
        "deviceSerial": device_serial,
        "authorization": authorization.get("userInput", "confirmed"),
        "success": True,
        "metadata": {"workflow": "frp_bypass"}
    })
    
    results = [
        execute_workflow_step("step1", "Device Detection", device_serial),
        execute_workflow_step("step2", "Security State Analysis", device_serial),
        execute_workflow_step("step3", "FRP Status Assessment", device_serial),
    ]
    
    return WorkflowExecutionResponse(
        success=True,
        workflow="frp_bypass",
        results=results,
        auditReference=str(uuid.uuid4())
    )


def execute_unlock_workflow(device_serial: str, authorization: Dict[str, Any]) -> WorkflowExecutionResponse:
    """Execute bootloader unlock workflow (analysis only)."""
    if not authorization.get("confirmed"):
        raise HTTPException(status_code=403, detail="Authorization not confirmed")
    
    # Log to shadow logs
    _write_shadow_log({
        "operation": "bootloader_unlock_workflow",
        "deviceSerial": device_serial,
        "authorization": authorization.get("userInput", "confirmed"),
        "success": True,
        "metadata": {"workflow": "bootloader_unlock"}
    })
    
    results = [
        execute_workflow_step("step1", "Device Detection", device_serial),
        execute_workflow_step("step2", "Bootloader State Analysis", device_serial),
        execute_workflow_step("step3", "Unlock Capability Assessment", device_serial),
    ]
    
    return WorkflowExecutionResponse(
        success=True,
        workflow="bootloader_unlock",
        results=results,
        auditReference=str(uuid.uuid4())
    )


def execute_custom_workflow(execution: WorkflowExecutionRequest) -> WorkflowExecutionResponse:
    """Execute custom workflow based on workflow ID."""
    workflow_id = execution.workflowId
    if not workflow_id:
        raise HTTPException(status_code=400, detail="workflowId required")
    
    # Find workflow
    workflow = next((w for w in WORKFLOWS if w["id"] == workflow_id), None)
    if not workflow:
        raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")
    
    if workflow["requires_authorization"]:
        if not execution.authorization or not execution.authorization.get("confirmed"):
            raise HTTPException(status_code=403, detail="Authorization required for this workflow")
    
    # Log to shadow logs
    _write_shadow_log({
        "operation": f"custom_workflow_{workflow_id}",
        "deviceSerial": execution.deviceSerial,
        "authorization": execution.authorization.get("userInput", "confirmed") if execution.authorization else None,
        "success": True,
        "metadata": {"workflow": workflow_id, "category": execution.category}
    })
    
    results = [
        execute_workflow_step("step1", f"{workflow['name']} - Analysis", execution.deviceSerial),
    ]
    
    return WorkflowExecutionResponse(
        success=True,
        workflow=workflow_id,
        results=results,
        auditReference=str(uuid.uuid4())
    )


def execute_batch_workflow(batch: BatchExecutionRequest) -> Dict[str, Any]:
    """Execute batch of workflow commands."""
    results = []
    
    for idx, command in enumerate(batch.commands):
        try:
            execution = WorkflowExecutionRequest(
                deviceSerial=batch.deviceSerial,
                category=command.get("category"),
                workflowId=command.get("workflowId"),
                authorization=command.get("authorization")
            )
            
            workflow_result = execute_custom_workflow(execution)
            
            results.append({
                "index": idx,
                "command": command,
                "result": workflow_result.dict(),
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            
            # Throttle between commands if specified
            if batch.throttle and idx < len(batch.commands) - 1:
                import time
                time.sleep(batch.throttle / 1000.0)  # Convert ms to seconds
                
        except Exception as e:
            results.append({
                "index": idx,
                "command": command,
                "result": {
                    "success": False,
                    "error": str(e)
                },
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
    
    return {
        "success": True,
        "totalCommands": len(batch.commands),
        "results": results
    }


# ============================================================================
# API ENDPOINTS
# ============================================================================

def create_trapdoor_router(app: FastAPI):
    """Create and register Trapdoor API routes."""
    
    # FRP Bypass Workflow
    @app.post("/api/trapdoor/frp", response_model=WorkflowExecutionResponse)
    async def execute_frp_endpoint(
        deviceSerial: str = Body(...),
        authorization: Dict[str, Any] = Body(...),
        x_api_key: Optional[str] = Header(None, alias="X-API-Key")
    ):
        """Execute FRP bypass workflow."""
        require_trapdoor_auth(x_api_key)
        return execute_frp_workflow(deviceSerial, authorization)
    
    # Bootloader Unlock
    @app.post("/api/trapdoor/unlock", response_model=WorkflowExecutionResponse)
    async def execute_unlock_endpoint(
        deviceSerial: str = Body(...),
        authorization: Dict[str, Any] = Body(...),
        x_api_key: Optional[str] = Header(None, alias="X-API-Key")
    ):
        """Execute bootloader unlock workflow."""
        require_trapdoor_auth(x_api_key)
        return execute_unlock_workflow(deviceSerial, authorization)
    
    # Execute Custom Workflow
    @app.post("/api/trapdoor/workflow/execute", response_model=WorkflowExecutionResponse)
    async def execute_workflow_endpoint(
        execution: WorkflowExecutionRequest = Body(...),
        x_api_key: Optional[str] = Header(None, alias="X-API-Key")
    ):
        """Execute custom workflow."""
        require_trapdoor_auth(x_api_key)
        return execute_custom_workflow(execution)
    
    # List Available Workflows
    @app.get("/api/trapdoor/workflows")
    async def list_workflows_endpoint(
        x_api_key: Optional[str] = Header(None, alias="X-API-Key")
    ):
        """List all available workflows."""
        require_trapdoor_auth(x_api_key)
        return {
            "success": True,
            "workflows": WORKFLOWS
        }
    
    # Execute Batch Commands
    @app.post("/api/trapdoor/batch/execute")
    async def execute_batch_endpoint(
        batch: BatchExecutionRequest = Body(...),
        x_api_key: Optional[str] = Header(None, alias="X-API-Key")
    ):
        """Execute batch of workflow commands."""
        require_trapdoor_auth(x_api_key)
        return execute_batch_workflow(batch)
    
    # Get Shadow Logs
    @app.get("/api/trapdoor/logs/shadow")
    async def get_shadow_logs_endpoint(
        date: Optional[str] = Query(None),
        x_api_key: Optional[str] = Header(None, alias="X-API-Key")
    ):
        """Get shadow logs for a specific date."""
        require_trapdoor_auth(x_api_key)
        entries = _read_shadow_logs(date)
        return {
            "success": True,
            "date": date or datetime.now(timezone.utc).date().isoformat(),
            "entries": entries,
            "count": len(entries),
            "totalEntries": len(entries),
            "tamperedEntries": sum(1 for e in entries if e.get("tampered", False))
        }
    
    # Get Shadow Log Statistics
    @app.get("/api/trapdoor/logs/stats")
    async def get_shadow_log_stats_endpoint(
        x_api_key: Optional[str] = Header(None, alias="X-API-Key")
    ):
        """Get shadow log statistics."""
        require_trapdoor_auth(x_api_key)
        stats = _get_shadow_log_stats()
        return {
            "success": True,
            "stats": stats
        }
    
    # Rotate Shadow Logs
    @app.post("/api/trapdoor/logs/rotate")
    async def rotate_shadow_logs_endpoint(
        x_api_key: Optional[str] = Header(None, alias="X-API-Key")
    ):
        """Rotate shadow logs (archive old logs)."""
        require_trapdoor_auth(x_api_key)
        # In production, this would archive logs older than retention period
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=90)
        
        rotated_count = 0
        for log_file in os.listdir(SHADOW_LOGS_DIR):
            if log_file.startswith("shadow-") and log_file.endswith(".log"):
                log_path = os.path.join(SHADOW_LOGS_DIR, log_file)
                file_date_str = log_file.replace("shadow-", "").replace(".log", "")
                try:
                    file_date = datetime.fromisoformat(file_date_str).date()
                    if file_date < cutoff_date.date():
                        # Archive or delete old logs
                        archive_dir = os.path.join(SHADOW_LOGS_DIR, "archive")
                        os.makedirs(archive_dir, exist_ok=True)
                        import shutil
                        shutil.move(log_path, os.path.join(archive_dir, log_file))
                        rotated_count += 1
                except:
                    pass
        
        return {
            "success": True,
            "message": f"Rotated {rotated_count} log file(s)"
        }