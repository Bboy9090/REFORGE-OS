# Trapdoor + Bobby Dev Integration Guide

## Overview

This document describes how the **trapdoor** Rust module in libBootForge integrates with the **bobby_dev** Python module to provide a unified tool execution architecture.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/TypeScript)              │
│                     - Bobby Dev UI Components                │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  CRM API (Express/TypeScript)                │
│              crm-api/src/routes/bobby-dev.ts                 │
│                 - Authentication                             │
│                 - Request routing                            │
└──────────────┬──────────────────────────┬────────────────────┘
               │                          │
               │ Python subprocess        │ Rust FFI/IPC
               ▼                          ▼
┌──────────────────────────┐   ┌─────────────────────────────┐
│   bobby_dev (Python)     │   │   trapdoor (Rust)          │
│   - Tool loaders         │◄──┤   - TrapdoorRunner         │
│   - Device detection     │   │   - BobbyDevBridge         │
│   - Usage guides         │   │   - Tool execution         │
└──────────────────────────┘   └─────────────────────────────┘
```

## Rust Trapdoor Module

### Location

`bootforge/libbootforge/src/trapdoor/`

### Components

#### 1. TrapdoorTool Enum

Defines all supported tools with proper categorization:

```rust
pub enum TrapdoorTool {
    // iOS Tools (A5-A11)
    Palera1n,
    Checkra1n,
    Lockra1n,
    OpenBypass,

    // iOS Tools (A12+)
    MinaCriss,
    IRemovalTools,
    BriqueRamdisk,

    // Android Tools
    FrpHelper,
    Magisk,
    Twrp,
    ApkHelpers,

    // System Tools
    EfiUnlocker,

    // Custom
    Custom(String),
}
```

#### 2. TrapdoorRunner

Main execution engine:

- Tool availability checking
- Sandboxed execution (with firejail support planned)
- Direct execution fallback
- Configuration management

#### 3. BobbyDevBridge

JSON-based interface for cross-language communication:

- `execute_tool_json()` - Execute tool from JSON request
- `get_tool_info_json()` - Get tool metadata as JSON
- `list_available_tools_json()` - List all available tools

### Key Methods

```rust
// Create runner
let runner = TrapdoorRunner::new();

// Execute tool
let result = runner.run_tool(
    TrapdoorTool::Palera1n,
    &["--version"],
    None
).await?;

// Check availability
let available = runner.is_tool_available(&TrapdoorTool::Checkra1n, None);
```

## Python Bobby Dev Module

### Integration Strategy

The bobby_dev Python module can now:

1. **Delegate to Rust** - Call trapdoor via subprocess/FFI for actual tool execution
2. **Provide Python API** - Maintain Python-friendly interfaces for compatibility
3. **Add Intelligence** - Device detection, recommendations, usage guides

### Example Integration Pattern

```python
# bobby_dev/ios/palera1n.py

import json
import subprocess
from typing import Optional

class Palera1nLoader:
    def __init__(self):
        self.trapdoor_bridge = "/path/to/trapdoor_cli"  # Rust CLI wrapper

    def download_tool(self) -> str:
        """Download palera1n using Rust trapdoor backend"""
        request = {
            "tool": "palera1n",
            "args": ["--download"],
            "env_path": None
        }

        result = subprocess.run(
            [self.trapdoor_bridge, "execute"],
            input=json.dumps(request),
            capture_output=True,
            text=True
        )

        response = json.loads(result.stdout)
        if response["success"]:
            return response["output"]
        else:
            raise RuntimeError(response["error"])

    def is_installed(self) -> bool:
        """Check if palera1n is installed via trapdoor"""
        result = subprocess.run(
            [self.trapdoor_bridge, "check", "palera1n"],
            capture_output=True,
            text=True
        )
        return result.returncode == 0

    def get_usage_guide(self) -> str:
        """Return comprehensive usage guide (Python-side logic)"""
        return """
        PALERA1N USAGE GUIDE
        ====================

        Platform: iOS (A11 and older)
        Compatibility: iPhone X and older devices

        ... detailed guide ...
        """

def load_palera1n() -> Palera1nLoader:
    return Palera1nLoader()
```

## TypeScript API Integration

### Current: Python Subprocess

`crm-api/src/routes/bobby-dev.ts` currently calls Python:

```typescript
const pythonScript = `
import sys
sys.path.insert(0, '${projectRoot}')
from bobby_dev.ios import palera1n
loader = palera1n.load_palera1n()
result = loader.download_tool()
print(result)
`;

const { stdout } = await execAsync(
  "python3 -c " + JSON.stringify(pythonScript),
);
```

### Enhanced: Dual Backend Support

```typescript
// Add trapdoor Rust backend support
const useRustBackend = process.env.USE_TRAPDOOR_RUST === "1";

if (useRustBackend) {
  // Call Rust trapdoor directly
  const request = {
    tool: "palera1n",
    args: ["--download"],
    env_path: null,
  };

  const { stdout } = await execAsync(
    `echo '${JSON.stringify(request)}' | ./bootforge/target/release/trapdoor_cli execute`,
  );

  const response = JSON.parse(stdout);
  // handle response
} else {
  // Fall back to Python bobby_dev
  // ... existing Python code ...
}
```

## Benefits of Integration

### 1. Performance

- Rust execution is faster and more efficient
- Better resource management
- Proper sandboxing capabilities

### 2. Security

- Compiled Rust code harder to reverse engineer
- Built-in sandboxing support
- Better process isolation

### 3. Maintainability

- Single source of truth for tool definitions
- Consistent tool execution logic
- Easier to add new tools (just update Rust enum)

### 4. Flexibility

- Python layer can still add intelligence and device-specific logic
- Gradual migration path (both backends can coexist)
- TypeScript API can choose backend based on config

## Tool Directory Structure

```
tools/
├── ios_old/
│   ├── palera1n
│   ├── checkra1n
│   ├── lockra1n
│   └── openbypass
├── ios_new/
│   ├── minacriss
│   ├── iremovaltools
│   └── brique_ramdisk
├── android/
│   ├── magisk
│   ├── twrp
│   ├── frp_bypass
│   └── apk_helpers
└── system/
    └── efi_unlocker
```

## Configuration

### Environment Variables

```bash
# Enable Rust trapdoor backend
export USE_TRAPDOOR_RUST=1

# Set tools directory
export TRAPDOOR_TOOLS_DIR=/path/to/tools

# Set assets directory
export TRAPDOOR_ASSETS_DIR=/path/to/assets

# Enable sandboxing
export TRAPDOOR_SANDBOX=1
```

### Config File (trapdoor.toml)

```toml
[trapdoor]
tools_dir = "./tools"
assets_dir = "./assets"
sandbox = true
timeout = 300

[tools.palera1n]
path = "./tools/ios_old/palera1n"
enabled = true

[tools.checkra1n]
path = "./tools/ios_old/checkra1n"
enabled = true
```

## Migration Path

### Phase 1: Current (Separate)

- trapdoor (Rust) = stub
- bobby_dev (Python) = stub
- Both exist independently

### Phase 2: Integration (This PR)

- trapdoor (Rust) = full implementation
- bobby_dev (Python) = calls trapdoor for execution
- Dual backend support in API

### Phase 3: Consolidation (Future)

- trapdoor = primary backend
- bobby_dev = thin wrapper + intelligence layer
- API uses Rust by default

## Building Trapdoor CLI

To use trapdoor from Python/TypeScript, build the CLI wrapper:

```bash
cd bootforge
cargo build --release --bin trapdoor_cli

# The binary will be at:
# bootforge/target/release/trapdoor_cli
```

## CLI Usage Examples

```bash
# Check if tool is available
./trapdoor_cli check palera1n

# Get tool info
./trapdoor_cli info palera1n

# List all available tools
./trapdoor_cli list

# Execute tool (via JSON)
echo '{"tool":"palera1n","args":["--version"],"env_path":null}' | \
    ./trapdoor_cli execute
```

## Testing

### Rust Tests

```bash
cd bootforge/libbootforge
cargo test trapdoor
```

### Integration Tests

```bash
# Test Python → Rust integration
python3 tests/test_trapdoor_integration.py

# Test TypeScript → Rust integration
npm test -- bobby-dev-trapdoor
```

## Security Considerations

1. **Tool Verification**: All tools should be verified before execution
2. **Sandboxing**: Use firejail or similar for isolation
3. **Argument Sanitization**: All user inputs must be sanitized
4. **Path Validation**: Only allow tools from approved directories
5. **Authentication**: Maintain BOBBY_CREATOR authentication gates

## Future Enhancements

- [ ] Implement firejail sandboxing
- [ ] Add tool signature verification
- [ ] Create automatic tool downloader
- [ ] Add tool version management
- [ ] Implement tool update checker
- [ ] Add telemetry and logging
- [ ] Create web UI for tool management

## Troubleshooting

### Tool Not Found

```
Error: Tool palera1n not found or not available
```

**Solution**: Ensure tool binary exists in tools/ios_old/palera1n

### Permission Denied

```
Error: Failed to execute: Permission denied
```

**Solution**: Make tool executable: `chmod +x tools/ios_old/palera1n`

### Sandbox Error

```
Error: Sandboxing failed
```

**Solution**: Disable sandboxing or install firejail: `TRAPDOOR_SANDBOX=0`

## Support

For issues or questions about trapdoor integration:

1. Check this documentation
2. Review BOBBY_DEV_SETUP.md
3. Check bootforge/libbootforge/src/trapdoor/ source code
4. Review crm-api/src/routes/bobby-dev.ts integration

---

**Last Updated**: 2025-12-08
**Version**: 1.0
**Status**: Active Development
