# Quick Start for Building macOS .app

This is a simplified guide for quickly building the macOS .app bundle.

## Prerequisites

Ensure you have:
- macOS 10.15 or later
- Xcode Command Line Tools installed
- Node.js v18+
- Rust toolchain

```bash
# Check prerequisites
node --version
rustc --version
xcode-select --version
```

## Quick Build

### Option 1: Using npm scripts (Recommended)

```bash
# 1. Install dependencies
npm install

# 2. Build the macOS app
npm run tauri:build:macos
```

The .app bundle will be at:
`src-tauri/target/x86_64-apple-darwin/release/bundle/macos/Bobbys-Workshop.app`

### Option 2: Using build scripts

```bash
# 1. Run the build script
./scripts/build-macos-app.sh

# 2. Create a DMG for distribution (optional)
./scripts/create-macos-dmg.sh
```

The DMG will be at: `dist/Bobbys-Workshop-{version}-macOS.dmg`

### Option 3: Manual build

```bash
# 1. Install Tauri CLI
cargo install tauri-cli

# 2. Install dependencies
npm install

# 3. Build frontend
npm run build

# 4. Build Tauri app
cargo tauri build --target x86_64-apple-darwin
```

## Installation

After building:

1. Navigate to the build output directory
2. Copy `Bobbys-Workshop.app` to `/Applications`
3. Launch from Applications folder

## Distribution

To distribute to users:

1. Create a DMG:
   ```bash
   ./scripts/create-macos-dmg.sh
   ```

2. Share the DMG file from `dist/` directory

3. Users can:
   - Download the DMG
   - Open it
   - Drag the app to Applications

## Troubleshooting

**"Tauri CLI not found"**
```bash
cargo install tauri-cli --version "^1.0"
```

**"Command not found: cargo"**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

**"xcode-select: error"**
```bash
xcode-select --install
```

## Full Documentation

For complete details including:
- Code signing
- Notarization
- CI/CD setup
- Advanced configuration

See: [MACOS_BUILD_GUIDE.md](./MACOS_BUILD_GUIDE.md)
