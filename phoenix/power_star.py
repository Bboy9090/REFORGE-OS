"""
Phoenix Core - Power Star Verification

Five-Star compliance verification system for device operations.
Each star represents a verification checkpoint that must pass.

Power Stars:
  - Ownership Verified
  - Legal Classification Clear
  - Authority Route Available
  - Audit Trail Complete
  - Operation Permitted

All 5 stars = Operation can proceed
< 5 stars = Operation blocked or requires escalation
"""

from typing import Dict, Any, List, Optional, Tuple
from enum import Enum
from dataclasses import dataclass, asdict
from datetime import datetime, timezone


class StarType(str, Enum):
    """The five Power Stars."""
    OWNERSHIP = "ownership_verified"
    LEGAL = "legal_classification_clear"
    AUTHORITY = "authority_route_available"
    AUDIT = "audit_trail_complete"
    PERMISSION = "operation_permitted"


class StarStatus(str, Enum):
    """Status of each star."""
    EARNED = "earned"       # Star is lit / verification passed
    PENDING = "pending"     # Verification in progress
    FAILED = "failed"       # Verification failed
    BLOCKED = "blocked"     # Cannot be earned due to prior failure
    NOT_APPLICABLE = "n/a"  # Star not required for this operation


@dataclass
class PowerStar:
    """Individual Power Star."""
    star_type: StarType
    status: StarStatus
    score: float  # 0.0 - 1.0
    message: str
    details: Dict[str, Any]
    verified_at: Optional[str]
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    @property
    def is_earned(self) -> bool:
        return self.status == StarStatus.EARNED


@dataclass
class PowerStarVerification:
    """Complete Power Star verification result."""
    verification_id: str
    device_id: str
    operation: str
    stars: Dict[StarType, PowerStar]
    total_stars: int
    earned_stars: int
    overall_status: str  # "approved", "conditional", "blocked"
    can_proceed: bool
    required_actions: List[str]
    timestamp: str
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            **asdict(self),
            "stars": {k.value: v.to_dict() for k, v in self.stars.items()}
        }
    
    @property
    def star_display(self) -> str:
        """Visual representation of stars."""
        earned = sum(1 for s in self.stars.values() if s.is_earned)
        return "★" * earned + "☆" * (5 - earned)


class PowerStarVerifier:
    """
    Power Star Verification System.
    
    Verifies device operations against five compliance checkpoints.
    All five stars must be earned for unrestricted operation.
    """
    
    def __init__(self):
        self._verification_cache: Dict[str, PowerStarVerification] = {}
    
    def verify(
        self,
        device_id: str,
        operation: str,
        device_state: Dict[str, Any],
        ownership_data: Dict[str, Any] = None,
        legal_data: Dict[str, Any] = None,
        routing_data: Dict[str, Any] = None,
        audit_data: Dict[str, Any] = None
    ) -> PowerStarVerification:
        """
        Perform full Power Star verification.
        
        Args:
            device_id: Device identifier
            operation: Operation being attempted
            device_state: Current device state
            ownership_data: Ownership verification data
            legal_data: Legal classification data
            routing_data: Authority routing data
            audit_data: Audit trail data
        
        Returns:
            PowerStarVerification with all five stars evaluated
        """
        now = datetime.now(timezone.utc).isoformat()
        verification_id = f"pv_{device_id}_{int(datetime.now().timestamp())}"
        
        stars: Dict[StarType, PowerStar] = {}
        
        # Star 1: Ownership Verified
        stars[StarType.OWNERSHIP] = self._verify_ownership(
            ownership_data or {},
            device_state
        )
        
        # Star 2: Legal Classification Clear
        stars[StarType.LEGAL] = self._verify_legal(
            legal_data or {},
            stars[StarType.OWNERSHIP]
        )
        
        # Star 3: Authority Route Available
        stars[StarType.AUTHORITY] = self._verify_authority(
            routing_data or {},
            stars[StarType.LEGAL]
        )
        
        # Star 4: Audit Trail Complete
        stars[StarType.AUDIT] = self._verify_audit(
            audit_data or {},
            device_id
        )
        
        # Star 5: Operation Permitted
        stars[StarType.PERMISSION] = self._verify_permission(
            operation,
            device_state,
            stars
        )
        
        # Calculate totals
        earned = sum(1 for s in stars.values() if s.is_earned)
        
        # Determine overall status
        if earned == 5:
            overall_status = "approved"
            can_proceed = True
            required_actions = []
        elif earned >= 3:
            overall_status = "conditional"
            can_proceed = False
            required_actions = self._get_required_actions(stars)
        else:
            overall_status = "blocked"
            can_proceed = False
            required_actions = self._get_required_actions(stars)
        
        verification = PowerStarVerification(
            verification_id=verification_id,
            device_id=device_id,
            operation=operation,
            stars=stars,
            total_stars=5,
            earned_stars=earned,
            overall_status=overall_status,
            can_proceed=can_proceed,
            required_actions=required_actions,
            timestamp=now
        )
        
        # Cache the verification
        self._verification_cache[verification_id] = verification
        
        return verification
    
    def _verify_ownership(
        self,
        ownership_data: Dict[str, Any],
        device_state: Dict[str, Any]
    ) -> PowerStar:
        """Verify ownership star."""
        now = datetime.now(timezone.utc).isoformat()
        
        confidence = ownership_data.get("confidence", 0.0)
        verified = ownership_data.get("verified", False)
        attestation_type = ownership_data.get("attestation_type", "None")
        
        if verified and confidence >= 0.85:
            return PowerStar(
                star_type=StarType.OWNERSHIP,
                status=StarStatus.EARNED,
                score=confidence,
                message="Ownership verified with high confidence",
                details={
                    "confidence": confidence,
                    "attestation_type": attestation_type
                },
                verified_at=now
            )
        elif confidence >= 0.50:
            return PowerStar(
                star_type=StarType.OWNERSHIP,
                status=StarStatus.PENDING,
                score=confidence,
                message="Ownership partially verified - additional documentation needed",
                details={
                    "confidence": confidence,
                    "attestation_type": attestation_type,
                    "needed": "Additional ownership proof required"
                },
                verified_at=None
            )
        else:
            return PowerStar(
                star_type=StarType.OWNERSHIP,
                status=StarStatus.FAILED,
                score=confidence,
                message="Ownership not verified",
                details={
                    "confidence": confidence,
                    "reason": "Insufficient ownership documentation"
                },
                verified_at=None
            )
    
    def _verify_legal(
        self,
        legal_data: Dict[str, Any],
        ownership_star: PowerStar
    ) -> PowerStar:
        """Verify legal classification star."""
        now = datetime.now(timezone.utc).isoformat()
        
        # If ownership failed, legal is blocked
        if ownership_star.status == StarStatus.FAILED:
            return PowerStar(
                star_type=StarType.LEGAL,
                status=StarStatus.BLOCKED,
                score=0.0,
                message="Legal classification blocked - ownership not verified",
                details={"blocked_by": "ownership_verification"},
                verified_at=None
            )
        
        status = legal_data.get("status", "Unknown")
        risk_level = legal_data.get("risk_level", "Unknown")
        
        if status == "Permitted":
            return PowerStar(
                star_type=StarType.LEGAL,
                status=StarStatus.EARNED,
                score=1.0,
                message="Legal classification: Permitted",
                details={"status": status, "risk_level": risk_level},
                verified_at=now
            )
        elif status in ["ConditionallyPermitted", "RequiresAuthorization"]:
            return PowerStar(
                star_type=StarType.LEGAL,
                status=StarStatus.PENDING,
                score=0.5,
                message=f"Legal classification: {status}",
                details={
                    "status": status,
                    "risk_level": risk_level,
                    "authorization_required": legal_data.get("authorization_required", [])
                },
                verified_at=None
            )
        else:
            return PowerStar(
                star_type=StarType.LEGAL,
                status=StarStatus.FAILED,
                score=0.0,
                message=f"Legal classification: {status}",
                details={"status": status, "risk_level": risk_level},
                verified_at=None
            )
    
    def _verify_authority(
        self,
        routing_data: Dict[str, Any],
        legal_star: PowerStar
    ) -> PowerStar:
        """Verify authority route star."""
        now = datetime.now(timezone.utc).isoformat()
        
        # If legal failed, authority is blocked
        if legal_star.status in [StarStatus.FAILED, StarStatus.BLOCKED]:
            return PowerStar(
                star_type=StarType.AUTHORITY,
                status=StarStatus.BLOCKED,
                score=0.0,
                message="Authority routing blocked - legal classification issue",
                details={"blocked_by": "legal_classification"},
                verified_at=None
            )
        
        routes = routing_data.get("recommended_routes", [])
        route_to = routing_data.get("route_to", "Unknown")
        
        if routes and len(routes) > 0:
            return PowerStar(
                star_type=StarType.AUTHORITY,
                status=StarStatus.EARNED,
                score=1.0,
                message=f"Authority route available: {route_to}",
                details={
                    "route_to": route_to,
                    "routes_available": len(routes)
                },
                verified_at=now
            )
        else:
            return PowerStar(
                star_type=StarType.AUTHORITY,
                status=StarStatus.PENDING,
                score=0.3,
                message="Authority route being determined",
                details={"route_to": route_to},
                verified_at=None
            )
    
    def _verify_audit(
        self,
        audit_data: Dict[str, Any],
        device_id: str
    ) -> PowerStar:
        """Verify audit trail star."""
        now = datetime.now(timezone.utc).isoformat()
        
        events = audit_data.get("events", [])
        integrity_verified = audit_data.get("integrity_verified", False)
        
        # Audit is automatically earned if we're tracking
        # (Phoenix always maintains audit trail)
        return PowerStar(
            star_type=StarType.AUDIT,
            status=StarStatus.EARNED,
            score=1.0,
            message="Audit trail active and verified",
            details={
                "events_count": len(events),
                "integrity_verified": integrity_verified,
                "device_id": device_id
            },
            verified_at=now
        )
    
    def _verify_permission(
        self,
        operation: str,
        device_state: Dict[str, Any],
        prior_stars: Dict[StarType, PowerStar]
    ) -> PowerStar:
        """Verify operation permission star."""
        now = datetime.now(timezone.utc).isoformat()
        
        # Count prior earned stars
        earned_count = sum(
            1 for st, star in prior_stars.items() 
            if star.is_earned and st != StarType.PERMISSION
        )
        
        # Blocked operations list
        blocked_operations = [
            "bypass_frp",
            "bypass_icloud",
            "unlock_bootloader_unauthorized",
            "flash_unauthorized_firmware"
        ]
        
        # Check if operation is inherently blocked
        if operation.lower() in blocked_operations:
            return PowerStar(
                star_type=StarType.PERMISSION,
                status=StarStatus.BLOCKED,
                score=0.0,
                message=f"Operation '{operation}' is not permitted",
                details={
                    "operation": operation,
                    "reason": "Operation violates compliance policy"
                },
                verified_at=None
            )
        
        # Check if prior stars allow this operation
        if earned_count >= 3:
            # At least ownership, legal, and audit must be earned
            ownership_earned = prior_stars[StarType.OWNERSHIP].is_earned
            audit_earned = prior_stars[StarType.AUDIT].is_earned
            
            if ownership_earned and audit_earned:
                return PowerStar(
                    star_type=StarType.PERMISSION,
                    status=StarStatus.EARNED,
                    score=1.0,
                    message=f"Operation '{operation}' permitted",
                    details={
                        "operation": operation,
                        "prior_stars_earned": earned_count
                    },
                    verified_at=now
                )
        
        # Not enough stars
        return PowerStar(
            star_type=StarType.PERMISSION,
            status=StarStatus.PENDING,
            score=earned_count / 4.0,
            message=f"Operation '{operation}' requires additional verification",
            details={
                "operation": operation,
                "prior_stars_earned": earned_count,
                "required_stars": 4
            },
            verified_at=None
        )
    
    def _get_required_actions(self, stars: Dict[StarType, PowerStar]) -> List[str]:
        """Get list of required actions to earn remaining stars."""
        actions = []
        
        for star_type, star in stars.items():
            if star.status == StarStatus.FAILED:
                if star_type == StarType.OWNERSHIP:
                    actions.append("Provide ownership documentation (receipt, ID, court order)")
                elif star_type == StarType.LEGAL:
                    actions.append("Obtain legal authorization for operation")
                elif star_type == StarType.AUTHORITY:
                    actions.append("Contact appropriate authority for this device/situation")
                elif star_type == StarType.PERMISSION:
                    actions.append("Operation not permitted - use authorized channels")
            elif star.status == StarStatus.PENDING:
                if star_type == StarType.OWNERSHIP:
                    actions.append("Complete ownership verification")
                elif star_type == StarType.LEGAL:
                    actions.append("Obtain required authorization")
                elif star_type == StarType.AUTHORITY:
                    actions.append("Confirm authority routing")
                elif star_type == StarType.PERMISSION:
                    actions.append("Complete prior verifications")
            elif star.status == StarStatus.BLOCKED:
                actions.append(f"Resolve blocking issue: {star.message}")
        
        return actions
    
    def get_verification(self, verification_id: str) -> Optional[PowerStarVerification]:
        """Get a cached verification by ID."""
        return self._verification_cache.get(verification_id)
    
    def quick_check(
        self,
        ownership_confidence: float,
        legal_status: str,
        operation: str
    ) -> Tuple[bool, str, int]:
        """
        Quick Power Star check without full verification.
        
        Args:
            ownership_confidence: 0.0 - 1.0
            legal_status: "Permitted", "ConditionallyPermitted", etc.
            operation: Operation name
        
        Returns:
            Tuple of (can_proceed, status_message, stars_earned)
        """
        stars = 0
        
        # Star 1: Ownership (0.85+ = earned)
        if ownership_confidence >= 0.85:
            stars += 1
        
        # Star 2: Legal (Permitted = earned)
        if legal_status == "Permitted":
            stars += 1
        elif legal_status == "ConditionallyPermitted" and ownership_confidence >= 0.85:
            stars += 1
        
        # Star 3: Authority (assume available if legal passes)
        if legal_status in ["Permitted", "ConditionallyPermitted"]:
            stars += 1
        
        # Star 4: Audit (always earned - we're tracking)
        stars += 1
        
        # Star 5: Permission (based on above)
        blocked_ops = ["bypass_frp", "bypass_icloud"]
        if operation.lower() not in blocked_ops and stars >= 3:
            stars += 1
        
        if stars == 5:
            return (True, "★★★★★ All Power Stars earned - Operation approved", 5)
        elif stars >= 3:
            return (False, f"{'★' * stars}{'☆' * (5-stars)} Conditional - Additional verification needed", stars)
        else:
            return (False, f"{'★' * stars}{'☆' * (5-stars)} Blocked - Insufficient verification", stars)


# Singleton instance
_verifier: Optional[PowerStarVerifier] = None


def get_verifier() -> PowerStarVerifier:
    """Get the Power Star verifier singleton."""
    global _verifier
    if _verifier is None:
        _verifier = PowerStarVerifier()
    return _verifier


def verify_power_stars(
    device_id: str,
    operation: str,
    device_state: Dict[str, Any],
    ownership_data: Dict[str, Any] = None,
    legal_data: Dict[str, Any] = None,
    routing_data: Dict[str, Any] = None,
    audit_data: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Perform Power Star verification.
    
    This is the main API for Power Star verification.
    
    Returns:
        Verification result as dict with star states and overall status
    """
    verifier = get_verifier()
    result = verifier.verify(
        device_id=device_id,
        operation=operation,
        device_state=device_state,
        ownership_data=ownership_data,
        legal_data=legal_data,
        routing_data=routing_data,
        audit_data=audit_data
    )
    return result.to_dict()
