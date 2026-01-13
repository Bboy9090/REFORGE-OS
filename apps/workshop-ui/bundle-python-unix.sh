#!/bin/bash
# Bundle Python Runtime for macOS/Linux
# Downloads embeddable Python and copies to Tauri resources

set -e

PYTHON_VERSION="3.11.7"
BUNDLE_DIR="src-tauri/resources/python"
TEMP_DIR="/tmp/reforge-python-bundle"

echo "📦 Bundling Python $PYTHON_VERSION for macOS/Linux..."

# Create directories
mkdir -p "$BUNDLE_DIR"
mkdir -p "$TEMP_DIR"

# For macOS, use pyenv or download from python.org
# For now, we'll use system Python and create a virtual environment
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Detected macOS..."
    
    # Check if Python 3.11+ is available
    if command -v python3.11 &> /dev/null; then
        PYTHON_CMD="python3.11"
    elif command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
    else
        echo "❌ Python 3 not found. Please install Python 3.11+"
        exit 1
    fi
    
    # Create virtual environment
    echo "Creating virtual environment..."
    $PYTHON_CMD -m venv "$BUNDLE_DIR/venv"
    
    # Activate and install dependencies
    source "$BUNDLE_DIR/venv/bin/activate"
    pip install --upgrade pip
    pip install -r ../../python/requirements.txt
    
    # Copy Python app
    cp -r ../../python/app "$BUNDLE_DIR/app"
    
    # Create launcher script
    cat > "$BUNDLE_DIR/python.sh" << 'EOF'
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
source venv/bin/activate
exec python app/main.py "$@"
EOF
    chmod +x "$BUNDLE_DIR/python.sh"
    
    echo "✅ Python bundled successfully!"
    echo "Location: $BUNDLE_DIR"
else
    echo "❌ Unsupported platform: $OSTYPE"
    exit 1
fi
