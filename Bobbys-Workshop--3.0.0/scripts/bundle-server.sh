#!/bin/bash

# Bundle server code to Tauri resources
# Copies server/ directory and installs production dependencies

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
RESOURCES_DIR="$ROOT_DIR/src-tauri/bundle/resources"
SERVER_DIR="$ROOT_DIR/server"
TARGET_SERVER_DIR="$RESOURCES_DIR/server"

echo "🚀 Bundling server code..."

# Ensure resources directory exists (create parent directories if needed)
echo "📁 Ensuring resources directory exists: $RESOURCES_DIR"
mkdir -p "$RESOURCES_DIR"

if [ ! -d "$RESOURCES_DIR" ]; then
    echo "❌ Error: Failed to create resources directory: $RESOURCES_DIR"
    exit 1
fi

# Clean existing server directory in resources
if [ -d "$TARGET_SERVER_DIR" ]; then
  echo "🧹 Cleaning existing server directory..."
  rm -rf "$TARGET_SERVER_DIR"
fi

# Ensure parent directory exists
PARENT_DIR=$(dirname "$TARGET_SERVER_DIR")
mkdir -p "$PARENT_DIR"

# Copy server directory
echo "📁 Copying server code to $TARGET_SERVER_DIR..."
if [ -d "$TARGET_SERVER_DIR" ]; then
    rm -rf "$TARGET_SERVER_DIR"
fi
cp -r "$SERVER_DIR" "$TARGET_SERVER_DIR"

# Verify copy succeeded
if [ ! -d "$TARGET_SERVER_DIR" ]; then
    echo "❌ Error: Failed to copy server directory to $TARGET_SERVER_DIR"
    exit 1
fi

# Remove development files
echo "🧹 Removing development files..."
find "$TARGET_SERVER_DIR" -name "*.log" -delete 2>/dev/null || true
find "$TARGET_SERVER_DIR" -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
find "$TARGET_SERVER_DIR" -name ".git" -type d -exec rm -rf {} + 2>/dev/null || true
find "$TARGET_SERVER_DIR" -name ".env" -delete 2>/dev/null || true
find "$TARGET_SERVER_DIR" -name ".env.*" -delete 2>/dev/null || true

# Install production dependencies
echo "📦 Installing production dependencies..."
cd "$TARGET_SERVER_DIR" || {
    echo "❌ Error: Failed to change to directory $TARGET_SERVER_DIR"
    exit 1
}
npm ci --production --silent

echo "✅ Server bundled successfully!"
echo "   Location: $TARGET_SERVER_DIR"

