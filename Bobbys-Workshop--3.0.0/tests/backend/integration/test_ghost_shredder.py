"""
Integration Tests - Ghost Codex Metadata Shredder
"""

import pytest
from pathlib import Path
from backend.modules.ghost.shredder import shred_media_metadata, shred_image_metadata, generate_ghost_filename
import tempfile
import shutil
from PIL import Image
import numpy as np


@pytest.fixture
def temp_dir():
    """Create temporary directory"""
    temp_path = tempfile.mkdtemp()
    yield Path(temp_path)
    shutil.rmtree(temp_path)


def test_shred_image_metadata(temp_dir):
    """Test image metadata shredding"""
    # Create test image with metadata
    img = Image.new('RGB', (100, 100), color='red')
    input_path = temp_dir / "test.jpg"
    img.save(input_path, "JPEG")
    
    # Add EXIF data (simulated - PIL doesn't easily add EXIF in test)
    output_path = temp_dir / "shredded.jpg"
    
    result = shred_image_metadata(str(input_path), str(output_path))
    assert result is True
    assert output_path.exists()
    
    # Verify image can be opened
    shredded_img = Image.open(output_path)
    assert shredded_img.size == (100, 100)


def test_generate_ghost_filename():
    """Test ghost filename generation"""
    original = "/path/to/sensitive_file.mp4"
    ghost_name = generate_ghost_filename(original)
    
    assert ghost_name.startswith("ghost_")
    assert ghost_name.endswith(".mp4")
    assert len(ghost_name) > 10  # Should have hash


def test_shred_media_metadata_placeholder(temp_dir):
    """Test media metadata shredding (requires FFmpeg)"""
    # This test would require actual audio/video file
    # For now, we'll test the function exists and handles errors
    
    input_path = temp_dir / "nonexistent.mp3"
    output_path = temp_dir / "shredded.mp3"
    
    # Should handle missing file gracefully
    result = shred_media_metadata(str(input_path), str(output_path))
    # Function should return False for missing file
    assert result is False
