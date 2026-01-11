"""
Sonic Codex - Performance Optimization
Caching and background job processing
"""

from functools import lru_cache
from typing import Dict, Optional
import time
from datetime import datetime, timedelta


# Simple in-memory cache (in production, use Redis)
_cache: Dict[str, Dict] = {}
_cache_ttl = 300  # 5 minutes


@lru_cache(maxsize=100)
def get_preset_cached(preset_name: str) -> Dict:
    """Cached preset lookup"""
    from backend.modules.sonic.enhancement.presets import get_preset_filter
    return get_preset_filter(preset_name)


def cache_job_list(jobs: list, ttl: int = 60):
    """Cache job list"""
    cache_key = "job_list"
    _cache[cache_key] = {
        "data": jobs,
        "expires": datetime.now() + timedelta(seconds=ttl)
    }


def get_cached_job_list() -> Optional[list]:
    """Get cached job list"""
    cache_key = "job_list"
    if cache_key in _cache:
        entry = _cache[cache_key]
        if datetime.now() < entry["expires"]:
            return entry["data"]
        else:
            del _cache[cache_key]
    return None


def cache_device_status(device_id: str, status: Dict, ttl: int = 10):
    """Cache device status"""
    cache_key = f"device_{device_id}"
    _cache[cache_key] = {
        "data": status,
        "expires": datetime.now() + timedelta(seconds=ttl)
    }


def get_cached_device_status(device_id: str) -> Optional[Dict]:
    """Get cached device status"""
    cache_key = f"device_{device_id}"
    if cache_key in _cache:
        entry = _cache[cache_key]
        if datetime.now() < entry["expires"]:
            return entry["data"]
        else:
            del _cache[cache_key]
    return None


def clear_cache():
    """Clear all cache"""
    _cache.clear()
    get_preset_cached.cache_clear()
