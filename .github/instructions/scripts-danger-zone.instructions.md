---
applyTo:
  - "**/*.sh"
  - "**/*.bat"
  - "**/*.ps1"
  - "scripts/**"
---

# Scripts Danger Zone Rules

## Safety-First Shell Scripting

Scripts have system-level access and can cause irreversible damage. Treat all script modifications with extreme caution.

### Allowlisted Commands Only

**ALLOWED** (with proper error handling):

- npm, pip, cargo (package managers)
- git (version control)
- node, python, rustc (language runtimes)
- mkdir, cp, mv (file operations with explicit paths)
- echo, cat, grep (read-only operations)
- test, [ ], [[]] (conditionals)

**REQUIRES EXPLICIT CONFIRMATION**:

- rm (any deletion)
- chmod, chown (permission changes)
- curl, wget (network downloads)
- eval, source (dynamic code execution)
- sudo (privilege escalation)
- kill, pkill (process termination)

**PROHIBITED** (no exceptions):

- rm -rf / or similar recursive root deletions
- curl | sh (piped execution)
- dd (disk operations)
- mkfs (filesystem formatting)
- Unvalidated user input in commands
- Hardcoded credentials or secrets

### Required Structure

Every script MUST include:

1. **Shebang line** (e.g., `#!/bin/bash`, `#!/usr/bin/env python3`)
2. **Error handling** (`set -e` for bash, `try/except` for Python, `$ErrorActionPreference = 'Stop'` for PowerShell)
3. **Usage documentation** (header comment explaining purpose, parameters, examples)
4. **Platform detection** (if behavior differs by OS)
5. **Exit codes** (0 for success, non-zero for failure)

### Confirmation Prompts

For destructive operations, require explicit user confirmation:

```bash
# GOOD: Explicit confirmation
read -p "Delete build artifacts? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi
rm -rf dist/ build/
```

```powershell
# GOOD: Explicit confirmation
$confirmation = Read-Host "Delete build artifacts? (y/N)"
if ($confirmation -ne 'y') {
    Write-Host "Aborted."
    exit 1
}
Remove-Item -Recurse -Force dist/, build/
```

### Structured Logging

Use clear, actionable log messages:

```bash
# GOOD: Structured logging
echo "[INFO] Starting build process..."
echo "[WARN] Node version $(node -v) may be outdated"
echo "[ERROR] Build failed: TypeScript compilation errors" >&2
echo "[SUCCESS] Build completed in 42s"
```

### Error Handling Examples

```bash
# GOOD: Proper error handling
if ! command -v node >/dev/null 2>&1; then
    echo "[ERROR] Node.js is not installed" >&2
    echo "  Install from: https://nodejs.org/" >&2
    exit 1
fi

npm ci || {
    echo "[ERROR] npm ci failed" >&2
    echo "  Try: rm -rf node_modules package-lock.json && npm install" >&2
    exit 1
}
```

### Platform Guards

```bash
# GOOD: Platform detection
case "$(uname -s)" in
    Darwin*)
        echo "[INFO] Running on macOS"
        # macOS-specific commands
        ;;
    Linux*)
        echo "[INFO] Running on Linux"
        # Linux-specific commands
        ;;
    MINGW*|MSYS*|CYGWIN*)
        echo "[INFO] Running on Windows"
        # Windows-specific commands
        ;;
    *)
        echo "[ERROR] Unsupported platform: $(uname -s)" >&2
        exit 1
        ;;
esac
```

### Validation Before Execution

```bash
# GOOD: Validate inputs
if [ -z "$1" ]; then
    echo "Usage: $0 <version>" >&2
    echo "  Example: $0 1.2.3" >&2
    exit 1
fi

VERSION="$1"
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "[ERROR] Invalid version format: $VERSION" >&2
    echo "  Expected format: X.Y.Z (e.g., 1.2.3)" >&2
    exit 1
fi
```

## AI Guidelines for Script Modifications

- **Never** add scripts that execute downloaded code
- **Never** disable error handling to "fix" a failing script
- **Always** test scripts manually before committing
- **Always** document what the script does and why
- **Always** validate that existing scripts work before modifying them
- **Prefer** language-specific package managers over custom scripts
