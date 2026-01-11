#!/bin/bash
# Create a DMG installer for macOS from the built .app bundle
# This makes distribution easier for end users
# Supports finding .app bundles from multiple architectures

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Bobby's Workshop - DMG Creator${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}✗ This script must be run on macOS${NC}"
    exit 1
fi

# Find the .app bundle using flexible search
echo -e "${BLUE}Searching for .app bundle...${NC}"
APP_PATH=$(find src-tauri/target -name "Bobbys-Workshop.app" -type d 2>/dev/null | head -n 1)

if [ -z "$APP_PATH" ] || [ ! -d "$APP_PATH" ]; then
    echo -e "${RED}✗ .app bundle not found${NC}"
    echo "  Please run ./scripts/build-macos-app.sh first"
    exit 1
fi

echo -e "${GREEN}✓ Found .app bundle: $APP_PATH${NC}"

# Detect architecture from path
if [[ "$APP_PATH" == *"x86_64-apple-darwin"* ]]; then
    ARCH="x86_64"
elif [[ "$APP_PATH" == *"aarch64-apple-darwin"* ]]; then
    ARCH="aarch64"
elif [[ "$APP_PATH" == *"universal-apple-darwin"* ]]; then
    ARCH="universal"
else
    ARCH="x86_64"  # Default
fi

echo -e "${BLUE}Detected architecture: $ARCH${NC}"

# Get version from Cargo.toml
VERSION=$(grep '^version' src-tauri/Cargo.toml | head -n1 | cut -d'"' -f2)
echo -e "${BLUE}Version: $VERSION${NC}"

# Output DMG name
DMG_NAME="Bobbys-Workshop-${VERSION}-macOS-${ARCH}.dmg"
DMG_PATH="dist/${DMG_NAME}"

# Create dist directory if it doesn't exist
mkdir -p dist

# Remove old DMG if it exists
if [ -f "$DMG_PATH" ]; then
    echo -e "${YELLOW}Removing old DMG...${NC}"
    rm "$DMG_PATH"
fi

echo ""
echo -e "${BLUE}Creating DMG installer...${NC}"

# Create temporary directory for DMG contents
TMP_DIR=$(mktemp -d)
echo -e "${BLUE}Temporary directory: $TMP_DIR${NC}"

# Copy .app to temp directory
cp -R "$APP_PATH" "$TMP_DIR/"

# Create Applications symlink for drag-and-drop install
ln -s /Applications "$TMP_DIR/Applications"

# Create DMG
echo -e "${BLUE}Building DMG (this may take a moment)...${NC}"
hdiutil create -volname "Bobby's Workshop" \
    -srcfolder "$TMP_DIR" \
    -ov -format UDZO \
    "$DMG_PATH"

# Cleanup
rm -rf "$TMP_DIR"

# Verify DMG was created
if [ -f "$DMG_PATH" ]; then
    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}✓ DMG created successfully!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo -e "${BLUE}DMG Location:${NC}"
    echo "  $DMG_PATH"
    echo ""
    echo -e "${BLUE}Size:${NC}"
    ls -lh "$DMG_PATH" | awk '{print "  " $5}'
    echo ""
    echo -e "${BLUE}To distribute:${NC}"
    echo "  1. Upload the DMG to your releases page"
    echo "  2. Users can download and mount the DMG"
    echo "  3. Drag the app to their Applications folder"
    echo ""
    echo -e "${YELLOW}Note: For distribution, consider code signing:${NC}"
    echo "  codesign --deep --force --verify --verbose --sign \"Developer ID\" \"$APP_PATH\""
    echo ""
else
    echo -e "${RED}✗ DMG creation failed${NC}"
    exit 1
fi
