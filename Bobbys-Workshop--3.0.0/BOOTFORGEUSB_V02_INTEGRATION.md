# BootForgeUSB v0.2 Integration Guide

## Overview

BootForgeUSB v0.2 is now integrated into Pandora Codex as the flagship "detect anything" layer. This upgrade provides **per-device correlation**, matching specific USB devices to tool outputs (adb/fastboot/idevice_id) with high confidence.

## Key Improvements in v0.2

### 1. Per-Device Correlation

- **v0.1**: System-level detection ("adb sees _a_ device")
- **v0.2**: Device-specific correlation ("adb sees _this_ device by serial")

### 2. Enhanced Evidence Structure

Every device record now includes:

- `matched_tool_ids[]` - Which tool IDs matched this specific device
- `interface_hints[]` - Full interface descriptor information
- Detailed correlation notes explaining confidence boost

### 3. Correlation Rules (Conservative)

#### Direct Serial Match (Highest Confidence)

```
IF usb.serial == tool_device_id
  THEN confidence = 0.94
       matched_tool_ids = [tool_device_id]
       note = "Correlated: adb/fastboot device id matches USB serial"
```

#### Single-Candidate Heuristic

```
IF count(likely_android_usb_devices) == 1
   AND count(adb.device_ids) == 1
  THEN confidence = 0.90
       matched_tool_ids = [adb.device_ids[0]]
       note = "Correlated: single likely-Android USB device + single adb device id present (heuristic)"
```

#### iOS UDID Correlation

```
IF count(apple_usb_devices) == 1
   AND count(idevice_id.device_ids) == 1
  THEN confidence = 0.95
       mode = ios_normal_confirmed
       matched_tool_ids = [udid]
```

## Integration Architecture

```
┌─────────────────────────────────────────────┐
│         Pandora Codex Web UI                │
│    (React + TypeScript + Spark Runtime)     │
└────────────────┬────────────────────────────┘
                 │
                 ├─► WebUSB API (Browser-based USB detection)
                 │
                 ├─► Backend API Server (Node/Express)
                 │         │
                 │         └─► Rust BootForgeUSB (via FFI/subprocess)
                 │                   │
                 │                   ├─► rusb (libusb wrapper)
                 │                   ├─► ADB tool confirmer
                 │                   ├─► Fastboot tool confirmer
                 │                   └─► idevice_id tool confirmer
                 │
                 └─► Pandora Agent (Python)
                           │
                           └─► bootforgeusb Python binding (pyo3)
```

## Usage Examples

### CLI Usage

```bash
# Build
cd libs/bootforgeusb
cargo build --release

# Scan devices
./target/release/bootforgeusb scan

# Example output
[
  {
    "device_uid": "usb:18d1:4ee7:bus1:addr5",
    "platform_hint": "android",
    "mode": "android_adb_confirmed",
    "confidence": 0.94,
    "matched_tool_ids": ["ABC123XYZ"],
    "evidence": {
      "usb": {
        "vid": "18d1",
        "pid": "4ee7",
        "serial": "ABC123XYZ",
        ...
      },
      "tools": {
        "adb": {
          "device_ids": ["ABC123XYZ"],
          "seen": true
        }
      }
    },
    "notes": [
      "Correlated: adb device id matches USB serial"
    ]
  }
]
```

### Python Integration (Pandora Agent)

```python
import bootforgeusb
import json

# Scan all USB devices with correlation
devices = bootforgeusb.scan()

for device in devices:
    print(f"\n{'='*60}")
    print(f"Device: {device['device_uid']}")
    print(f"Platform: {device['platform_hint']}")
    print(f"Mode: {device['mode']}")
    print(f"Confidence: {device['confidence']:.2%}")

    # Check if device was correlated to tool output
    if device['matched_tool_ids']:
        print(f"Matched Tool IDs: {', '.join(device['matched_tool_ids'])}")

    # Display evidence
    usb = device['evidence']['usb']
    print(f"USB: {usb['vid']}:{usb['pid']} ({usb.get('product', 'Unknown')})")

    # Display correlation notes
    for note in device['notes']:
        print(f"  📋 {note}")
```

### Backend API Integration (Node)

```javascript
// server/api/devices.ts
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function scanDevices() {
  try {
    const { stdout } = await execAsync("/path/to/bootforgeusb scan", {
      timeout: 5000,
    });

    const devices = JSON.parse(stdout);

    return devices.map((device) => ({
      uid: device.device_uid,
      platform: device.platform_hint,
      mode: device.mode,
      confidence: device.confidence,
      matchedToolIds: device.matched_tool_ids,
      evidence: device.evidence,
      notes: device.notes,
    }));
  } catch (error) {
    console.error("BootForgeUSB scan failed:", error);
    return [];
  }
}
```

### React Component Integration

```typescript
// src/hooks/use-bootforge-devices.ts
import { useState, useEffect } from "react";

interface BootForgeDevice {
  device_uid: string;
  platform_hint: string;
  mode: string;
  confidence: number;
  matched_tool_ids: string[];
  evidence: any;
  notes: string[];
}

export function useBootForgeDevices(refreshInterval = 3000) {
  const [devices, setDevices] = useState<BootForgeDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDevices() {
      try {
        const response = await fetch("/api/bootforge/scan");
        if (!response.ok) throw new Error("Failed to scan devices");

        const data = await response.json();
        setDevices(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchDevices();
    const interval = setInterval(fetchDevices, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { devices, loading, error };
}
```

## Device Dossier Display

```typescript
// src/components/DeviceDossier.tsx
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle, AlertTriangle } from "@phosphor-icons/react";

export function DeviceDossier({ device }: { device: BootForgeDevice }) {
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.90) return { label: "Confirmed", color: "bg-emerald-600" };
    if (confidence >= 0.75) return { label: "Likely", color: "bg-blue-600" };
    return { label: "Uncertain", color: "bg-amber-600" };
  };

  const badge = getConfidenceBadge(device.confidence);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{device.evidence.usb.product || "Unknown Device"}</h3>
          <p className="text-sm text-muted-foreground font-mono">
            {device.evidence.usb.vid}:{device.evidence.usb.pid}
          </p>
        </div>
        <Badge className={badge.color}>
          {badge.label} {Math.round(device.confidence * 100)}%
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Platform:</span>
          <span className="font-medium capitalize">{device.platform_hint}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Mode:</span>
          <span className="font-medium">{device.mode.replace(/_/g, ' ')}</span>
        </div>

        {device.matched_tool_ids.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600" weight="fill" />
            <span className="text-emerald-600 font-medium">
              Correlated via {device.matched_tool_ids.join(', ')}
            </span>
          </div>
        )}

        {device.notes.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Detection Notes:</p>
            {device.notes.map((note, i) => (
              <p key={i} className="text-xs text-foreground/80">• {note}</p>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
```

## Building and Deployment

### Development Build

```bash
cd libs/bootforgeusb

# Build Rust library
cargo build

# Build Python binding
pip install maturin
maturin develop

# Run tests
cargo test
```

### Production Build

```bash
# Build optimized release
cargo build --release

# Build Python wheel for distribution
maturin build --release

# Install wheel
pip install target/wheels/bootforgeusb-*.whl
```

### CI/CD Integration

```yaml
# .github/workflows/bootforgeusb.yml
name: BootForgeUSB Build

on:
  push:
    paths:
      - "libs/bootforgeusb/**"

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]

    steps:
      - uses: actions/checkout@v3

      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable

      - name: Install libusb (Linux)
        if: matrix.os == 'ubuntu-latest'
        run: sudo apt-get install -y libusb-1.0-0-dev

      - name: Build
        run: |
          cd libs/bootforgeusb
          cargo build --release
          cargo test --release

      - name: Build Python Binding
        run: |
          pip install maturin
          cd libs/bootforgeusb
          maturin build --release
```

## Troubleshooting

### No Devices Detected

```bash
# Check USB permissions (Linux)
sudo usermod -a -G plugdev $USER
sudo udevadm control --reload-rules

# Check libusb installation
ldd target/release/bootforgeusb | grep libusb

# Run with debug logging
RUST_LOG=debug ./target/release/bootforgeusb scan
```

### Tool Confirmers Not Working

```bash
# Verify tools are in PATH
which adb
which fastboot
which idevice_id

# Test tools manually
adb devices -l
fastboot devices
idevice_id -l

# Check tool permissions
ls -l $(which adb)
```

### Python Binding Issues

```bash
# Reinstall binding
pip uninstall bootforgeusb
cd libs/bootforgeusb
maturin develop --release

# Verify installation
python3 -c "import bootforgeusb; print(bootforgeusb.scan())"
```

## Performance Considerations

- **Scan Latency**: ~100-500ms depending on device count
- **Memory Usage**: ~5-10MB for typical scan
- **Tool Overhead**: 50-200ms per tool confirmer
- **Recommended Poll Interval**: 2-5 seconds

## Security Notes

1. **Read-Only Operations**: BootForgeUSB never modifies devices
2. **No Root Required**: USB enumeration works with user permissions
3. **Timeout Protection**: All tool executions have 5-second timeouts
4. **No Stealth**: All operations are logged and auditable
5. **Evidence-Based**: Only claims what can be proven

## Next Steps

1. Integrate into Pandora UI device detection panel
2. Wire up backend API endpoints for `/api/bootforge/scan`
3. Implement real-time polling with confidence tracking
4. Add device history tracking across scans
5. Build device dossier export functionality

---

**BootForgeUSB v0.2 - The greatest detection layer, built with Rust for safety, speed, and truth.**
