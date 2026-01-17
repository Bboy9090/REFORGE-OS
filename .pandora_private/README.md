# Bobby Vault - Private Tool Storage

This directory contains **user-supplied tools** that are not part of the public Pandora Codex distribution.

## ⚠️ CRITICAL: This directory is GITIGNORED

**NEVER commit:**

- Tool binaries
- Local manifests (tools.local.json)
- Execution logs
- Any proprietary or sensitive scripts

## Structure

```
.pandora_private/
├── tools/              # User-supplied tool binaries
├── manifests/          # Local tool registry
│   └── tools.local.json
├── scripts/            # Tool runners and utilities
│   └── run_local_tool.py
└── logs/               # Execution audit logs
```

## How to Add a Local Tool

### 1. Copy Tool Binary

```bash
cp /path/to/your/tool .pandora_private/tools/my_tool
chmod +x .pandora_private/tools/my_tool
```

### 2. Compute SHA-256 Hash

```bash
sha256sum .pandora_private/tools/my_tool
```

### 3. Add to Local Manifest

Edit `.pandora_private/manifests/tools.local.json`:

```json
{
  "version": "1.0",
  "tools": [
    {
      "id": "my_tool",
      "name": "My Custom Tool",
      "path": "/absolute/path/to/.pandora_private/tools/my_tool",
      "sha256": "abc123...",
      "requires_confirmation": true,
      "capabilities": ["custom_flash"],
      "added_by": "you@example.com",
      "added_at": "2025-01-20T12:00:00Z"
    }
  ]
}
```

### 4. Execute with Validation

```bash
python3 .pandora_private/scripts/run_local_tool.py my_tool --arg1 --arg2
```

The runner will:

1. ✅ Verify SHA-256 hash
2. ✅ Require typed confirmation (if enabled)
3. ✅ Execute the tool
4. ✅ Create audit log in .pandora_private/logs/

## Security Features

### Hash Validation

Every execution verifies the tool's SHA-256 hash matches the manifest. If the binary has been modified or corrupted, execution is blocked.

### Typed Confirmation

Tools marked with `requires_confirmation: true` will prompt the user to type the tool ID exactly to proceed. This prevents accidental execution of destructive operations.

### Audit Logging

Every tool execution creates a structured JSON log with:

- Timestamp
- Tool ID, name, path, and hash
- Command and arguments
- Exit code
- Duration
- stdout/stderr preview

### No Stealth, No Background

All operations are explicit. The user sees exactly what is being executed and when.

## Example: Add Samsung Odin Alternative

```bash
# 1. Copy tool
cp ~/Downloads/heimdall .pandora_private/tools/heimdall
chmod +x .pandora_private/tools/heimdall

# 2. Get hash
sha256sum .pandora_private/tools/heimdall
# Output: 5a2b3c... .pandora_private/tools/heimdall

# 3. Add to manifest
# Edit .pandora_private/manifests/tools.local.json and add:
{
  "id": "heimdall",
  "name": "Heimdall Flash Tool",
  "path": "/workspaces/spark-template/.pandora_private/tools/heimdall",
  "sha256": "5a2b3c...",
  "requires_confirmation": true,
  "capabilities": ["flash_samsung"],
  "added_by": "tech@repair-shop.com",
  "added_at": "2025-01-20T15:30:00Z"
}

# 4. Run it
python3 .pandora_private/scripts/run_local_tool.py heimdall flash --pit some.pit
```

## Compliance

This vault system is designed for **lawful repair and diagnostics**:

- ✅ User-controlled tool storage
- ✅ Hash-verified execution
- ✅ Explicit confirmation for risky operations
- ✅ Complete audit trail
- ✅ No hidden operations

## Support

For questions about Bobby Vault integration, see:

- `/docs/ENTERPRISE_STANDARD.md`
- `/docs/SECURITY_MODEL.md`
- `/PANDORA_ENTERPRISE_BLUEPRINT.md`

---

**Part of Pandora Codex Enterprise Framework. Keep it secret. Keep it safe. Keep it audited.** 🔐
