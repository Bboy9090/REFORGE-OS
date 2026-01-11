"""
Bobby's Workshop - Python Backend
FastAPI server for Sonic Codex, Ghost Codex, and Pandora Codex operations
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from contextlib import asynccontextmanager
import os
from pathlib import Path

# Import routers
from backend.modules.sonic.routes import router as sonic_router
from backend.modules.ghost.routes import router as ghost_router
from backend.modules.pandora.routes import router as pandora_router
from backend.modules.auth.routes import router as auth_router

# Create jobs directory if it doesn't exist
JOBS_DIR = Path("jobs")
JOBS_DIR.mkdir(exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    print("🎵 Bobby's Workshop Python Backend Starting...")
    print(f"📁 Jobs directory: {JOBS_DIR.absolute()}")
    yield
    # Shutdown
    print("🛑 Bobby's Workshop Python Backend Shutting Down...")


app = FastAPI(
    title="Bobby's Workshop - Secret Rooms API",
    description="Audio Forensic Intelligence, Stealth Operations, and Hardware Manipulation",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",
        "http://localhost:5173",
        "http://127.0.0.1:5000",
        "http://127.0.0.1:5173",
        # Allow mobile device access on local network
        "http://192.168.1.1:5000",
        "http://192.168.1.1:5173",
        # Development
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


def verify_trapdoor_auth(x_secret_room_passcode: str = Header(None), x_api_key: str = Header(None)):
    """Verify Trapdoor API authentication"""
    # TODO: Implement proper authentication check
    # For now, check if header is present
    if not x_secret_room_passcode and not x_api_key:
        raise HTTPException(status_code=401, detail="Trapdoor authentication required")
    return True


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Bobby's Workshop Python Backend",
        "jobs_directory": str(JOBS_DIR.absolute())
    }


@app.get("/api/v1/ready")
async def ready_check():
    """Health check endpoint for frontend"""
    return {"status": "ready", "backend": "online"}


@app.get("/api/bootforgeusb/status")
async def bootforge_status():
    """Legacy endpoint for compatibility"""
    return {"status": "not_available", "message": "Use /api/v1/trapdoor/pandora/hardware/status instead"}


# Mount routers with Trapdoor authentication
app.include_router(
    sonic_router,
    prefix="/api/v1/trapdoor/sonic",
    tags=["Sonic Codex"]
)

app.include_router(
    ghost_router,
    prefix="/api/v1/trapdoor/ghost",
    tags=["Ghost Codex"]
)

app.include_router(
    pandora_router,
    prefix="/api/v1/trapdoor/pandora",
    tags=["Pandora Codex"]
)

app.include_router(
    auth_router,
    prefix="/api/v1/trapdoor/phoenix",
    tags=["Phoenix Key"]
)


if __name__ == "__main__":
    port = int(os.getenv("PYTHON_BACKEND_PORT", "8000"))
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
