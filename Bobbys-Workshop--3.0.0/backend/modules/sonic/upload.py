"""
Sonic Codex - File Upload Handler
Handles audio/video file uploads with validation
"""

from fastapi import UploadFile, HTTPException
from pathlib import Path
import aiofiles
from typing import Optional
import os

# Supported formats
AUDIO_FORMATS = {'.mp3', '.wav', '.m4a', '.flac', '.ogg', '.aac'}
VIDEO_FORMATS = {'.mp4', '.mov', '.avi', '.mkv', '.webm'}
ALLOWED_FORMATS = AUDIO_FORMATS | VIDEO_FORMATS

MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB


async def save_uploaded_file(
    file: UploadFile,
    job_id: str,
    jobs_dir: Path
) -> dict:
    """
    Save uploaded file and return metadata
    
    Args:
        file: Uploaded file
        job_id: Unique job identifier
        jobs_dir: Base directory for jobs
        
    Returns:
        dict with file path and metadata
    """
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_FORMATS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Allowed: {', '.join(ALLOWED_FORMATS)}"
        )
    
    # Create job directory
    job_dir = jobs_dir / job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    
    # Save file
    file_path = job_dir / f"original{file_ext}"
    
    # Check file size as we write
    file_size = 0
    async with aiofiles.open(file_path, 'wb') as f:
        while chunk := await file.read(8192):  # 8KB chunks
            file_size += len(chunk)
            if file_size > MAX_FILE_SIZE:
                os.remove(file_path)
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large. Maximum size: {MAX_FILE_SIZE / (1024*1024):.0f}MB"
                )
            await f.write(chunk)
    
    return {
        "file_path": str(file_path),
        "file_name": file.filename,
        "file_size": file_size,
        "file_type": "audio" if file_ext in AUDIO_FORMATS else "video",
        "extension": file_ext
    }
