# Quick Fix: White Screen

## Problem

REFORGE OS shows a white/blank screen.

## Cause

The **backend API is not running**. The frontend requires the FastAPI backend to be running on port 8001.

## Solution

### Start the Backend API

**Option 1: Quick Start (Recommended)**

1. Open a new PowerShell terminal
2. Navigate to the API directory:
   ```powershell
   cd "C:\Users\Bobby\NEWFORGEl - Copy\api"
   ```
3. Start the backend:
   ```powershell
   python -m uvicorn main:app --port 8001
   ```
4. Keep this terminal open (backend needs to keep running)
5. Refresh or restart the REFORGE OS window

**Option 2: Use Launcher Script**

```powershell
cd "C:\Users\Bobby\NEWFORGEl - Copy\apps\workshop-ui"
.\start-reforge-os.ps1
```

This will start both backend and frontend automatically.

---

## About "EDB Postgres"

**Important**: The current implementation uses **JSON files**, NOT Postgres.

- ✅ **No database setup needed**
- ✅ **Works out of the box**
- ✅ **Data stored in `storage/` directory**

**If you see "edb postgres" references:**
- These are NOT needed for the current version
- The app uses file-based storage
- Ignore any Postgres-related errors or messages

---

## Verify Backend is Running

Test if backend is accessible:

1. Open browser
2. Go to: http://localhost:8001/health
3. You should see: `{"status":"ok","service":"reforge-os-api"}`

If you see this, backend is running correctly!

---

## Complete Steps

1. **Start backend API:**
   ```powershell
   cd "C:\Users\Bobby\NEWFORGEl - Copy\api"
   python -m uvicorn main:app --port 8001
   ```

2. **Refresh REFORGE OS window:**
   - Press `F5` to refresh
   - Or close and reopen the app

3. **App should now work!**

---

## Still Not Working?

1. **Check backend is running:**
   - Visit http://localhost:8001/health in browser
   - Should return JSON with status "ok"

2. **Check for errors:**
   - Press `F12` in REFORGE OS window
   - Check Console tab for JavaScript errors
   - Check Network tab for failed requests

3. **Verify dependencies:**
   ```powershell
   cd api
   pip install -r requirements.txt
   ```

---

**The app needs BOTH:**
- ✅ Tauri frontend (workshop-ui.exe) - Already running
- ✅ FastAPI backend (python -m uvicorn) - Needs to be started
