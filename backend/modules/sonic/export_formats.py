"""
Sonic Codex - Export Format Converters
Convert transcripts to SRT, TXT, and JSON formats
"""

from pathlib import Path
from typing import List, Dict
import json


def export_to_srt(segments: List[Dict], output_path: Path) -> bool:
    """
    Export transcript to SRT subtitle format
    
    Args:
        segments: List of transcript segments with start, end, text
        output_path: Path to save SRT file
        
    Returns:
        True if successful
    """
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            for i, seg in enumerate(segments, 1):
                start_time = format_srt_time(seg['start'])
                end_time = format_srt_time(seg['end'])
                text = seg['text'].strip()
                
                # Add speaker label if available
                if seg.get('speaker'):
                    text = f"[{seg['speaker']}] {text}"
                
                f.write(f"{i}\n")
                f.write(f"{start_time} --> {end_time}\n")
                f.write(f"{text}\n\n")
        
        return True
    except Exception as e:
        print(f"Error exporting SRT: {e}")
        return False


def export_to_txt(segments: List[Dict], output_path: Path, include_timestamps: bool = False) -> bool:
    """
    Export transcript to plain text format
    
    Args:
        segments: List of transcript segments
        output_path: Path to save TXT file
        include_timestamps: Include timestamps in output
        
    Returns:
        True if successful
    """
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            for seg in segments:
                text = seg['text'].strip()
                
                if include_timestamps:
                    timestamp = f"[{format_time(seg['start'])} - {format_time(seg['end'])}] "
                    text = timestamp + text
                
                # Add speaker label if available
                if seg.get('speaker'):
                    text = f"[{seg['speaker']}] {text}"
                
                f.write(text + '\n')
        
        return True
    except Exception as e:
        print(f"Error exporting TXT: {e}")
        return False


def export_to_json(segments: List[Dict], output_path: Path, include_metadata: bool = True) -> bool:
    """
    Export transcript to structured JSON format
    
    Args:
        segments: List of transcript segments
        output_path: Path to save JSON file
        include_metadata: Include additional metadata
        
    Returns:
        True if successful
    """
    try:
        data = {
            'segments': segments
        }
        
        if include_metadata:
            data['metadata'] = {
                'total_segments': len(segments),
                'total_duration': segments[-1]['end'] if segments else 0,
                'format': 'json',
                'version': '1.0'
            }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        return True
    except Exception as e:
        print(f"Error exporting JSON: {e}")
        return False


def format_srt_time(seconds: float) -> str:
    """Format time for SRT (HH:MM:SS,mmm)"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def format_time(seconds: float) -> str:
    """Format time as MM:SS"""
    minutes = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{minutes:02d}:{secs:02d}"
