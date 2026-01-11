# ⚡ Quick Build & Run Guide

## 🚀 Best Case Combo (100% Setup)

### Option 1: Complete Setup & Run (RECOMMENDED)
```powershell
.\BUILD-AND-RUN.ps1
```
**What it does:**
1. ✅ Checks prerequisites (Node.js, Python, FFmpeg)
2. ✅ Creates .env file with correct config
3. ✅ Installs frontend dependencies (npm install)
4. ✅ Creates Python virtual environment
5. ✅ Installs backend dependencies (pip install)
6. ✅ Optionally builds frontend for production
7. ✅ Verifies everything is installed correctly
8. ✅ Starts both servers in separate windows

### Option 2: Commit + Build + Run
```powershell
.\COMMIT-AND-RUN.ps1
```
**What it does:**
- Same as Option 1, but ALSO:
- Checks git status
- Commits all changes (with your message)
- Then builds and runs

---

## 📋 Manual Steps (If Scripts Don't Work)

### 1. Prerequisites Check
```powershell
node --version    # Should be 18+
npm --version     # Should be 8+
python --version  # Should be 3.11+
ffmpeg -version   # Optional but recommended
```

### 2. Create .env File
Create `.env` in project root:
```env
PYTHON_BACKEND_PORT=8000
SECRET_SEQUENCE=PHOENIX_RISES_2025
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

### 3. Install Frontend Dependencies
```powershell
npm install
```

### 4. Setup Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 5. Start Servers

**Terminal 1 - Backend:**
```powershell
.\START-BACKEND.ps1
```

**Terminal 2 - Frontend:**
```powershell
.\START-FRONTEND.ps1
```

### 6. Open App
- **Frontend:** http://localhost:5000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Phoenix Key:** `PHOENIX_RISES_2025`

---

## 🔧 Troubleshooting

### "Port already in use"
```powershell
# Kill process on port 8000 (backend)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Kill process on port 5000 (frontend)
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### "Python module not found"
```powershell
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```

### "npm install fails"
```powershell
npm cache clean --force
npm install
```

### "FFmpeg not found"
- Download from https://ffmpeg.org/download.html
- Add to PATH or place in project root

---

## ✅ Verification Checklist

- [ ] Node.js 18+ installed
- [ ] Python 3.11+ installed
- [ ] .env file exists in project root
- [ ] `npm install` completed successfully
- [ ] Backend venv exists (`backend\venv`)
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Backend starts on port 8000
- [ ] Frontend starts on port 5000
- [ ] Can access http://localhost:5000
- [ ] Can access http://localhost:8000/docs

---

## 🎯 Best Case Execution Order

1. **Run BUILD-AND-RUN.ps1** (does everything automatically)
2. **Wait for servers to start** (watch the PowerShell windows)
3. **Open http://localhost:5000** in browser
4. **Enter Phoenix Key:** `PHOENIX_RISES_2025`
5. **Test Secret Rooms** (Sonic Codex, Ghost Codex, Pandora Codex)

---

**That's it! You're at 100%!** 🔥
