# Bootforge USB Integration - Manual Steps

## Integration Complete Summary

Your **external Bootforge-usb repository** has been analyzed and an integration plan created.

## What Was Found

### External Repo Structure (external clone)
- Clean, focused USB enumeration library (v0.1.0)
- Cross-platform architecture with platform-specific enrichment
- Files: `lib.rs`, `types.rs`, `enumerate/` module
- PR #7 branch checked out successfully

### Workshop Current State
- **`libs/bootforgeusb/`** - Python binding with correlation (v0.2)
- **`crates/bootforge-usb/libbootforge/`** - Full orchestration engine
- **`server/bootforge_backend.py`** - FastAPI flashing server

## Manual Integration Steps Required

These steps are written to be machine-agnostic. You just need:

- `WORKSHOP_ROOT`: this repo root
- `BOOTFORGE_EXTERNAL`: path to the external bootforge-usb clone

### Set paths

PowerShell:

```powershell
$WORKSHOP_ROOT = (git rev-parse --show-toplevel)
$BOOTFORGE_EXTERNAL = "..\bootforge-usb-external"  # change if needed
```

bash/zsh:

```bash
WORKSHOP_ROOT="$(git rev-parse --show-toplevel)"
BOOTFORGE_EXTERNAL="../bootforge-usb-external"  # change if needed
```

### Step 1: Create enumerate directory
PowerShell:

```powershell
Set-Location (Join-Path $WORKSHOP_ROOT "crates\bootforge-usb\libbootforge\src")
New-Item -ItemType Directory -Force -Path "enumerate" | Out-Null
```

bash/zsh:

```bash
cd "$WORKSHOP_ROOT/crates/bootforge-usb/libbootforge/src"
mkdir -p enumerate
```

### Step 2: Copy enumeration files
PowerShell:

```powershell
Copy-Item -Force (Join-Path $BOOTFORGE_EXTERNAL "src\enumerate\*.rs") (Join-Path $WORKSHOP_ROOT "crates\bootforge-usb\libbootforge\src\enumerate\")
```

bash/zsh:

```bash
cp -f "$BOOTFORGE_EXTERNAL"/src/enumerate/*.rs "$WORKSHOP_ROOT"/crates/bootforge-usb/libbootforge/src/enumerate/
```

### Step 3: Copy clean types
PowerShell:

```powershell
Copy-Item -Force (Join-Path $BOOTFORGE_EXTERNAL "src\types.rs") (Join-Path $WORKSHOP_ROOT "crates\bootforge-usb\libbootforge\src\usb\clean_types.rs")
```

bash/zsh:

```bash
cp -f "$BOOTFORGE_EXTERNAL"/src/types.rs "$WORKSHOP_ROOT"/crates/bootforge-usb/libbootforge/src/usb/clean_types.rs
```

### Step 4: Update Cargo.toml dependencies

Edit `crates\bootforge-usb\libbootforge\Cargo.toml` and ensure these dependencies:

```toml
[dependencies]
rusb = "0.9"
serde = { version = "1.0", features = ["derive"] }
thiserror = "1.0"
anyhow = "1.0"
log = "0.4"
```

### Step 5: Update libs/bootforgeusb Cargo.toml

Edit `libs\bootforgeusb\Cargo.toml` and update:

```toml
[dependencies]
rusb = "0.9"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
pyo3 = { version = "0.22", features = ["extension-module"], optional = true }
thiserror = "2.0"
anyhow = "1.0"
log = "0.4"
env_logger = "0.11"
```

### Step 6: Add enumerate module to lib.rs

Edit `crates\bootforge-usb\libbootforge\src\lib.rs` and add:

```rust
pub mod enumerate;
```

## Benefits of This Integration

1. ✅ **Cleaner Architecture** - Separation of enumeration from correlation
2. ✅ **Platform Support** - Structured Linux/Windows/macOS enrichment
3. ✅ **Better Types** - Clean `UsbDeviceInfo` structure
4. ✅ **Maintainability** - Easier to extend and test
5. ✅ **Documentation** - Clear API examples

## Files Created in Workshop

1. `BOOTFORGE_USB_INTEGRATION_PLAN.md` - Detailed integration plan
2. `BOOTFORGE_USB_INTEGRATION_MANUAL.md` - This file (manual steps)

## Next Steps After Manual Copy

1. Run the manual commands above
2. Build the project: `cargo build --release`
3. Test enumeration: `cargo test --package libbootforge`
4. Update Python bindings if needed
5. Commit changes:
   ```bash
   git add .
   git commit -m "Integrate clean enumeration from external Bootforge-usb repo"
   git push
   ```

## Testing Integration

After copying files, test with:

```bash
# Test Rust library
cd crates/bootforge-usb/libbootforge
cargo test

# Test Python binding
cd libs/bootforgeusb
cargo build --release
python -c "import bootforgeusb; print(bootforgeusb.scan())"
```

## Support

If you encounter issues:
1. Check that all files were copied correctly
2. Verify Cargo.toml dependencies match
3. Run `cargo clean` and rebuild if needed
4. Check platform-specific compilation (Windows, Linux, macOS)

---

**Status**: Ready for manual integration
**External Repo**: external clone (PR #7 checked out)
**Workshop Repo**: this repository
