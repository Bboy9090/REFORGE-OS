"""
BootForge USB - Driver Packs Auto-Bundler

Automatically bundles driver packages for target operating systems.
Supports Windows, Linux, and macOS driver injection.
"""

import os
import json
import hashlib
import shutil
from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum
from dataclasses import dataclass, asdict

from .core import log, run_cmd


class DriverCategory(str, Enum):
    """Driver categories."""
    CHIPSET = "chipset"
    NETWORK = "network"
    STORAGE = "storage"
    GRAPHICS = "graphics"
    AUDIO = "audio"
    USB = "usb"
    BLUETOOTH = "bluetooth"
    TOUCHPAD = "touchpad"
    KEYBOARD = "keyboard"
    CAMERA = "camera"
    FIRMWARE = "firmware"


class TargetOS(str, Enum):
    """Target operating systems."""
    WINDOWS_10 = "windows_10"
    WINDOWS_11 = "windows_11"
    UBUNTU_22 = "ubuntu_22.04"
    UBUNTU_24 = "ubuntu_24.04"
    DEBIAN_12 = "debian_12"
    FEDORA_40 = "fedora_40"
    MACOS_SONOMA = "macos_sonoma"
    MACOS_VENTURA = "macos_ventura"
    CHROME_OS = "chrome_os"


@dataclass
class DriverPack:
    """Driver pack metadata."""
    pack_id: str
    name: str
    version: str
    category: DriverCategory
    target_os: List[TargetOS]
    vendor: str
    hardware_ids: List[str]
    download_url: Optional[str]
    local_path: Optional[str]
    sha256: Optional[str]
    size_bytes: int
    silent_install_cmd: Optional[str]
    requires_reboot: bool
    created_at: str
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class DriverBundle:
    """A bundle of driver packs for a specific configuration."""
    bundle_id: str
    name: str
    target_os: TargetOS
    device_profile: str
    packs: List[DriverPack]
    total_size_bytes: int
    created_at: str
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            **asdict(self),
            "packs": [p.to_dict() for p in self.packs]
        }


# Driver Pack Registry - Known driver sources
DRIVER_PACK_REGISTRY: Dict[str, Dict[str, Any]] = {
    # Intel Chipset
    "intel_chipset_win": {
        "name": "Intel Chipset Device Software",
        "vendor": "Intel",
        "category": DriverCategory.CHIPSET,
        "target_os": [TargetOS.WINDOWS_10, TargetOS.WINDOWS_11],
        "hardware_ids": ["PCI\\VEN_8086*"],
        "download_url": "https://downloadcenter.intel.com/product/chipsets",
        "silent_install_cmd": "SetupChipset.exe -s"
    },
    # Intel Network
    "intel_network_win": {
        "name": "Intel Network Adapter Driver",
        "vendor": "Intel",
        "category": DriverCategory.NETWORK,
        "target_os": [TargetOS.WINDOWS_10, TargetOS.WINDOWS_11],
        "hardware_ids": ["PCI\\VEN_8086&DEV_15*", "PCI\\VEN_8086&DEV_10*"],
        "download_url": "https://downloadcenter.intel.com/product/network-adapters",
        "silent_install_cmd": "PROWinx64.exe /qn"
    },
    # Realtek Audio
    "realtek_audio_win": {
        "name": "Realtek High Definition Audio",
        "vendor": "Realtek",
        "category": DriverCategory.AUDIO,
        "target_os": [TargetOS.WINDOWS_10, TargetOS.WINDOWS_11],
        "hardware_ids": ["HDAUDIO\\FUNC_01&VEN_10EC*"],
        "download_url": "https://www.realtek.com/en/downloads",
        "silent_install_cmd": "setup.exe -s"
    },
    # NVIDIA Graphics
    "nvidia_graphics_win": {
        "name": "NVIDIA GeForce Driver",
        "vendor": "NVIDIA",
        "category": DriverCategory.GRAPHICS,
        "target_os": [TargetOS.WINDOWS_10, TargetOS.WINDOWS_11],
        "hardware_ids": ["PCI\\VEN_10DE*"],
        "download_url": "https://www.nvidia.com/Download/index.aspx",
        "silent_install_cmd": "setup.exe -s -noreboot"
    },
    # AMD Graphics
    "amd_graphics_win": {
        "name": "AMD Radeon Software",
        "vendor": "AMD",
        "category": DriverCategory.GRAPHICS,
        "target_os": [TargetOS.WINDOWS_10, TargetOS.WINDOWS_11],
        "hardware_ids": ["PCI\\VEN_1002*"],
        "download_url": "https://www.amd.com/en/support",
        "silent_install_cmd": "Setup.exe -install"
    },
    # Samsung NVMe
    "samsung_nvme_win": {
        "name": "Samsung NVMe Driver",
        "vendor": "Samsung",
        "category": DriverCategory.STORAGE,
        "target_os": [TargetOS.WINDOWS_10, TargetOS.WINDOWS_11],
        "hardware_ids": ["SCSI\\DiskSAMSUNG*"],
        "download_url": "https://semiconductor.samsung.com/consumer-storage/support/tools/",
        "silent_install_cmd": "Samsung_NVM_Express.msi /quiet"
    },
    # Linux firmware-linux
    "firmware_linux": {
        "name": "Linux Firmware Package",
        "vendor": "Linux Kernel",
        "category": DriverCategory.FIRMWARE,
        "target_os": [TargetOS.UBUNTU_22, TargetOS.UBUNTU_24, TargetOS.DEBIAN_12, TargetOS.FEDORA_40],
        "hardware_ids": ["*"],
        "download_url": "https://git.kernel.org/pub/scm/linux/kernel/git/firmware/linux-firmware.git",
        "silent_install_cmd": None
    },
}


class DriverPackManager:
    """Manages driver pack bundling and deployment."""
    
    def __init__(self, storage_dir: str = None):
        self.storage_dir = storage_dir or os.path.join(
            os.path.dirname(__file__), "..", "storage", "driver_packs"
        )
        os.makedirs(self.storage_dir, exist_ok=True)
        self._load_cache()
    
    def _load_cache(self) -> None:
        """Load cached driver pack metadata."""
        cache_file = os.path.join(self.storage_dir, "cache.json")
        if os.path.exists(cache_file):
            with open(cache_file, "r") as f:
                self._cache = json.load(f)
        else:
            self._cache = {"packs": {}, "bundles": {}}
    
    def _save_cache(self) -> None:
        """Save driver pack cache."""
        cache_file = os.path.join(self.storage_dir, "cache.json")
        with open(cache_file, "w") as f:
            json.dump(self._cache, f, indent=2)
    
    def detect_required_drivers(self, hardware_info: Dict[str, Any]) -> List[str]:
        """
        Detect required drivers based on hardware information.
        
        Args:
            hardware_info: Device hardware information including PCI/USB IDs
        
        Returns:
            List of driver pack IDs that match the hardware
        """
        required = []
        hardware_ids = hardware_info.get("hardware_ids", [])
        target_os = hardware_info.get("target_os", TargetOS.WINDOWS_11)
        
        for pack_id, pack_info in DRIVER_PACK_REGISTRY.items():
            # Check if target OS matches
            if target_os not in pack_info.get("target_os", []):
                continue
            
            # Check hardware ID patterns
            pack_hw_ids = pack_info.get("hardware_ids", [])
            for hw_id in hardware_ids:
                for pattern in pack_hw_ids:
                    if self._match_hardware_id(hw_id, pattern):
                        if pack_id not in required:
                            required.append(pack_id)
                        break
        
        return required
    
    def _match_hardware_id(self, hw_id: str, pattern: str) -> bool:
        """Match hardware ID against pattern (supports * wildcard)."""
        if pattern == "*":
            return True
        if pattern.endswith("*"):
            return hw_id.upper().startswith(pattern[:-1].upper())
        return hw_id.upper() == pattern.upper()
    
    def create_bundle(
        self,
        name: str,
        target_os: TargetOS,
        device_profile: str,
        pack_ids: List[str]
    ) -> DriverBundle:
        """
        Create a driver bundle for a specific configuration.
        
        Args:
            name: Bundle name
            target_os: Target operating system
            device_profile: Device profile identifier
            pack_ids: List of driver pack IDs to include
        
        Returns:
            DriverBundle with all requested packs
        """
        packs = []
        total_size = 0
        
        for pack_id in pack_ids:
            pack_info = DRIVER_PACK_REGISTRY.get(pack_id)
            if pack_info:
                pack = DriverPack(
                    pack_id=pack_id,
                    name=pack_info["name"],
                    version="latest",
                    category=pack_info["category"],
                    target_os=pack_info["target_os"],
                    vendor=pack_info["vendor"],
                    hardware_ids=pack_info["hardware_ids"],
                    download_url=pack_info.get("download_url"),
                    local_path=self._get_local_path(pack_id),
                    sha256=None,
                    size_bytes=0,
                    silent_install_cmd=pack_info.get("silent_install_cmd"),
                    requires_reboot=pack_info.get("category") in [
                        DriverCategory.CHIPSET, 
                        DriverCategory.GRAPHICS,
                        DriverCategory.STORAGE
                    ],
                    created_at=datetime.utcnow().isoformat()
                )
                packs.append(pack)
        
        bundle_id = hashlib.sha256(
            f"{name}:{target_os}:{device_profile}:{datetime.utcnow().isoformat()}".encode()
        ).hexdigest()[:12]
        
        bundle = DriverBundle(
            bundle_id=f"drv_{bundle_id}",
            name=name,
            target_os=target_os,
            device_profile=device_profile,
            packs=packs,
            total_size_bytes=total_size,
            created_at=datetime.utcnow().isoformat()
        )
        
        # Cache the bundle
        self._cache["bundles"][bundle.bundle_id] = bundle.to_dict()
        self._save_cache()
        
        log(f"Created driver bundle: {bundle.bundle_id} with {len(packs)} packs")
        return bundle
    
    def _get_local_path(self, pack_id: str) -> Optional[str]:
        """Get local path for a driver pack if downloaded."""
        path = os.path.join(self.storage_dir, pack_id)
        return path if os.path.exists(path) else None
    
    def get_bundle(self, bundle_id: str) -> Optional[Dict[str, Any]]:
        """Get a bundle by ID."""
        return self._cache.get("bundles", {}).get(bundle_id)
    
    def list_bundles(self) -> List[Dict[str, Any]]:
        """List all cached bundles."""
        return list(self._cache.get("bundles", {}).values())
    
    def get_recommended_bundle(
        self,
        target_os: TargetOS,
        hardware_info: Dict[str, Any]
    ) -> DriverBundle:
        """
        Get recommended driver bundle based on hardware detection.
        
        Args:
            target_os: Target OS
            hardware_info: Hardware information
        
        Returns:
            Recommended DriverBundle
        """
        required_packs = self.detect_required_drivers({
            **hardware_info,
            "target_os": target_os
        })
        
        device_profile = hardware_info.get("profile", "generic")
        
        return self.create_bundle(
            name=f"Auto-Bundle for {device_profile}",
            target_os=target_os,
            device_profile=device_profile,
            pack_ids=required_packs
        )


# Singleton instance
_driver_manager: Optional[DriverPackManager] = None


def get_driver_manager() -> DriverPackManager:
    """Get the driver pack manager singleton."""
    global _driver_manager
    if _driver_manager is None:
        _driver_manager = DriverPackManager()
    return _driver_manager


def auto_bundle_drivers(
    target_os: str,
    hardware_info: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Auto-bundle drivers for a target OS based on hardware info.
    
    This is the main API for driver pack auto-bundling.
    
    Args:
        target_os: Target OS string (e.g., "windows_11")
        hardware_info: Hardware information dict
    
    Returns:
        Bundle information dict
    """
    manager = get_driver_manager()
    os_enum = TargetOS(target_os) if target_os in [e.value for e in TargetOS] else TargetOS.WINDOWS_11
    bundle = manager.get_recommended_bundle(os_enum, hardware_info)
    return bundle.to_dict()
