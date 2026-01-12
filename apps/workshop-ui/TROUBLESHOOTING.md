# Troubleshooting REFORGE OS

## White Screen / Blank Screen

If you see a white/blank screen when launching REFORGE OS:

### Common Causes

1. **Backend API Not Running**
   - The frontend requires the FastAPI backend to be running
   - Default backend URL: `http://localhost:8001`

2. **JavaScript Errors**
   - Check browser console for errors
   - Open Developer Tools (F12) to see errors

3. **Frontend Not Loading**
   - Verify `dist/` folder exists
   - Check Tauri configuration

### Solutions

#### Solution 1: Start Backend API

The app requires the backend API to be running:

```powershell
# Navigate to API directory
cd api

# Install dependencies (if needed)
pip install -r requirements.txt

# Start the server
python -m uvicorn main:app --port 8001
```

Or use the provided script:
```powershell
cd api
python main.py
```

#### Solution 2: Check Browser Console

1. Press `F12` to open Developer Tools
2. Check the Console tab for errors
3. Check the Network tab for failed requests

#### Solution 3: Verify Backend is Running

Test if backend is accessible:

```powershell
# Test health endpoint
curl http://localhost:8001/health

# Or open in browser
start http://localhost:8001/health
```

#### Solution 4: Check Configuration

Verify API URL in `apps/workshop-ui/src/lib/api-client.ts`:
- Default: `http://localhost:8001`
- Should match your backend port

### EDB Postgres Issues

If you see errors about "edb postgres":

**Current Implementation**: The app uses **JSON files** for storage, NOT Postgres.

**If you want to use Postgres**:
1. Install Postgres
2. Create database
3. Run migrations (if available)
4. Update configuration

**For now (JSON storage)**:
- No database setup required
- Data stored in `storage/` directory
- Works out of the box

### Quick Fix

**Start backend API first, then launch app:**

1. **Terminal 1 - Backend:**
   ```powershell
   cd api
   python -m uvicorn main:app --port 8001
   ```

2. **Terminal 2 - Frontend (or use desktop shortcut):**
   - Desktop shortcut will launch the app
   - Or run: `src-tauri/target/release/workshop-ui.exe`

### Development Mode

For development with hot reload:

```powershell
# Terminal 1 - Backend
cd api
python -m uvicorn main:app --port 8001 --reload

# Terminal 2 - Frontend
cd apps/workshop-ui
npm run dev
```

### Still Not Working?

1. **Check logs:**
   - Backend: Check terminal output for errors
   - Frontend: Check browser console (F12)

2. **Verify dependencies:**
   ```powershell
   # Backend
   cd api
   pip install -r requirements.txt
   
   # Frontend
   cd apps/workshop-ui
   npm install
   ```

3. **Rebuild:**
   ```powershell
   cd apps/workshop-ui
   npm run build
   ```

---

**Note**: The app requires both the Tauri frontend AND the FastAPI backend to be running.
