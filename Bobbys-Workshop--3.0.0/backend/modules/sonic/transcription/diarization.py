"""
Sonic Codex - Speaker Diarization
Identify and label different speakers using pyannote.audio
"""

from pathlib import Path
from typing import List, Dict
import json

try:
    from pyannote.audio import Pipeline
    PYANNOTE_AVAILABLE = True
except ImportError:
    PYANNOTE_AVAILABLE = False
    print("Warning: pyannote.audio not available. Install with: pip install pyannote.audio")


class SpeakerDiarizer:
    """Speaker diarization using pyannote.audio"""
    
    def __init__(self):
        """Initialize diarization pipeline"""
        if not PYANNOTE_AVAILABLE:
            raise RuntimeError("pyannote.audio is not installed")
        
        # Load pre-trained pipeline
        # Note: First run will download the model (~1.5GB)
        self.pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            use_auth_token=None  # Set token if using HuggingFace model
        )
    
    def identify_speakers(
        self,
        audio_path: str,
        num_speakers: int = None
    ) -> List[Dict]:
        """
        Identify speakers in audio file
        
        Args:
            audio_path: Path to audio file
            num_speakers: Expected number of speakers (auto-detect if None)
            
        Returns:
            List of speaker segments with timestamps
        """
        # Run diarization
        diarization = self.pipeline(
            audio_path,
            num_speakers=num_speakers
        )
        
        # Convert to list of segments
        segments = []
        for turn, _, speaker in diarization.itertracks(yield_label=True):
            segments.append({
                "start": turn.start,
                "end": turn.end,
                "speaker": speaker,
                "duration": turn.end - turn.start
            })
        
        return segments
    
    def merge_with_transcript(
        self,
        transcript_segments: List[Dict],
        speaker_segments: List[Dict]
    ) -> List[Dict]:
        """
        Merge transcript segments with speaker labels
        
        Args:
            transcript_segments: Transcript segments from Whisper
            speaker_segments: Speaker segments from diarization
            
        Returns:
            Merged segments with speaker labels
        """
        merged = []
        
        for transcript_seg in transcript_segments:
            # Find overlapping speaker segment
            speaker = "Unknown"
            for speaker_seg in speaker_segments:
                # Check if transcript segment overlaps with speaker segment
                if (transcript_seg["start"] >= speaker_seg["start"] and 
                    transcript_seg["start"] < speaker_seg["end"]):
                    speaker = speaker_seg["speaker"]
                    break
            
            merged.append({
                **transcript_seg,
                "speaker": speaker
            })
        
        return merged


# Global diarizer instance (lazy loaded)
_diarizer: 'SpeakerDiarizer' = None


def get_diarizer() -> 'SpeakerDiarizer':
    """Get or create global diarizer instance"""
    global _diarizer
    if _diarizer is None:
        _diarizer = SpeakerDiarizer()
    return _diarizer
