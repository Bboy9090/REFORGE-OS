# Bootforge USB Integration Plan

## Overview

Integrating the **external Bootforge-usb repository** (clean enumeration library) with **Bobby's Workshop** (comprehensive flashing platform).

## Repository Comparison

### External Bootforge-usb (external clone)
- **Purpose**: Clean, focused USB enumeration library
- **Version**: 0.1.0
- **Features**:
  - Cross-platform USB device enumeration (libusb/rusb)
  - Platform-specific enrichment (Linux sysfs, Windows SetupAPI planned, macOS IOKit planned)
  - Clean data structures (`UsbDeviceInfo`, `PlatformHint`, `UsbBusType`)
  - Minimal dependencies
  - Well-tested, production-ready code

### Workshop's Bootforge Implementation

#### `libs/bootforgeusb/` (Python binding)
- **Purpose**: Device detection with correlation (v0.2)
- **Features**:
  - Per-device correlation (adb/fastboot/idevice_id)
  - Confidence scoring
  - Evidence bundles
  - Python bindings via pyo3

#### `crates/bootforge-usb/` (Full framework)
- **Purpose**: Complete USB orchestration engine
- **Features**:
  - USB detection + imaging + flashing
  - Device-specific drivers (Apple, Android, Samsung, Qualcomm, MediaTek)
  - Trapdoor tooling integration
  - Thermal monitoring
  - Multiple CLI tools (bootforge-cli, trapdoor-cli, bootforge-usb-builder)

## Integration Strategy

### Phase 1: Copy Clean Enumeration Code ✅
**Goal**: Import the cleaner enumeration architecture from external repo

**Actions**:
1. Create `crates/bootforge-usb/libbootforge/src/enumerate/` directory
2. Copy clean enumeration modules:
   - `libusb.rs` - Base enumeration
   - `linux.rs` - Linux sysfs enrichment
   - `windows.rs` - Windows SetupAPI (placeholder)
   - `macos.rs` - macOS IOKit (placeholder)
   - `mod.rs` - Unified entry point
3. Copy clean types from `types.rs` → `crates/bootforge-usb/libbootforge/src/types.rs`
4. Update `libs/bootforgeusb/src/usb_scan.rs` to use cleaner enumeration

### Phase 2: Unify Dependencies
**Goal**: Ensure both implementations use same Rust dependencies

**Actions**:
1. Update `libs/bootforgeusb/Cargo.toml` to match external repo dependencies
2. Update `crates/bootforge-usb/libbootforge/Cargo.toml` with clean deps
3. Use `rusb = "0.9"` consistently
4. Use `anyhow` for error handling in enumeration code

### Phase 3: Enhance Detection Layer
**Goal**: Combine clean enumeration with correlation features

**Actions**:
1. Use external repo's `enumerate_libusb()` as base
2. Keep Workshop's correlation logic (adb/fastboot matching)
3. Merge confidence scoring with clean device info
4. Update evidence structure to include `UsbDeviceInfo`

### Phase 4: Documentation Update
**Goal**: Document the integration and architecture

**Actions**:
1. Update `BOOTFORGEUSB_V02_INTEGRATION.md` with new architecture
2. Add API examples showing both enumeration and correlation
3. Document platform-specific enrichment status
4. Add troubleshooting for cross-platform issues

### Phase 5: Testing
**Goal**: Ensure integration works across platforms

**Actions**:
1. Test enumeration on Windows/Linux/macOS
2. Test correlation with adb/fastboot devices
3. Verify Python bindings still work
4. Run existing test suites

## File Mapping

| External Repo | Workshop Destination | Status |
|--------------|---------------------|--------|
| `src/lib.rs` | `crates/bootforge-usb/libbootforge/src/lib.rs` | Merge |
| `src/types.rs` | `crates/bootforge-usb/libbootforge/src/usb/types.rs` | Copy + extend |
| `src/enumerate/mod.rs` | `crates/bootforge-usb/libbootforge/src/usb/enumerate.rs` | Copy |
| `src/enumerate/libusb.rs` | `crates/bootforge-usb/libbootforge/src/usb/enumerate_libusb.rs` | Copy |
| `src/enumerate/linux.rs` | `crates/bootforge-usb/libbootforge/src/usb/enrich_linux.rs` | Copy |
| `src/enumerate/windows.rs` | `crates/bootforge-usb/libbootforge/src/usb/enrich_windows.rs` | Copy |
| `src/enumerate/macos.rs` | `crates/bootforge-usb/libbootforge/src/usb/enrich_macos.rs` | Copy |
| `examples/list_devices.rs` | `crates/bootforge-usb/libbootforge/examples/` | Copy |

## Benefits of Integration

1. **Cleaner Architecture**: Better separation between enumeration and correlation
2. **Platform Support**: Structured approach to platform-specific code
3. **Maintainability**: Easier to understand and extend
4. **Testing**: Better test coverage with clean interfaces
5. **Documentation**: Clearer API examples and usage patterns

## Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Breaking existing Python bindings | Keep existing API surface, refactor internals only |
| Correlation logic breaks | Preserve existing correlation tests before refactoring |
| Platform-specific code conflicts | Use conditional compilation carefully |
| Performance regression | Benchmark before/after integration |

## Next Steps

1. ✅ Clone external repo and analyze PR #7
2. 🔄 Copy clean enumeration code to Workshop
3. ⏳ Update Python bindings to use new enumeration
4. ⏳ Run tests and verify functionality
5. ⏳ Update documentation
6. ⏳ Commit and push integration

## Machine-agnostic paths (recommended)

To keep this reproducible on any machine/OS, use workspace-relative paths:

- Workshop repo root: `.` (this repository)
- External repo root: `../bootforge-usb-external` (example)

If you use a different location, set an env var and reuse it in commands:

- PowerShell:
  - `$env:BOOTFORGE_EXTERNAL = "..\bootforge-usb-external"`
- Bash/zsh:
  - `export BOOTFORGE_EXTERNAL="../bootforge-usb-external"`

---

**Status**: Phase 1 - In Progress
**Last Updated**: 2025-12-22
