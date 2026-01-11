"""
Sonic Codex - FastAPI Routes
API endpoints for audio forensic intelligence
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Header, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path
from typing import Optional
import asyncio
import json

from backend.modules.sonic.upload import save_uploaded_file
from backend.modules.sonic.extractor import extract_audio_from_url
from backend.modules.sonic.job_manager import SonicJob, JobStage
from backend.modules.sonic.enhancement.preprocess import apply_forensic_preprocessing
from backend.modules.sonic.enhancement.consonant_boost import apply_consonant_recovery
from backend.modules.sonic.enhancement.presets import get_preset_filter, list_presets
from backend.modules.sonic.transcription.whisper_engine import get_transcriber
from backend.modules.sonic.transcription.diarization import get_diarizer
from backend.modules.sonic.exporter import create_job_package
from backend.modules.sonic.export_formats import export_to_srt, export_to_txt, export_to_json
try:
    from backend.modules.sonic.capture import LiveAudioCapture
    LIVE_CAPTURE_AVAILABLE = True
except (ImportError, RuntimeError):
    LIVE_CAPTURE_AVAILABLE = False
    LiveAudioCapture = None

# Optional: DeepFilterNet (Tier 2)
try:
    from backend.modules.sonic.enhancement.deepfilter import apply_neural_dereverberation, is_available as df_available
    DEEPFILTERNET_AVAILABLE = df_available()
except ImportError:
    DEEPFILTERNET_AVAILABLE = False

router = APIRouter()
JOBS_DIR = Path("jobs")


def verify_auth(x_secret_room_passcode: Optional[str] = Header(None)):
    """Verify Trapdoor authentication"""
    if not x_secret_room_passcode:
        raise HTTPException(status_code=401, detail="Trapdoor authentication required")
    return True


@router.get("/presets")
async def get_presets():
    """Get list of available enhancement presets"""
    return {"presets": list_presets()}


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    device: str = "Unknown",
    title: str = "Untitled",
    x_secret_room_passcode: Optional[str] = Header(None)
):
    """Upload audio/video file for processing"""
    verify_auth(x_secret_room_passcode)
    
    # Create new job
    job = SonicJob.create_new(device, title, JOBS_DIR)
    
    try:
        # Save uploaded file
        file_info = await save_uploaded_file(file, job.job_id, JOBS_DIR)
        job.set_output("original", file_info["file_path"])
        job.set_metadata("file_info", file_info)
        job.update_stage(JobStage.PREPROCESSING, 10)
        
        return {
            "job_id": job.job_id,
            "status": "uploaded",
            "file_info": file_info
        }
    except Exception as e:
        job.add_error(str(e))
        job.update_stage(JobStage.FAILED_UPLOAD)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/extract")
async def extract_from_url(
    url: str,
    device: str = "URL_Source",
    title: Optional[str] = None,
    format_preference: str = "wav",
    x_secret_room_passcode: Optional[str] = Header(None)
):
    """Extract audio from URL (YouTube, TikTok, etc.)"""
    verify_auth(x_secret_room_passcode)
    
    # Create new job
    job_title = title or "URL_Extraction"
    job = SonicJob.create_new(device, job_title, JOBS_DIR)
    
    try:
        job.update_stage(JobStage.UPLOADING, 5)
        
        # Extract audio from URL
        file_info = extract_audio_from_url(
            url,
            job.path,
            format_preference=format_preference
        )
        
        # Use metadata title if available
        if file_info.get("metadata", {}).get("title"):
            job.title = file_info["metadata"]["title"]
            job.base_name = f"{device}_{job.date_str}_{job.title}".replace(" ", "_")
        
        job.set_output("original", file_info["file_path"])
        job.set_metadata("file_info", file_info)
        job.set_metadata("source_url", url)
        job.update_stage(JobStage.PREPROCESSING, 10)
        
        return {
            "job_id": job.job_id,
            "status": "extracted",
            "file_info": file_info
        }
    except Exception as e:
        job.add_error(str(e))
        job.update_stage(JobStage.FAILED_UPLOAD)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/jobs/{job_id}/enhance")
async def enhance_audio(
    job_id: str,
    preset: str = "Speech Clear",
    x_secret_room_passcode: Optional[str] = Header(None)
):
    """Apply audio enhancement to job"""
    verify_auth(x_secret_room_passcode)
    
    job = SonicJob.load(job_id, JOBS_DIR)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if "original" not in job.outputs:
        raise HTTPException(status_code=400, detail="No original file found")
    
    try:
        job.update_stage(JobStage.ENHANCING, 30)
        
        # Get preset config
        preset_config = get_preset_filter(preset)
        
        # Apply preprocessing
        input_path = job.outputs["original"]
        preprocessed_path = job.path / "preprocessed.wav"
        apply_forensic_preprocessing(input_path, str(preprocessed_path))
        
        # Apply neural enhancement if Super Sonic and available
        if preset_config.get("deepfilternet") and DEEPFILTERNET_AVAILABLE:
            neural_path = job.path / "neural_enhanced.wav"
            try:
                apply_neural_dereverberation(str(preprocessed_path), str(neural_path))
                preprocessed_path = neural_path  # Use neural output for next step
                job.set_metadata("neural_enhancement", True)
            except Exception as e:
                job.add_error(f"Neural enhancement failed: {str(e)}, using standard enhancement")
        
        # Apply consonant boost
        enhanced_path = job.path / job.get_enhanced_filename()
        apply_consonant_recovery(
            str(preprocessed_path),
            str(enhanced_path),
            gain_db=preset_config.get("gain_db", 6.0)
        )
        
        job.set_output("enhanced", str(enhanced_path))
        job.set_metadata("preset", preset)
        job.update_stage(JobStage.TRANSCRIBING, 50)
        
        return {
            "job_id": job_id,
            "status": "enhanced",
            "enhanced_file": str(enhanced_path)
        }
    except Exception as e:
        job.add_error(str(e))
        job.update_stage(JobStage.FAILED_ENHANCE)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/jobs/{job_id}/transcribe")
async def transcribe_audio(
    job_id: str,
    language: Optional[str] = None,
    translate: bool = True,
    diarize: bool = False,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    """Transcribe audio using Whisper, optionally with speaker diarization"""
    verify_auth(x_secret_room_passcode)
    
    job = SonicJob.load(job_id, JOBS_DIR)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    audio_path = job.outputs.get("enhanced") or job.outputs.get("original")
    if not audio_path:
        raise HTTPException(status_code=400, detail="No audio file found")
    
    try:
        job.update_stage(JobStage.TRANSCRIBING, 60)
        
        # Get transcriber
        transcriber = get_transcriber()
        
        # Transcribe
        result = transcriber.transcribe(
            audio_path,
            language=language,
            translate=translate,
            beam_size=10
        )
        
        # Apply speaker diarization if requested
        if diarize:
            try:
                diarizer = get_diarizer()
                speaker_segments = diarizer.identify_speakers(audio_path)
                merged_segments = diarizer.merge_with_transcript(
                    result["segments"],
                    speaker_segments
                )
                result["segments"] = merged_segments
                result["diarization"] = True
                job.set_metadata("diarization", True)
            except Exception as e:
                # Diarization failed, but transcription succeeded
                job.add_error(f"Diarization failed: {str(e)}")
                result["diarization"] = False
        
        # Save transcripts
        transcript_orig_path = job.path / "transcript_original.json"
        transcript_en_path = job.path / "transcript_english.json"
        
        with open(transcript_orig_path, 'w') as f:
            json.dump(result, f, indent=2)
        
        # If translation occurred, save English version
        if translate and result["language"] != "en":
            with open(transcript_en_path, 'w') as f:
                json.dump(result, f, indent=2)
            job.set_output("transcript_en", str(transcript_en_path))
        
        job.set_output("transcript_original", str(transcript_orig_path))
        job.set_metadata("language", result["language"])
        job.set_metadata("language_probability", result["language_probability"])
        job.update_stage(JobStage.COMPLETE, 100)
        
        return {
            "job_id": job_id,
            "status": "complete",
            "transcription": result
        }
    except Exception as e:
        job.add_error(str(e))
        job.update_stage(JobStage.FAILED_TRANSCRIBE)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jobs")
async def list_jobs(x_secret_room_passcode: Optional[str] = Header(None)):
    """List all jobs"""
    verify_auth(x_secret_room_passcode)
    
    jobs = []
    for job_dir in JOBS_DIR.iterdir():
        if job_dir.is_dir():
            job = SonicJob.load(job_dir.name, JOBS_DIR)
            if job:
                jobs.append({
                    "job_id": job.job_id,
                    "title": job.title,
                    "device": job.device,
                    "stage": job.stage.value,
                    "progress": job.progress,
                    "created": job.date_str
                })
    
    return {"jobs": jobs}


@router.get("/jobs/{job_id}")
async def get_job(job_id: str, x_secret_room_passcode: Optional[str] = Header(None)):
    """Get job details"""
    verify_auth(x_secret_room_passcode)
    
    job = SonicJob.load(job_id, JOBS_DIR)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    manifest_path = job.path / "manifest.json"
    with open(manifest_path, 'r') as f:
        manifest = json.load(f)
    
    return manifest


@router.get("/jobs/{job_id}/download")
async def download_package(
    job_id: str,
    format: str = "zip",
    x_secret_room_passcode: Optional[str] = Header(None)
):
    """Download job package or specific format"""
    verify_auth(x_secret_room_passcode)
    
    job = SonicJob.load(job_id, JOBS_DIR)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Load transcript
    transcript_path = job.outputs.get("transcript_original")
    if not transcript_path or not Path(transcript_path).exists():
        raise HTTPException(status_code=404, detail="Transcript not found")
    
    with open(transcript_path, 'r') as f:
        transcript_data = json.load(f)
    
    segments = transcript_data.get("segments", [])
    
    if format == "zip":
        # Return ZIP package
        zip_path = create_job_package(job_id, JOBS_DIR)
        if not zip_path:
            raise HTTPException(status_code=500, detail="Failed to create package")
        return FileResponse(
            path=zip_path,
            filename=Path(zip_path).name,
            media_type='application/zip'
        )
    elif format == "srt":
        # Export as SRT
        srt_path = job.path / f"{job.base_name}.srt"
        if export_to_srt(segments, srt_path):
            return FileResponse(
                path=str(srt_path),
                filename=srt_path.name,
                media_type='text/plain'
            )
        raise HTTPException(status_code=500, detail="Failed to export SRT")
    elif format == "txt":
        # Export as TXT
        txt_path = job.path / f"{job.base_name}.txt"
        if export_to_txt(segments, txt_path, include_timestamps=True):
            return FileResponse(
                path=str(txt_path),
                filename=txt_path.name,
                media_type='text/plain'
            )
        raise HTTPException(status_code=500, detail="Failed to export TXT")
    elif format == "json":
        # Export as JSON
        json_path = job.path / f"{job.base_name}_export.json"
        if export_to_json(segments, json_path):
            return FileResponse(
                path=str(json_path),
                filename=json_path.name,
                media_type='application/json'
            )
        raise HTTPException(status_code=500, detail="Failed to export JSON")
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported format: {format}")


@router.post("/capture/start")
async def start_live_capture(
    device: str = "Microphone",
    title: str = "Live_Recording",
    sample_rate: int = 44100,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    """Start live audio capture"""
    verify_auth(x_secret_room_passcode)
    
    # Create new job
    job = SonicJob.create_new(device, title, JOBS_DIR)
    job.update_stage(JobStage.UPLOADING, 5)
    
    # Initialize capture
    capture = LiveAudioCapture(sample_rate=sample_rate)
    
    # Set output path
    output_path = job.path / f"{job.base_name}_LIVE.wav"
    
    # Start recording
    capture.start_recording(output_path=output_path)
    
    # Store capture instance (in production, use proper session management)
    # For now, return job_id and instructions
    
    return {
        "job_id": job.job_id,
        "status": "recording",
        "output_path": str(output_path),
        "sample_rate": sample_rate
    }


@router.post("/capture/stop")
async def stop_live_capture(
    job_id: str,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    """Stop live audio capture and process"""
    verify_auth(x_secret_room_passcode)
    
    job = SonicJob.load(job_id, JOBS_DIR)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # TODO: Retrieve capture instance from session
    # For now, assume file was saved
    
    job.update_stage(JobStage.PREPROCESSING, 10)
    
    return {
        "job_id": job_id,
        "status": "stopped",
        "message": "Recording stopped. Ready for processing."
    }


@router.get("/capture/devices")
async def get_capture_devices(x_secret_room_passcode: Optional[str] = Header(None)):
    """Get available audio input devices"""
    verify_auth(x_secret_room_passcode)
    
    try:
        capture = LiveAudioCapture()
        devices = capture.get_available_devices()
        capture.cleanup()
        return {"devices": devices}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get devices: {str(e)}")


@router.websocket("/ws/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    """WebSocket endpoint for real-time job updates"""
    await websocket.accept()
    
    try:
        while True:
            # Send heartbeat
            await websocket.send_json({"type": "ping"})
            
            # Load job status
            job = SonicJob.load(job_id, JOBS_DIR)
            if job:
                await websocket.send_json({
                    "type": "status",
                    "stage": job.stage.value,
                    "progress": job.progress
                })
            
            await asyncio.sleep(2)  # Update every 2 seconds
            
    except WebSocketDisconnect:
        pass
