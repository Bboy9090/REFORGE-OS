# Backend API Setup Guide

This guide explains how to set up and run the Bobby Dev Arsenal backend API server for real system tool and device detection.

## 🚀 Quick Start

### 1. Install Backend Dependencies

```bash
npm run server:install
```

This installs Express and CORS for the backend API server.

### 2. Start the Backend Server

**Development mode (with auto-reload):**

```bash
npm run server:dev
```

**Production mode:**

```bash
npm run server:start
```

The server will start on **http://localhost:3001**

### 3. Start the Frontend

In a separate terminal:

```bash
npm run dev
```

The frontend will start on **http://localhost:5173** and connect to the backend API.

## 📡 How It Works

### Architecture

```
┌─────────────────────┐
│   React Frontend    │  Port 5173
│  (Vite Dev Server)  │
└──────────┬──────────┘
           │ HTTP Requests
           ▼
┌─────────────────────┐
│   Express Backend   │  Port 3001
│   (API Server)      │
└──────────┬──────────┘
           │ execSync()
           ▼
┌─────────────────────┐
│  System Commands    │
│  (rustc, adb, etc)  │
└─────────────────────┘
```

### Frontend → Backend Flow

1. **Frontend** makes HTTP request to `http://localhost:3001/api/system-tools`
2. **Backend** executes system commands (e.g., `rustc --version`)
3. **Backend** returns JSON with real detection results
4. **Frontend** displays actual installed tools

### No Fake Data

- ✅ All tool detection is **real** via `execSync()`
- ✅ Only shows tools that are **actually installed**
- ✅ Shows **actual version numbers** from commands
- ✅ ADB devices list shows **real connected devices**
- ⚠️ If backend isn't running, frontend shows clear error message

## 🔧 Available Endpoints

### GET /api/health

Health check endpoint.

```bash
curl http://localhost:3001/api/health
```

### GET /api/system-tools

Get all system tools detection results.

```bash
curl http://localhost:3001/api/system-tools
```

### GET /api/system-tools/rust

Get Rust toolchain info.

```bash
curl http://localhost:3001/api/system-tools/rust
```

### GET /api/system-tools/android

Get Android tools (ADB, Fastboot) info.

```bash
curl http://localhost:3001/api/system-tools/android
```

### GET /api/system-info

Get system information (OS, CPU, memory).

```bash
curl http://localhost:3001/api/system-info
```

### GET /api/adb/devices

Get parsed ADB devices list.

```bash
curl http://localhost:3001/api/adb/devices
```

See [server/README.md](server/README.md) for full API documentation.

## 🐛 Troubleshooting

### "Backend API not available" error

**Cause:** The backend server isn't running or is on a different port.

**Solution:**

```bash
# Check if server is running
lsof -i :3001

# Start the server
npm run server:dev
```

### Port 3001 already in use

**Solution:**

```bash
# Kill process on port 3001
npm run server:kill

# Or manually
lsof -ti :3001 | xargs kill -9

# Then restart
npm run server:dev
```

### Tools not detected even when installed

**Cause:** Tools might not be in PATH or require different command.

**Solution:**

```bash
# Test command manually
rustc --version
adb --version

# Check PATH
echo $PATH

# Restart terminal/shell after installing tools
```

### CORS errors in browser console

**Cause:** Backend CORS is misconfigured or frontend is using wrong URL.

**Solution:** The backend has CORS enabled by default. Check that:

- Backend is running on port 3001
- Frontend is making requests to `http://localhost:3001`
- No proxy is interfering

## 📁 Project Structure

```
bobby-dev-arsenal/
├── server/                  # Backend API server
│   ├── index.js            # Express server with endpoints
│   ├── package.json        # Server dependencies
│   └── README.md           # API documentation
├── src/                    # Frontend React app
│   ├── lib/
│   │   ├── apiConfig.ts   # API URL configuration
│   │   └── deviceDetection.ts  # Detection logic
│   └── components/
│       └── SystemToolsDetector.tsx  # UI component
├── scripts/                # Standalone detection scripts
│   ├── dev-arsenal-status.js
│   ├── check-rust.js
│   └── check-android-tools.js
└── package.json           # Root package with scripts
```

## 🔐 Security

The backend implements several security measures:

- ✅ **Command timeouts** (5s max execution time)
- ✅ **Whitelisted ADB commands** (no arbitrary command execution)
- ✅ **Error handling** for all system calls
- ✅ **CORS configured** for local development
- ⚠️ **Not for production** - This is a development tool

## 🚦 Running in Production

To run the backend in a production-like environment:

```bash
# Set environment variable
export PORT=3001

# Or in package.json script
PORT=3001 npm run server:start
```

For actual production deployment, add:

- Environment-based CORS configuration
- Rate limiting
- Authentication
- HTTPS/TLS
- Process manager (PM2)

## 📚 Next Steps

1. **Start both servers** (backend + frontend)
2. **Open the app** in browser: http://localhost:5173
3. **Click "Refresh"** on System Tools panel
4. **See real tool detection** with actual versions

The app will only show tools that are actually installed on your system!
