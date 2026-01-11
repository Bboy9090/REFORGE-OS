# 🚀 Bobby's Secret Rooms - Local Setup Guide

## Prerequisites

### Required Software
- **Node.js** 18+ and npm
- **Python** 3.11+
- **FFmpeg** (for audio/video processing)
- **Git**

### Optional (for advanced features)
- **GPU** with CUDA (for DeepFilterNet neural processing)
- **USB drivers** (for Pandora Codex hardware detection)

---

## Quick Start

### 1. Clone & Navigate
```bash
cd Bobbys-Workshop--3.0.0
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
cd ..
```

### 4. Install FFmpeg

**Windows:**
- Download from https://ffmpeg.org/download.html
- Add to PATH or place in project root

**Mac:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

### 5. Configure Environment

Create `.env` file in project root:
```env
# Backend
PYTHON_BACKEND_PORT=8000
SECRET_SEQUENCE=PHOENIX_RISES_2025

# Frontend
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

### 6. Start Backend
```bash
# Activate virtual environment first
cd backend
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

uvicorn backend.main:app --reload --port 8000
```

### 7. Start Frontend (New Terminal)
```bash
npm run dev
```

### 8. Access Application
- **Frontend**: http://localhost:5000 (or port shown in terminal)
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## Troubleshooting

### "FFmpeg not found"
- Ensure FFmpeg is installed and in PATH
- Test with: `ffmpeg -version`

### "Python module not found"
- Ensure virtual environment is activated
- Reinstall: `pip install -r requirements.txt`

### "Port already in use"
- Change ports in `.env` file
- Or kill process using the port

### "USB device not detected" (Pandora Codex)
- Install USB drivers for your OS
- On Linux: `sudo apt-get install libusb-1.0-0-dev`
- Grant permissions: `sudo usermod -a -G dialout $USER`

---

## Development Commands

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run test         # Run tests
npm run test:e2e     # Run E2E tests
```

### Backend
```bash
# Activate venv first
uvicorn backend.main:app --reload    # Dev server
pytest tests/backend                 # Run tests
```

---

## First Time Setup Checklist

- [ ] Node.js installed
- [ ] Python 3.11+ installed
- [ ] FFmpeg installed and in PATH
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Virtual environment created and activated
- [ ] `.env` file created with configuration
- [ ] Backend server running on port 8000
- [ ] Frontend server running
- [ ] Can access http://localhost:5000

---

## Testing the Installation

1. **Access Secret Rooms**
   - Navigate to Secret Rooms in the app
   - Use Phoenix Key: `PHOENIX_RISES_2025`

2. **Test Sonic Codex**
   - Upload a test audio file
   - Process through pipeline
   - Verify transcription works

3. **Test Ghost Codex**
   - Shred metadata from a test image
   - Generate a canary token

4. **Test Pandora Codex**
   - Connect iOS device (if available)
   - Verify hardware detection

---

**Ready to build!** 🔥
