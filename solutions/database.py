"""Solutions database - Problem to Solution mapping for all device types."""
import os
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from enum import Enum


class DeviceType(str, Enum):
    """Supported device types for solutions."""
    COMPUTER_WINDOWS = "computer_windows"
    COMPUTER_LINUX = "computer_linux"
    MACBOOK = "macbook"
    IMAC = "imac"
    ANDROID_PHONE = "android_phone"
    ANDROID_TABLET = "android_tablet"
    IOS_IPHONE = "ios_iphone"
    IOS_IPAD = "ios_ipad"


class ProblemCategory(str, Enum):
    """Problem categories."""
    BOOT = "boot"
    HARDWARE = "hardware"
    SOFTWARE = "software"
    PERFORMANCE = "performance"
    NETWORK = "network"
    DATA = "data"
    SECURITY = "security"
    OTHER = "other"


class SolutionDifficulty(str, Enum):
    """Solution difficulty levels."""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    EXPERT = "expert"


# Storage directory
BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "storage", "solutions")
os.makedirs(BASE_DIR, exist_ok=True)

SOLUTIONS_FILE = os.path.join(BASE_DIR, "solutions.json")


def _load_solutions() -> Dict[str, Any]:
    """Load solutions database."""
    if not os.path.exists(SOLUTIONS_FILE):
        return {"solutions": []}
    try:
        with open(SOLUTIONS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return {"solutions": []}


def _save_solutions(data: Dict[str, Any]) -> None:
    """Save solutions database."""
    with open(SOLUTIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def create_solution(
    title: str,
    description: str,
    device_type: str,
    category: str,
    solution_steps: List[str],
    difficulty: str = "medium",
    estimated_time: Optional[str] = None,
    tools_needed: Optional[List[str]] = None,
    prerequisites: Optional[List[str]] = None,
    warnings: Optional[List[str]] = None,
    tags: Optional[List[str]] = None
) -> str:
    """Create a new solution entry."""
    solutions_data = _load_solutions()
    
    solution_id = str(uuid.uuid4())
    
    solution = {
        "id": solution_id,
        "title": title,
        "description": description,
        "device_type": device_type,
        "category": category,
        "solution_steps": solution_steps,
        "difficulty": difficulty,
        "estimated_time": estimated_time or "Unknown",
        "tools_needed": tools_needed or [],
        "prerequisites": prerequisites or [],
        "warnings": warnings or [],
        "tags": tags or [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    solutions_data["solutions"].append(solution)
    _save_solutions(solutions_data)
    
    return solution_id


def get_solution(solution_id: str) -> Optional[Dict[str, Any]]:
    """Get a solution by ID."""
    solutions_data = _load_solutions()
    for solution in solutions_data.get("solutions", []):
        if solution.get("id") == solution_id:
            return solution
    return None


def search_solutions(
    device_type: Optional[str] = None,
    category: Optional[str] = None,
    search_query: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: int = 100
) -> List[Dict[str, Any]]:
    """Search solutions with filters."""
    solutions_data = _load_solutions()
    solutions = solutions_data.get("solutions", [])
    
    # Filter by device type
    if device_type:
        solutions = [s for s in solutions if s.get("device_type") == device_type]
    
    # Filter by category
    if category:
        solutions = [s for s in solutions if s.get("category") == category]
    
    # Filter by difficulty
    if difficulty:
        solutions = [s for s in solutions if s.get("difficulty") == difficulty]
    
    # Search query (title, description, tags)
    if search_query:
        query_lower = search_query.lower()
        solutions = [
            s for s in solutions
            if query_lower in s.get("title", "").lower()
            or query_lower in s.get("description", "").lower()
            or any(query_lower in tag.lower() for tag in s.get("tags", []))
        ]
    
    # Limit results
    return solutions[:limit]


def list_solutions(limit: int = 100) -> List[Dict[str, Any]]:
    """List all solutions."""
    solutions_data = _load_solutions()
    return solutions_data.get("solutions", [])[:limit]


def get_solutions_by_device_type(device_type: str) -> List[Dict[str, Any]]:
    """Get all solutions for a specific device type."""
    return search_solutions(device_type=device_type)


def initialize_sample_solutions() -> None:
    """Initialize database with sample solutions (if empty)."""
    solutions_data = _load_solutions()
    if solutions_data.get("solutions"):
        return  # Already has solutions
    
    # Sample solutions
    sample_solutions = [
        {
            "id": str(uuid.uuid4()),
            "title": "MacBook Won't Boot - Recovery Mode",
            "description": "MacBook is not booting normally. Guide to access Recovery Mode and reinstall macOS.",
            "device_type": DeviceType.MACBOOK.value,
            "category": ProblemCategory.BOOT.value,
            "solution_steps": [
                "Shut down the MacBook completely",
                "Press and hold Command (⌘) + R while turning on",
                "Release keys when Apple logo appears",
                "Select 'Reinstall macOS' from Recovery Mode",
                "Follow on-screen instructions",
                "Ensure internet connection for download"
            ],
            "difficulty": SolutionDifficulty.MEDIUM.value,
            "estimated_time": "30-60 minutes",
            "tools_needed": ["Internet connection"],
            "prerequisites": ["Backup data if possible"],
            "warnings": ["Will erase data if not backed up"],
            "tags": ["boot", "recovery", "macos", "reinstall"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Windows PC Boot Loop",
            "description": "Windows PC is stuck in a boot loop, continuously restarting.",
            "device_type": DeviceType.COMPUTER_WINDOWS.value,
            "category": ProblemCategory.BOOT.value,
            "solution_steps": [
                "Boot from Windows Recovery Media",
                "Select 'Troubleshoot'",
                "Choose 'Advanced options'",
                "Select 'Startup Repair'",
                "Follow repair process",
                "If unsuccessful, try 'System Restore'"
            ],
            "difficulty": SolutionDifficulty.MEDIUM.value,
            "estimated_time": "20-40 minutes",
            "tools_needed": ["Windows Recovery Media/USB"],
            "prerequisites": [],
            "warnings": ["System Restore may affect recent changes"],
            "tags": ["boot", "windows", "recovery", "repair"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Android Phone Boot Loop",
            "description": "Android device is stuck in boot loop, continuously restarting.",
            "device_type": DeviceType.ANDROID_PHONE.value,
            "category": ProblemCategory.BOOT.value,
            "solution_steps": [
                "Boot into Recovery Mode (varies by device)",
                "Wipe cache partition",
                "If issue persists, perform factory reset",
                "Ensure device is charged (50%+)",
                "Use OEM recovery tools if available"
            ],
            "difficulty": SolutionDifficulty.MEDIUM.value,
            "estimated_time": "15-30 minutes",
            "tools_needed": ["Recovery mode access"],
            "prerequisites": ["Backup data if possible"],
            "warnings": ["Factory reset will erase all data"],
            "tags": ["boot", "android", "recovery", "reset"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "iPhone Won't Turn On",
            "description": "iPhone is completely unresponsive, won't turn on or charge.",
            "device_type": DeviceType.IOS_IPHONE.value,
            "category": ProblemCategory.HARDWARE.value,
            "solution_steps": [
                "Check charging cable and adapter",
                "Try different power source",
                "Force restart (varies by model)",
                "Connect to computer with iTunes/Finder",
                "If recognized, try restore",
                "If not recognized, check for hardware damage"
            ],
            "difficulty": SolutionDifficulty.EASY.value,
            "estimated_time": "10-30 minutes",
            "tools_needed": ["Charging cable", "Computer with iTunes/Finder"],
            "prerequisites": [],
            "warnings": ["Restore will erase data"],
            "tags": ["power", "iphone", "hardware", "charging"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    solutions_data["solutions"] = sample_solutions
    _save_solutions(solutions_data)


# Initialize sample solutions on import
initialize_sample_solutions()
