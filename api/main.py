"""Repair Shop Management API - FastAPI service."""
from fastapi import FastAPI, HTTPException, Query, Body, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from typing import List, Optional, Dict, Any
import uvicorn
import os

# Import modules
from cases import manager as case_manager
from device_detection import detector as device_detector
from diagnostics.workflow import run_gated_diagnostics
from diagnostics.adb_diagnostics import check_adb_authorization
from policy_gates.gates import (
    evaluate_gates,
    PolicyGate,
    is_operation_allowed,
)
from recovery.firmware_lookup import lookup_oem_firmware, get_firmware_sources
from recovery.evidence_bundles import (
    generate_apple_support_bundle,
    generate_carrier_support_bundle,
    generate_generic_evidence_bundle,
)
from recovery.recovery_guidance import generate_recovery_guidance
from audit.logger import create_audit_logger, AuditLevel
from audit.viewer import query_audit_events
from solutions import database as solutions_db
from trapdoor_api import create_trapdoor_router


app = FastAPI(
    title="REFORGE OS API",
    description="Professional repair shop management platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize audit logger
audit_logger = create_audit_logger()


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "reforge-os-api"}


# Cases endpoints
@app.post("/api/v1/cases")
async def create_case_endpoint(
    customer_name: str = Body(...),
    customer_email: str = Body(""),
    customer_phone: str = Body(""),
    notes: str = Body(""),
    actor: str = Body("system")
):
    """Create a new repair case."""
    try:
        case_id = case_manager.create_case(
            customer_name=customer_name,
            customer_email=customer_email,
            customer_phone=customer_phone,
            notes=notes,
            created_by=actor
        )
        
        audit_logger.log(
            level=AuditLevel.INFO,
            actor=actor,
            action="create_case",
            resource_type="case",
            resource_id=case_id,
            case_id=case_id,
            message=f"Case created: {customer_name}"
        )
        
        case = case_manager.get_case(case_id)
        return {"ok": True, "case": case}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/cases")
async def list_cases_endpoint(
    status: Optional[str] = Query(None),
    actor: str = Query("system")
):
    """List cases, optionally filtered by status."""
    try:
        cases_list = case_manager.list_cases(status=status)
        
        audit_logger.log(
            level=AuditLevel.INFO,
            actor=actor,
            action="list_cases",
            resource_type="case",
            message=f"Listed cases (status={status})"
        )
        
        return {"ok": True, "cases": cases_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/cases/{case_id}")
async def get_case_endpoint(case_id: str, actor: str = Query("system")):
    """Get a case by ID."""
    try:
        case = case_manager.get_case(case_id)
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        audit_logger.log(
            level=AuditLevel.INFO,
            actor=actor,
            action="get_case",
            resource_type="case",
            resource_id=case_id,
            case_id=case_id
        )
        
        return {"ok": True, "case": case}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/api/v1/cases/{case_id}/status")
async def update_case_status_endpoint(
    case_id: str,
    status: str = Body(...),
    actor: str = Body("system")
):
    """Update case status."""
    try:
        success = case_manager.update_case_status(case_id, status)
        if not success:
            raise HTTPException(status_code=404, detail="Case not found")
        
        audit_logger.log(
            level=AuditLevel.INFO,
            actor=actor,
            action="update_case_status",
            resource_type="case",
            resource_id=case_id,
            case_id=case_id,
            message=f"Status updated to: {status}"
        )
        
        case = case_manager.get_case(case_id)
        return {"ok": True, "case": case}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Devices endpoints
@app.post("/api/v1/cases/{case_id}/devices")
async def add_device_endpoint(
    case_id: str,
    platform: str = Body(...),
    model: Optional[str] = Body(None),
    serial: Optional[str] = Body(None),
    imei: Optional[str] = Body(None),
    os_version: Optional[str] = Body(None),
    connection_state: str = Body("none"),
    trust_state: Dict[str, Any] = Body({}),
    passport: Dict[str, Any] = Body({}),
    actor: str = Body("system")
):
    """Add a device to a case."""
    try:
        device_id = case_manager.add_device_to_case(
            case_id=case_id,
            platform=platform,
            model=model,
            serial=serial,
            imei=imei,
            os_version=os_version,
            connection_state=connection_state,
            trust_state=trust_state,
            passport=passport
        )
        
        audit_logger.log(
            level=AuditLevel.INFO,
            actor=actor,
            action="add_device",
            resource_type="device",
            resource_id=device_id,
            case_id=case_id,
            device_id=device_id,
            message=f"Device added: {model or 'Unknown'}"
        )
        
        device = case_manager.get_device(device_id)
        return {"ok": True, "device": device}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/cases/{case_id}/devices")
async def get_case_devices_endpoint(case_id: str, actor: str = Query("system")):
    """Get all devices for a case."""
    try:
        devices = case_manager.get_case_devices(case_id)
        
        audit_logger.log(
            level=AuditLevel.INFO,
            actor=actor,
            action="list_case_devices",
            resource_type="device",
            case_id=case_id,
            message=f"Listed devices for case {case_id}"
        )
        
        return {"ok": True, "devices": devices}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Device detection endpoints
@app.get("/api/v1/devices/detect")
async def detect_devices_endpoint(actor: str = Query("system")):
    """Detect all available devices."""
    try:
        devices = device_detector.detect_all_devices()
        devices_list = [d.to_dict() if hasattr(d, 'to_dict') else d for d in devices]
        
        audit_logger.log(
            level=AuditLevel.INFO,
            actor=actor,
            action="detect_devices",
            resource_type="device",
            message=f"Detected {len(devices_list)} devices"
        )
        
        return {"ok": True, "devices": devices_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Diagnostics endpoints
@app.post("/api/v1/diagnostics/run")
async def run_diagnostics_endpoint(
    device_serial: str = Body(...),
    platform: str = Body(...),
    connection_state: str = Body(...),
    trust_state: Dict[str, Any] = Body(...),
    operations: List[str] = Body(["properties", "logcat"]),
    ownership_attested: bool = Body(False),
    confirmation_phrase: Optional[str] = Body(None),
    case_id: Optional[str] = Body(None),
    device_id: Optional[str] = Body(None),
    actor: str = Body("system")
):
    """Run gated diagnostics on a device."""
    try:
        result = run_gated_diagnostics(
            device_serial=device_serial,
            platform=platform,
            connection_state=connection_state,
            trust_state=trust_state,
            operations=operations,
            ownership_attested=ownership_attested,
            confirmation_phrase=confirmation_phrase,
            case_id=case_id,
            device_id=device_id
        )
        
        audit_logger.log(
            level=AuditLevel.INFO if result["allowed"] else AuditLevel.WARN,
            actor=actor,
            action="run_diagnostics",
            resource_type="diagnostics",
            case_id=case_id,
            device_id=device_id,
            message=f"Diagnostics run: {'allowed' if result['allowed'] else 'blocked'}",
            metadata={"device_serial": device_serial, "allowed": result["allowed"]}
        )
        
        return {"ok": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Recovery endpoints
@app.get("/api/v1/recovery/firmware")
async def lookup_firmware_endpoint(
    oem: str = Query(...),
    model: Optional[str] = Query(None),
    version: Optional[str] = Query(None),
    actor: str = Query("system")
):
    """Lookup official firmware source for OEM."""
    try:
        source = lookup_oem_firmware(oem, model, version)
        if not source:
            raise HTTPException(status_code=404, detail="Firmware source not found")
        
        return {"ok": True, "firmware_source": source.__dict__}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/recovery/guidance")
async def recovery_guidance_endpoint(
    platform: str = Body(...),
    oem: Optional[str] = Body(None),
    model: Optional[str] = Body(None),
    guidance_type: str = Body("restore"),
    actor: str = Body("system")
):
    """Generate recovery guidance."""
    try:
        guidance = generate_recovery_guidance(platform, oem, model, guidance_type)
        
        return {"ok": True, "guidance": guidance.to_dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Evidence bundle endpoints
@app.post("/api/v1/bundles/generate")
async def generate_bundle_endpoint(
    case_id: str = Body(...),
    bundle_type: str = Body(...),
    carrier: Optional[str] = Body(None),
    actor: str = Body("system")
):
    """Generate evidence bundle for a case."""
    try:
        case = case_manager.get_case(case_id)
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        devices = case_manager.get_case_devices(case_id)
        
        device_info = {
            "case_id": case_id,
            "customer_name": case.get("customer_name"),
            "customer_email": case.get("customer_email"),
            "customer_phone": case.get("customer_phone"),
            "status": case.get("status"),
            "notes": case.get("notes"),
            "devices": devices,
        }
        
        if bundle_type == "apple_support":
            bundle = generate_apple_support_bundle(
                case_id=case_id,
                device_info=device_info
            )
        elif bundle_type == "carrier":
            if not carrier:
                raise HTTPException(status_code=400, detail="Carrier required for carrier bundle")
            bundle = generate_carrier_support_bundle(
                case_id=case_id,
                device_info=device_info,
                carrier=carrier
            )
        elif bundle_type == "generic":
            bundle = generate_generic_evidence_bundle(
                case_id=case_id,
                device_info=device_info
            )
        else:
            raise HTTPException(status_code=400, detail=f"Invalid bundle type: {bundle_type}")
        
        audit_logger.log(
            level=AuditLevel.INFO,
            actor=actor,
            action="generate_evidence_bundle",
            resource_type="bundle",
            case_id=case_id,
            message=f"Generated {bundle_type} bundle",
            metadata={"bundle_id": bundle.bundle_id, "bundle_type": bundle_type}
        )
        
        return {"ok": True, "bundle": bundle.to_dict()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Solutions endpoints (Custodial Closet)
@app.get("/api/v1/solutions")
async def list_solutions_endpoint(
    device_type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    limit: int = Query(100),
    actor: str = Query("system")
):
    """List solutions with optional filters."""
    try:
        solutions = solutions_db.search_solutions(
            device_type=device_type,
            category=category,
            search_query=search,
            difficulty=difficulty,
            limit=limit
        )
        
        audit_logger.log(
            level=AuditLevel.INFO,
            actor=actor,
            action="list_solutions",
            resource_type="solution",
            message=f"Listed {len(solutions)} solutions"
        )
        
        return {"ok": True, "solutions": solutions, "count": len(solutions)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/solutions/{solution_id}")
async def get_solution_endpoint(solution_id: str, actor: str = Query("system")):
    """Get a solution by ID."""
    try:
        solution = solutions_db.get_solution(solution_id)
        if not solution:
            raise HTTPException(status_code=404, detail="Solution not found")
        
        audit_logger.log(
            level=AuditLevel.INFO,
            actor=actor,
            action="get_solution",
            resource_type="solution",
            resource_id=solution_id,
            message=f"Retrieved solution: {solution.get('title')}"
        )
        
        return {"ok": True, "solution": solution}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/solutions/device-types/{device_type}")
async def get_solutions_by_device_type_endpoint(
    device_type: str,
    actor: str = Query("system")
):
    """Get all solutions for a specific device type."""
    try:
        solutions = solutions_db.get_solutions_by_device_type(device_type)
        
        audit_logger.log(
            level=AuditLevel.INFO,
            actor=actor,
            action="list_solutions_by_device_type",
            resource_type="solution",
            message=f"Listed solutions for {device_type}"
        )
        
        return {"ok": True, "solutions": solutions, "count": len(solutions)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Audit endpoints
@app.get("/api/v1/audit/events")
async def get_audit_events_endpoint(
    limit: int = Query(100),
    level: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    case_id: Optional[str] = Query(None),
    actor: str = Query("system")
):
    """Get audit events."""
    try:
        events = query_audit_events(
            case_id=case_id,
            level=level,
            action=action,
            limit=limit
        )
        
        return {"ok": True, "events": events, "count": len(events)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/audit/cases/{case_id}/events")
async def get_case_audit_events_endpoint(case_id: str, actor: str = Query("system")):
    """Get audit events for a case."""
    try:
        events = query_audit_events(case_id=case_id)
        
        return {"ok": True, "events": events, "count": len(events)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Register Trapdoor API routes
create_trapdoor_router(app)


if __name__ == "__main__":
    port = int(os.getenv("API_PORT", "8001"))
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
