#!/bin/bash
# Build script for macOS .app bundle using Tauri
# This script builds Bobby's Workshop as a native macOS application
# Supports both Intel (x86_64) and Apple Silicon (aarch64) architectures

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Default target (can be overridden with environment variable)
TARGET="${MACOS_TARGET:-x86_64-apple-darwin}"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Bobby's Workshop - macOS .app Builder${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${BLUE}Target: $TARGET${NC}"
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${YELLOW}⚠️  Warning: This script is designed for macOS${NC}"
    echo -e "${YELLOW}   Current OS: $OSTYPE${NC}"
    echo -e "${YELLOW}   The build may not work correctly on non-macOS systems${NC}"
    echo ""
fi

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "  Install from: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version)${NC}"

# Check Rust
if ! command -v rustc &> /dev/null; then
    echo -e "${RED}✗ Rust is not installed${NC}"
    echo "  Install from: https://rustup.rs/"
    exit 1
fi
echo -e "${GREEN}✓ Rust $(rustc --version)${NC}"

# Check Cargo
if ! command -v cargo &> /dev/null; then
    echo -e "${RED}✗ Cargo is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Cargo $(cargo --version)${NC}"

# Check if Tauri CLI is installed
if ! cargo tauri --version &> /dev/null; then
    echo -e "${YELLOW}⚠️  Tauri CLI not found, installing...${NC}"
    cargo install tauri-cli --version "^1.0"
else
    echo -e "${GREEN}✓ Tauri CLI $(cargo tauri --version)${NC}"
fi

# Add target if not already installed
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${BLUE}Ensuring Rust target is installed...${NC}"
    rustup target add "$TARGET" 2>/dev/null || true
fi

echo ""

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Build frontend
echo -e "${BLUE}Building frontend...${NC}"
npm run build
echo -e "${GREEN}✓ Frontend built${NC}"
echo ""

# Build Tauri app
echo -e "${BLUE}Building macOS .app bundle for $TARGET...${NC}"
echo -e "${YELLOW}This may take several minutes...${NC}"
cargo tauri build --target "$TARGET"

# Find the built .app bundle using flexible search
echo -e "${BLUE}Locating built .app bundle...${NC}"
APP_PATH=$(find src-tauri/target -name "*.app" -type d 2>/dev/null | head -n 1)

# Check if build succeeded
if [ -n "$APP_PATH" ] && [ -d "$APP_PATH" ]; then
    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}✓ Build successful!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo -e "${BLUE}Output location:${NC}"
    echo "  $APP_PATH"
    echo ""
    ls -lh "$APP_PATH" 2>/dev/null || echo "  (Bundle directory)"
    echo ""
    echo -e "${BLUE}To install:${NC}"
    echo "  1. Open Finder"
    echo "  2. Navigate to: $(dirname "$APP_PATH")"
    echo "  3. Drag $(basename "$APP_PATH") to Applications"
    echo ""
    echo -e "${BLUE}To create a DMG for distribution, run:${NC}"
    echo "  ./scripts/create-macos-dmg.sh"
    echo ""
else
    echo -e "${RED}✗ Build failed or output directory not found${NC}"
    exit 1
fi
