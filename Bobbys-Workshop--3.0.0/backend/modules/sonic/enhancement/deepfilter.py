"""
Sonic Codex - DeepFilterNet Integration (Tier 2)
Neural dereverberation for maximum audio clarity
"""

from pathlib import Path
from typing import Optional
import numpy as np

try:
    from deepfilternet import df
    DEEPFILTERNET_AVAILABLE = True
except ImportError:
    DEEPFILTERNET_AVAILABLE = False
    print("Warning: DeepFilterNet not available. Install with: pip install deepfilternet")


def apply_neural_dereverberation(
    input_path: str,
    output_path: str,
    model: str = "DeepFilterNet3"
) -> dict:
    """
    Apply neural dereverberation using DeepFilterNet
    
    Args:
        input_path: Path to input audio file
        output_path: Path to save processed audio
        model: Model version to use
        
    Returns:
        dict with processing metadata
    """
    if not DEEPFILTERNET_AVAILABLE:
        raise RuntimeError("DeepFilterNet is not installed. This is a Tier 2 feature.")
    
    try:
        # Load audio
        audio, sample_rate = df.load_audio(input_path)
        
        # Apply DeepFilterNet processing
        # This removes room reverb and enhances speech
        enhanced_audio = df.enhance(audio, sr=sample_rate, model=model)
        
        # Save enhanced audio
        df.save_audio(output_path, enhanced_audio, sample_rate)
        
        return {
            "status": "success",
            "model": model,
            "sample_rate": int(sample_rate),
            "duration": len(enhanced_audio) / sample_rate
        }
    except Exception as e:
        raise RuntimeError(f"DeepFilterNet processing failed: {str(e)}")


def is_available() -> bool:
    """Check if DeepFilterNet is available"""
    return DEEPFILTERNET_AVAILABLE
