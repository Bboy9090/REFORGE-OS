"""Health check handler."""

import time

_start_time = time.time()

def health_handler():
    """Get health status."""
    uptime_ms = int((time.time() - _start_time) * 1000)
    
    return {
        "status": "ok",
        "version": "py-worker-1.0.0",
        "uptime_ms": uptime_ms
    }
