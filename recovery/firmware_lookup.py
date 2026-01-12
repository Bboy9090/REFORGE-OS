"""OEM firmware source lookup - official sources only."""
import json
from dataclasses import dataclass
from typing import Dict, Any, List, Optional


@dataclass
class FirmwareSource:
    """Firmware source information."""
    oem: str
    model: str
    version: Optional[str] = None
    source_url: Optional[str] = None
    source_type: str = "official"  # "official", "carrier"
    download_url: Optional[str] = None
    instructions_url: Optional[str] = None
    notes: Optional[str] = None


# OEM Firmware Source Mappings (Official Sources Only)
OEM_FIRMWARE_SOURCES = {
    "samsung": {
        "name": "Samsung",
        "firmware_url": "https://samfw.com/",
        "instructions_url": "https://www.samsung.com/us/support/troubleshooting/TSG01234697/",
        "tool": "Odin",
        "notes": "Official Samsung firmware via SamFW or Samsung Smart Switch"
    },
    "google": {
        "name": "Google Pixel",
        "firmware_url": "https://developers.google.com/android/images",
        "instructions_url": "https://developers.google.com/android/images#instructions",
        "tool": "Fastboot",
        "notes": "Official Google factory images"
    },
    "xiaomi": {
        "name": "Xiaomi",
        "firmware_url": "https://xiaomifirmwareupdater.com/",
        "instructions_url": "https://c.mi.com/oc/miuidownload/detail?guide=2",
        "tool": "Mi Flash Tool",
        "notes": "Official Xiaomi firmware updater"
    },
    "oneplus": {
        "name": "OnePlus",
        "firmware_url": "https://www.oneplus.com/support/softwareupgrade",
        "instructions_url": "https://www.oneplus.com/support/softwareupgrade/details",
        "tool": "Oxygen Updater or Fastboot",
        "notes": "Official OnePlus software upgrades"
    },
    "motorola": {
        "name": "Motorola",
        "firmware_url": "https://motorola-global-portal.custhelp.com/app/standalone/bootloader/unlock-your-device-a",
        "instructions_url": "https://motorola-global-portal.custhelp.com/app/standalone/bootloader/unlock-your-device-a",
        "tool": "RSD Lite or Fastboot",
        "notes": "Official Motorola firmware and unlock tools"
    },
    "apple": {
        "name": "Apple",
        "firmware_url": "https://ipsw.me/",
        "instructions_url": "https://support.apple.com/en-us/HT201263",
        "tool": "iTunes / Finder",
        "notes": "Official Apple IPSW downloads and restore instructions"
    },
}


def lookup_oem_firmware(
    oem: str,
    model: Optional[str] = None,
    version: Optional[str] = None
) -> Optional[FirmwareSource]:
    """
    Lookup official firmware source for OEM.
    
    Returns firmware source information with official download links.
    Only returns official sources - no third-party mirrors.
    """
    oem_lower = oem.lower()
    
    if oem_lower not in OEM_FIRMWARE_SOURCES:
        return None
    
    source_info = OEM_FIRMWARE_SOURCES[oem_lower]
    
    return FirmwareSource(
        oem=source_info["name"],
        model=model or "Unknown",
        version=version,
        source_url=source_info.get("firmware_url"),
        source_type="official",
        instructions_url=source_info.get("instructions_url"),
        notes=source_info.get("notes")
    )


def get_firmware_sources(oem: Optional[str] = None) -> List[FirmwareSource]:
    """
    Get firmware sources for OEM(s).
    
    If oem is None, returns all known OEM sources.
    """
    if oem:
        source = lookup_oem_firmware(oem)
        return [source] if source else []
    
    sources = []
    for oem_key in OEM_FIRMWARE_SOURCES.keys():
        source = lookup_oem_firmware(oem_key)
        if source:
            sources.append(source)
    
    return sources


def get_recovery_tool_info(oem: str) -> Dict[str, Any]:
    """Get recommended recovery tool information for OEM."""
    oem_lower = oem.lower()
    
    if oem_lower not in OEM_FIRMWARE_SOURCES:
        return {"tool": "Unknown", "notes": "OEM not recognized"}
    
    source_info = OEM_FIRMWARE_SOURCES[oem_lower]
    return {
        "tool": source_info.get("tool", "Unknown"),
        "instructions_url": source_info.get("instructions_url"),
        "notes": source_info.get("notes")
    }
