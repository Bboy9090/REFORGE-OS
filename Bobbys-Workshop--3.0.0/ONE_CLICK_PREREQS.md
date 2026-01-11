
# One-click prerequisites (Windows focus)

## What we can actually bundle / automate

### ADB + Fastboot (platform-tools)

The backend can now provision Google Android **platform-tools** automatically into an app-managed folder (no PATH needed).

- Endpoint: `POST /api/system-tools/android/ensure`
- Managed install folder (default): `%LOCALAPPDATA%\Bobbys-Workshop\tools\android\platform-tools`
  - Override with: `BOBBYS_WORKSHOP_DATA_DIR`

This makes the app “one click” for **adb/fastboot binaries**.

### Rust

Rust is **build-time only** for the Tauri desktop build. End users do not need Rust installed to run the packaged app.

## What cannot be safely “forged in” generically

### OEM USB drivers (Motorola/Samsung/etc.)

Windows ADB detection often fails because the phone is using an MTP driver (shows up as “Portable Device”) instead of an **ADB Interface** driver.

There is no single “universal driver” that reliably enables ADB for every vendor/device. Driver installers must be:

- Vendor-provided and signed
- Installed with admin privileges
- Matched to the specific device interface

So we **do not** silently bundle/install random drivers. The app can detect that something is connected (USB enumeration) and can guide users toward installing the correct OEM driver.

## Truth mode (no fake devices)

WebSocket demo streams are gated behind `DEMO_MODE=1`. Default behavior is **no synthetic devices/events**.
