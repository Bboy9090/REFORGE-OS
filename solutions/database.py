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
    """Initialize database with sample solutions (if empty or minimal)."""
    solutions_data = _load_solutions()
    existing_solutions = solutions_data.get("solutions", [])
    
    # Only initialize if database is empty or has very few solutions
    if len(existing_solutions) >= 10:
        return  # Already has sufficient solutions
    
    # Sample solutions
    sample_solutions = [
        # Mac Solutions
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
            "title": "iMac Won't Start - Reset NVRAM/PRAM",
            "description": "iMac is not starting or displaying incorrectly. Reset NVRAM/PRAM to restore default settings.",
            "device_type": DeviceType.IMAC.value,
            "category": ProblemCategory.BOOT.value,
            "solution_steps": [
                "Shut down the iMac",
                "Press Option + Command + P + R while turning on",
                "Hold for about 20 seconds",
                "Release keys when Apple logo appears and disappears twice",
                "Allow system to boot normally"
            ],
            "difficulty": SolutionDifficulty.EASY.value,
            "estimated_time": "5-10 minutes",
            "tools_needed": [],
            "prerequisites": [],
            "warnings": ["This resets system settings like volume, display resolution"],
            "tags": ["boot", "nvram", "pram", "reset", "imac"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "MacBook Battery Not Charging",
            "description": "MacBook battery is not charging or holding a charge. Diagnostic and troubleshooting steps.",
            "device_type": DeviceType.MACBOOK.value,
            "category": ProblemCategory.HARDWARE.value,
            "solution_steps": [
                "Check charging cable and adapter for damage",
                "Try different power outlet",
                "Reset SMC (System Management Controller)",
                "Check battery health in System Information",
                "If battery health is poor, consider replacement",
                "Check for software updates"
            ],
            "difficulty": SolutionDifficulty.MEDIUM.value,
            "estimated_time": "20-30 minutes",
            "tools_needed": ["Charging cable", "Adapter"],
            "prerequisites": [],
            "warnings": ["Battery replacement may be required if health is below 80%"],
            "tags": ["battery", "charging", "hardware", "smc", "macbook"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        # Windows Solutions
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
            "title": "Windows Blue Screen of Death (BSOD)",
            "description": "Windows PC experiencing frequent blue screen crashes. Diagnostic and recovery steps.",
            "device_type": DeviceType.COMPUTER_WINDOWS.value,
            "category": ProblemCategory.SOFTWARE.value,
            "solution_steps": [
                "Note the error code displayed on blue screen",
                "Boot into Safe Mode",
                "Run Windows Memory Diagnostic",
                "Check Event Viewer for error details",
                "Update or rollback recent drivers",
                "Check disk for errors (chkdsk)",
                "Restore system to previous restore point"
            ],
            "difficulty": SolutionDifficulty.HARD.value,
            "estimated_time": "30-60 minutes",
            "tools_needed": ["Windows Recovery Media"],
            "prerequisites": ["Error code from BSOD"],
            "warnings": ["May require driver updates or hardware replacement"],
            "tags": ["bsod", "crash", "windows", "diagnostic", "drivers"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Windows Slow Performance",
            "description": "Windows PC is running slowly. Optimization and cleanup steps.",
            "device_type": DeviceType.COMPUTER_WINDOWS.value,
            "category": ProblemCategory.PERFORMANCE.value,
            "solution_steps": [
                "Run Disk Cleanup utility",
                "Check Task Manager for resource-heavy processes",
                "Disable startup programs",
                "Run disk defragmentation",
                "Check for malware/virus",
                "Update Windows and drivers",
                "Check available disk space (keep 15% free)",
                "Consider SSD upgrade if using HDD"
            ],
            "difficulty": SolutionDifficulty.EASY.value,
            "estimated_time": "20-40 minutes",
            "tools_needed": [],
            "prerequisites": [],
            "warnings": ["Backup data before defragmentation"],
            "tags": ["performance", "optimization", "windows", "cleanup"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Windows Cannot Connect to Internet",
            "description": "Windows PC cannot connect to internet or network. Network troubleshooting steps.",
            "device_type": DeviceType.COMPUTER_WINDOWS.value,
            "category": ProblemCategory.NETWORK.value,
            "solution_steps": [
                "Check physical cable connections",
                "Restart modem/router",
                "Run Network Troubleshooter",
                "Reset network adapter",
                "Release and renew IP address (ipconfig /release, ipconfig /renew)",
                "Check firewall settings",
                "Update network adapter drivers",
                "Check DNS settings"
            ],
            "difficulty": SolutionDifficulty.MEDIUM.value,
            "estimated_time": "15-30 minutes",
            "tools_needed": [],
            "prerequisites": [],
            "warnings": ["May require router/modem reset"],
            "tags": ["network", "internet", "connectivity", "windows", "troubleshooting"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        # Linux Solutions
        {
            "id": str(uuid.uuid4()),
            "title": "Linux System Won't Boot - GRUB Recovery",
            "description": "Linux system fails to boot, stuck at GRUB menu or bootloader error.",
            "device_type": DeviceType.COMPUTER_LINUX.value,
            "category": ProblemCategory.BOOT.value,
            "solution_steps": [
                "Boot from Linux Live USB/CD",
                "Mount the root filesystem",
                "Chroot into the installed system",
                "Reinstall GRUB bootloader",
                "Update GRUB configuration",
                "Check fstab for errors",
                "Reboot and test"
            ],
            "difficulty": SolutionDifficulty.HARD.value,
            "estimated_time": "30-60 minutes",
            "tools_needed": ["Linux Live USB/CD"],
            "prerequisites": ["Linux system knowledge"],
            "warnings": ["Incorrect commands can make system unbootable"],
            "tags": ["boot", "grub", "linux", "bootloader", "recovery"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Linux Disk Full - Clean Up Space",
            "description": "Linux system running out of disk space. Cleanup and optimization steps.",
            "device_type": DeviceType.COMPUTER_LINUX.value,
            "category": ProblemCategory.PERFORMANCE.value,
            "solution_steps": [
                "Check disk usage (df -h)",
                "Find large files (du -sh /* | sort -h)",
                "Clean package cache (apt clean / yum clean)",
                "Remove old kernels",
                "Clean log files (journalctl --vacuum-time)",
                "Check for large log files in /var/log",
                "Remove unused packages",
                "Check for core dump files"
            ],
            "difficulty": SolutionDifficulty.MEDIUM.value,
            "estimated_time": "15-30 minutes",
            "tools_needed": [],
            "prerequisites": ["Root/sudo access"],
            "warnings": ["Be careful when deleting files, especially system logs"],
            "tags": ["disk", "space", "cleanup", "linux", "optimization"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Linux Service Won't Start",
            "description": "Linux systemd service failing to start. Diagnostic and troubleshooting steps.",
            "device_type": DeviceType.COMPUTER_LINUX.value,
            "category": ProblemCategory.SOFTWARE.value,
            "solution_steps": [
                "Check service status (systemctl status servicename)",
                "View service logs (journalctl -u servicename)",
                "Check service configuration file",
                "Verify dependencies are installed",
                "Check for syntax errors in config",
                "Test service configuration (systemd-analyze verify)",
                "Reload systemd daemon",
                "Start service and check for errors"
            ],
            "difficulty": SolutionDifficulty.MEDIUM.value,
            "estimated_time": "15-30 minutes",
            "tools_needed": [],
            "prerequisites": ["Root/sudo access", "Service name"],
            "warnings": ["Check logs carefully before modifying system services"],
            "tags": ["service", "systemd", "linux", "troubleshooting"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        # Android Solutions
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
            "title": "Android Phone Won't Charge",
            "description": "Android device is not charging or charging slowly. Diagnostic steps.",
            "device_type": DeviceType.ANDROID_PHONE.value,
            "category": ProblemCategory.HARDWARE.value,
            "solution_steps": [
                "Check charging cable and adapter",
                "Try different power source",
                "Clean charging port with compressed air",
                "Check for physical damage to port",
                "Try wireless charging if supported",
                "Boot into Safe Mode to rule out software",
                "Check battery health in settings",
                "Replace charging port or battery if needed"
            ],
            "difficulty": SolutionDifficulty.EASY.value,
            "estimated_time": "15-20 minutes",
            "tools_needed": ["Charging cable", "Adapter", "Compressed air"],
            "prerequisites": [],
            "warnings": ["May require hardware repair"],
            "tags": ["charging", "battery", "hardware", "android"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Android App Crashes Continuously",
            "description": "Specific Android app keeps crashing. Troubleshooting and resolution steps.",
            "device_type": DeviceType.ANDROID_PHONE.value,
            "category": ProblemCategory.SOFTWARE.value,
            "solution_steps": [
                "Force stop the app in Settings",
                "Clear app cache",
                "Clear app data (if acceptable)",
                "Uninstall and reinstall app",
                "Check for app updates",
                "Update Android OS",
                "Check available storage space",
                "Boot into Safe Mode to test"
            ],
            "difficulty": SolutionDifficulty.EASY.value,
            "estimated_time": "10-15 minutes",
            "tools_needed": [],
            "prerequisites": [],
            "warnings": ["Clearing app data will reset app to default"],
            "tags": ["app", "crash", "software", "android", "troubleshooting"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Android Tablet Slow Performance",
            "description": "Android tablet is running slowly or lagging. Optimization steps.",
            "device_type": DeviceType.ANDROID_TABLET.value,
            "category": ProblemCategory.PERFORMANCE.value,
            "solution_steps": [
                "Restart the tablet",
                "Clear cache for all apps",
                "Uninstall unused apps",
                "Free up storage space (keep 20% free)",
                "Disable or uninstall bloatware",
                "Update Android OS",
                "Factory reset as last resort",
                "Consider device age - may need replacement"
            ],
            "difficulty": SolutionDifficulty.MEDIUM.value,
            "estimated_time": "20-40 minutes",
            "tools_needed": [],
            "prerequisites": ["Backup data"],
            "warnings": ["Factory reset will erase all data"],
            "tags": ["performance", "slow", "optimization", "android", "tablet"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        # iOS Solutions
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
        },
        {
            "id": str(uuid.uuid4()),
            "title": "iPhone Stuck in Recovery Mode",
            "description": "iPhone is stuck in recovery mode (connect to iTunes/Finder screen).",
            "device_type": DeviceType.IOS_IPHONE.value,
            "category": ProblemCategory.BOOT.value,
            "solution_steps": [
                "Connect to computer with iTunes/Finder",
                "Try 'Update' first (preserves data)",
                "If update fails, try 'Restore'",
                "If restore fails, use DFU mode",
                "Use recovery tools if available",
                "If all else fails, check for hardware issues"
            ],
            "difficulty": SolutionDifficulty.HARD.value,
            "estimated_time": "30-60 minutes",
            "tools_needed": ["Computer with iTunes/Finder", "USB cable"],
            "prerequisites": [],
            "warnings": ["Restore will erase all data", "DFU mode is complex"],
            "tags": ["recovery", "dfu", "restore", "iphone", "itunes"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "iPad Touch Screen Not Responding",
            "description": "iPad touch screen is unresponsive or erratic. Troubleshooting steps.",
            "device_type": DeviceType.IOS_IPAD.value,
            "category": ProblemCategory.HARDWARE.value,
            "solution_steps": [
                "Restart the iPad",
                "Remove screen protector or case",
                "Clean screen with microfiber cloth",
                "Check for software updates",
                "Reset all settings",
                "Restore from backup",
                "If issue persists, check for screen damage",
                "May require screen replacement"
            ],
            "difficulty": SolutionDifficulty.MEDIUM.value,
            "estimated_time": "20-40 minutes",
            "tools_needed": ["Microfiber cloth"],
            "prerequisites": ["Backup data"],
            "warnings": ["May require hardware repair", "Reset all settings removes preferences"],
            "tags": ["touch", "screen", "hardware", "ipad", "troubleshooting"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "iPhone Overheating",
            "description": "iPhone is overheating during use or charging. Diagnostic and resolution steps.",
            "device_type": DeviceType.IOS_IPHONE.value,
            "category": ProblemCategory.HARDWARE.value,
            "solution_steps": [
                "Remove from case during charging",
                "Stop using device until cool",
                "Check for resource-intensive apps",
                "Close background apps",
                "Disable location services if not needed",
                "Update iOS to latest version",
                "Check battery health",
                "If persistent, may need battery replacement"
            ],
            "difficulty": SolutionDifficulty.EASY.value,
            "estimated_time": "15-20 minutes",
            "tools_needed": [],
            "prerequisites": [],
            "warnings": ["Overheating can damage battery permanently"],
            "tags": ["overheating", "battery", "temperature", "iphone"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    solutions_data["solutions"] = sample_solutions
    _save_solutions(solutions_data)


# Initialize sample solutions on import
initialize_sample_solutions()
