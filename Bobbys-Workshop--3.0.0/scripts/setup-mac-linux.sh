#!/bin/bash
# Bobby's Workshop - Mac/Linux Setup Script

set -e

echo "🚀 Setting up Bobby's Workshop..."

# Check Node.js
echo ""
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js found: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install from https://nodejs.org/"
    exit 1
fi

# Check Python
echo ""
echo "🐍 Checking Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✅ Python found: $PYTHON_VERSION"
    PYTHON_CMD=python3
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version)
    echo "✅ Python found: $PYTHON_VERSION"
    PYTHON_CMD=python
else
    echo "❌ Python not found. Please install Python 3.11+"
    exit 1
fi

# Check FFmpeg
echo ""
echo "🎬 Checking FFmpeg..."
if command -v ffmpeg &> /dev/null; then
    echo "✅ FFmpeg found"
else
    echo "⚠️  FFmpeg not found. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install ffmpeg
        else
            echo "   Please install Homebrew first: https://brew.sh/"
            echo "   Then run: brew install ffmpeg"
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update
        sudo apt-get install -y ffmpeg
    fi
fi

# Install Frontend Dependencies
echo ""
echo "📦 Installing frontend dependencies..."
npm install
echo "✅ Frontend dependencies installed"

# Create Python Virtual Environment
echo ""
echo "🐍 Setting up Python virtual environment..."
if [ ! -d "backend/venv" ]; then
    $PYTHON_CMD -m venv backend/venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate and Install Backend Dependencies
echo ""
echo "📦 Installing backend dependencies..."
source backend/venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt
deactivate
echo "✅ Backend dependencies installed"

# Create .env file if it doesn't exist
echo ""
echo "⚙️  Setting up environment..."
if [ ! -f ".env" ]; then
    cat > .env << EOF
# Backend
PYTHON_BACKEND_PORT=8000
SECRET_SEQUENCE=PHOENIX_RISES_2025

# Frontend
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Linux: Install USB dependencies for Pandora Codex
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo ""
    echo "🔌 Installing USB dependencies for Pandora Codex..."
    sudo apt-get install -y libusb-1.0-0-dev
    echo "✅ USB dependencies installed"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Start backend: cd backend && source venv/bin/activate && uvicorn backend.main:app --reload --port 8000"
echo "   2. Start frontend: npm run dev"
echo "   3. Open browser: http://localhost:5000"
