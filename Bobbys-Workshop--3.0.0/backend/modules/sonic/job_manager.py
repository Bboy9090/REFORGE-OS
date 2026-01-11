"""
Sonic Codex - Job State Management
Manages job lifecycle and state transitions
"""

from enum import Enum
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict
import json
import uuid


class JobStage(Enum):
    """Job processing stages"""
    UPLOADING = "uploading"
    PREPROCESSING = "preprocessing"
    ENHANCING = "enhancing"
    TRANSCRIBING = "transcribing"
    TRANSLATING = "translating"
    PACKAGING = "packaging"
    COMPLETE = "complete"
    FAILED_UPLOAD = "failed_upload"
    FAILED_ENHANCE = "failed_enhance"
    FAILED_TRANSCRIBE = "failed_transcribe"


class SonicJob:
    """Manages a single Sonic Codex job"""
    
    def __init__(
        self,
        job_id: str,
        device: str = "Unknown",
        title: str = "Untitled",
        jobs_dir: Path = Path("jobs")
    ):
        """
        Initialize job
        
        Args:
            job_id: Unique job identifier
            device: Device name
            title: Job title
            jobs_dir: Base directory for jobs
        """
        self.job_id = job_id
        self.device = device
        self.title = title
        self.date_str = datetime.now().strftime("%Y-%m-%d_%H%M")
        self.base_name = f"{device}_{self.date_str}_{title}".replace(" ", "_")
        self.jobs_dir = jobs_dir
        self.path = jobs_dir / job_id
        self.path.mkdir(parents=True, exist_ok=True)
        
        self.stage = JobStage.UPLOADING
        self.progress = 0
        self.metadata = {}
        self.outputs = {}
        self.errors = []
        
        # Initialize manifest
        self._save_manifest()
    
    def update_stage(self, stage: JobStage, progress: int = None):
        """Update job stage and progress"""
        self.stage = stage
        if progress is not None:
            self.progress = progress
        self._save_manifest()
    
    def set_metadata(self, key: str, value: any):
        """Set metadata value"""
        self.metadata[key] = value
        self._save_manifest()
    
    def set_output(self, key: str, value: str):
        """Set output file path"""
        self.outputs[key] = value
        self._save_manifest()
    
    def add_error(self, error: str):
        """Add error message"""
        self.errors.append({
            "message": error,
            "timestamp": datetime.now().isoformat()
        })
        self._save_manifest()
    
    def _save_manifest(self):
        """Save manifest.json"""
        manifest = {
            "job_id": self.job_id,
            "metadata": {
                "title": self.title,
                "device": self.device,
                "timestamp": datetime.now().isoformat(),
                "base_name": self.base_name,
                **self.metadata
            },
            "pipeline": {
                "stage": self.stage.value,
                "progress": self.progress
            },
            "outputs": self.outputs,
            "errors": self.errors
        }
        
        manifest_path = self.path / "manifest.json"
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)
    
    def get_enhanced_filename(self) -> str:
        """Get enhanced audio filename"""
        return f"{self.base_name}_ENHANCED.wav"
    
    @classmethod
    def create_new(cls, device: str, title: str, jobs_dir: Path = Path("jobs")) -> 'SonicJob':
        """Create a new job"""
        job_id = str(uuid.uuid4())[:8]
        return cls(job_id, device, title, jobs_dir)
    
    @classmethod
    def load(cls, job_id: str, jobs_dir: Path = Path("jobs")) -> Optional['SonicJob']:
        """Load existing job from manifest"""
        job_path = jobs_dir / job_id
        manifest_path = job_path / "manifest.json"
        
        if not manifest_path.exists():
            return None
        
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
        
        job = cls(
            job_id=manifest["job_id"],
            device=manifest["metadata"]["device"],
            title=manifest["metadata"]["title"],
            jobs_dir=jobs_dir
        )
        
        job.stage = JobStage(manifest["pipeline"]["stage"])
        job.progress = manifest["pipeline"]["progress"]
        job.metadata = {k: v for k, v in manifest["metadata"].items() if k not in ["title", "device", "timestamp", "base_name"]}
        job.outputs = manifest.get("outputs", {})
        job.errors = manifest.get("errors", [])
        
        return job
