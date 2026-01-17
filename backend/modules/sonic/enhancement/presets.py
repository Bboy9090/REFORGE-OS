"""
Sonic Codex - Enhancement Presets
Pre-configured filter chains for different scenarios
"""

PRESETS = {
    "Speech Clear": {
        "description": "Clear speech enhancement with noise reduction",
        "ffmpeg_filter": "highpass=f=80,lowpass=f=8000,compand=0.3|0.3:1|1:-90/-60|-60/-40|-40/-30|-20/-20:6:0:-90:0.2",
        "consonant_boost": True,
        "gain_db": 6.0
    },
    "Interview": {
        "description": "Mid-range boost for vocal presence in interviews",
        "ffmpeg_filter": "highpass=f=100,lowpass=f=6000,equalizer=f=3000:width_type=h:width=1000:g=4",
        "consonant_boost": True,
        "gain_db": 4.0
    },
    "Noisy Room": {
        "description": "Aggressive noise reduction for noisy environments",
        "ffmpeg_filter": "afftdn=nr=20:nf=-25,highpass=f=200,lowpass=f=3000",
        "consonant_boost": True,
        "gain_db": 8.0
    },
    "Super Sonic": {
        "description": "Maximum enhancement with neural dereverberation",
        "ffmpeg_filter": "arnndn=m=bd.rnnn,speechnorm=e=12:r=0.0001",
        "consonant_boost": True,
        "gain_db": 10.0,
        "neural_enhancement": True,  # Requires DeepFilterNet
        "deepfilternet": True
    }
}


def get_preset_filter(preset_name: str) -> dict:
    """
    Get preset configuration
    
    Args:
        preset_name: Name of the preset
        
    Returns:
        dict with preset configuration
    """
    if preset_name not in PRESETS:
        raise ValueError(f"Unknown preset: {preset_name}. Available: {list(PRESETS.keys())}")
    
    return PRESETS[preset_name]


def list_presets() -> list:
    """List all available presets"""
    return [
        {
            "name": name,
            "description": config["description"]
        }
        for name, config in PRESETS.items()
    ]
