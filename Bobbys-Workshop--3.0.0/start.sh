#!/bin/bash
# 🚀 Pandora Codex - One-Click Run Script (macOS/Linux)
# Run this to start the server

set -e

echo "========================================"
echo "🎯 Pandora Codex - Starting Server"
echo "========================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if tools are installed
if ! command -v adb &> /dev/null; then
    echo "⚠️  ADB not found. Run ./install.sh first!"
    echo ""
fi

if ! command -v scrcpy &> /dev/null; then
    echo "⚠️  scrcpy not found. Run ./install.sh first!"
    echo ""
fi

# Start the server
echo "🚀 Starting Pandora Codex server..."
echo ""
echo "Server will start at: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Open browser (optional)
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3001
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3001 2>/dev/null || true
fi

npm run dev
