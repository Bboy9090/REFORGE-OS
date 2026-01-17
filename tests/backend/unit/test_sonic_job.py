"""
Unit Tests - Sonic Codex Job Management
"""

import pytest
from pathlib import Path
from backend.modules.sonic.job_manager import SonicJob, JobStage
import tempfile
import shutil


@pytest.fixture
def temp_jobs_dir():
    """Create temporary jobs directory"""
    temp_dir = tempfile.mkdtemp()
    yield Path(temp_dir)
    shutil.rmtree(temp_dir)


def test_create_job(temp_jobs_dir):
    """Test job creation"""
    job = SonicJob.create_new("iPhone_13", "Test_Job", temp_jobs_dir)
    
    assert job.job_id is not None
    assert job.device == "iPhone_13"
    assert job.title == "Test_Job"
    assert job.path.exists()
    assert job.stage == JobStage.UPLOADING


def test_job_naming(temp_jobs_dir):
    """Test human-readable naming"""
    job = SonicJob.create_new("iPhone_13_Pro", "Meeting_Notes", temp_jobs_dir)
    
    assert "iPhone_13_Pro" in job.base_name
    assert "Meeting_Notes" in job.base_name
    assert job.date_str in job.base_name


def test_update_stage(temp_jobs_dir):
    """Test stage updates"""
    job = SonicJob.create_new("Device", "Test", temp_jobs_dir)
    
    job.update_stage(JobStage.ENHANCING, 50)
    assert job.stage == JobStage.ENHANCING
    assert job.progress == 50


def test_manifest_creation(temp_jobs_dir):
    """Test manifest.json creation"""
    job = SonicJob.create_new("Device", "Test", temp_jobs_dir)
    
    manifest_path = job.path / "manifest.json"
    assert manifest_path.exists()
    
    import json
    with open(manifest_path, 'r') as f:
        manifest = json.load(f)
    
    assert manifest["job_id"] == job.job_id
    assert manifest["metadata"]["device"] == "Device"
    assert manifest["pipeline"]["stage"] == "uploading"


def test_load_job(temp_jobs_dir):
    """Test loading existing job"""
    job = SonicJob.create_new("Device", "Test", temp_jobs_dir)
    job_id = job.job_id
    
    loaded_job = SonicJob.load(job_id, temp_jobs_dir)
    
    assert loaded_job is not None
    assert loaded_job.job_id == job_id
    assert loaded_job.device == "Device"
    assert loaded_job.title == "Test"
