"""Device inspection handlers."""

import json

def inspect_basic_handler(device_id: str, platform: str, hints: dict = None):
    """
    Basic device inspection.
    Returns observation flags only - no mutations.
    
    This function performs read-only analysis.
    It does NOT execute modifications, exploits, or bypasses.
    """
    hints = hints or {}
    
    # Placeholder implementation
    # In real implementation, this would:
    # - Probe device via ADB/libimobiledevice
    # - Parse system properties
    # - Return flags only
    
    flags = {
        "activation_locked": None,
        "mdm_enrolled": None,
        "frp_locked": None,
        "efi_locked": None
    }
    
    # Example: If platform is iOS and we detect activation lock
    if platform.lower() == 'ios':
        # This would call libimobiledevice or similar
        # For now, return None (unknown)
        flags["activation_locked"] = None
    
    # Example: If platform is Android
    if platform.lower() == 'android':
        # This would call ADB
        flags["frp_locked"] = None
    
    return flags

def inspect_deep_handler(device_id: str, platform: str):
    """
    Deep device inspection.
    More thorough probing, still read-only.
    
    This function performs comprehensive read-only analysis.
    It does NOT execute modifications or bypasses.
    """
    # Placeholder implementation
    # In real implementation, this would perform deeper probing
    return {
        "signals": ["battery_state", "storage_health"],
        "notes": "deep probe completed"
    }
