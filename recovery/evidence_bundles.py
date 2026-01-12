"""Evidence bundle generation for support requests."""
import json
import os
import zipfile
from dataclasses import dataclass, asdict
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone


@dataclass
class EvidenceBundle:
    """Evidence bundle structure."""
    bundle_id: str
    bundle_type: str  # "apple_support", "carrier", "generic"
    case_id: Optional[str] = None
    device_id: Optional[str] = None
    files: List[str] = None
    metadata: Dict[str, Any] = None
    created_at: str = ""
    
    def __post_init__(self):
        if self.files is None:
            self.files = []
        if self.metadata is None:
            self.metadata = {}
        if not self.created_at:
            self.created_at = datetime.now(timezone.utc).isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)


def generate_apple_support_bundle(
    case_id: str,
    device_info: Dict[str, Any],
    proof_of_ownership: List[str] = None,
    diagnostics_reports: List[str] = None,
    output_dir: str = "storage/bundles"
) -> EvidenceBundle:
    """
    Generate Apple Support evidence bundle.
    
    Includes:
    - Device information
    - Proof of ownership documents
    - Diagnostics reports
    - Case notes
    """
    os.makedirs(output_dir, exist_ok=True)
    
    bundle_id = f"apple_support_{case_id}_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
    bundle_dir = os.path.join(output_dir, bundle_id)
    os.makedirs(bundle_dir, exist_ok=True)
    
    files = []
    
    # Device information
    device_info_file = os.path.join(bundle_dir, "device_info.json")
    with open(device_info_file, "w", encoding="utf-8") as f:
        json.dump(device_info, f, indent=2, ensure_ascii=False)
    files.append(device_info_file)
    
    # Proof of ownership (copy files)
    if proof_of_ownership:
        ownership_dir = os.path.join(bundle_dir, "proof_of_ownership")
        os.makedirs(ownership_dir, exist_ok=True)
        for proof_file in proof_of_ownership:
            if os.path.exists(proof_file):
                filename = os.path.basename(proof_file)
                dest_file = os.path.join(ownership_dir, filename)
                import shutil
                shutil.copy2(proof_file, dest_file)
                files.append(dest_file)
    
    # Diagnostics reports
    if diagnostics_reports:
        reports_dir = os.path.join(bundle_dir, "diagnostics")
        os.makedirs(reports_dir, exist_ok=True)
        for report_file in diagnostics_reports:
            if os.path.exists(report_file):
                filename = os.path.basename(report_file)
                dest_file = os.path.join(reports_dir, filename)
                import shutil
                shutil.copy2(report_file, dest_file)
                files.append(dest_file)
    
    # Case notes
    case_notes = {
        "case_id": case_id,
        "device_info": device_info,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "instructions": [
            "1. Visit https://support.apple.com/",
            "2. Sign in with your Apple ID",
            "3. Select 'Activation Lock' or appropriate issue",
            "4. Upload this bundle as evidence",
            "5. Provide proof of ownership when requested"
        ]
    }
    case_notes_file = os.path.join(bundle_dir, "case_notes.json")
    with open(case_notes_file, "w", encoding="utf-8") as f:
        json.dump(case_notes, f, indent=2, ensure_ascii=False)
    files.append(case_notes_file)
    
    # Create ZIP bundle
    zip_path = os.path.join(output_dir, f"{bundle_id}.zip")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for file_path in files:
            arcname = os.path.relpath(file_path, bundle_dir)
            zipf.write(file_path, arcname)
    
    metadata = {
        "bundle_type": "apple_support",
        "case_id": case_id,
        "files_included": len(files),
        "zip_path": zip_path
    }
    
    bundle = EvidenceBundle(
        bundle_id=bundle_id,
        bundle_type="apple_support",
        case_id=case_id,
        files=[f for f in files if os.path.exists(f)],
        metadata=metadata
    )
    
    return bundle


def generate_carrier_support_bundle(
    case_id: str,
    device_info: Dict[str, Any],
    carrier: str,
    proof_of_ownership: List[str] = None,
    output_dir: str = "storage/bundles"
) -> EvidenceBundle:
    """Generate carrier support evidence bundle."""
    os.makedirs(output_dir, exist_ok=True)
    
    bundle_id = f"carrier_{carrier.lower()}_{case_id}_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
    bundle_dir = os.path.join(output_dir, bundle_id)
    os.makedirs(bundle_dir, exist_ok=True)
    
    files = []
    
    # Device information
    device_info_file = os.path.join(bundle_dir, "device_info.json")
    with open(device_info_file, "w", encoding="utf-8") as f:
        json.dump(device_info, f, indent=2, ensure_ascii=False)
    files.append(device_info_file)
    
    # Proof of ownership
    if proof_of_ownership:
        ownership_dir = os.path.join(bundle_dir, "proof_of_ownership")
        os.makedirs(ownership_dir, exist_ok=True)
        for proof_file in proof_of_ownership:
            if os.path.exists(proof_file):
                filename = os.path.basename(proof_file)
                dest_file = os.path.join(ownership_dir, filename)
                import shutil
                shutil.copy2(proof_file, dest_file)
                files.append(dest_file)
    
    # Carrier-specific notes
    carrier_notes = {
        "case_id": case_id,
        "carrier": carrier,
        "device_info": device_info,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "instructions": [
            f"1. Contact {carrier} customer support",
            "2. Request SIM unlock or device unlock",
            "3. Provide this bundle as evidence",
            "4. Submit proof of ownership"
        ]
    }
    carrier_notes_file = os.path.join(bundle_dir, "carrier_notes.json")
    with open(carrier_notes_file, "w", encoding="utf-8") as f:
        json.dump(carrier_notes, f, indent=2, ensure_ascii=False)
    files.append(carrier_notes_file)
    
    # Create ZIP
    zip_path = os.path.join(output_dir, f"{bundle_id}.zip")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for file_path in files:
            arcname = os.path.relpath(file_path, bundle_dir)
            zipf.write(file_path, arcname)
    
    metadata = {
        "bundle_type": "carrier",
        "carrier": carrier,
        "case_id": case_id,
        "zip_path": zip_path
    }
    
    bundle = EvidenceBundle(
        bundle_id=bundle_id,
        bundle_type="carrier",
        case_id=case_id,
        files=[f for f in files if os.path.exists(f)],
        metadata=metadata
    )
    
    return bundle


def generate_generic_evidence_bundle(
    case_id: str,
    device_info: Dict[str, Any],
    documents: List[str] = None,
    output_dir: str = "storage/bundles"
) -> EvidenceBundle:
    """Generate generic evidence bundle."""
    os.makedirs(output_dir, exist_ok=True)
    
    bundle_id = f"evidence_{case_id}_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
    bundle_dir = os.path.join(output_dir, bundle_id)
    os.makedirs(bundle_dir, exist_ok=True)
    
    files = []
    
    # Device information
    device_info_file = os.path.join(bundle_dir, "device_info.json")
    with open(device_info_file, "w", encoding="utf-8") as f:
        json.dump(device_info, f, indent=2, ensure_ascii=False)
    files.append(device_info_file)
    
    # Documents
    if documents:
        docs_dir = os.path.join(bundle_dir, "documents")
        os.makedirs(docs_dir, exist_ok=True)
        for doc_file in documents:
            if os.path.exists(doc_file):
                filename = os.path.basename(doc_file)
                dest_file = os.path.join(docs_dir, filename)
                import shutil
                shutil.copy2(doc_file, dest_file)
                files.append(dest_file)
    
    # Create ZIP
    zip_path = os.path.join(output_dir, f"{bundle_id}.zip")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for file_path in files:
            arcname = os.path.relpath(file_path, bundle_dir)
            zipf.write(file_path, arcname)
    
    metadata = {
        "bundle_type": "generic",
        "case_id": case_id,
        "zip_path": zip_path
    }
    
    bundle = EvidenceBundle(
        bundle_id=bundle_id,
        bundle_type="generic",
        case_id=case_id,
        files=[f for f in files if os.path.exists(f)],
        metadata=metadata
    )
    
    return bundle
