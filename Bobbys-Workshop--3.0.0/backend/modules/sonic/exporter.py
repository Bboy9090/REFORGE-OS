"""
Sonic Codex - Export Package Generator
Creates ZIP package with all job outputs
"""

import zipfile
import json
from pathlib import Path
from typing import Optional
import os


def create_job_package(job_id: str, jobs_dir: Path) -> Optional[str]:
    """
    Bundle the entire forensic job into a single ZIP package
    
    Args:
        job_id: Job identifier
        jobs_dir: Base directory for jobs
        
    Returns:
        Path to created ZIP file, or None if failed
    """
    job_dir = jobs_dir / job_id
    if not job_dir.exists():
        return None
    
    # Load manifest to get base name
    manifest_path = job_dir / "manifest.json"
    if not manifest_path.exists():
        return None
    
    with open(manifest_path, 'r') as f:
        manifest = json.load(f)
    
    # Get base name from manifest
    base_name = manifest.get("metadata", {}).get("base_name", f"Job_{job_id}")
    zip_filename = f"{base_name}_FORENSIC_PACKAGE.zip"
    zip_path = job_dir / zip_filename
    
    # Files to include
    files_to_include = []
    
    # Add outputs from manifest
    outputs = manifest.get("outputs", {})
    for key, file_path in outputs.items():
        if file_path and Path(file_path).exists():
            files_to_include.append(Path(file_path))
    
    # Always include manifest
    files_to_include.append(manifest_path)
    
    # Include logs if they exist
    logs_path = job_dir / "logs.txt"
    if logs_path.exists():
        files_to_include.append(logs_path)
    
    # Create ZIP
    try:
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file_path in files_to_include:
                if file_path.exists():
                    # Use relative path within ZIP
                    arcname = file_path.name
                    zipf.write(file_path, arcname=arcname)
        
        # Update manifest to include package
        manifest["outputs"]["package"] = str(zip_path)
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        return str(zip_path)
    except Exception as e:
        print(f"Error creating package: {e}")
        return None
