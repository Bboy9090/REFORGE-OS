# macOS .app Build and Distribution Guide

## Overview

Bobby's Workshop can be built and distributed as a native macOS `.app` bundle using Tauri. This guide covers building, packaging, and distributing the application for macOS users.

## Quick Start

### For End Users

1. Download `Bobbys-Workshop-{version}-macOS-x86_64.dmg` from the [Releases](https://github.com/Bboy9090/Bobbys-Workshop-/releases) page
2. Open the DMG file
3. Drag **Bobby's Workshop** to your **Applications** folder
4. Launch from Applications
5. If prompted for security, go to **System Preferences → Security & Privacy** and click "Open Anyway"

### For Developers

```bash
# Build the macOS .app bundle
make macos:build

# Or use the npm script
npm run tauri:build:macos

# Create a DMG installer for distribution
make macos:dmg
```

## Prerequisites

### System Requirements

- **macOS**: 10.15 (Catalina) or later
- **Xcode Command Line Tools**: Required for building
- **Disk Space**: At least 2GB for build process, 500MB for final app

### Development Tools

1. **Node.js** (v18+)
   ```bash
   # Check if installed
   node --version
   
   # Install via Homebrew
   brew install node
   ```

2. **Rust** (v1.70+)
   ```bash
   # Check if installed
   rustc --version
   
   # Install Rust toolchain
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source $HOME/.cargo/env
   ```

3. **Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

4. **Tauri CLI**
   ```bash
   cargo install tauri-cli --version "^1.0"
   ```

## Building the macOS .app

### Method 1: Using Make (Recommended)

```bash
# Build the .app bundle
make macos:build

# The .app will be located at:
# src-tauri/target/x86_64-apple-darwin/release/bundle/macos/Bobbys-Workshop.app
```

### Method 2: Using npm Scripts

```bash
# Install dependencies
npm install

# Build the app
npm run tauri:build:macos
```

### Method 3: Manual Build

```bash
# 1. Install dependencies
npm install

# 2. Build the frontend
npm run build

# 3. Build the Tauri app for macOS
cargo tauri build --target x86_64-apple-darwin
```

## Creating a DMG Installer

A DMG (Disk Image) makes distribution easier for end users.

### Using the Automated Script

```bash
# Create DMG from built .app
make macos:dmg

# Or run the script directly
./scripts/create-macos-dmg.sh
```

The DMG will be created at: `dist/Bobbys-Workshop-{version}-macOS.dmg`

### Manual DMG Creation

```bash
# Create temporary directory
mkdir -p dmg_contents
cp -R src-tauri/target/x86_64-apple-darwin/release/bundle/macos/Bobbys-Workshop.app dmg_contents/
ln -s /Applications dmg_contents/Applications

# Create DMG
hdiutil create -volname "Bobby's Workshop" \
  -srcfolder dmg_contents \
  -ov -format UDZO \
  Bobbys-Workshop.dmg

# Cleanup
rm -rf dmg_contents
```

## Build Outputs

After a successful build, you'll find:

```
src-tauri/target/x86_64-apple-darwin/release/bundle/macos/
├── Bobbys-Workshop.app          # The macOS application bundle
└── bundle_dmg/                  # DMG creation resources (if generated)
```

### .app Bundle Structure

```
Bobbys-Workshop.app/
├── Contents/
│   ├── Info.plist              # App metadata
│   ├── MacOS/
│   │   └── Bobbys-Workshop     # Executable
│   ├── Resources/
│   │   ├── icon.icns           # App icon
│   │   └── ...                 # Frontend assets
│   └── _CodeSignature/         # Code signature (if signed)
```

## Code Signing (Optional but Recommended)

For distribution outside of personal use, code signing is recommended.

### Requirements

- Apple Developer Account ($99/year)
- Developer ID Application certificate

### Signing the App

```bash
# Sign the .app bundle
codesign --deep --force --verify --verbose \
  --sign "Developer ID Application: Your Name (TEAM_ID)" \
  src-tauri/target/x86_64-apple-darwin/release/bundle/macos/Bobbys-Workshop.app

# Verify the signature
codesign --verify --verbose=4 \
  src-tauri/target/x86_64-apple-darwin/release/bundle/macos/Bobbys-Workshop.app

# Check if it will pass Gatekeeper
spctl --assess --verbose=4 \
  src-tauri/target/x86_64-apple-darwin/release/bundle/macos/Bobbys-Workshop.app
```

### Notarizing for Gatekeeper

For distribution outside the App Store, notarization is required:

```bash
# 1. Create a ZIP of the app
ditto -c -k --keepParent \
  src-tauri/target/x86_64-apple-darwin/release/bundle/macos/Bobbys-Workshop.app \
  Bobbys-Workshop.zip

# 2. Submit for notarization
xcrun notarytool submit Bobbys-Workshop.zip \
  --apple-id "your@email.com" \
  --password "app-specific-password" \
  --team-id "TEAM_ID" \
  --wait

# 3. Staple the notarization ticket
xcrun stapler staple \
  src-tauri/target/x86_64-apple-darwin/release/bundle/macos/Bobbys-Workshop.app
```

## CI/CD - Automated Builds

### GitHub Actions

The repository includes a workflow for automated macOS builds:

`.github/workflows/build-macos.yml`

#### Trigger Builds

**On Tag Push** (Recommended for releases):
```bash
git tag v1.0.0
git push origin v1.0.0
```

**Manual Workflow Dispatch**:
1. Go to **Actions** → **Build macOS App**
2. Click **Run workflow**
3. Select branch and enter version (optional)

#### Artifacts

Built artifacts are available for 30 days after the workflow completes:
- `macos-app-bundle` - The .app bundle
- `macos-dmg-installer` - The DMG installer with checksums

## Distribution

### Option 1: GitHub Releases (Recommended)

When you push a tag (e.g., `v1.0.0`), the workflow automatically:
1. Builds the .app bundle
2. Creates a DMG installer
3. Generates checksums
4. Creates a GitHub Release with all files

Users can then download from: `https://github.com/Bboy9090/Bobbys-Workshop-/releases`

### Option 2: Direct Distribution

Share the DMG file directly with users:

```bash
# Generate checksum for verification
shasum -a 256 dist/Bobbys-Workshop-*.dmg > checksums.txt

# Users verify with:
shasum -a 256 -c checksums.txt
```

### Option 3: Self-Hosting

Host the DMG on your own server:

```bash
# Upload to server
scp dist/Bobbys-Workshop-*.dmg user@yourserver:/path/to/downloads/

# Provide download link
https://yourserver.com/downloads/Bobbys-Workshop-1.0.0-macOS.dmg
```

## Installation Instructions for End Users

Include these instructions with your distribution:

### Installing Bobby's Workshop on macOS

1. **Download** the DMG file (`Bobbys-Workshop-{version}-macOS-x86_64.dmg`)

2. **Open** the DMG file by double-clicking it

3. **Drag** the Bobby's Workshop icon to the Applications folder

4. **Launch** the app from your Applications folder

5. **Security Prompt** (first launch only):
   - If macOS blocks the app, go to **System Preferences → Security & Privacy**
   - Click **"Open Anyway"** next to the Bobby's Workshop message
   - Click **"Open"** in the confirmation dialog

6. **Verify Installation**:
   - The app should launch successfully
   - You should see the Bobby's Workshop interface

### Troubleshooting

**"App is damaged and can't be opened"**
- This happens with unsigned apps on newer macOS versions
- Solution: Run in Terminal:
  ```bash
  xattr -cr /Applications/Bobbys-Workshop.app
  ```

**"App can't be opened because it is from an unidentified developer"**
- Solution: Right-click the app → Open → Click "Open" in dialog

**App crashes on launch**
- Check macOS version (requires 10.15+)
- Verify you have sufficient permissions
- Check Console.app for error messages

## Build Artifacts Management

### Cleaning Build Artifacts

```bash
# Clean macOS build artifacts only
make macos:clean

# Clean all build artifacts
make clean

# Deep clean (including dependencies)
make clean:deep
```

### Artifact Sizes

Approximate file sizes:
- **.app bundle**: 80-120 MB
- **DMG installer**: 70-100 MB (compressed)

## Architecture Support

### Current Support

- **x86_64** (Intel Macs): ✅ Fully supported and tested
- **aarch64** (Apple Silicon/M1/M2/M3): ✅ Supported via cross-compilation (not tested on hardware)
- **Universal Binary**: ✅ Supported but requires both architectures

### Building for Apple Silicon

The scripts support building for Apple Silicon, though testing on actual M-series hardware is recommended:

```bash
# Add aarch64 target
rustup target add aarch64-apple-darwin

# Build for Apple Silicon
MACOS_TARGET=aarch64-apple-darwin ./scripts/build-macos-app.sh

# Or via npm
npm run tauri:build -- --target aarch64-apple-darwin

# Universal Binary (both architectures)
rustup target add x86_64-apple-darwin aarch64-apple-darwin
MACOS_TARGET=universal-apple-darwin ./scripts/build-macos-app.sh
```

**Note**: Cross-compilation from Intel to Apple Silicon (and vice versa) is supported by Rust/Tauri, but end-to-end testing on actual hardware is recommended before distribution.

## Testing the Build

### Manual Testing

```bash
# Build the app
make macos:build

# Run the .app directly
open src-tauri/target/x86_64-apple-darwin/release/bundle/macos/Bobbys-Workshop.app

# Test basic functionality:
# - App launches successfully
# - UI renders correctly
# - Backend server starts
# - USB device detection works
# - All major features are functional
```

### Automated Testing

```bash
# Run tests before building
npm test

# Test the built frontend
npm run preview
```

## Version Management

Version is controlled in `src-tauri/Cargo.toml`:

```toml
[package]
version = "1.0.0"
```

Update this before building releases. The version will be:
- Shown in the app's About dialog
- Included in the DMG filename
- Listed in GitHub Releases

## Advanced Configuration

### Custom Bundle Identifier

Edit `src-tauri/tauri.conf.json`:

```json
{
  "identifier": "com.bboy9090.bobbysworkshop"
}
```

### Window Configuration

Edit `src-tauri/tauri.conf.json`:

```json
{
  "app": {
    "windows": [
      {
        "title": "Bobbys-Workshop",
        "width": 1400,
        "height": 900,
        "resizable": true,
        "fullscreen": false
      }
    ]
  }
}
```

### Custom Icons

Place icon files in `src-tauri/icons/`:
- `icon.icns` - macOS app icon (required)
- `icon.png` - Base icon (1024x1024 recommended)

## Maintenance

### Updating Dependencies

```bash
# Update npm dependencies
npm update

# Update Rust dependencies
cd src-tauri
cargo update

# Update Tauri CLI
cargo install tauri-cli --version "^1.0" --force
```

### Rebuilding After Changes

```bash
# 1. Clean old builds
make macos:clean

# 2. Update dependencies (if needed)
npm install

# 3. Rebuild
make macos:build
```

## Security Considerations

1. **Code Signing**: Required for distribution to avoid security warnings
2. **Notarization**: Required for macOS 10.15+ to pass Gatekeeper
3. **Network Access**: Backend listens only on localhost (3001)
4. **USB Permissions**: Users must grant USB access permissions
5. **File Access**: Limited to app directory by default

## Support & Resources

- **Documentation**: See [TAURI_BUILD_GUIDE.md](./TAURI_BUILD_GUIDE.md)
- **Tauri Docs**: https://tauri.app/v1/guides/
- **Issues**: https://github.com/Bboy9090/Bobbys-Workshop-/issues
- **Discussions**: https://github.com/Bboy9090/Bobbys-Workshop-/discussions

## License

Same as Bobby's Workshop - MIT License

See [LICENSE](./LICENSE) for details.

---

**Bobby's Workshop** - macOS Distribution  
Built with Tauri • Native Performance • Easy Installation 🍎
