"""Device detection - USB, ADB, iOS enumeration."""
import subprocess
import json
import re
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime, timezone


@dataclass
class DevicePassport:
    """Device passport structure."""
    platform: str  # 'android', 'ios', 'unknown'
    model: Optional[str] = None
    serial: Optional[str] = None
    imei: Optional[str] = None
    os_version: Optional[str] = None
    manufacturer: Optional[str] = None
    connection_state: str = "none"  # 'usb', 'adb', 'recovery', 'dfu', 'fastboot', 'none'
    trust_state: Dict[str, Any] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.trust_state is None:
            self.trust_state = {}
        if self.metadata is None:
            self.metadata = {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)


def detect_adb_devices() -> List[Dict[str, Any]]:
    """Detect Android devices via ADB (authorized only)."""
    devices = []
    try:
        result = subprocess.run(
            ["adb", "devices", "-l"],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode != 0:
            return devices
        
        lines = result.stdout.strip().split("\n")[1:]  # Skip header
        for line in lines:
            if not line.strip():
                continue
            
            parts = line.split()
            if len(parts) < 2:
                continue
            
            serial = parts[0]
            status = parts[1]
            
            # Only return authorized devices
            if status != "device":
                continue
            
            # Get device properties
            device_info = {
                "serial": serial,
                "status": status,
                "platform": "android",
                "connection_state": "adb",
                "trust_state": {"adb_authorized": True}
            }
            
            # Try to get model
            try:
                model_result = subprocess.run(
                    ["adb", "-s", serial, "shell", "getprop", "ro.product.model"],
                    capture_output=True,
                    text=True,
                    timeout=2
                )
                if model_result.returncode == 0:
                    device_info["model"] = model_result.stdout.strip()
            except:
                pass
            
            # Try to get OS version
            try:
                version_result = subprocess.run(
                    ["adb", "-s", serial, "shell", "getprop", "ro.build.version.release"],
                    capture_output=True,
                    text=True,
                    timeout=2
                )
                if version_result.returncode == 0:
                    device_info["os_version"] = version_result.stdout.strip()
            except:
                pass
            
            devices.append(device_info)
    
    except FileNotFoundError:
        # ADB not installed
        pass
    except subprocess.TimeoutExpired:
        pass
    except Exception:
        pass
    
    return devices


def detect_ios_devices() -> List[Dict[str, Any]]:
    """Detect iOS devices via libimobiledevice."""
    devices = []
    try:
        # Try idevice_id to list devices
        result = subprocess.run(
            ["idevice_id", "-l"],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode != 0:
            return devices
        
        udids = result.stdout.strip().split("\n")
        for udid in udids:
            if not udid.strip():
                continue
            
            device_info = {
                "udid": udid.strip(),
                "platform": "ios",
                "connection_state": "usb",
                "trust_state": {"paired": True}
            }
            
            # Try to get device info
            try:
                info_result = subprocess.run(
                    ["ideviceinfo", "-u", udid, "-k", "ProductType"],
                    capture_output=True,
                    text=True,
                    timeout=2
                )
                if info_result.returncode == 0:
                    device_info["model"] = info_result.stdout.strip()
            except:
                pass
            
            devices.append(device_info)
    
    except FileNotFoundError:
        # libimobiledevice not installed
        pass
    except subprocess.TimeoutExpired:
        pass
    except Exception:
        pass
    
    return devices


def detect_usb_devices() -> List[Dict[str, Any]]:
    """
    Detect USB devices (cross-platform basic detection).
    This is a simplified version - full implementation would use libusb.
    """
    devices = []
    
    # For now, combine ADB and iOS detection
    # In a full implementation, this would use libusb to enumerate all USB devices
    adb_devices = detect_adb_devices()
    ios_devices = detect_ios_devices()
    
    devices.extend(adb_devices)
    devices.extend(ios_devices)
    
    return devices


def generate_device_passport(device_info: Dict[str, Any]) -> DevicePassport:
    """Generate a device passport from detection info."""
    platform = device_info.get("platform", "unknown")
    model = device_info.get("model")
    serial = device_info.get("serial") or device_info.get("udid")
    os_version = device_info.get("os_version")
    connection_state = device_info.get("connection_state", "none")
    trust_state = device_info.get("trust_state", {})
    
    metadata = {
        "detected_at": datetime.now(timezone.utc).isoformat(),
        "detection_method": device_info.get("detection_method", "usb")
    }
    
    return DevicePassport(
        platform=platform,
        model=model,
        serial=serial,
        imei=device_info.get("imei"),
        os_version=os_version,
        manufacturer=device_info.get("manufacturer"),
        connection_state=connection_state,
        trust_state=trust_state,
        metadata=metadata
    )


def detect_all_devices() -> List[Dict[str, Any]]:
    """Detect all available devices (ADB + iOS)."""
    all_devices = []
    
    # Detect ADB devices
    adb_devices = detect_adb_devices()
    for dev in adb_devices:
        dev["detection_method"] = "adb"
        all_devices.append(dev)
    
    # Detect iOS devices
    ios_devices = detect_ios_devices()
    for dev in ios_devices:
        dev["detection_method"] = "libimobiledevice"
        all_devices.append(dev)
    
    return all_devices
