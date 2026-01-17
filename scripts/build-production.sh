#!/bin/bash
# Production Build Script
# Optimized build process for deployment

set -e

echo "🔨 Starting Production Build..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf node_modules/.vite

# Type check
echo "📝 Running TypeScript type check..."
npm run type-check || echo "⚠️  Type check failed - continuing anyway"

# Lint
echo "🔍 Running ESLint..."
npm run lint || echo "⚠️  Lint errors found - continuing anyway"

# Build
echo "🏗️  Building application..."
npm run build

# Check bundle size
echo "📊 Bundle size analysis..."
if command -v du &> /dev/null; then
  du -sh dist/*
fi

echo "✅ Production build complete!"
echo "📦 Output: ./dist"
