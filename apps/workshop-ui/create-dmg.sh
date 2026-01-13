#!/bin/bash
# Create DMG for macOS distribution

set -e

APP_NAME="REFORGE OS"
APP_BUNDLE="src-tauri/target/release/bundle/macos/REFORGE OS.app"
DMG_NAME="REFORGE-OS-3.0.0.dmg"
DMG_PATH="src-tauri/target/release/bundle/dmg"

echo "📦 Creating DMG for macOS..."

mkdir -p "$DMG_PATH"

# Create DMG
hdiutil create -volname "$APP_NAME" -srcfolder "$APP_BUNDLE" -ov -format UDZO "$DMG_PATH/$DMG_NAME"

echo "✅ DMG created: $DMG_PATH/$DMG_NAME"
