"""
Integration Tests - Sonic Codex Full Pipeline
"""

import pytest
from pathlib import Path
from backend.modules.sonic.job_manager import SonicJob, JobStage
from backend.modules.sonic.enhancement.preprocess import apply_forensic_preprocessing
from backend.modules.sonic.enhancement.consonant_boost import apply_consonant_recovery
import tempfile
import shutil
import numpy as np
import soundfile as sf


@pytest.fixture
def temp_jobs_dir():
    """Create temporary jobs directory"""
    temp_dir = tempfile.mkdtemp()
    yield Path(temp_dir)
    shutil.rmtree(temp_dir)


@pytest.fixture
def sample_audio_file(temp_jobs_dir):
    """Create sample audio file for testing"""
    # Generate a simple sine wave
    sample_rate = 44100
    duration = 2.0  # 2 seconds
    frequency = 440  # A4 note
    
    t = np.linspace(0, duration, int(sample_rate * duration))
    audio = np.sin(2 * np.pi * frequency * t)
    
    # Add some noise
    noise = np.random.normal(0, 0.1, len(audio))
    audio = audio + noise
    
    # Normalize
    audio = audio / np.max(np.abs(audio))
    
    output_path = temp_jobs_dir / "test_audio.wav"
    sf.write(str(output_path), audio, sample_rate)
    
    return output_path


def test_full_pipeline_happy_path(temp_jobs_dir, sample_audio_file):
    """Test complete pipeline: Job → Enhance → Process"""
    # Create job
    job = SonicJob.create_new("Test_Device", "Test_Job", temp_jobs_dir)
    job.set_output("original", str(sample_audio_file))
    
    # Update to preprocessing
    job.update_stage(JobStage.PREPROCESSING, 20)
    
    # Apply preprocessing
    preprocessed_path = job.path / "preprocessed.wav"
    result = apply_forensic_preprocessing(
        str(sample_audio_file),
        str(preprocessed_path)
    )
    
    assert preprocessed_path.exists()
    assert result["sample_rate"] == 44100
    
    # Apply consonant boost
    enhanced_path = job.path / job.get_enhanced_filename()
    boost_result = apply_consonant_recovery(
        str(preprocessed_path),
        str(enhanced_path),
        gain_db=6.0
    )
    
    assert enhanced_path.exists()
    assert boost_result["gain_db"] == 6.0
    
    # Update job
    job.set_output("enhanced", str(enhanced_path))
    job.update_stage(JobStage.COMPLETE, 100)
    
    # Verify manifest
    manifest_path = job.path / "manifest.json"
    assert manifest_path.exists()
    
    import json
    with open(manifest_path, 'r') as f:
        manifest = json.load(f)
    
    assert manifest["pipeline"]["stage"] == "complete"
    assert manifest["pipeline"]["progress"] == 100
    assert "enhanced" in manifest["outputs"]
