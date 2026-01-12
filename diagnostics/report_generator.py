"""Generate diagnostics reports from collected data."""
import json
import os
from typing import Dict, Any, Optional
from datetime import datetime, timezone


def generate_diagnostics_report(
    diagnostics_data: Dict[str, Any],
    case_id: Optional[str] = None,
    device_id: Optional[str] = None,
    output_dir: str = "storage/reports"
) -> str:
    """
    Generate a diagnostics report in Markdown format.
    
    Args:
        diagnostics_data: Diagnostics results from run_authorized_adb_diagnostics
        case_id: Optional case ID
        device_id: Optional device ID
        output_dir: Output directory for reports
    
    Returns:
        Path to generated report file
    """
    os.makedirs(output_dir, exist_ok=True)
    
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    device_serial = diagnostics_data.get("device_serial", "unknown")
    filename = f"diagnostics_{device_serial}_{timestamp}.md"
    filepath = os.path.join(output_dir, filename)
    
    report_lines = []
    
    # Header
    report_lines.append("# Device Diagnostics Report")
    report_lines.append("")
    report_lines.append(f"**Generated**: {diagnostics_data.get('timestamp', datetime.now(timezone.utc).isoformat())}")
    if case_id:
        report_lines.append(f"**Case ID**: {case_id}")
    if device_id:
        report_lines.append(f"**Device ID**: {device_id}")
    report_lines.append(f"**Device Serial**: {device_serial}")
    report_lines.append("")
    report_lines.append("---")
    report_lines.append("")
    
    # Authorization Status
    authorized = diagnostics_data.get("authorized", False)
    report_lines.append("## Authorization Status")
    report_lines.append("")
    if authorized:
        report_lines.append("✅ **Authorized**: Device is authorized for ADB operations")
    else:
        report_lines.append("❌ **Not Authorized**: Device authorization required")
        if "error" in diagnostics_data:
            report_lines.append(f"")
            report_lines.append(f"Error: {diagnostics_data['error']}")
    report_lines.append("")
    
    # Operations Results
    operations = diagnostics_data.get("operations", {})
    if operations:
        report_lines.append("## Diagnostics Results")
        report_lines.append("")
        
        # Device Properties
        if "properties" in operations:
            props_data = operations["properties"]
            report_lines.append("### Device Properties")
            report_lines.append("")
            
            if props_data.get("success"):
                properties = props_data.get("data", {}).get("properties", {})
                if properties:
                    report_lines.append("| Property | Value |")
                    report_lines.append("|----------|-------|")
                    for key, value in sorted(properties.items()):
                        # Escape pipe characters in values
                        value_str = str(value).replace("|", "\\|")
                        report_lines.append(f"| `{key}` | {value_str} |")
                else:
                    report_lines.append("No properties retrieved.")
            else:
                report_lines.append(f"❌ Failed: {props_data.get('error', 'Unknown error')}")
            report_lines.append("")
        
        # Logcat
        if "logcat" in operations:
            logcat_data = operations["logcat"]
            report_lines.append("### Logcat Snapshot")
            report_lines.append("")
            
            if logcat_data.get("success"):
                output_file = logcat_data.get("data", {}).get("output_file")
                file_size = logcat_data.get("data", {}).get("file_size", 0)
                lines_captured = logcat_data.get("data", {}).get("lines_captured", 0)
                report_lines.append(f"✅ **Success**: Logcat captured")
                report_lines.append(f"- **File**: `{output_file}`")
                report_lines.append(f"- **Size**: {file_size:,} bytes")
                report_lines.append(f"- **Lines**: {lines_captured:,}")
                if logcat_data.get("stdout"):
                    report_lines.append("")
                    report_lines.append("**Preview**:")
                    report_lines.append("```")
                    report_lines.append(logcat_data["stdout"][:500])
                    report_lines.append("```")
            else:
                report_lines.append(f"❌ Failed: {logcat_data.get('error', 'Unknown error')}")
            report_lines.append("")
        
        # Bugreport
        if "bugreport" in operations:
            bugreport_data = operations["bugreport"]
            report_lines.append("### Bugreport")
            report_lines.append("")
            
            if bugreport_data.get("success"):
                output_file = bugreport_data.get("data", {}).get("output_file")
                file_size = bugreport_data.get("data", {}).get("file_size", 0)
                report_lines.append(f"✅ **Success**: Bugreport captured")
                report_lines.append(f"- **File**: `{output_file}`")
                report_lines.append(f"- **Size**: {file_size:,} bytes")
            else:
                report_lines.append(f"❌ Failed: {bugreport_data.get('error', 'Unknown error')}")
            report_lines.append("")
    
    # Footer
    report_lines.append("---")
    report_lines.append("")
    report_lines.append("*This report was generated by authorized diagnostics. All operations require device authorization.*")
    
    # Write report
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))
    
    return filepath


def generate_json_report(
    diagnostics_data: Dict[str, Any],
    output_dir: str = "storage/reports"
) -> str:
    """
    Generate a JSON diagnostics report.
    
    Returns:
        Path to generated JSON file
    """
    os.makedirs(output_dir, exist_ok=True)
    
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    device_serial = diagnostics_data.get("device_serial", "unknown")
    filename = f"diagnostics_{device_serial}_{timestamp}.json"
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(diagnostics_data, f, indent=2, ensure_ascii=False)
    
    return filepath
