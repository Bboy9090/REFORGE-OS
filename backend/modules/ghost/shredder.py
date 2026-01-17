"""
Ghost Codex - Metadata Shredder
Removes all metadata from media files
"""

import subprocess
from pathlib import Path
from PIL import Image
from typing import List
import hashlib


def shred_media_metadata(input_path: str, output_path: str) -> bool:
    """
    Remove all metadata from audio/video file using FFmpeg
    
    Args:
        input_path: Path to input file
        output_path: Path to save cleaned file
        
    Returns:
        True if successful
    """
    try:
        cmd = [
            'ffmpeg',
            '-i', input_path,
            '-map_metadata', '-1',  # Strip all metadata
            '-c', 'copy',  # Copy streams without re-encoding
            '-fflags', '+bitexact',  # No encoder tags
            '-flags:v', '+bitexact',
            '-flags:a', '+bitexact',
            output_path,
            '-y'  # Overwrite output
        ]
        
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True
        )
        return True
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg error: {e.stderr.decode()}")
        return False
    except Exception as e:
        print(f"Error shredding metadata: {e}")
        return False


def shred_image_metadata(input_path: str, output_path: str) -> bool:
    """
    Remove all EXIF/GPS metadata from image file
    
    Args:
        input_path: Path to input image
        output_path: Path to save cleaned image
        
    Returns:
        True if successful
    """
    try:
        img = Image.open(input_path)
        # Create new image with just pixel data (no metadata)
        data = list(img.getdata())
        clean_img = Image.new(img.mode, img.size)
        clean_img.putdata(data)
        clean_img.save(output_path)
        return True
    except Exception as e:
        print(f"Error shredding image metadata: {e}")
        return False


def generate_ghost_filename(original_path: str) -> str:
    """
    Generate generic hash-based filename
    
    Args:
        original_path: Original file path
        
    Returns:
        Generic filename like "ghost_8f2a.mp4"
    """
    # Generate hash from original filename
    hash_obj = hashlib.md5(original_path.encode())
    hash_hex = hash_obj.hexdigest()[:4]
    
    ext = Path(original_path).suffix
    return f"ghost_{hash_hex}{ext}"


def shred_folder(folder_path: str, recursive: bool = True) -> List[str]:
    """
    Shred metadata from all files in a folder
    
    Args:
        folder_path: Path to folder
        recursive: Process subdirectories
        
    Returns:
        List of processed file paths
    """
    folder = Path(folder_path)
    if not folder.exists():
        return []
    
    processed = []
    
    # Find all files
    pattern = "**/*" if recursive else "*"
    for file_path in folder.glob(pattern):
        if file_path.is_file():
            # Determine file type
            ext = file_path.suffix.lower()
            
            # Image files
            if ext in {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'}:
                output_path = file_path.parent / generate_ghost_filename(str(file_path))
                if shred_image_metadata(str(file_path), str(output_path)):
                    processed.append(str(output_path))
            
            # Media files (audio/video)
            elif ext in {'.mp3', '.wav', '.mp4', '.mov', '.avi', '.mkv', '.m4a', '.flac'}:
                output_path = file_path.parent / generate_ghost_filename(str(file_path))
                if shred_media_metadata(str(file_path), str(output_path)):
                    processed.append(str(output_path))
    
    return processed
