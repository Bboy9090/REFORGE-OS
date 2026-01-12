"""Policy gates implementation - compliance enforcement."""
from dataclasses import dataclass
from typing import Dict, Any, List, Optional
from enum import Enum


class GateStatus(Enum):
    """Gate evaluation status."""
    PASSED = "passed"
    FAILED = "failed"
    BLOCKED = "blocked"


@dataclass
class GateResult:
    """Result of a policy gate evaluation."""
    gate_id: str
    status: GateStatus
    message: str
    required: bool = True
    
    def is_blocking(self) -> bool:
        """Check if this gate blocks the operation."""
        return self.required and self.status == GateStatus.FAILED


@dataclass
class PolicyGate:
    """Policy gate definition."""
    gate_id: str
    name: str
    required: bool = True
    config: Optional[Dict[str, Any]] = None


# Forbidden keywords that indicate circumvention attempts
FORBIDDEN_KEYWORDS = [
    "bypass",
    "unlock",
    "frp",
    "activation lock removal",
    "icloud unlock",
    "mdm bypass",
    "jailbreak for unlock",
    "remove google account",
    "unauthorized access",
    "bruteforce",
    "exploit",
]


def check_ownership_attestation(
    attested: bool,
    confirmation_phrase: Optional[str] = None
) -> GateResult:
    """
    Gate 1: Ownership Attestation
    
    Requires explicit confirmation that the user owns the device
    or has written permission to service it.
    """
    if not attested:
        return GateResult(
            gate_id="GATE_OWNERSHIP_ATTESTATION",
            status=GateStatus.FAILED,
            message="Ownership attestation is required. You must confirm that you own this device or have written permission to service it.",
            required=True
        )
    
    # Optional: Check for typed confirmation phrase
    if confirmation_phrase:
        required_phrase = "I CONFIRM AUTHORIZED SERVICE"
        if confirmation_phrase.upper() != required_phrase:
            return GateResult(
                gate_id="GATE_OWNERSHIP_ATTESTATION",
                status=GateStatus.FAILED,
                message=f"Confirmation phrase must be exactly: '{required_phrase}'",
                required=True
            )
    
    return GateResult(
        gate_id="GATE_OWNERSHIP_ATTESTATION",
        status=GateStatus.PASSED,
        message="Ownership attestation confirmed",
        required=True
    )


def check_device_authorization(
    platform: str,
    connection_state: str,
    trust_state: Dict[str, Any]
) -> GateResult:
    """
    Gate 2: Device Authorization
    
    Verifies that the device is authorized for operations.
    - Android: ADB must be authorized (RSA key accepted)
    - iOS: Device must be paired
    """
    if platform == "android":
        if connection_state != "adb":
            return GateResult(
                gate_id="GATE_DEVICE_AUTHORIZATION",
                status=GateStatus.FAILED,
                message="Android device must be connected via ADB with authorized status",
                required=True
            )
        
        adb_authorized = trust_state.get("adb_authorized", False)
        if not adb_authorized:
            return GateResult(
                gate_id="GATE_DEVICE_AUTHORIZATION",
                status=GateStatus.FAILED,
                message="ADB authorization required. Please accept the RSA key on the device.",
                required=True
            )
    
    elif platform == "ios":
        paired = trust_state.get("paired", False)
        if not paired:
            return GateResult(
                gate_id="GATE_DEVICE_AUTHORIZATION",
                status=GateStatus.FAILED,
                message="iOS device must be paired. Please trust this computer on the device.",
                required=True
            )
    
    else:
        # Unknown platform - allow but warn
        return GateResult(
            gate_id="GATE_DEVICE_AUTHORIZATION",
            status=GateStatus.PASSED,
            message="Platform unknown - proceeding with caution",
            required=False
        )
    
    return GateResult(
        gate_id="GATE_DEVICE_AUTHORIZATION",
        status=GateStatus.PASSED,
        message="Device authorization verified",
        required=True
    )


def check_no_circumvention(
    action: str,
    description: Optional[str] = None
) -> GateResult:
    """
    Gate 3: No Circumvention
    
    Blocks any actions that resemble circumvention attempts.
    Scans for forbidden keywords.
    """
    text_to_check = f"{action} {description or ''}".lower()
    
    for keyword in FORBIDDEN_KEYWORDS:
        if keyword in text_to_check:
            return GateResult(
                gate_id="GATE_NO_CIRCUMVENTION",
                status=GateStatus.BLOCKED,
                message=f"Blocked: This action resembles circumvention (detected keyword: '{keyword}'). Only authorized diagnostics and recovery guidance are allowed.",
                required=True
            )
    
    return GateResult(
        gate_id="GATE_NO_CIRCUMVENTION",
        status=GateStatus.PASSED,
        message="No circumvention detected",
        required=True
    )


def check_destructive_confirmation(
    is_destructive: bool,
    typed_confirmation: Optional[str] = None
) -> GateResult:
    """
    Gate 4: Destructive Action Confirmation
    
    Requires explicit typed confirmation for destructive actions.
    """
    if not is_destructive:
        return GateResult(
            gate_id="GATE_DESTRUCTIVE_CONFIRMATION",
            status=GateStatus.PASSED,
            message="Non-destructive operation",
            required=False
        )
    
    if not typed_confirmation:
        return GateResult(
            gate_id="GATE_DESTRUCTIVE_CONFIRMATION",
            status=GateStatus.FAILED,
            message="Destructive actions require typed confirmation. Type 'ERASE_DEVICE' to confirm.",
            required=True
        )
    
    if typed_confirmation != "ERASE_DEVICE":
        return GateResult(
            gate_id="GATE_DESTRUCTIVE_CONFIRMATION",
            status=GateStatus.FAILED,
            message="Confirmation phrase must be exactly: 'ERASE_DEVICE'",
            required=True
        )
    
    return GateResult(
        gate_id="GATE_DESTRUCTIVE_CONFIRMATION",
        status=GateStatus.PASSED,
        message="Destructive action confirmed",
        required=True
    )


def evaluate_gates(
    gates: List[PolicyGate],
    context: Dict[str, Any]
) -> List[GateResult]:
    """
    Evaluate a list of policy gates against a context.
    
    Context should contain:
    - ownership_attested: bool
    - confirmation_phrase: Optional[str]
    - platform: str
    - connection_state: str
    - trust_state: Dict[str, Any]
    - action: str
    - description: Optional[str]
    - is_destructive: bool
    - typed_confirmation: Optional[str]
    """
    results = []
    
    for gate in gates:
        if gate.gate_id == "GATE_OWNERSHIP_ATTESTATION":
            result = check_ownership_attestation(
                attested=context.get("ownership_attested", False),
                confirmation_phrase=context.get("confirmation_phrase")
            )
            results.append(result)
        
        elif gate.gate_id == "GATE_DEVICE_AUTHORIZATION":
            result = check_device_authorization(
                platform=context.get("platform", "unknown"),
                connection_state=context.get("connection_state", "none"),
                trust_state=context.get("trust_state", {})
            )
            results.append(result)
        
        elif gate.gate_id == "GATE_NO_CIRCUMVENTION":
            result = check_no_circumvention(
                action=context.get("action", ""),
                description=context.get("description")
            )
            results.append(result)
        
        elif gate.gate_id == "GATE_DESTRUCTIVE_CONFIRMATION":
            result = check_destructive_confirmation(
                is_destructive=context.get("is_destructive", False),
                typed_confirmation=context.get("typed_confirmation")
            )
            results.append(result)
    
    return results


def is_operation_allowed(results: List[GateResult]) -> tuple[bool, List[str]]:
    """
    Check if operation is allowed based on gate results.
    
    Returns:
        (allowed: bool, blocking_reasons: List[str])
    """
    blocking_reasons = []
    
    for result in results:
        if result.is_blocking():
            blocking_reasons.append(result.message)
    
    return (len(blocking_reasons) == 0, blocking_reasons)
