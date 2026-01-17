#!/usr/bin/env python3
"""
Bobby's World - Flash Progress WebSocket Server (Python/FastAPI)

A WebSocket server for live flash operation progress updates.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import json
import time
from typing import Dict, List, Optional
from datetime import datetime
import uvicorn

app = FastAPI(title="Bobby's World Flash Progress Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class FlashJobRequest(BaseModel):
    deviceId: str
    deviceName: Optional[str] = None
    partition: Optional[str] = "system"
    imageSize: Optional[int] = 4294967296


class FlashProgressManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.active_jobs: Dict[str, dict] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"[WS] Client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"[WS] Client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        message["timestamp"] = int(time.time() * 1000)
        data = json.dumps(message)
        
        print(f"[WS] Broadcasting: {message.get('type')} {message.get('jobId', '')}")
        
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(data)
            except Exception as e:
                print(f"[WS] Send error: {e}")
                disconnected.append(connection)

        for connection in disconnected:
            self.disconnect(connection)

    async def flash_started(self, job_id: str, device_id: str, device_name: str, total_bytes: int):
        """Notify that a flash operation has started"""
        self.active_jobs[job_id] = {
            "jobId": job_id,
            "deviceId": device_id,
            "deviceName": device_name,
            "status": "running",
            "startedAt": int(time.time() * 1000)
        }
        
        await self.broadcast({
            "type": "flash_started",
            "jobId": job_id,
            "deviceId": device_id,
            "deviceName": device_name,
            "stage": "Initializing",
            "totalBytes": total_bytes
        })

    async def send_progress(self, job_id: str, device_id: str, progress: float,
                           stage: str, bytes_transferred: int, total_bytes: int,
                           transfer_speed: float, eta: float):
        """Send progress update for a specific job"""
        if job_id in self.active_jobs:
            self.active_jobs[job_id]["progress"] = progress
            self.active_jobs[job_id]["stage"] = stage
        
        await self.broadcast({
            "type": "flash_progress",
            "jobId": job_id,
            "deviceId": device_id,
            "progress": progress,
            "stage": stage,
            "bytesTransferred": bytes_transferred,
            "totalBytes": total_bytes,
            "transferSpeed": transfer_speed,
            "estimatedTimeRemaining": eta
        })

    async def flash_completed(self, job_id: str, device_id: str):
        """Notify that a flash operation completed successfully"""
        if job_id in self.active_jobs:
            self.active_jobs[job_id]["status"] = "completed"
        
        await self.broadcast({
            "type": "flash_completed",
            "jobId": job_id,
            "deviceId": device_id
        })

    async def flash_failed(self, job_id: str, device_id: str, error: str):
        """Notify that a flash operation failed"""
        if job_id in self.active_jobs:
            self.active_jobs[job_id]["status"] = "failed"
            self.active_jobs[job_id]["error"] = error
        
        await self.broadcast({
            "type": "flash_failed",
            "jobId": job_id,
            "deviceId": device_id,
            "error": error
        })

    async def flash_paused(self, job_id: str, device_id: str):
        """Notify that a flash operation was paused"""
        if job_id in self.active_jobs:
            self.active_jobs[job_id]["status"] = "paused"
        
        await self.broadcast({
            "type": "flash_paused",
            "jobId": job_id,
            "deviceId": device_id
        })

    async def flash_resumed(self, job_id: str, device_id: str):
        """Notify that a flash operation was resumed"""
        if job_id in self.active_jobs:
            self.active_jobs[job_id]["status"] = "running"
        
        await self.broadcast({
            "type": "flash_resumed",
            "jobId": job_id,
            "deviceId": device_id
        })


manager = FlashProgressManager()


@app.websocket("/flash-progress")
async def flash_progress_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "ping":
                await websocket.send_json({
                    "type": "pong",
                    "timestamp": int(time.time() * 1000)
                })
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"[WS] Error: {e}")
        manager.disconnect(websocket)


async def perform_flash(job_id: str, device_id: str, device_name: str, 
                       partition: str, image_size: int):
    """
    Simulate a flash operation with progress updates
    """
    print(f"[FLASH] Starting job {job_id} for device {device_id}")
    
    total_bytes = image_size
    chunk_size = 10485760  # 10MB
    update_interval = 0.5  # seconds
    
    await manager.flash_started(job_id, device_id, device_name, total_bytes)
    
    bytes_transferred = 0
    start_time = time.time()
    
    try:
        while bytes_transferred < total_bytes:
            await asyncio.sleep(update_interval)
            bytes_transferred += chunk_size
            
            if bytes_transferred > total_bytes:
                bytes_transferred = total_bytes
            
            progress = (bytes_transferred / total_bytes) * 100
            elapsed = time.time() - start_time
            transfer_speed = bytes_transferred / elapsed if elapsed > 0 else 0
            remaining = total_bytes - bytes_transferred
            eta = remaining / transfer_speed if transfer_speed > 0 else 0
            
            # Determine stage based on progress
            if progress < 5:
                stage = "Initializing flash operation"
            elif progress < 10:
                stage = "Verifying device connection"
            elif progress < 20:
                stage = "Unlocking bootloader"
            elif progress < 30:
                stage = "Erasing existing partition"
            elif progress < 90:
                stage = f"Flashing {partition} partition"
            elif progress < 95:
                stage = "Verifying flash integrity"
            else:
                stage = "Finalizing and rebooting"
            
            await manager.send_progress(
                job_id, device_id, progress, stage,
                bytes_transferred, total_bytes, transfer_speed, eta
            )
        
        await manager.flash_completed(job_id, device_id)
        print(f"[FLASH] Completed job {job_id}")
        
    except Exception as e:
        error_msg = str(e)
        await manager.flash_failed(job_id, device_id, error_msg)
        print(f"[FLASH] Failed job {job_id}: {error_msg}")


@app.post("/api/flash/start")
async def start_flash(request: FlashJobRequest):
    """Start a flash operation"""
    job_id = f"job_{int(time.time())}_{hex(hash(time.time()))[2:10]}"
    device_name = request.deviceName or request.deviceId
    
    print(f"[API] Starting flash job: {job_id}")
    print(f"[API] Device: {request.deviceId} ({device_name})")
    print(f"[API] Partition: {request.partition}")
    print(f"[API] Image size: {request.imageSize} bytes")
    
    asyncio.create_task(perform_flash(
        job_id, request.deviceId, device_name,
        request.partition, request.imageSize
    ))
    
    return {
        "success": True,
        "jobId": job_id,
        "status": "started",
        "deviceId": request.deviceId,
        "partition": request.partition
    }


@app.get("/api/flash/jobs")
async def get_jobs():
    """Get all active jobs"""
    return {"jobs": list(manager.active_jobs.values())}


@app.get("/api/flash/job/{job_id}")
async def get_job(job_id: str):
    """Get specific job details"""
    job = manager.active_jobs.get(job_id)
    if job:
        return {"job": job}
    return {"error": "Job not found"}, 404


@app.post("/api/flash/demo")
async def start_demo():
    """Start demo flash operations for multiple devices"""
    devices = [
        {
            "id": "PIXEL6_001",
            "name": "Google Pixel 6",
            "partition": "system",
            "size": 3221225472
        },
        {
            "id": "SAMSUNG_S21_002",
            "name": "Samsung Galaxy S21",
            "partition": "boot",
            "size": 2147483648
        },
        {
            "id": "ONEPLUS_9_003",
            "name": "OnePlus 9 Pro",
            "partition": "vendor",
            "size": 1073741824
        }
    ]
    
    jobs = []
    for i, device in enumerate(devices):
        job_id = f"job_{int(time.time())}_{i}_{hex(hash(time.time() + i))[2:10]}"
        
        delay = i * 0.5
        asyncio.create_task(
            delayed_flash(delay, job_id, device["id"], device["name"],
                        device["partition"], device["size"])
        )
        
        jobs.append({
            "jobId": job_id,
            "deviceId": device["id"],
            "deviceName": device["name"],
            "partition": device["partition"]
        })
    
    return {
        "success": True,
        "message": "Demo flash operations started",
        "jobs": jobs
    }


async def delayed_flash(delay: float, *args):
    """Start flash after delay"""
    await asyncio.sleep(delay)
    await perform_flash(*args)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "websocket": {
            "port": 8000,
            "connected_clients": len(manager.active_connections)
        },
        "active_jobs": len(manager.active_jobs)
    }


if __name__ == "__main__":
    print("")
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║  Bobby's World - Flash Progress WebSocket Server         ║")
    print("╠═══════════════════════════════════════════════════════════╣")
    print("║  HTTP API:       http://localhost:8000                   ║")
    print("║  WebSocket:      ws://localhost:8000/flash-progress      ║")
    print("╠═══════════════════════════════════════════════════════════╣")
    print("║  Endpoints:                                               ║")
    print("║    POST /api/flash/start    - Start flash job            ║")
    print("║    POST /api/flash/demo     - Start demo jobs (3 devices)║")
    print("║    GET  /api/flash/jobs     - List active jobs           ║")
    print("║    GET  /health             - Server health check        ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    print("")
    print("[SERVER] Starting server...")
    print("")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
