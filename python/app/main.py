"""
REFORGE OS Python Worker Service
Stateless worker for device inspection, log collection, and report formatting.

This service is NOT a controller. It is a worker.
- Receives requests from Rust (ForgeWorks Core)
- Performs analysis / parsing / probing
- Returns results
- Never decides what is allowed

All authority stays in Rust.
"""

import uvicorn
from fastapi import FastAPI, HTTPException, Body, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
import time
import os
import sys

# Import handlers
from health import health_handler
from inspect import inspect_basic_handler, inspect_deep_handler
from logs import collect_logs_handler
from report import format_report_handler
from policy import PolicyMirror

app = FastAPI(
    title="REFORGE OS Python Worker",
    description="Stateless worker service for device inspection and analysis",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize policy mirror
policy = PolicyMirror()

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class PyInspectRequest(BaseModel):
    device_id: str
    platform: str
    payload: Dict[str, Any] = {}

class PyResponse(BaseModel):
    ok: bool
    data: Optional[Dict[str, Any]] = None
    warnings: List[str] = []

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/health")
async def health():
    """Health check endpoint - required for UI unlock"""
    return health_handler()

@app.post("/inspect/basic")
async def inspect_basic(request: PyInspectRequest):
    """
    Basic device inspection
    
    This endpoint performs read-only device state analysis.
    It does NOT execute modifications or bypasses.
    """
    # Policy check
    if not policy.allow_inspect():
        raise HTTPException(status_code=403, detail="Inspect operation not allowed by policy")
    
    try:
        result = inspect_basic_handler(request.device_id, request.platform, request.payload)
        return PyResponse(ok=True, data=result, warnings=[])
    except Exception as e:
        return PyResponse(ok=False, data=None, warnings=[str(e)])

@app.post("/inspect/deep")
async def inspect_deep(request: PyInspectRequest):
    """
    Deep device inspection
    
    This endpoint performs comprehensive device state analysis.
    It does NOT execute modifications or bypasses.
    """
    # Policy check
    if not policy.allow_inspect():
        raise HTTPException(status_code=403, detail="Deep inspect operation not allowed by policy")
    
    try:
        result = inspect_deep_handler(request.device_id, request.platform)
        return PyResponse(ok=True, data=result, warnings=[])
    except Exception as e:
        return PyResponse(ok=False, data=None, warnings=[str(e)])

@app.post("/logs/collect")
async def collect_logs(
    device_id: str = Body(...),
    scope: str = Body("default")
):
    """
    Collect device logs
    
    This endpoint collects read-only log data.
    It does NOT modify device state.
    """
    # Policy check
    if not policy.allow_logs():
        raise HTTPException(status_code=403, detail="Log collection not allowed by policy")
    
    try:
        result = collect_logs_handler(device_id, scope)
        return PyResponse(ok=True, data=result, warnings=[])
    except Exception as e:
        return PyResponse(ok=False, data=None, warnings=[str(e)])

@app.post("/report/format")
async def format_report(
    report_id: str = Body(...),
    format: str = Body("pdf")
):
    """
    Format report
    
    This endpoint formats analysis results into reports.
    It does NOT execute device operations.
    """
    try:
        result = format_report_handler(report_id, format)
        return PyResponse(ok=True, data=result, warnings=[])
    except Exception as e:
        return PyResponse(ok=False, data=None, warnings=[str(e)])

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    # Get port from args or env
    port = 8001
    if len(sys.argv) > 1:
        for arg in sys.argv[1:]:
            if arg.startswith("--port"):
                if "=" in arg:
                    port = int(arg.split("=")[1])
                elif len(sys.argv) > sys.argv.index(arg) + 1:
                    port = int(sys.argv[sys.argv.index(arg) + 1])
    
    port = int(os.getenv("PORT", port))
    policy_mode = os.getenv("POLICY_MODE", "public")
    
    # Initialize policy
    policy.set_mode(policy_mode)
    
    print(f"[Python Worker] Starting on port {port} (policy_mode={policy_mode})", flush=True)
    print(f"[Python Worker] Health endpoint: http://127.0.0.1:{port}/health", flush=True)
    
    try:
        uvicorn.run(app, host="127.0.0.1", port=port, log_level="info", access_log=False)
    except Exception as e:
        print(f"[Python Worker] Error: {e}", flush=True, file=sys.stderr)
        sys.exit(1)