"""
Sonic Codex - URL Audio Extraction
Extract audio from YouTube, TikTok, or any URL using yt-dlp
"""

import yt_dlp
from pathlib import Path
from typing import Dict, Optional
import os


def extract_audio_from_url(
    url: str,
    output_dir: Path,
    format_preference: str = "best"
) -> Dict:
    """
    Extract audio from URL using yt-dlp
    
    Args:
        url: URL to extract from (YouTube, TikTok, etc.)
        output_dir: Directory to save extracted audio
        format_preference: Audio format preference (best, wav, mp3)
        
    Returns:
        dict with file path and metadata
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Configure yt-dlp options
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': str(output_dir / '%(title)s.%(ext)s'),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'wav' if format_preference == 'wav' else 'mp3',
            'preferredquality': '192',
        }],
        'quiet': False,
        'no_warnings': False,
    }
    
    # If WAV format requested, use best quality
    if format_preference == 'wav':
        ydl_opts['postprocessors'][0]['preferredcodec'] = 'wav'
        ydl_opts['postprocessors'][0]['preferredquality'] = '0'  # Best quality
    
    metadata = {}
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Extract info first to get metadata
            info = ydl.extract_info(url, download=False)
            
            metadata = {
                "title": info.get('title', 'Unknown'),
                "duration": info.get('duration', 0),
                "uploader": info.get('uploader', 'Unknown'),
                "upload_date": info.get('upload_date', 'Unknown'),
                "view_count": info.get('view_count', 0),
                "description": info.get('description', '')[:500],  # First 500 chars
            }
            
            # Now download
            ydl.download([url])
            
            # Find the downloaded file
            # yt-dlp renames files, so we need to find the actual output
            downloaded_files = list(output_dir.glob('*'))
            if downloaded_files:
                # Get the most recently created file
                audio_file = max(downloaded_files, key=os.path.getctime)
                
                # If it's not the right format, it might be in a subdirectory or have different extension
                # Check for common audio extensions
                audio_extensions = ['.wav', '.mp3', '.m4a', '.opus']
                for ext in audio_extensions:
                    potential_file = output_dir / f"{info.get('title', 'audio')}{ext}"
                    if potential_file.exists():
                        audio_file = potential_file
                        break
                
                return {
                    "file_path": str(audio_file),
                    "file_name": audio_file.name,
                    "file_size": audio_file.stat().st_size,
                    "file_type": "audio",
                    "extension": audio_file.suffix,
                    "metadata": metadata
                }
            else:
                raise Exception("No file was downloaded")
                
    except Exception as e:
        raise Exception(f"Failed to extract audio from URL: {str(e)}")
