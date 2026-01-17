"""
Pandora Codex - FastAPI Routes
API endpoints for hardware manipulation (Chain-Breaker UI)
"""

from fastapi import APIRouter, HTTPException, Header, WebSocket
from typing import Optional
import time
import asyncio

from backend.modules.pandora.detector import scan_for_hardware, get_device_info
from backend.modules.pandora.dfu_entry import enter_dfu_mode, detect_dfu_entry
from backend.modules.pandora.jailbreak import execute_checkm8, execute_palera1n, execute_unc0ver, get_supported_exploit

router = APIRouter()


def verify_auth(x_secret_room_passcode: Optional[str] = Header(None)):
    """Verify Trapdoor authentication"""
    if not x_secret_room_passcode:
        raise HTTPException(status_code=401, detail="Trapdoor authentication required")
    return True


@router.get("/hardware/status")
async def get_hardware_status(x_secret_room_passcode: Optional[str] = Header(None)):
    """Get current hardware status (DFU/Recovery/Normal)"""
    verify_auth(x_secret_room_passcode)
    
    return scan_for_hardware()


@router.websocket("/hardware/stream")
async def hardware_stream(websocket: WebSocket):
    """WebSocket stream for real-time hardware status"""
    await websocket.accept()
    
    try:
        while True:
            # Scan hardware every second
            status = scan_for_hardware()
            await websocket.send_json(status)
            
            await asyncio.sleep(1)
    except Exception as e:
        print(f"WebSocket error: {e}")


@router.post("/enter-dfu")
async def enter_dfu(
    device_serial: Optional[str] = None,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    """Enter DFU mode on connected device"""
    verify_auth(x_secret_room_passcode)
    
    result = enter_dfu_mode(device_serial)
    return result


@router.post("/jailbreak")
async def execute_jailbreak(
    exploit: str,
    device_serial: Optional[str] = None,
    ios_version: Optional[str] = None,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    """Execute jailbreak exploit"""
    verify_auth(x_secret_room_passcode)
    
    if exploit == "checkm8":
        result = execute_checkm8(device_serial or "unknown", ios_version or "unknown")
    elif exploit == "palera1n":
        result = execute_palera1n(device_serial or "unknown", ios_version or "unknown")
    elif exploit == "unc0ver":
        result = execute_unc0ver(device_serial or "unknown", ios_version or "unknown")
    else:
        raise HTTPException(status_code=400, detail=f"Unknown exploit: {exploit}")
    
    return result


@router.post("/flash")
async def flash_firmware(
    firmware_path: str,
    device_serial: Optional[str] = None,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    """Flash firmware to device"""
    verify_auth(x_secret_room_passcode)
    
    # TODO: Implement actual flashing logic
    return {
        "status": "pending",
        "message": "Flash operation initiated",
        "firmware": firmware_path,
        "device": device_serial
    }
