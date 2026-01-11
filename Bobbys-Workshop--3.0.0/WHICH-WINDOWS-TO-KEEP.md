# 🪟 Which Windows to Keep Open

## ✅ KEEP THESE TWO WINDOWS OPEN:

### 1. 🔥 BACKEND Window
- **Title Bar**: "🔥 BOBBY'S WORKSHOP - BACKEND (Port 8000)"
- **What it shows**: Python/FastAPI server logs
- **What to look for**: 
  - "Uvicorn running on http://127.0.0.1:8000"
  - "Application startup complete"
- **Port**: 8000
- **Color**: Green text

### 2. 🎨 FRONTEND Window  
- **Title Bar**: "🎨 BOBBY'S WORKSHOP - FRONTEND (Port 5000)"
- **What it shows**: React/Vite dev server logs
- **What to look for**:
  - "Local: http://localhost:5000/"
  - "ready in XXX ms"
- **Port**: 5000
- **Color**: Cyan/Magenta text

---

## ❌ CLOSE THESE:

- Any other PowerShell windows
- Any windows without clear titles
- Any windows showing errors (unless you're debugging)

---

## 🚀 How to Start (If You Closed Them):

### Option 1: Double-Click Scripts
1. Double-click `START-BACKEND.ps1` (opens backend window)
2. Double-click `START-FRONTEND.ps1` (opens frontend window)

### Option 2: From PowerShell
```powershell
.\START-BACKEND.ps1
.\START-FRONTEND.ps1
```

---

## 🛑 How to Stop:

1. Click in each window
2. Press `Ctrl+C`
3. Wait for "Shutting down" message
4. Close the window

---

## ✅ Quick Check:

- **Backend working?** → Open http://localhost:8000/docs (should show API docs)
- **Frontend working?** → Open http://localhost:5000 (should show the app)

---

**Remember: Keep the TWO windows with clear titles open!** 🔥🎨
