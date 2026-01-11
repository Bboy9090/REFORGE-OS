#!/bin/bash
# 🚀 Pandora Codex - One-Click Install Script (macOS/Linux)
# This installs ALL required tools and dependencies

set -e

echo "🎯 Pandora Codex - One-Click Installer"
echo "======================================"
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    echo "✅ Detected: macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    echo "✅ Detected: Linux"
else
    echo "❌ Unsupported OS: $OSTYPE"
    exit 1
fi

echo ""
echo "📦 Installing system dependencies..."
echo ""

# macOS Installation
if [ "$OS" = "macos" ]; then
    # Check for Homebrew
    if ! command -v brew &> /dev/null; then
        echo "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi

    echo "Installing tools via Homebrew..."
    
    # Android tools
    brew install android-platform-tools
    
    # iOS tools
    brew install libimobiledevice
    brew install ideviceinstaller
    
    # Screen mirroring
    brew install scrcpy
    
    # Media tools
    brew install ffmpeg
    
    # Network tools (optional)
    brew install mitmproxy
    
    # Build tools
    brew install node
    
    echo "✅ All system tools installed!"
fi

# Linux Installation
if [ "$OS" = "linux" ]; then
    echo "Updating package lists..."
    sudo apt-get update
    
    echo "Installing tools via apt..."
    
    # Android tools
    sudo apt-get install -y android-tools-adb android-tools-fastboot
    
    # iOS tools
    sudo apt-get install -y libimobiledevice-utils libimobiledevice6 ideviceinstaller
    
    # Screen mirroring
    sudo apt-get install -y scrcpy
    
    # Media tools
    sudo apt-get install -y ffmpeg
    
    # Network tools (optional)
    sudo apt-get install -y mitmproxy
    
    # Build tools
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    echo "✅ All system tools installed!"
fi

echo ""
echo "📦 Installing Node.js dependencies..."
echo ""

# Install Node.js dependencies
npm install

echo ""
echo "🔧 Setting up directories..."
echo ""

# Create required directories
mkdir -p data
mkdir -p data/ios-backups
mkdir -p data/debloater-backups
mkdir -p server/routes
mkdir -p server/middleware
mkdir -p server/utils
mkdir -p runtime

echo "✅ Directories created!"

echo ""
echo "🎉 Installation Complete!"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev (start development server)"
echo "2. Open: http://localhost:3001"
echo "3. Connect your device via USB"
echo ""
echo "Available tools:"
echo "  ✅ adb (Android Debug Bridge)"
echo "  ✅ fastboot (Android bootloader)"
echo "  ✅ scrcpy (Android screen mirror)"
echo "  ✅ ideviceinfo (iOS device info)"
echo "  ✅ idevicebackup2 (iOS backup/restore)"
echo "  ✅ ffmpeg (media conversion)"
echo ""
echo "🚀 Ready to go!"
