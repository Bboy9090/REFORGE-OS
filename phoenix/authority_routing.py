"""
Phoenix Core - Authority Routing Table

Defines authoritative routes for device recovery and support escalation.
Routes devices to appropriate authorities based on classification and context.
"""

from typing import Dict, Any, List, Optional
from enum import Enum
from dataclasses import dataclass, asdict
from datetime import datetime


class AuthorityType(str, Enum):
    """Types of authorities for routing."""
    OEM = "oem"                    # Original Equipment Manufacturer
    CARRIER = "carrier"            # Mobile carrier
    ENTERPRISE = "enterprise"      # Enterprise IT/MDM
    LEGAL = "legal"               # Legal counsel
    COURT = "court"               # Court system
    LAW_ENFORCEMENT = "law_enforcement"
    INSURANCE = "insurance"        # Insurance company
    SELF_SERVICE = "self_service"  # User can resolve themselves


class EscalationLevel(str, Enum):
    """Escalation levels."""
    L1_SELF = "L1_self_service"    # User can handle
    L2_SUPPORT = "L2_support"      # Tech support can handle
    L3_SPECIALIST = "L3_specialist" # Specialist required
    L4_LEGAL = "L4_legal"          # Legal involvement needed
    L5_COURT = "L5_court"          # Court order required


@dataclass
class AuthorityRoute:
    """A route to an authority."""
    authority_id: str
    authority_type: AuthorityType
    name: str
    description: str
    contact_method: str
    contact_details: Dict[str, str]
    required_documentation: List[str]
    estimated_timeline: str
    cost_estimate: Optional[str]
    success_rate: Optional[str]
    escalation_level: EscalationLevel
    notes: List[str]
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class RoutingDecision:
    """A routing decision for a device."""
    device_id: str
    classification: str
    ownership_confidence: float
    recommended_routes: List[AuthorityRoute]
    blocked_routes: List[str]
    routing_reason: str
    timestamp: str
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            **asdict(self),
            "recommended_routes": [r.to_dict() for r in self.recommended_routes]
        }


# Authority Registry - Known authorities and their routes
AUTHORITY_REGISTRY: Dict[str, AuthorityRoute] = {
    # Apple Routes
    "apple_store": AuthorityRoute(
        authority_id="apple_store",
        authority_type=AuthorityType.OEM,
        name="Apple Store Genius Bar",
        description="In-person support at Apple retail locations",
        contact_method="in_person",
        contact_details={
            "website": "https://www.apple.com/retail/",
            "booking": "https://getsupport.apple.com/"
        },
        required_documentation=[
            "Government-issued ID",
            "Proof of purchase",
            "Device serial number"
        ],
        estimated_timeline="Same day to 5 business days",
        cost_estimate="Varies by warranty status",
        success_rate="High for verified owners",
        escalation_level=EscalationLevel.L2_SUPPORT,
        notes=["Appointment recommended", "Bring original receipt if available"]
    ),
    
    "apple_support": AuthorityRoute(
        authority_id="apple_support",
        authority_type=AuthorityType.OEM,
        name="Apple Support Online",
        description="Remote support via phone, chat, or web",
        contact_method="phone_online",
        contact_details={
            "website": "https://support.apple.com/",
            "phone": "1-800-275-2273"
        },
        required_documentation=[
            "Apple ID credentials",
            "Device serial number"
        ],
        estimated_timeline="Immediate to 24 hours",
        cost_estimate="Free",
        success_rate="Medium",
        escalation_level=EscalationLevel.L1_SELF,
        notes=["Available 24/7", "Can initiate account recovery"]
    ),
    
    "apple_account_recovery": AuthorityRoute(
        authority_id="apple_account_recovery",
        authority_type=AuthorityType.OEM,
        name="Apple Account Recovery",
        description="Official iCloud account recovery process",
        contact_method="online",
        contact_details={
            "website": "https://iforgot.apple.com/",
            "support": "https://support.apple.com/apple-id"
        },
        required_documentation=[
            "Recovery email/phone",
            "Trusted device",
            "Security questions"
        ],
        estimated_timeline="Immediate to 72 hours",
        cost_estimate="Free",
        success_rate="High with recovery info",
        escalation_level=EscalationLevel.L1_SELF,
        notes=["May require waiting period", "Two-factor authentication required"]
    ),
    
    # Samsung Routes
    "samsung_care": AuthorityRoute(
        authority_id="samsung_care",
        authority_type=AuthorityType.OEM,
        name="Samsung Care",
        description="Official Samsung support and repair service",
        contact_method="phone_online",
        contact_details={
            "website": "https://www.samsung.com/support/",
            "phone": "1-800-726-7864"
        },
        required_documentation=[
            "IMEI number",
            "Proof of purchase",
            "Samsung account credentials"
        ],
        estimated_timeline="5-10 business days",
        cost_estimate="Varies by warranty status",
        success_rate="High for verified owners",
        escalation_level=EscalationLevel.L2_SUPPORT,
        notes=["Walk-in service available at some locations"]
    ),
    
    "samsung_find_my_mobile": AuthorityRoute(
        authority_id="samsung_find_my_mobile",
        authority_type=AuthorityType.OEM,
        name="Samsung Find My Mobile Unlock",
        description="Remote unlock via Samsung account",
        contact_method="online",
        contact_details={
            "website": "https://findmymobile.samsung.com/"
        },
        required_documentation=["Samsung account credentials"],
        estimated_timeline="Immediate",
        cost_estimate="Free",
        success_rate="High if account linked",
        escalation_level=EscalationLevel.L1_SELF,
        notes=["Requires prior account setup", "Device must be online"]
    ),
    
    # Google Routes
    "google_support": AuthorityRoute(
        authority_id="google_support",
        authority_type=AuthorityType.OEM,
        name="Google Support",
        description="Official Pixel and Google device support",
        contact_method="phone_online",
        contact_details={
            "website": "https://support.google.com/pixelphone/",
            "phone": "1-855-836-3987"
        },
        required_documentation=[
            "Google account credentials",
            "Device IMEI",
            "Proof of purchase"
        ],
        estimated_timeline="Varies",
        cost_estimate="Warranty dependent",
        success_rate="Medium-High",
        escalation_level=EscalationLevel.L2_SUPPORT,
        notes=["Chat support available"]
    ),
    
    "google_account_recovery": AuthorityRoute(
        authority_id="google_account_recovery",
        authority_type=AuthorityType.OEM,
        name="Google Account Recovery",
        description="Official Google account recovery for FRP",
        contact_method="online",
        contact_details={
            "website": "https://accounts.google.com/signin/recovery"
        },
        required_documentation=[
            "Recovery email/phone",
            "Previous passwords",
            "Account creation info"
        ],
        estimated_timeline="Immediate to 7 days",
        cost_estimate="Free",
        success_rate="Medium",
        escalation_level=EscalationLevel.L1_SELF,
        notes=["May require identity verification", "Patience required"]
    ),
    
    # Carrier Routes
    "carrier_unlock": AuthorityRoute(
        authority_id="carrier_unlock",
        authority_type=AuthorityType.CARRIER,
        name="Carrier Unlock Request",
        description="Request network unlock from carrier",
        contact_method="phone_online",
        contact_details={
            "note": "Contact your specific carrier"
        },
        required_documentation=[
            "Account holder information",
            "Device IMEI",
            "Account in good standing"
        ],
        estimated_timeline="Immediate to 5 business days",
        cost_estimate="Usually free after contract",
        success_rate="High for eligible devices",
        escalation_level=EscalationLevel.L1_SELF,
        notes=["Contract must be fulfilled", "Device must not be reported lost/stolen"]
    ),
    
    # Legal Routes
    "legal_counsel": AuthorityRoute(
        authority_id="legal_counsel",
        authority_type=AuthorityType.LEGAL,
        name="Legal Counsel",
        description="Consult with attorney for complex situations",
        contact_method="in_person",
        contact_details={
            "note": "Contact local bar association for referral"
        },
        required_documentation=[
            "All available ownership documentation",
            "Device information",
            "Situation summary"
        ],
        estimated_timeline="Varies",
        cost_estimate="$200-500/hour typical",
        success_rate="Varies by case",
        escalation_level=EscalationLevel.L4_LEGAL,
        notes=["Required for disputed ownership", "Estate/inheritance matters"]
    ),
    
    "court_order": AuthorityRoute(
        authority_id="court_order",
        authority_type=AuthorityType.COURT,
        name="Court Order",
        description="Obtain court order for device access",
        contact_method="legal_process",
        contact_details={
            "note": "Requires attorney and court filing"
        },
        required_documentation=[
            "Legal representation",
            "Sworn statements",
            "Supporting evidence"
        ],
        estimated_timeline="Weeks to months",
        cost_estimate="$1,000+ including legal fees",
        success_rate="Varies by jurisdiction and evidence",
        escalation_level=EscalationLevel.L5_COURT,
        notes=["Last resort option", "Required for law enforcement requests"]
    ),
    
    # Enterprise Routes
    "enterprise_mdm": AuthorityRoute(
        authority_id="enterprise_mdm",
        authority_type=AuthorityType.ENTERPRISE,
        name="Enterprise MDM Administrator",
        description="Contact organization IT for MDM-enrolled devices",
        contact_method="internal",
        contact_details={
            "note": "Contact your organization's IT department"
        },
        required_documentation=[
            "Employee ID",
            "Device asset tag",
            "IT ticket"
        ],
        estimated_timeline="Same day to 3 business days",
        cost_estimate="Internal process",
        success_rate="High for current employees",
        escalation_level=EscalationLevel.L2_SUPPORT,
        notes=["Former employees may need HR involvement"]
    ),
}


class AuthorityRoutingTable:
    """
    Authority Routing Table for Phoenix Core.
    
    Determines the appropriate authority routes based on device state,
    classification, and ownership confidence.
    """
    
    def __init__(self):
        self._routes = AUTHORITY_REGISTRY.copy()
        self._routing_rules = self._build_routing_rules()
    
    def _build_routing_rules(self) -> Dict[str, List[str]]:
        """Build routing rules based on classification."""
        return {
            # High confidence, clear ownership
            "Permitted": [
                "apple_support", "samsung_care", "google_support",
                "carrier_unlock", "apple_account_recovery", 
                "google_account_recovery", "samsung_find_my_mobile"
            ],
            
            # Conditional - needs some verification
            "ConditionallyPermitted": [
                "apple_store", "samsung_care", "google_support",
                "apple_account_recovery", "google_account_recovery"
            ],
            
            # Low confidence - needs authorization
            "RequiresAuthorization": [
                "apple_store", "legal_counsel", "enterprise_mdm"
            ],
            
            # Very low confidence - legal only
            "Prohibited": [
                "legal_counsel", "court_order"
            ],
        }
    
    def get_routes_for_classification(
        self,
        classification: str,
        platform: str = None
    ) -> List[AuthorityRoute]:
        """
        Get authority routes for a given classification.
        
        Args:
            classification: Compliance classification
            platform: Optional platform filter (ios, android, etc.)
        
        Returns:
            List of applicable AuthorityRoute objects
        """
        route_ids = self._routing_rules.get(classification, [])
        routes = [self._routes[rid] for rid in route_ids if rid in self._routes]
        
        # Filter by platform if specified
        if platform:
            if platform == "ios":
                routes = [r for r in routes if "apple" in r.authority_id or 
                          r.authority_type in [AuthorityType.LEGAL, AuthorityType.COURT, AuthorityType.CARRIER]]
            elif platform == "android":
                routes = [r for r in routes if "apple" not in r.authority_id]
        
        return routes
    
    def route_device(
        self,
        device_id: str,
        classification: str,
        ownership_confidence: float,
        platform: str = None,
        lock_type: str = None
    ) -> RoutingDecision:
        """
        Make a routing decision for a device.
        
        Args:
            device_id: Device identifier
            classification: Compliance classification
            ownership_confidence: Ownership confidence (0.0-1.0)
            platform: Device platform
            lock_type: Type of lock (frp, icloud, mdm, etc.)
        
        Returns:
            RoutingDecision with recommended routes
        """
        routes = self.get_routes_for_classification(classification, platform)
        
        # Determine blocked routes based on confidence
        blocked = []
        if ownership_confidence < 0.5:
            blocked = ["self_service", "carrier_unlock"]
        
        # Filter out blocked routes
        routes = [r for r in routes if r.authority_id not in blocked]
        
        # Sort by escalation level
        routes.sort(key=lambda r: list(EscalationLevel).index(r.escalation_level))
        
        # Determine routing reason
        if ownership_confidence >= 0.85:
            reason = "High ownership confidence - standard recovery paths available"
        elif ownership_confidence >= 0.50:
            reason = "Medium ownership confidence - verification required"
        else:
            reason = "Low ownership confidence - legal consultation recommended"
        
        return RoutingDecision(
            device_id=device_id,
            classification=classification,
            ownership_confidence=ownership_confidence,
            recommended_routes=routes,
            blocked_routes=blocked,
            routing_reason=reason,
            timestamp=datetime.utcnow().isoformat()
        )
    
    def get_authority(self, authority_id: str) -> Optional[AuthorityRoute]:
        """Get a specific authority by ID."""
        return self._routes.get(authority_id)
    
    def list_authorities(self, authority_type: AuthorityType = None) -> List[AuthorityRoute]:
        """List all authorities, optionally filtered by type."""
        routes = list(self._routes.values())
        if authority_type:
            routes = [r for r in routes if r.authority_type == authority_type]
        return routes
    
    def add_custom_authority(self, route: AuthorityRoute) -> None:
        """Add a custom authority route."""
        self._routes[route.authority_id] = route


# Singleton instance
_routing_table: Optional[AuthorityRoutingTable] = None


def get_routing_table() -> AuthorityRoutingTable:
    """Get the authority routing table singleton."""
    global _routing_table
    if _routing_table is None:
        _routing_table = AuthorityRoutingTable()
    return _routing_table


def route_to_authority(
    device_id: str,
    classification: str,
    ownership_confidence: float,
    platform: str = None,
    lock_type: str = None
) -> Dict[str, Any]:
    """
    Route a device to appropriate authorities.
    
    This is the main API for authority routing.
    
    Args:
        device_id: Device identifier
        classification: Compliance classification
        ownership_confidence: Ownership confidence (0.0-1.0)
        platform: Device platform (ios, android, etc.)
        lock_type: Type of lock if applicable
    
    Returns:
        Routing decision as dict
    """
    table = get_routing_table()
    decision = table.route_device(
        device_id=device_id,
        classification=classification,
        ownership_confidence=ownership_confidence,
        platform=platform,
        lock_type=lock_type
    )
    return decision.to_dict()
