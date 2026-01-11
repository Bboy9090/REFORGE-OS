# Security Model

## Threat Model

This application performs potentially destructive operations on Android devices (flashing firmware, unlocking bootloaders, erasing partitions). The security model is designed to:

1. **Prevent accidental execution** - All destructive operations require explicit user confirmation
2. **Prevent command injection** - All user input is validated and sanitized before use in system commands
3. **Audit all operations** - All sensitive operations are logged for accountability
4. **Restrict system access** - Tauri permissions are restricted to only what is necessary

## Tauri Security Configuration

### Shell Permissions

- **`shell.execute: false`** - Arbitrary shell command execution is DISABLED
- **`shell.sidecar: true`** - Only pre-approved sidecar binaries can be executed (if needed)
- **`shell.open: true`** - Opening URLs/files is allowed for user convenience

**Rationale:** Direct shell execution (`execute: true`) was a security risk. All commands must now go through the controlled backend API which validates input before execution.

### File System Access

- **`fs.all: true`** with scope restrictions:
  - `$APPDATA/**`, `$LOCALAPPDATA/**`, `$TEMP/**`, `$HOME/**`
  
**Rationale:** Application needs to read/write configuration and temporary files, but access is restricted to user-accessible directories.

### HTTP Access

- **`http.request: true`** with scope restrictions:
  - `http://localhost:3001/**` (backend API)
  - `https://dl.google.com/**` (Android platform tools downloads)
  
**Rationale:** Frontend needs to communicate with local backend API and download official Android tools.

## Input Validation

### Device Serial Numbers

- **Format:** `^[a-zA-Z0-9._-]+$` (alphanumeric, dots, dashes, underscores only)
- **Location:** Validated in both Tauri Rust code and Node.js backend

### Partition Names

- **Format:** `^[a-zA-Z0-9._-]+$` (alphanumeric, dots, dashes, underscores only)
- **Allowlist:** Standard Android partitions are preferred (boot, system, vendor, etc.)
- **Location:** Validated in Tauri Rust code with allowlist check

### Command Execution

- All commands use `Command::new()` with explicit arguments (no shell interpretation)
- No user input is ever passed through a shell
- All paths are validated before use

## Operation Gates

All destructive operations require:

1. **Frontend confirmation dialog** - User must type the exact confirmation text
2. **Backend validation** - Confirmation token is verified server-side
3. **Device locking** - Per-device locks prevent concurrent operations
4. **Audit logging** - All attempts (successful or denied) are logged

## Security Checklist

- [x] Tauri `shell.execute` disabled
- [x] Device serial validation (regex)
- [x] Partition name validation (regex + allowlist)
- [x] Confirmation gates for destructive operations
- [x] Device locks prevent race conditions
- [x] Audit logging for sensitive operations
- [x] No shell interpretation of user input
- [x] File system access scoped to user directories
- [x] HTTP access restricted to localhost + trusted domains
