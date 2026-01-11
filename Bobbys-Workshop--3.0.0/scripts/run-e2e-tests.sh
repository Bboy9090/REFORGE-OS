#!/bin/bash
# E2E Test Runner Script (Bash version for Linux/macOS)
# Automates the E2E testing process

echo ""
echo "🧪 E2E Test Runner - Bobby's Workshop"
echo "═══════════════════════════════════════════"
echo ""

# Step 1: Check if Playwright is installed
echo "Step 1: Checking Playwright installation..."
if command -v playwright &> /dev/null || npx playwright --version &> /dev/null; then
    echo "✅ Playwright found"
else
    echo "⚠️ Playwright not found. Installing..."
    npx playwright install chromium
    echo "✅ Playwright installed!"
fi

echo ""

# Step 2: Check if dev server is running
echo "Step 2: Checking if dev server is running..."
if curl -s http://localhost:5000 > /dev/null 2>&1; then
    echo "✅ Dev server is running on port 5000!"
    SERVER_RUNNING=true
else
    echo "⚠️ Dev server is not running on port 5000."
    echo "   Please start the dev server in a separate terminal:"
    echo "   npm run dev"
    echo ""
    echo "   Then run this script again."
    exit 1
fi

echo ""

# Step 3: Run E2E tests
echo "Step 3: Running E2E tests..."
echo "═══════════════════════════════════════════"
echo ""

npm run test:e2e

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ E2E tests completed!"
    echo ""
    echo "📊 View test report with:"
    echo "   npm run test:e2e:report"
    echo ""
else
    echo ""
    echo "❌ E2E tests failed. Check the output above for details."
    echo ""
    echo "💡 Tips:"
    echo "   • Make sure the dev server is running"
    echo "   • Check that Playwright browsers are installed"
    echo "   • View test report: npm run test:e2e:report"
    echo ""
    exit 1
fi
