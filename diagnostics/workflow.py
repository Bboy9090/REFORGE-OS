"""Authorized diagnostics workflow with policy gate enforcement."""
import json
from typing import Dict, Any, List, Optional
from policy_gates.gates import (
    PolicyGate,
    evaluate_gates,
    is_operation_allowed,
    GateResult,
)
from .adb_diagnostics import (
    run_authorized_adb_diagnostics,
    check_adb_authorization,
    DiagnosticsResult,
)
from .report_generator import generate_diagnostics_report


def run_gated_diagnostics(
    device_serial: str,
    platform: str,
    connection_state: str,
    trust_state: Dict[str, Any],
    operations: List[str] = None,
    ownership_attested: bool = False,
    confirmation_phrase: Optional[str] = None,
    output_dir: str = "storage/diagnostics",
    case_id: Optional[str] = None,
    device_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Run authorized diagnostics with policy gate enforcement.
    
    This function enforces all policy gates before running diagnostics:
    1. Ownership attestation
    2. Device authorization
    3. No circumvention
    4. (No destructive confirmation needed for read-only diagnostics)
    
    Returns:
        Dict with 'allowed', 'gate_results', 'diagnostics', 'report_path', etc.
    """
    # Define required gates for diagnostics
    gates = [
        PolicyGate(gate_id="GATE_OWNERSHIP_ATTESTATION", name="Ownership Attestation", required=True),
        PolicyGate(gate_id="GATE_DEVICE_AUTHORIZATION", name="Device Authorization", required=True),
        PolicyGate(gate_id="GATE_NO_CIRCUMVENTION", name="No Circumvention", required=True),
    ]
    
    # Build context for gate evaluation
    context = {
        "ownership_attested": ownership_attested,
        "confirmation_phrase": confirmation_phrase,
        "platform": platform,
        "connection_state": connection_state,
        "trust_state": trust_state,
        "action": "authorized_diagnostics",
        "description": "Authorized device diagnostics (read-only)",
        "is_destructive": False,
    }
    
    # Evaluate gates
    gate_results = evaluate_gates(gates, context)
    
    # Check if operation is allowed
    allowed, blocking_reasons = is_operation_allowed(gate_results)
    
    result = {
        "allowed": allowed,
        "gate_results": [gr.__dict__ for gr in gate_results],
        "blocking_reasons": blocking_reasons,
        "device_serial": device_serial,
        "platform": platform,
    }
    
    if not allowed:
        result["error"] = "Diagnostics blocked by policy gates"
        result["diagnostics"] = None
        return result
    
    # Run diagnostics (gates passed)
    try:
        diagnostics_data = run_authorized_adb_diagnostics(
            device_serial=device_serial,
            operations=operations,
            output_dir=output_dir
        )
        
        result["diagnostics"] = diagnostics_data
        
        # Generate report if diagnostics succeeded
        if diagnostics_data.get("authorized"):
            report_path = generate_diagnostics_report(
                diagnostics_data=diagnostics_data,
                case_id=case_id,
                device_id=device_id,
                output_dir=output_dir.replace("diagnostics", "reports")
            )
            result["report_path"] = report_path
        
    except Exception as e:
        result["error"] = str(e)
        result["diagnostics"] = None
    
    return result
