# Trapdoor CLI Usage Guide

## Overview

The Trapdoor CLI (`trapdoor_cli`) is a Rust-based command-line tool that provides a unified interface for executing Bobby Dev tools. It supports:

- **Firejail Sandboxing**: Automatic sandboxing for enhanced security (when firejail is installed)
- **Tool Signature Verification**: SHA-256 based verification of tool integrity
- **Automatic Tool Downloader**: Framework for automated tool downloads (manual installation required currently)
- **Python/TypeScript Integration**: JSON-based API for cross-language communication

## Building

```bash
cd bootforge
cargo build --release --bin trapdoor_cli
```

The binary will be available at: `bootforge/target/release/trapdoor_cli`

## CLI Commands

### List Available Tools

Lists all tools that are currently installed and available:

```bash
./bootforge/target/release/trapdoor_cli list
```

Output:

```json
[
  { "name": "palera1n", "category": "ios_old", "available": true },
  { "name": "checkra1n", "category": "ios_old", "available": true }
]
```

### Get Tool Information

Get detailed information about a specific tool:

```bash
./bootforge/target/release/trapdoor_cli info palera1n
```

Output:

```json
{
  "name": "palera1n",
  "category": "ios_old",
  "available": true
}
```

### Check Tool Availability

Check if a tool is available (returns exit code 0 if available):

```bash
./bootforge/target/release/trapdoor_cli check palera1n
echo $?  # 0 if available, 1 if not
```

### Execute a Tool

Execute a tool with arguments using JSON input via stdin:

```bash
echo '{"tool":"palera1n","args":["--version"],"env_path":null}' | \
    ./bootforge/target/release/trapdoor_cli execute
```

Output:

```json
{
  "success": true,
  "output": "palera1n version 1.0.0\n",
  "error": null
}
```

### Specify Custom Tools Directory

Use the `--tools-dir` flag to specify a custom tools directory:

```bash
./bootforge/target/release/trapdoor_cli --tools-dir /custom/path list
```

Or use the environment variable:

```bash
export TRAPDOOR_TOOLS_DIR=/custom/path
./bootforge/target/release/trapdoor_cli list
```

## Python Integration

The `trapdoor_bridge.py` script provides a Python-friendly interface:

### Using the Python Bridge

```python
from trapdoor_bridge import TrapdoorBridge

# Initialize bridge
bridge = TrapdoorBridge()

# List available tools
tools = bridge.list_available_tools()
print(tools)

# Get tool info
info = bridge.get_tool_info('palera1n')
print(info)

# Check if tool is available
available = bridge.check_tool('palera1n')
print(f"Available: {available}")

# Execute tool
result = bridge.execute_tool('palera1n', ['--version'])
if result['success']:
    print(result['output'])
else:
    print(f"Error: {result['error']}")
```

### CLI Interface for Python Bridge

```bash
# List tools
python3 trapdoor_bridge.py list

# Get tool info
python3 trapdoor_bridge.py info palera1n

# Check tool
python3 trapdoor_bridge.py check palera1n

# Execute tool
python3 trapdoor_bridge.py execute palera1n --version
```

## TypeScript Integration

The CRM API now supports dual backend execution via the `USE_TRAPDOOR_RUST` environment variable.

### Enable Rust Backend

```bash
export USE_TRAPDOOR_RUST=1
export TRAPDOOR_CLI_PATH=./bootforge/target/release/trapdoor_cli
```

### API Usage

```typescript
// POST /api/bobby-dev/run-tool
{
  "tool": "palera1n",
  "action": "check",
  "params": {}
}
```

When `USE_TRAPDOOR_RUST=1`, supported actions (check, download) will use the Rust backend automatically.

## Security Features

### Firejail Sandboxing

When firejail is installed, tools are automatically executed in a sandboxed environment with:

- Private home directory (`--private`)
- Private /tmp directory (`--private-tmp`)
- No root privileges (`--noroot`)
- No network access (`--net=none`)
- Seccomp filtering (`--seccomp`)
- All capabilities dropped (`--caps.drop=all`)
- No new privileges (`--nonewprivs`)

Install firejail:

```bash
# Ubuntu/Debian
sudo apt-get install firejail

# Arch
sudo pacman -S firejail

# macOS (via Homebrew - limited support)
brew install firejail
```

### Tool Signature Verification

The verification module supports SHA-256 based signature verification:

```rust
use libbootforge::trapdoor::{verify_tool, ToolSignature, SignatureDatabase};

// Verify a tool
let verified = verify_tool(&tool_path, "expected_sha256_hash")?;

// Use signature database
let mut db = SignatureDatabase::new();
db.add_signature(ToolSignature {
    tool_name: "palera1n".to_string(),
    version: "1.0.0".to_string(),
    sha256: "abc123...".to_string(),
});
```

## Tool Directory Structure

Tools should be organized by category:

```
tools/
├── ios_old/           # iOS tools for A5-A11 devices
│   ├── palera1n
│   ├── checkra1n
│   ├── lockra1n
│   └── openbypass
├── ios_new/           # iOS tools for A12+ devices
│   ├── minacriss
│   ├── iremovaltools
│   └── brique_ramdisk
├── android/           # Android tools
│   ├── magisk
│   ├── twrp
│   ├── frp_bypass
│   └── apk_helpers
└── system/            # System tools
    └── efi_unlocker
```

## Configuration

### Environment Variables

- `TRAPDOOR_TOOLS_DIR`: Directory containing tools (default: `./tools`)
- `TRAPDOOR_CLI_PATH`: Path to trapdoor_cli binary
- `USE_TRAPDOOR_RUST`: Enable Rust backend in TypeScript API (`1` to enable)
- `BOBBY_CREATOR`: Enable Bobby Dev features (`1` to enable)

### Runtime Configuration

The TrapdoorRunner can be configured programmatically:

```rust
use libbootforge::trapdoor::{TrapdoorRunner, TrapdoorConfig};
use std::path::PathBuf;

let config = TrapdoorConfig {
    tools_dir: PathBuf::from("./tools"),
    assets_dir: PathBuf::from("./assets"),
    sandbox: true,
    timeout: 300,
};

let runner = TrapdoorRunner::with_config(config);
```

## Running Tests

### Python Integration Tests

```bash
cd /path/to/The-Pandora-Codex-
python3 tests/test_trapdoor_integration.py -v
```

Tests verify:

- Bridge initialization
- Tool listing and checking
- Tool information retrieval
- Tool execution format
- CLI direct invocation

### Rust Unit Tests

```bash
cd bootforge
cargo test trapdoor
```

## Troubleshooting

### Tool Not Found

**Error**: `Tool palera1n not found or not available`

**Solution**: Ensure the tool binary exists at `tools/ios_old/palera1n` and is executable:

```bash
chmod +x tools/ios_old/palera1n
```

### Firejail Not Available

**Warning**: `Firejail not available, falling back to direct execution`

**Solution**: Install firejail for enhanced security, or continue with direct execution (less secure).

### Python Bridge Not Found

**Error**: `RuntimeError: trapdoor_cli binary not found`

**Solution**: Build the CLI first:

```bash
cd bootforge
cargo build --release --bin trapdoor_cli
```

### TypeScript API Error

**Error**: `Rust backend execution failed`

**Solution**: Check that:

1. `USE_TRAPDOOR_RUST=1` is set
2. `TRAPDOOR_CLI_PATH` points to the binary
3. The binary is executable

## Examples

### Complete Python Workflow

```python
#!/usr/bin/env python3
from trapdoor_bridge import TrapdoorBridge

# Initialize
bridge = TrapdoorBridge()

# Check available tools
print("Available tools:")
for tool in bridge.list_available_tools():
    print(f"  - {tool['name']} ({tool['category']})")

# Get tool details
info = bridge.get_tool_info('palera1n')
print(f"\nTool: {info['name']}")
print(f"Category: {info['category']}")
print(f"Available: {info['available']}")

# Execute if available
if info['available']:
    result = bridge.execute_tool('palera1n', ['--help'])
    if result['success']:
        print(f"\nOutput:\n{result['output']}")
    else:
        print(f"\nError: {result['error']}")
```

### TypeScript API Integration

```typescript
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function runTool(tool: string, action: string) {
  const useRust = process.env.USE_TRAPDOOR_RUST === "1";

  if (useRust) {
    const cliPath =
      process.env.TRAPDOOR_CLI_PATH ||
      "./bootforge/target/release/trapdoor_cli";

    if (action === "check") {
      const { returncode } = await execAsync(`${cliPath} check ${tool}`);
      return returncode === 0;
    }
  }

  // Fall back to Python
  // ... existing Python code ...
}
```

## Future Enhancements

- [ ] Automatic tool downloads from secure sources
- [ ] Tool version management and updates
- [ ] Enhanced signature verification with public key crypto
- [ ] Tool usage statistics and telemetry
- [ ] Web UI for tool management
- [ ] Plugin system for custom tools

## Support

For issues or questions:

1. Check TRAPDOOR_BOBBY_DEV_INTEGRATION.md
2. Review bootforge/libbootforge/src/trapdoor/ source
3. Check crm-api/src/routes/bobby-dev.ts integration
4. File an issue on GitHub

---

**Version**: 1.0  
**Last Updated**: 2025-12-08
