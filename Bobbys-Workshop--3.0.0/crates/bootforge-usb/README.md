# libBootForge - Unified USB Orchestration Engine

A comprehensive Rust framework for cross-platform device USB communication, imaging, and repair tooling.

## Architecture

```
libBootForge/
├── libbootforge/      # Core library (USB, imaging, drivers, trapdoor)
├── bootforge-cli/     # Command-line interface
└── bootforge-usb-builder/  # USB creation tool
```

## Modules

- **usb/** - USB detection, transport, vendor mapping
- **imaging/** - Multi-format image writing (APFS, NTFS, EXT, raw)
- **drivers/** - Device-specific drivers (Apple, Android, Samsung, Qualcomm, MediaTek)
- **trapdoor/** - Private tool orchestration layer
- **utils/** - Thermal monitoring, checksum verification

## Building

```bash
cargo build --release
```

## Usage

### Scan USB Devices

```bash
./target/release/bootforge-cli scan
```

### Create BootForge USB

```bash
./target/release/bootforge-usb-builder --device /dev/sdb --private --password YOUR_PASSWORD
```

## Stubs to Implement

Each module contains `// Stub: wire up ...` comments marking integration points:

- USB detection via libusb
- Actual device driver communication
- Image writing logic
- Trapdoor tool execution with sandboxing
- Thermal monitoring from system
- Checksum computation

## Configuration

See `configs/bootforge.toml` for global settings.

## Private Tools

Create `.bootforge_private/` folder locally (not shipped):

```
.bootforge_private/
├── jailbreak/
│   ├── palera1n
│   └── checkra1n
├── android/
│   └── frp_payloads/
└── windows/
    └── efi_unlocker.bin
```

## License

Private use only - Legitimacy first, tools second.
