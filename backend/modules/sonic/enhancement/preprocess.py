"""
Sonic Codex - Forensic Pre-Processing
Spectral gating, noise reduction, and RMS normalization
"""

import librosa
import numpy as np
import soundfile as sf
from pathlib import Path
import noisereduce as nr


def apply_forensic_preprocessing(
    input_path: str,
    output_path: str,
    target_db: float = -3.0
) -> dict:
    """
    Apply forensic pre-processing to audio
    
    Args:
        input_path: Path to input audio file
        output_path: Path to save processed audio
        target_db: Target RMS level in dB (default -3dB)
        
    Returns:
        dict with processing metadata
    """
    # Load audio
    y, sr = librosa.load(input_path, sr=None)
    
    # High-pass filter (cut rumble below 80Hz)
    y = librosa.effects.preemphasis(y)
    
    # Spectral subtraction (remove stationary noise)
    # Sample first 2 seconds as noise profile
    noise_sample = y[:int(sr * 2)] if len(y) > sr * 2 else y[:len(y)//4]
    y = nr.reduce_noise(y=y, sr=sr, stationary=True, y_noise=noise_sample)
    
    # RMS normalization to target dB
    current_rms = np.sqrt(np.mean(y**2))
    if current_rms > 0:
        target_linear = 10 ** (target_db / 20)
        gain = target_linear / current_rms
        # Prevent clipping
        gain = min(gain, 1.0 / np.max(np.abs(y)) if np.max(np.abs(y)) > 0 else 1.0)
        y = y * gain
    
    # Save processed audio
    sf.write(output_path, y, sr)
    
    return {
        "sample_rate": int(sr),
        "duration": len(y) / sr,
        "target_db": target_db,
        "final_rms_db": 20 * np.log10(np.sqrt(np.mean(y**2))) if np.sqrt(np.mean(y**2)) > 0 else -np.inf
    }
