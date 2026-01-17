"""
Unit Tests - Export Format Converters
"""

import pytest
from pathlib import Path
from backend.modules.sonic.export_formats import export_to_srt, export_to_txt, export_to_json
import tempfile
import os


@pytest.fixture
def sample_segments():
    """Sample transcript segments for testing"""
    return [
        {
            "start": 0.0,
            "end": 2.5,
            "text": "Hello world",
            "speaker": "Speaker 1"
        },
        {
            "start": 2.5,
            "end": 5.0,
            "text": "How are you?",
            "speaker": "Speaker 2"
        },
        {
            "start": 5.0,
            "end": 7.5,
            "text": "I'm doing great!",
            "speaker": "Speaker 1"
        }
    ]


def test_export_srt(sample_segments):
    """Test SRT export"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.srt', delete=False) as f:
        output_path = Path(f.name)
    
    try:
        result = export_to_srt(sample_segments, output_path)
        assert result is True
        assert output_path.exists()
        
        content = output_path.read_text()
        assert "Hello world" in content
        assert "Speaker 1" in content
        assert "00:00:00,000" in content
    finally:
        os.unlink(output_path)


def test_export_txt(sample_segments):
    """Test TXT export"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        output_path = Path(f.name)
    
    try:
        result = export_to_txt(sample_segments, output_path, include_timestamps=True)
        assert result is True
        assert output_path.exists()
        
        content = output_path.read_text()
        assert "Hello world" in content
        assert "Speaker 1" in content
    finally:
        os.unlink(output_path)


def test_export_json(sample_segments):
    """Test JSON export"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        output_path = Path(f.name)
    
    try:
        result = export_to_json(sample_segments, output_path)
        assert result is True
        assert output_path.exists()
        
        import json
        with open(output_path, 'r') as f:
            data = json.load(f)
        
        assert "segments" in data
        assert len(data["segments"]) == 3
        assert data["segments"][0]["text"] == "Hello world"
    finally:
        os.unlink(output_path)
