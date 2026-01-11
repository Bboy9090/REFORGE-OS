# BootForgeUSB v0.2

Evidence-based USB device detection with **per-device correlation** for Pandora Codex.

## Philosophy

**No fake outputs. No simulated success.**

BootForgeUSB v0.2 provides device detection with:

- **Per-device correlation** - Match USB devices to tool outputs by serial/ID
- **Confidence scores** - Never claim 100% certainty without proof
- **Evidence bundles** - Raw USB descriptors + tool outputs + matched IDs
- **Conservative classification** - "likely" vs "confirmed"
- **Tool confirmers** - Only run if tools are installed
- **No stealth** - All operations are explicit and logged

## What's New in v0.2

### Device Correlation

v0.2 upgrades from "system-level confirmation" to **per-device correlation**:

1. **Direct Serial Match** - USB serial equals adb/fastboot device ID
2. **Single-Candidate Heuristic** - When exactly 1 USB device + exactly 1 tool output
3. **iOS UDID Correlation** - Single Apple device + single idevice_id output
4. **Matched Tool IDs** - Each device record includes `matched_tool_ids[]`

### Enhanced Evidence

Tool evidence now includes:

```json
{
  "adb": {
    "present": true,
    "seen": true,
    "raw": "STDOUT:\nABC123\tdevice ...",
    "device_ids": ["ABC123"]
  }
}
```

### Correlation Notes

Devices now include correlation evidence in notes:

- "Correlated: adb device id matches USB serial"
- "Correlated: single likely-Android USB device + single adb device id present (heuristic)"
- "Correlated: single idevice_id UDID + single Apple USB device present"

## Architecture

### Rust Core Library

- `usb_scan.rs` - USB enumeration via rusb/libusb + interface hints
- `classify.rs` - Classification rules with v0.2 correlation logic
- `model.rs` - Type definitions (Device, Evidence, InterfaceHint, matched_tool_ids)
- `tools/confirmers.rs` - Tool validation with device ID parsing

### Python Binding (pyo3)

```python
import bootforgeusb

devices = bootforgeusb.scan()
# Returns list of Device dicts with confidence + evidence + matched_tool_ids
```

### CLI

```bash
bootforgeusb scan
```

## Device Classification

### iOS Modes

- `ios_normal_likely` - VID:05AC + not DFU/Recovery PIDs
- `ios_normal_confirmed` - Single Apple device + single idevice_id UDID
- `ios_recovery_likely` - VID:05AC + PID:1281 or interface pattern
- `ios_dfu_likely` - VID:05AC + PID:1227 or minimal descriptors + vendor interface

### Android Modes

- `android_adb_confirmed` - Serial matches adb device ID
- `android_fastboot_confirmed` - Serial matches fastboot device ID
- `android_recovery_adb_confirmed` - ADB + recovery/sideload in output
- `android_usb_likely` - Vendor VID or vendor interface, not confirmed

### Unknown

- `unknown_usb` - Connected but not classified

## Evidence Structure (v0.2)

```json
{
  "device_uid": "usb:05ac:12a8:bus3:addr12",
  "platform_hint": "android",
  "mode": "android_adb_confirmed",
  "confidence": 0.94,
  "matched_tool_ids": ["ABC123XYZ"],
  "evidence": {
    "usb": {
      "vid": "18d1",
      "pid": "4ee7",
      "manufacturer": "Google",
      "product": "Pixel",
      "serial": "ABC123XYZ",
      "bus": 1,
      "address": 5,
      "interface_class": 255,
      "interface_hints": [{ "class": 255, "subclass": 66, "protocol": 1 }]
    },
    "tools": {
      "adb": {
        "present": true,
        "seen": true,
        "raw": "STDOUT:\nABC123XYZ\tdevice product:...",
        "device_ids": ["ABC123XYZ"]
      },
      "fastboot": {
        "present": true,
        "seen": false,
        "raw": "STDOUT:\n",
        "device_ids": []
      },
      "idevice_id": {
        "present": false,
        "seen": false,
        "raw": "missing",
        "device_ids": []
      }
    }
  },
  "notes": ["Correlated: adb device id matches USB serial"]
}
```

## Tool Confirmers v0.2

Confirmers parse device IDs from tool output:

### ADB Confirmer

```bash
adb devices -l
```

Parses device IDs from lines like: `ABC123\tdevice ...`

### Fastboot Confirmer

```bash
fastboot devices
```

Parses device IDs from lines like: `ABC123\tfastboot`

### iOS Confirmer

```bash
idevice_id -l
```

Parses UDIDs (one per line)

## Confidence Scoring v0.2

- **0.55-0.70** - USB signature matches known pattern
- **0.70-0.86** - USB + interface hints
- **0.86-0.90** - iOS DFU/Recovery pattern or single-candidate heuristic
- **0.90-0.95** - Serial match or single-candidate correlation
- **0.95+** - iOS normal confirmed via idevice_id correlation

## Correlation Rules (Conservative)

### Direct Match

```
IF usb.serial == adb_device_id
  THEN mode = android_adb_confirmed
       confidence = 0.94
       matched_tool_ids = [adb_device_id]
```

### Single-Candidate (Heuristic)

```
IF count(likely_android_usb) == 1
   AND count(adb.device_ids) == 1
  THEN mode = android_adb_confirmed
       confidence = 0.90
       matched_tool_ids = [adb.device_ids[0]]
       note = "single-candidate heuristic"
```

### iOS Correlation

```
IF count(apple_usb) == 1
   AND count(idevice_id.device_ids) == 1
  THEN mode = ios_normal_confirmed
       confidence = 0.95
       matched_tool_ids = [udid]
```

## Building

### Rust Library + CLI

```bash
cd libs/bootforgeusb
cargo build --release
./target/release/bootforgeusb scan --json
```

### Python Binding

```bash
cd libs/bootforgeusb
pip install maturin
maturin develop
python3 -c "import bootforgeusb; print(bootforgeusb.scan())"
```

## Requirements

### System Dependencies

- **libusb** (Linux: `apt-get install libusb-1.0-0-dev`)
- **macOS** - Included in Xcode Command Line Tools
- **Windows** - libusb-win32 or WinUSB drivers

### Optional Tools (for confirmers)

- `adb` - Android SDK Platform Tools
- `fastboot` - Android SDK Platform Tools
- `idevice_id` - libimobiledevice

## Safety Features

1. **Read-only operations** - No device modifications
2. **Timeout protection** - Tools have execution limits
3. **Error handling** - All errors captured and logged
4. **Privilege separation** - No root/admin required for scanning
5. **Explicit permissions** - USB access requires user approval

## Integration with Pandora Agent

```python
import bootforgeusb

# Scan all devices
devices = bootforgeusb.scan()

for device in devices:
    print(f"UID: {device['device_uid']}")
    print(f"Platform: {device['platform_hint']}")
    print(f"Mode: {device['mode']}")
    print(f"Confidence: {device['confidence']}")
    print(f"Evidence: {device['evidence']}")
```

## Development

### Run Tests

```bash
cargo test
```

### Enable Logging

```bash
RUST_LOG=debug ./target/release/bootforgeusb scan
```

## Roadmap

### v0.1 (MVP) ✅

- [x] USB enumeration with rusb
- [x] Basic classification rules
- [x] Tool confirmers (adb/fastboot/idevice)
- [x] Python binding via pyo3
- [x] CLI with JSON output
- [x] Confidence scoring

### v0.2 (Current) ✅

- [x] Per-device correlation (serial matching)
- [x] Single-candidate heuristic correlation
- [x] Device ID parsing from tool outputs
- [x] Interface hints collection
- [x] matched_tool_ids in output

### v0.3 (Planned)

- [ ] Hotplug monitoring (watch mode)
- [ ] Advanced vendor modes (Samsung Odin, Qualcomm EDL, MTK)
- [ ] Windows driver binding inspection
- [ ] Device state transitions tracking

### v1.0 (Future)

- [ ] Performance profiling
- [ ] Device fingerprinting
- [ ] Risk assessment integration
- [ ] Web UI integration

## License

MIT - See LICENSE file for details

---

**Part of the Pandora Codex Enterprise Framework. Built with Rust for safety, speed, and truth.**
