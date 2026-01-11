# ⚡ Quick Start - Bobby's Secret Rooms

## ✅ What's Installed

- ✅ **Frontend**: All npm packages installed
- ✅ **Backend Core**: FastAPI, Uvicorn, WebSockets, and essential packages
- ✅ **Python Virtual Environment**: Created and ready

## ⚠️ Optional Packages (Can Install Later)

Some packages require compilation or additional setup:
- `librosa` - Audio processing (needs C compiler or pre-built wheels)
- `faster-whisper` - Transcription (needs C compiler)
- `pyannote.audio` - Speaker diarization
- `webrtcvad` - Voice activity detection

**These can be installed later when needed or when you have build tools.**

---

## 🚀 Start the Application

### Step 1: Start Backend

Open a terminal and run:
```powershell
cd backend
.\venv\Scripts\activate
uvicorn backend.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 2: Start Frontend

Open another terminal and run:
```powershell
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5000/
```

### Step 3: Access the App

1. Open browser: **http://localhost:5000**
2. Navigate to **Secret Rooms**
3. Use Phoenix Key: `PHOENIX_RISES_2025`

---

## 🧪 Test Basic Functionality

### Test Phoenix Key Authentication
1. Go to Secret Rooms
2. Enter sequence: `PHOENIX_RISES_2025`
3. Should unlock and show room navigation

### Test API Endpoints
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

## 📝 Next Steps

1. **Install FFmpeg** (if not already installed)
   - Download from: https://ffmpeg.org/download.html
   - Add to PATH

2. **Install Optional Packages** (when ready)
   ```powershell
   .\backend\venv\Scripts\pip.exe install librosa faster-whisper pyannote.audio webrtcvad
   ```
   Note: These may require Visual Studio Build Tools on Windows

3. **Configure Environment**
   - Create `.env` file if needed
   - Adjust ports if conflicts occur

---

## 🐛 Troubleshooting

### Backend won't start
- Check Python version: `python --version` (should be 3.11+)
- Ensure virtual environment is activated
- Check port 8000 is not in use

### Frontend won't start
- Check Node.js version: `node --version` (should be 18+)
- Try deleting `node_modules` and running `npm install` again

### Can't access Secret Rooms
- Check backend is running on port 8000
- Check browser console for errors
- Verify Phoenix Key sequence is correct

---

**You're ready to go!** 🔥
