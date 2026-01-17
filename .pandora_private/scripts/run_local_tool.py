#!/usr/bin/env python3
"""
Bobby Vault - Local Tool Runner
Executes local tools with SHA-256 validation and audit logging.

NO STEALTH. NO BACKGROUND OPERATIONS. ALL EXPLICIT.
"""

import json
import hashlib
import subprocess
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional

VAULT_ROOT = Path(__file__).parent.parent
TOOLS_DIR = VAULT_ROOT / "tools"
MANIFESTS_DIR = VAULT_ROOT / "manifests"
LOGS_DIR = VAULT_ROOT / "logs"
LOCAL_MANIFEST_PATH = MANIFESTS_DIR / "tools.local.json"


class ToolExecutionError(Exception):
    """Raised when tool execution fails."""
    pass


def load_local_manifest() -> Dict[str, Any]:
    """Load the local tools manifest."""
    if not LOCAL_MANIFEST_PATH.exists():
        return {"version": "1.0", "tools": []}
    
    with open(LOCAL_MANIFEST_PATH, 'r') as f:
        return json.load(f)


def find_tool(tool_id: str) -> Optional[Dict[str, Any]]:
    """Find a tool in the local manifest."""
    manifest = load_local_manifest()
    for tool in manifest.get("tools", []):
        if tool["id"] == tool_id:
            return tool
    return None


def compute_sha256(file_path: Path) -> str:
    """Compute SHA-256 hash of a file."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()


def verify_tool_hash(tool: Dict[str, Any]) -> bool:
    """Verify the SHA-256 hash of a tool binary."""
    tool_path = Path(tool["path"])
    if not tool_path.exists():
        print(f"ERROR: Tool binary not found: {tool_path}", file=sys.stderr)
        return False
    
    actual_hash = compute_sha256(tool_path)
    expected_hash = tool["sha256"]
    
    if actual_hash != expected_hash:
        print(f"ERROR: Hash mismatch for {tool['name']}", file=sys.stderr)
        print(f"  Expected: {expected_hash}", file=sys.stderr)
        print(f"  Actual:   {actual_hash}", file=sys.stderr)
        print(f"  Tool may have been tampered with or corrupted.", file=sys.stderr)
        return False
    
    return True


def get_typed_confirmation(tool: Dict[str, Any]) -> bool:
    """Get explicit typed confirmation from user."""
    print(f"\n⚠️  CONFIRMATION REQUIRED")
    print(f"Tool: {tool['name']}")
    print(f"Path: {tool['path']}")
    print(f"SHA256: {tool['sha256']}")
    print(f"\nType '{tool['id']}' to confirm execution: ", end="")
    
    user_input = input().strip()
    return user_input == tool['id']


def create_audit_log(
    tool: Dict[str, Any],
    args: list[str],
    result: subprocess.CompletedProcess,
    duration_ms: float
) -> None:
    """Create structured audit log entry."""
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "tool_id": tool["id"],
        "tool_name": tool["name"],
        "tool_path": tool["path"],
        "tool_sha256": tool["sha256"],
        "command": [tool["path"]] + args,
        "exit_code": result.returncode,
        "duration_ms": duration_ms,
        "stdout_preview": result.stdout[:500] if result.stdout else "",
        "stderr_preview": result.stderr[:500] if result.stderr else "",
        "success": result.returncode == 0,
    }
    
    log_filename = f"tool_execution_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
    log_path = LOGS_DIR / log_filename
    
    with open(log_path, 'w') as f:
        json.dump(log_entry, f, indent=2)
    
    print(f"\n✓ Audit log created: {log_path}")


def run_local_tool(tool_id: str, args: list[str], skip_confirmation: bool = False) -> int:
    """
    Execute a local tool with SHA-256 validation and audit logging.
    
    Returns exit code of the tool.
    """
    tool = find_tool(tool_id)
    if not tool:
        print(f"ERROR: Tool '{tool_id}' not found in local manifest", file=sys.stderr)
        print(f"Available tools:", file=sys.stderr)
        manifest = load_local_manifest()
        for t in manifest.get("tools", []):
            print(f"  - {t['id']}: {t['name']}", file=sys.stderr)
        return 1
    
    print(f"🔍 Verifying tool: {tool['name']}")
    if not verify_tool_hash(tool):
        return 1
    
    print(f"✓ Hash verified")
    
    if tool.get("requires_confirmation", True) and not skip_confirmation:
        if not get_typed_confirmation(tool):
            print("\n❌ Confirmation failed. Execution cancelled.", file=sys.stderr)
            return 1
        print("✓ Confirmation received")
    
    print(f"\n🚀 Executing: {tool['path']} {' '.join(args)}\n")
    
    start_time = datetime.utcnow()
    try:
        result = subprocess.run(
            [tool["path"]] + args,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print(result.stderr, file=sys.stderr)
        
    except subprocess.TimeoutExpired:
        print("ERROR: Tool execution timed out (5 minutes)", file=sys.stderr)
        return 124
    except Exception as e:
        print(f"ERROR: Tool execution failed: {e}", file=sys.stderr)
        return 1
    
    end_time = datetime.utcnow()
    duration_ms = (end_time - start_time).total_seconds() * 1000
    
    create_audit_log(tool, args, result, duration_ms)
    
    return result.returncode


def main():
    if len(sys.argv) < 2:
        print("Usage: run_local_tool.py <tool_id> [args...]")
        print("\nExample:")
        print("  python3 run_local_tool.py custom_flasher --device /dev/ttyUSB0")
        sys.exit(1)
    
    tool_id = sys.argv[1]
    args = sys.argv[2:]
    
    skip_confirmation = "--skip-confirmation" in args
    if skip_confirmation:
        args.remove("--skip-confirmation")
    
    exit_code = run_local_tool(tool_id, args, skip_confirmation)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
