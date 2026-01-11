"""
Ghost Codex - FastAPI Routes
API endpoints for stealth and identity protection
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Header, Request
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path
from typing import Optional
import json

from backend.modules.ghost.shredder import (
    shred_media_metadata,
    shred_image_metadata,
    shred_folder,
    generate_ghost_filename
)
from backend.modules.ghost.canary import generate_bait_file, log_canary_alert
from backend.modules.ghost.persona import get_persona_generator

router = APIRouter()


def verify_auth(x_secret_room_passcode: Optional[str] = Header(None)):
    """Verify Trapdoor authentication"""
    if not x_secret_room_passcode:
        raise HTTPException(status_code=401, detail="Trapdoor authentication required")
    return True


@router.post("/shred")
async def shred_file(
    file: UploadFile = File(...),
    x_secret_room_passcode: Optional[str] = Header(None)
):
    """Shred metadata from uploaded file"""
    verify_auth(x_secret_room_passcode)
    
    # Save uploaded file temporarily
    temp_path = Path(f"temp_{file.filename}")
    with open(temp_path, 'wb') as f:
        content = await file.read()
        f.write(content)
    
    # Determine file type
    ext = temp_path.suffix.lower()
    output_path = Path(f"ghost_{generate_ghost_filename(file.filename)}")
    
    success = False
    if ext in {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'}:
        success = shred_image_metadata(str(temp_path), str(output_path))
    elif ext in {'.mp3', '.wav', '.mp4', '.mov', '.avi', '.mkv', '.m4a', '.flac'}:
        success = shred_media_metadata(str(temp_path), str(output_path))
    else:
        temp_path.unlink()
        raise HTTPException(status_code=400, detail="Unsupported file type")
    
    # Clean up temp file
    temp_path.unlink()
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to shred metadata")
    
    return FileResponse(
        path=str(output_path),
        filename=output_path.name,
        media_type='application/octet-stream'
    )


@router.post("/canary/generate")
async def create_canary_token(
    token_id: str,
    filename: str,
    callback_url: str,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    """Generate a canary token bait file"""
    verify_auth(x_secret_room_passcode)
    
    bait_path = generate_bait_file(token_id, filename, callback_url)
    
    return {
        "token_id": token_id,
        "bait_file": bait_path,
        "status": "created"
    }


@router.get("/trap/{token_id}")
async def canary_trap(token_id: str, request: Request):
    """
    Canary token alert endpoint
    Called when bait file is accessed
    """
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    
    log_canary_alert(token_id, client_ip, user_agent)
    
    # Return 200 OK so they suspect nothing
    return {"status": "ok"}


@router.get("/alerts")
async def get_alerts(
    x_secret_room_passcode: Optional[str] = Header(None),
    log_file: str = "ghost_codex_alerts.json"
):
    """Get all canary token alerts"""
    verify_auth(x_secret_room_passcode)
    
    log_path = Path(log_file)
    if not log_path.exists():
        return {"alerts": []}
    
    with open(log_path, 'r') as f:
        alerts = json.load(f)
    
    return {"alerts": alerts}


@router.post("/persona/email")
async def generate_email_persona(
    expires_in_hours: int = 24,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    """Generate temporary email persona"""
    verify_auth(x_secret_room_passcode)
    
    generator = get_persona_generator()
    persona = generator.generate_email(expires_in_hours=expires_in_hours)
    
    return persona


@router.post("/persona/phone")
async def generate_phone_persona(
    expires_in_days: int = 7,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    """Generate temporary phone persona"""
    verify_auth(x_secret_room_passcode)
    
    generator = get_persona_generator()
    persona = generator.generate_phone(expires_in_days=expires_in_days)
    
    return persona


@router.get("/personas")
async def list_personas(x_secret_room_passcode: Optional[str] = Header(None)):
    """List all personas"""
    verify_auth(x_secret_room_passcode)
    
    generator = get_persona_generator()
    personas = generator.list_personas()
    
    return {"personas": personas}


@router.delete("/personas/{persona_id}")
async def delete_persona(
    persona_id: str,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    """Delete persona"""
    verify_auth(x_secret_room_passcode)
    
    generator = get_persona_generator()
    success = generator.delete_persona(persona_id)
    
    if success:
        return {"status": "deleted"}
    else:
        raise HTTPException(status_code=404, detail="Persona not found")
