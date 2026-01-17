"""
Sonic Codex - Whisper Transcription Engine
Uses faster-whisper for local processing or OpenAI API
"""

from pathlib import Path
from typing import Optional, Dict, List
import json

try:
    from faster_whisper import WhisperModel
    FASTER_WHISPER_AVAILABLE = True
except ImportError:
    FASTER_WHISPER_AVAILABLE = False
    print("Warning: faster-whisper not available. Install with: pip install faster-whisper")


class WhisperTranscriber:
    """Whisper transcription engine wrapper"""
    
    def __init__(self, model_size: str = "large-v3", device: str = "cpu"):
        """
        Initialize Whisper model
        
        Args:
            model_size: Model size (tiny, base, small, medium, large-v3)
            device: Device to use (cpu, cuda)
        """
        if not FASTER_WHISPER_AVAILABLE:
            raise RuntimeError("faster-whisper is not installed")
        
        self.model = WhisperModel(model_size, device=device)
        self.model_size = model_size
    
    def transcribe(
        self,
        audio_path: str,
        language: Optional[str] = None,
        translate: bool = True,
        beam_size: int = 10
    ) -> Dict:
        """
        Transcribe audio file
        
        Args:
            audio_path: Path to audio file
            language: Language code (auto-detect if None)
            translate: Force translation to English
            beam_size: Beam size for decoding (higher = more accurate, slower)
            
        Returns:
            dict with transcription results
        """
        # Transcribe
        segments, info = self.model.transcribe(
            audio_path,
            language=language,
            task="translate" if translate else "transcribe",
            beam_size=beam_size,
            patience=2.0
        )
        
        # Convert segments to list
        segment_list = []
        for segment in segments:
            segment_list.append({
                "start": segment.start,
                "end": segment.end,
                "text": segment.text.strip(),
                "confidence": getattr(segment, 'avg_logprob', 0.0)  # Log probability as confidence
            })
        
        return {
            "language": info.language,
            "language_probability": info.language_probability,
            "duration": info.duration,
            "segments": segment_list,
            "full_text": " ".join([s["text"] for s in segment_list])
        }
    
    def detect_language(self, audio_path: str) -> Dict:
        """
        Detect language of audio file
        
        Args:
            audio_path: Path to audio file
            
        Returns:
            dict with language detection results
        """
        _, info = self.model.transcribe(audio_path, task="transcribe", beam_size=1)
        
        return {
            "language": info.language,
            "language_probability": info.language_probability
        }


# Global transcriber instance (lazy loaded)
_transcriber: Optional[WhisperTranscriber] = None


def get_transcriber() -> WhisperTranscriber:
    """Get or create global transcriber instance"""
    global _transcriber
    if _transcriber is None:
        _transcriber = WhisperTranscriber()
    return _transcriber
