# Tools Directory

This directory contains bundled external tools that can be used by Bobby's Workshop.

## Directory Structure

```
tools/
├── checkra1n/          # iOS jailbreak tool (macOS/Linux)
│   └── checkra1n
├── palera1n/           # iOS jailbreak tool (macOS/Linux)
│   └── palera1n
├── odin/               # Samsung Odin (Windows only)
│   └── Odin3.exe
├── heimdall/           # Cross-platform Samsung flashing (Odin alternative)
│   └── heimdall (or heimdall.exe on Windows)
├── spflashtool/        # MediaTek SP Flash Tool (Windows)
│   └── flash_tool.exe
├── edl/                # Qualcomm EDL tool
│   └── edl (or edl.exe on Windows)
└── qfil/               # Qualcomm Flash Image Loader (Windows)
    └── QFIL.exe
```

## Installation

Tools can be:
1. **Manually placed** in their respective directories
2. **Downloaded automatically** via the API (coming soon)
3. **Detected from system PATH** if already installed

## Usage

The `server/tools-manager.js` module automatically:
- Detects tools in this directory
- Falls back to system PATH if not found
- Provides execution wrappers with proper error handling

## Platform Support

- **checkra1n/palera1n**: macOS, Linux (iOS jailbreak)
- **odin**: Windows only (Samsung flashing)
- **heimdall**: All platforms (Samsung flashing alternative)
- **spflashtool**: Windows only (MediaTek flashing)
- **edl/qfil**: All platforms (Qualcomm EDL mode flashing)

## Notes

- Tools must be executable (Unix) or .exe files (Windows)
- On first use, tools are checked for availability
- Missing tools return clear error messages
- Download links are provided in tool info responses
