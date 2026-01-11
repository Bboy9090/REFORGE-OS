"""
Sonic Codex - Consonant Recovery (2kHz-8kHz Boost)
Recovers muffled speech clarity by boosting high-frequency consonants
"""

import librosa
import numpy as np
import soundfile as sf
from scipy import signal


def apply_consonant_recovery(
    input_path: str,
    output_path: str,
    gain_db: float = 6.0
) -> dict:
    """
    Apply 2kHz-8kHz frequency boost for consonant recovery
    
    Args:
        input_path: Path to input audio file
        output_path: Path to save enhanced audio
        gain_db: Gain in dB for the 2-8kHz range (default 6dB)
        
    Returns:
        dict with enhancement metadata
    """
    # Load audio
    y, sr = librosa.load(input_path, sr=None)
    
    # Design high-shelf filter for 2kHz-8kHz boost
    # High-shelf filter: boost frequencies above 2kHz
    nyquist = sr / 2
    low_freq = 2000 / nyquist  # Normalized frequency
    high_freq = 8000 / nyquist
    
    # Create high-shelf filter
    # Using scipy's iirfilter for high-shelf
    sos = signal.iirfilter(
        N=4,
        Wn=[low_freq, high_freq],
        btype='band',
        ftype='butter',
        output='sos'
    )
    
    # Apply filter
    y_filtered = signal.sosfilt(sos, y)
    
    # Mix original with filtered (boost the high frequencies)
    # Blend: original + (filtered * gain)
    gain_linear = 10 ** (gain_db / 20)
    y_boosted = y + (y_filtered - y) * (gain_linear - 1)
    
    # Normalize to prevent clipping
    max_val = np.max(np.abs(y_boosted))
    if max_val > 0.95:
        y_boosted = y_boosted * (0.95 / max_val)
    
    # Save enhanced audio
    sf.write(output_path, y_boosted, sr)
    
    return {
        "gain_db": gain_db,
        "frequency_range": "2kHz-8kHz",
        "sample_rate": int(sr),
        "duration": len(y_boosted) / sr
    }
