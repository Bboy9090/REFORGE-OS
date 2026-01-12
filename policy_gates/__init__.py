"""Policy gates for authorized operations."""
from .gates import (
    PolicyGate,
    GateResult,
    check_ownership_attestation,
    check_device_authorization,
    check_no_circumvention,
    check_destructive_confirmation,
    evaluate_gates,
)

__all__ = [
    "PolicyGate",
    "GateResult",
    "check_ownership_attestation",
    "check_device_authorization",
    "check_no_circumvention",
    "check_destructive_confirmation",
    "evaluate_gates",
]
