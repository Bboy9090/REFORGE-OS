"""
Pandora Codex - Hardware Detection
Detect iOS devices in DFU/Recovery mode using PyUSB
"""

try:
    import usb.core
    import usb.util
    PYUSB_AVAILABLE = True
except ImportError:
    PYUSB_AVAILABLE = False
    print("Warning: PyUSB not available. Install with: pip install pyusb")


# Apple Device Constants
APPLE_VID = 0x05ac
DFU_PID = 0x1227      # DFU Mode (vulnerable signature)
REC_PID = 0x1281      # Recovery Mode
NORM_PID = 0x12a8     # Normal Mode (Locked)
DFU_MODE_PIDS = [0x1227, 0x1281, 0x1282, 0x1283, 0x1284]


def scan_for_hardware() -> dict:
    """
    Scan USB bus for Apple hardware and determine lock state
    
    Returns:
        dict with device status and mode
    """
    if not PYUSB_AVAILABLE:
        return {
            "status": "ERROR",
            "msg": "PyUSB not available. Install with: pip install pyusb",
            "mode": None,
            "color": "#FF0000"
        }
    
    try:
        # Find all connected Apple devices
        devices = list(usb.core.find(find_all=True, idVendor=APPLE_VID))
        
        if not devices:
            return {
                "status": "WAITING",
                "msg": "No Hardware Detected in Bobby's Workshop",
                "mode": None,
                "color": "#FF0000"
            }
        
        # Check each device
        for dev in devices:
            pid = dev.idProduct
            
            if pid == DFU_PID or pid in DFU_MODE_PIDS:
                return {
                    "status": "READY_TO_STRIKE",
                    "msg": "Device in DFU. Bootrom exploit (Checkm8) available.",
                    "mode": "DFU",
                    "pid": hex(pid),
                    "color": "#00FF41"  # Matrix Green
                }
            elif pid == REC_PID:
                return {
                    "status": "LOCKED",
                    "msg": "Device in Recovery. Exit or Flash required.",
                    "mode": "RECOVERY",
                    "pid": hex(pid),
                    "color": "#FFB000"  # Amber Warning
                }
            elif pid == NORM_PID:
                return {
                    "status": "LOCKED",
                    "msg": "Device Active. Enter DFU to begin chain-breaking.",
                    "mode": "NORMAL",
                    "pid": hex(pid),
                    "color": "#FF0000"  # Red Locked
                }
        
        # Unknown device signature
        return {
            "status": "UNKNOWN",
            "msg": f"Device detected but signature unrecognized (PID: {hex(devices[0].idProduct)})",
            "mode": "UNKNOWN",
            "pid": hex(devices[0].idProduct),
            "color": "#888888"
        }
        
    except Exception as e:
        return {
            "status": "ERROR",
            "msg": f"Hardware scan error: {str(e)}",
            "mode": None,
            "color": "#FF0000"
        }


def get_device_info(device) -> dict:
    """
    Get detailed device information
    
    Args:
        device: USB device object
        
    Returns:
        dict with device information
    """
    try:
        return {
            "vendor_id": hex(device.idVendor),
            "product_id": hex(device.idProduct),
            "serial_number": usb.util.get_string(device, device.iSerialNumber) if device.iSerialNumber else "Unknown",
            "manufacturer": usb.util.get_string(device, device.iManufacturer) if device.iManufacturer else "Apple",
            "product": usb.util.get_string(device, device.iProduct) if device.iProduct else "Unknown"
        }
    except:
        return {
            "vendor_id": hex(device.idVendor),
            "product_id": hex(device.idProduct),
            "serial_number": "Unknown",
            "manufacturer": "Apple",
            "product": "Unknown"
        }
