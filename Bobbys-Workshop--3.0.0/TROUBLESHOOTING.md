# 🔧 Troubleshooting Guide

## If Servers Won't Start

### Step 1: Check the PowerShell Windows

Look at the PowerShell windows that opened. They will show the exact error.

**Common Errors:**

#### Backend Errors:

**"Python not found"**
- Solution: Make sure Python 3.11+ is installed
- Check: `python --version`

**"No module named 'backend'"**
- Solution: Make sure you're running from project root
- Check: You should be in `Bobbys-Workshop--3.0.0\Bobbys-Workshop--3.0.0`

**"ModuleNotFoundError"**
- Solution: Install missing packages
- Run: `.\backend\venv\Scripts\pip.exe install <package-name>`

**"Port 8000 already in use"**
- Solution: Kill the process using port 8000
- Run: `netstat -ano | findstr :8000` then `taskkill /PID <pid> /F`

#### Frontend Errors:

**"npm not found"**
- Solution: Install Node.js from https://nodejs.org/

**"Port 5000 already in use"**
- Solution: Change port in `vite.config.ts` or kill process
- Run: `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`

**"Cannot find module"**
- Solution: Reinstall dependencies
- Run: `npm install`

---

### Step 2: Manual Start (To See Errors)

**Backend:**
```powershell
cd C:\Users\Bobby\Documents\Bobbys-Workshop--3.0.0\Bobbys-Workshop--3.0.0
$env:PYTHONPATH = $PWD
.\backend\venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000
```

**Frontend:**
```powershell
cd C:\Users\Bobby\Documents\Bobbys-Workshop--3.0.0\Bobbys-Workshop--3.0.0
npm run dev
```

---

### Step 3: Quick Fixes

**Reinstall Backend Dependencies:**
```powershell
.\backend\venv\Scripts\pip.exe install -r backend\requirements.txt
```

**Reinstall Frontend Dependencies:**
```powershell
npm install
```

**Check Python Version:**
```powershell
python --version
# Should be 3.11 or higher
```

**Check Node Version:**
```powershell
node --version
# Should be 18 or higher
```

---

### Step 4: Still Not Working?

1. **Copy the exact error message** from the PowerShell window
2. **Check which step failed:**
   - Backend startup?
   - Frontend startup?
   - Import errors?
3. **Share the error** and I'll help fix it!

---

## Quick Test Commands

**Test Backend Import:**
```powershell
$env:PYTHONPATH = $PWD
.\backend\venv\Scripts\python.exe -c "from backend import main; print('OK')"
```

**Test Frontend:**
```powershell
npm run build
```

---

**Most Common Issue:** Missing dependencies. Run the install commands above!
