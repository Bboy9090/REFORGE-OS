"""Authorized ADB diagnostics - read-only operations only."""
import subprocess
import json
import os
from dataclasses import dataclass, asdict
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone


@dataclass
class DiagnosticsResult:
    """Result of diagnostics operation."""
    success: bool
    device_serial: str
    operation: str
    stdout: str = ""
    stderr: str = ""
    exit_code: int = 0
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str = ""
    
    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)


def check_adb_authorization(device_serial: str) -> bool:
    """
    Check if device is authorized for ADB operations.
    Only devices with status="device" are authorized.
    """
    try:
        result = subprocess.run(
            ["adb", "devices", "-l"],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode != 0:
            return False
        
        lines = result.stdout.strip().split("\n")[1:]  # Skip header
        for line in lines:
            if not line.strip():
                continue
            
            parts = line.split()
            if len(parts) < 2:
                continue
            
            serial = parts[0]
            status = parts[1]
            
            if serial == device_serial and status == "device":
                return True
        
        return False
    
    except Exception:
        return False


def get_device_properties(device_serial: str) -> DiagnosticsResult:
    """
    Get device properties (read-only).
    Requires ADB authorization.
    """
    if not check_adb_authorization(device_serial):
        return DiagnosticsResult(
            success=False,
            device_serial=device_serial,
            operation="get_device_properties",
            error="Device not authorized. Please accept ADB RSA key on device.",
            exit_code=1
        )
    
    properties = {}
    
    # List of properties to retrieve (read-only, safe properties)
    safe_properties = [
        "ro.product.model",
        "ro.product.manufacturer",
        "ro.product.brand",
        "ro.build.version.release",
        "ro.build.version.sdk",
        "ro.build.id",
        "ro.build.version.incremental",
        "ro.build.type",
        "ro.build.tags",
        "ro.product.device",
        "ro.product.name",
        "ro.serialno",
        "ro.bootloader",
        "ro.hardware",
        "ro.chipname",
        "ro.product.cpu.abilist",
        "ro.product.cpu.abilist32",
        "ro.product.cpu.abilist64",
        "ro.product.locale",
        "ro.product.locale.region",
        "ro.product.locale.language",
        "ro.wifi.channels",
        "ro.telephony.call_ring.multiple",
        "ro.telephony.default_network",
    ]
    
    for prop in safe_properties:
        try:
            result = subprocess.run(
                ["adb", "-s", device_serial, "shell", "getprop", prop],
                capture_output=True,
                text=True,
                timeout=2
            )
            if result.returncode == 0:
                value = result.stdout.strip()
                if value:
                    properties[prop] = value
        except subprocess.TimeoutExpired:
            continue
        except Exception:
            continue
    
    return DiagnosticsResult(
        success=True,
        device_serial=device_serial,
        operation="get_device_properties",
        data={"properties": properties},
        exit_code=0
    )


def capture_bugreport(device_serial: str, output_dir: str = "storage/diagnostics") -> DiagnosticsResult:
    """
    Capture Android bugreport (authorized only).
    This is a read-only diagnostic operation.
    """
    if not check_adb_authorization(device_serial):
        return DiagnosticsResult(
            success=False,
            device_serial=device_serial,
            operation="capture_bugreport",
            error="Device not authorized. Please accept ADB RSA key on device.",
            exit_code=1
        )
    
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    output_file = os.path.join(output_dir, f"bugreport_{device_serial}_{timestamp}.zip")
    
    try:
        result = subprocess.run(
            ["adb", "-s", device_serial, "bugreport", output_file],
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout for bugreport
        )
        
        if result.returncode == 0 and os.path.exists(output_file):
            file_size = os.path.getsize(output_file)
            return DiagnosticsResult(
                success=True,
                device_serial=device_serial,
                operation="capture_bugreport",
                stdout=f"Bugreport saved to {output_file}",
                data={
                    "output_file": output_file,
                    "file_size": file_size
                },
                exit_code=0
            )
        else:
            return DiagnosticsResult(
                success=False,
                device_serial=device_serial,
                operation="capture_bugreport",
                stderr=result.stderr,
                error="Failed to capture bugreport",
                exit_code=result.returncode
            )
    
    except subprocess.TimeoutExpired:
        return DiagnosticsResult(
            success=False,
            device_serial=device_serial,
            operation="capture_bugreport",
            error="Bugreport capture timed out",
            exit_code=1
        )
    except Exception as e:
        return DiagnosticsResult(
            success=False,
            device_serial=device_serial,
            operation="capture_bugreport",
            error=str(e),
            exit_code=1
        )


def capture_logcat_snapshot(device_serial: str, output_dir: str = "storage/diagnostics", lines: int = 1000) -> DiagnosticsResult:
    """
    Capture logcat snapshot (authorized only).
    This is a read-only diagnostic operation.
    """
    if not check_adb_authorization(device_serial):
        return DiagnosticsResult(
            success=False,
            device_serial=device_serial,
            operation="capture_logcat_snapshot",
            error="Device not authorized. Please accept ADB RSA key on device.",
            exit_code=1
        )
    
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    output_file = os.path.join(output_dir, f"logcat_{device_serial}_{timestamp}.txt")
    
    try:
        result = subprocess.run(
            ["adb", "-s", device_serial, "logcat", "-d", "-t", str(lines)],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(result.stdout)
            
            file_size = os.path.getsize(output_file)
            return DiagnosticsResult(
                success=True,
                device_serial=device_serial,
                operation="capture_logcat_snapshot",
                stdout=result.stdout[:500],  # First 500 chars for preview
                data={
                    "output_file": output_file,
                    "file_size": file_size,
                    "lines_captured": len(result.stdout.splitlines())
                },
                exit_code=0
            )
        else:
            return DiagnosticsResult(
                success=False,
                device_serial=device_serial,
                operation="capture_logcat_snapshot",
                stderr=result.stderr,
                error="Failed to capture logcat",
                exit_code=result.returncode
            )
    
    except subprocess.TimeoutExpired:
        return DiagnosticsResult(
            success=False,
            device_serial=device_serial,
            operation="capture_logcat_snapshot",
            error="Logcat capture timed out",
            exit_code=1
        )
    except Exception as e:
        return DiagnosticsResult(
            success=False,
            device_serial=device_serial,
            operation="capture_logcat_snapshot",
            error=str(e),
            exit_code=1
        )


def run_authorized_adb_diagnostics(
    device_serial: str,
    operations: List[str] = None,
    output_dir: str = "storage/diagnostics"
) -> Dict[str, Any]:
    """
    Run authorized ADB diagnostics suite.
    
    Operations can include:
    - "properties" - Get device properties
    - "bugreport" - Capture bugreport
    - "logcat" - Capture logcat snapshot
    
    All operations require ADB authorization.
    """
    if operations is None:
        operations = ["properties", "logcat"]
    
    results = {
        "device_serial": device_serial,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "operations": {},
        "authorized": check_adb_authorization(device_serial)
    }
    
    if not results["authorized"]:
        results["error"] = "Device not authorized. Please accept ADB RSA key on device."
        return results
    
    if "properties" in operations:
        props_result = get_device_properties(device_serial)
        results["operations"]["properties"] = props_result.to_dict()
    
    if "logcat" in operations:
        logcat_result = capture_logcat_snapshot(device_serial, output_dir)
        results["operations"]["logcat"] = logcat_result.to_dict()
    
    if "bugreport" in operations:
        bugreport_result = capture_bugreport(device_serial, output_dir)
        results["operations"]["bugreport"] = bugreport_result.to_dict()
    
    return results
