"""
Phoenix Core - OS Recipe Management and Deployment

Phoenix Core is the brains of REFORGE OS deployment operations.

Components:
- Authority Routing: Routes devices to appropriate authorities
- Memory Persistence: Maintains state across sessions
- Power Star Verification: Five-star compliance verification
- Registry: OS recipe management
- Router: Deployment routing
- Verifier: Recipe verification
- Device Info: Device information extraction
"""

__version__ = "3.0.0"

from .authority_routing import (
    AuthorityRoutingTable,
    AuthorityRoute,
    AuthorityType,
    EscalationLevel,
    RoutingDecision,
    get_routing_table,
    route_to_authority,
)

from .memory_persistence import (
    PhoenixMemory,
    DeviceMemory,
    SessionMemory,
    PersistedState,
    get_memory,
)

from .power_star import (
    PowerStarVerifier,
    PowerStarVerification,
    PowerStar,
    StarType,
    StarStatus,
    get_verifier,
    verify_power_stars,
)

from .registry import get_recipe, list_recipes
from .router import deploy_recipe, recommend_recipe
from .verifier import verify_recipe_hash, validate_recipe

__all__ = [
    # Authority Routing
    "AuthorityRoutingTable",
    "AuthorityRoute", 
    "AuthorityType",
    "EscalationLevel",
    "RoutingDecision",
    "get_routing_table",
    "route_to_authority",
    
    # Memory Persistence
    "PhoenixMemory",
    "DeviceMemory",
    "SessionMemory",
    "PersistedState",
    "get_memory",
    
    # Power Star
    "PowerStarVerifier",
    "PowerStarVerification",
    "PowerStar",
    "StarType",
    "StarStatus",
    "get_verifier",
    "verify_power_stars",
    
    # Registry
    "get_recipe",
    "list_recipes",
    
    # Router
    "deploy_recipe",
    "recommend_recipe",
    
    # Verifier
    "verify_recipe_hash",
    "validate_recipe",
]
