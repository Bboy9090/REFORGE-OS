"""
Phoenix Key - Authentication Routes
API endpoints for Phoenix Key authentication
"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
import json

from backend.modules.auth.phoenix import get_phoenix_auth

router = APIRouter()


@router.post("/unlock")
async def unlock_phoenix_key(
    sequence: Optional[str] = None,
    gesture: Optional[list] = None
):
    """
    Unlock Phoenix Key with sequence or gesture
    
    Args:
        sequence: Secret sequence string
        gesture: Gesture pattern array
        
    Returns:
        Authentication token
    """
    auth = get_phoenix_auth()
    
    # Validate sequence or gesture
    if sequence:
        if auth.validate_sequence(sequence):
            token = auth.generate_token()
            return {"token": token, "status": "unlocked"}
        else:
            raise HTTPException(status_code=401, detail="Invalid sequence")
    
    elif gesture:
        # For gesture, we'll use a simple pattern match
        # In production, this would be more sophisticated
        expected_pattern = [1, 2, 3, 2, 1]
        if gesture == expected_pattern:
            token = auth.generate_token()
            return {"token": token, "status": "unlocked"}
        else:
            raise HTTPException(status_code=401, detail="Invalid gesture pattern")
    
    else:
        raise HTTPException(status_code=400, detail="Sequence or gesture required")


@router.post("/validate")
async def validate_token(
    token: str,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    """Validate Phoenix Key token"""
    auth = get_phoenix_auth()
    
    # Also accept header for backward compatibility
    token_to_check = token or x_secret_room_passcode
    
    if not token_to_check:
        raise HTTPException(status_code=400, detail="Token required")
    
    if auth.validate_token(token_to_check):
        return {"valid": True, "status": "authenticated"}
    else:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.post("/revoke")
async def revoke_token(
    token: str,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    """Revoke Phoenix Key token"""
    auth = get_phoenix_auth()
    token_to_revoke = token or x_secret_room_passcode
    
    if token_to_revoke:
        auth.revoke_token(token_to_revoke)
        return {"status": "revoked"}
    
    raise HTTPException(status_code=400, detail="Token required")
