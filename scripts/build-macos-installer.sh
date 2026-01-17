#!/bin/bash
# Bobby's Workshop - Quick Build Script for macOS
# Creates standalone macOS installers (DMG + APP)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Parse arguments
SKIP_CLEAN=false
SKIP_DEPS=false

for arg in "$@"; do
    case $arg in
        --skip-clean)
            SKIP_CLEAN=true
            ;;
        --skip-deps)
            SKIP_DEPS=true
            ;;
    esac
done

echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  🔥 Bobby's Workshop                      ║${NC}"
echo -e "${CYAN}║     macOS Installer Builder               ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
echo -e "${CYAN}🔍 Checking Prerequisites...${NC}"
echo ""

MISSING_TOOLS=()

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js: ${NODE_VERSION}${NC}"
else
    echo -e "${RED}✗ Node.js: Not found${NC}"
    MISSING_TOOLS+=("Node.js (https://nodejs.org/)")
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm: v${NPM_VERSION}${NC}"
else
    echo -e "${RED}✗ npm: Not found${NC}"
    MISSING_TOOLS+=("npm")
fi

# Check Rust
if command -v rustc &> /dev/null; then
    RUST_VERSION=$(rustc --version)
    echo -e "${GREEN}✓ Rust: ${RUST_VERSION}${NC}"
else
    echo -e "${RED}✗ Rust: Not found${NC}"
    MISSING_TOOLS+=("Rust (https://rustup.rs/)")
fi

# Check Cargo
if command -v cargo &> /dev/null; then
    CARGO_VERSION=$(cargo --version)
    echo -e "${GREEN}✓ Cargo: ${CARGO_VERSION}${NC}"
else
    echo -e "${RED}✗ Cargo: Not found${NC}"
    MISSING_TOOLS+=("Cargo")
fi

# Check Tauri CLI
if cargo tauri --version &> /dev/null; then
    TAURI_VERSION=$(cargo tauri --version)
    echo -e "${GREEN}✓ Tauri CLI: ${TAURI_VERSION}${NC}"
else
    echo -e "${RED}✗ Tauri CLI: Not found${NC}"
    echo -e "${YELLOW}  Install with: cargo install tauri-cli${NC}"
    MISSING_TOOLS+=("Tauri CLI (cargo install tauri-cli)")
fi

# Check Xcode Command Line Tools
if xcode-select -p &> /dev/null; then
    echo -e "${GREEN}✓ Xcode Command Line Tools: Installed${NC}"
else
    echo -e "${RED}✗ Xcode Command Line Tools: Not found${NC}"
    echo -e "${YELLOW}  Install with: xcode-select --install${NC}"
    MISSING_TOOLS+=("Xcode Command Line Tools (xcode-select --install)")
fi

echo ""

if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing required tools:${NC}"
    for tool in "${MISSING_TOOLS[@]}"; do
        echo -e "${YELLOW}   • ${tool}${NC}"
    done
    echo ""
    echo -e "${YELLOW}Please install the missing tools and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites satisfied!${NC}"
echo ""

# Clean previous builds
if [ "$SKIP_CLEAN" = false ]; then
    echo -e "${CYAN}🧹 Cleaning Previous Build Artifacts...${NC}"
    if [ -d "dist" ]; then
        rm -rf dist
        echo -e "${YELLOW}  Removed dist/${NC}"
    fi
    if [ -d "src-tauri/target" ]; then
        rm -rf src-tauri/target
        echo -e "${YELLOW}  Removed src-tauri/target/${NC}"
    fi
    echo -e "${GREEN}✓ Cleanup complete${NC}"
    echo ""
fi

# Install dependencies
if [ "$SKIP_DEPS" = false ]; then
    echo -e "${CYAN}📦 Installing Dependencies...${NC}"
    echo ""
    
    echo -e "${YELLOW}Installing root dependencies...${NC}"
    npm install
    
    echo ""
    echo -e "${YELLOW}Installing server dependencies...${NC}"
    cd server
    npm install
    cd ..
    
    echo ""
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    echo ""
fi

# Build frontend
echo -e "${CYAN}🏗️  Building Frontend...${NC}"
echo ""
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Frontend built successfully${NC}"
echo ""

# Build Tauri app
echo -e "${CYAN}🚀 Building Tauri Application for macOS...${NC}"
echo ""
echo -e "${YELLOW}This may take 5-10 minutes on first build...${NC}"
echo ""

cargo tauri build --target x86_64-apple-darwin

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Tauri build failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Tauri application built successfully${NC}"
echo ""

# Display results
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📊 Build Results${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

BUNDLE_DIR="src-tauri/target/x86_64-apple-darwin/release/bundle"

if [ -d "$BUNDLE_DIR" ]; then
    echo -e "${GREEN}Installer packages created:${NC}"
    echo ""
    
    # Find DMG files
    if [ -d "$BUNDLE_DIR/dmg" ]; then
        for file in "$BUNDLE_DIR/dmg"/*.dmg; do
            if [ -f "$file" ]; then
                SIZE_MB=$(du -m "$file" | cut -f1)
                FILENAME=$(basename "$file")
                echo -e "${GREEN}  ✓ DMG Installer: ${FILENAME} (${SIZE_MB} MB)${NC}"
                echo -e "${CYAN}    Location: ${file}${NC}"
            fi
        done
    fi
    
    echo ""
    
    # Find APP bundles
    if [ -d "$BUNDLE_DIR/macos" ]; then
        for file in "$BUNDLE_DIR/macos"/*.app; do
            if [ -d "$file" ]; then
                SIZE_MB=$(du -sm "$file" | cut -f1)
                FILENAME=$(basename "$file")
                echo -e "${GREEN}  ✓ App Bundle: ${FILENAME} (${SIZE_MB} MB)${NC}"
                echo -e "${CYAN}    Location: ${file}${NC}"
            fi
        done
    fi
else
    echo -e "${YELLOW}⚠️  Bundle directory not found at: ${BUNDLE_DIR}${NC}"
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ BUILD COMPLETE!                       ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}📦 macOS installers are ready!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "${NC}  1. Test the DMG installer on a clean Mac${NC}"
echo -e "${NC}  2. Test the APP bundle by dragging to Applications${NC}"
echo -e "${NC}  3. Verify all features work correctly${NC}"
echo -e "${NC}  4. (Optional) Code sign with Apple Developer ID${NC}"
echo -e "${NC}  5. Distribute the installer files${NC}"
echo ""
echo -e "${CYAN}Installation guide: STANDALONE_INSTALLER_GUIDE.md${NC}"
echo ""
