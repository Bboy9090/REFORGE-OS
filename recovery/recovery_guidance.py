"""Recovery guidance generation."""
from dataclasses import dataclass
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from .firmware_lookup import lookup_oem_firmware, get_recovery_tool_info


@dataclass
class RecoveryGuidance:
    """Recovery guidance structure."""
    platform: str
    oem: Optional[str] = None
    model: Optional[str] = None
    guidance_type: str = "restore"  # "restore", "update", "recovery"
    firmware_source: Optional[Dict[str, Any]] = None
    tool_info: Optional[Dict[str, Any]] = None
    steps: List[str] = None
    warnings: List[str] = None
    official_links: List[Dict[str, str]] = None
    created_at: str = ""
    
    def __post_init__(self):
        if self.steps is None:
            self.steps = []
        if self.warnings is None:
            self.warnings = []
        if self.official_links is None:
            self.official_links = []
        if not self.created_at:
            self.created_at = datetime.now(timezone.utc).isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "platform": self.platform,
            "oem": self.oem,
            "model": self.model,
            "guidance_type": self.guidance_type,
            "firmware_source": self.firmware_source,
            "tool_info": self.tool_info,
            "steps": self.steps,
            "warnings": self.warnings,
            "official_links": self.official_links,
            "created_at": self.created_at
        }


def generate_recovery_guidance(
    platform: str,
    oem: Optional[str] = None,
    model: Optional[str] = None,
    guidance_type: str = "restore"
) -> RecoveryGuidance:
    """
    Generate recovery guidance for device.
    
    Provides official recovery steps and firmware sources only.
    """
    guidance = RecoveryGuidance(
        platform=platform,
        oem=oem,
        model=model,
        guidance_type=guidance_type
    )
    
    if platform == "android" and oem:
        # Lookup firmware source
        firmware_source = lookup_oem_firmware(oem, model)
        if firmware_source:
            guidance.firmware_source = firmware_source.__dict__
        
        # Get tool info
        tool_info = get_recovery_tool_info(oem)
        guidance.tool_info = tool_info
        
        # Generate steps
        if guidance_type == "restore":
            guidance.steps = [
                "1. Download official firmware from OEM source",
                "2. Install recommended recovery tool",
                "3. Follow official OEM instructions",
                "4. Backup important data before proceeding",
                "5. Ensure device is charged (50%+)",
                "6. Follow step-by-step OEM guide"
            ]
            guidance.warnings = [
                "WARNING: Restore will erase all data",
                "Ensure you have backups before proceeding",
                "Only use official firmware from OEM",
                "Follow OEM instructions exactly"
            ]
        elif guidance_type == "update":
            guidance.steps = [
                "1. Check for OTA updates in device settings",
                "2. If OTA unavailable, download official firmware",
                "3. Use OEM update tool or recovery mode",
                "4. Follow OEM update instructions"
            ]
            guidance.warnings = [
                "Ensure device is charged",
                "Backup data before updating",
                "Only use official firmware"
            ]
        
        # Add official links
        if firmware_source:
            if firmware_source.source_url:
                guidance.official_links.append({
                    "label": f"{oem} Firmware Download",
                    "url": firmware_source.source_url
                })
            if firmware_source.instructions_url:
                guidance.official_links.append({
                    "label": f"{oem} Instructions",
                    "url": firmware_source.instructions_url
                })
    
    elif platform == "ios":
        guidance.steps = [
            "1. Use iTunes (Windows) or Finder (macOS)",
            "2. Connect device to computer",
            "3. Put device in Recovery Mode or DFU Mode",
            "4. Select 'Restore' (not 'Update')",
            "5. Follow on-screen instructions"
        ]
        guidance.warnings = [
            "WARNING: Restore will erase all data",
            "Ensure you have backups (iCloud or iTunes)",
            "Activation Lock may require Apple ID password",
            "Only use official Apple firmware (IPSW)"
        ]
        guidance.official_links = [
            {
                "label": "Apple Support - Restore",
                "url": "https://support.apple.com/en-us/HT201263"
            },
            {
                "label": "IPSW Downloads",
                "url": "https://ipsw.me/"
            },
            {
                "label": "Apple Support",
                "url": "https://support.apple.com/"
            }
        ]
        firmware_source = lookup_oem_firmware("apple", model)
        if firmware_source:
            guidance.firmware_source = firmware_source.__dict__
    
    else:
        guidance.steps = [
            "1. Identify device manufacturer and model",
            "2. Visit manufacturer support website",
            "3. Look for official recovery/restore instructions",
            "4. Follow manufacturer guidelines"
        ]
        guidance.warnings = [
            "Only use official manufacturer resources",
            "Backup data before any restore operation"
        ]
    
    return guidance
