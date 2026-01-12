# Starting REFORGE OS

## Quick Start

REFORGE OS requires **both** the backend API and frontend to be running.

### Option 1: Use Launcher Script (Recommended)

```powershell
cd apps/workshop-ui
.\start-reforge-os.ps1
```

This will:
- Start the backend API automatically
- Launch the frontend app
- Handle both processes

### Option 2: Manual Start

**Terminal 1 - Backend API:**
```powershell
cd api
python -m uvicorn main:app --port 8001
```

**Terminal 2 - Frontend (or use desktop shortcut):**
- Double-click desktop shortcut "REFORGE OS"
- Or run: `apps/workshop-ui/src-tauri/target/release/workshop-ui.exe`

---

## About EDB Postgres

**Important**: The current implementation uses **JSON files** for storage, NOT Postgres.

- **No database setup required**
- Data stored in `storage/` directory
- Works out of the box

**If you see "edb postgres" errors:**
- These are not related to the current implementation
- The app doesn't require Postgres
- Ignore any Postgres-related errors

**Future**: Postgres support can be added later if needed.

---

## White Screen Fix

If you see a white/blank screen:

1. **Start the backend API first:**
   ```powershell
   cd api
   python -m uvicorn main:app --port 8001
   ```

2. **Then launch the frontend** (desktop shortcut or executable)

3. **Refresh the app window** (F5 or close and reopen)

---

## Troubleshooting

### Backend won't start
- Check Python is installed: `python --version`
- Install dependencies: `cd api && pip install -r requirements.txt`
- Check port 8001 is available

### Frontend shows white screen
- Make sure backend is running on port 8001
- Check `http://localhost:8001/health` in browser
- Press F12 in app window to see console errors

### Still not working?
See `apps/workshop-ui/TROUBLESHOOTING.md` for detailed help.
