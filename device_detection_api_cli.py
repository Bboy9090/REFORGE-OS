#!/usr/bin/env python3
"""Device Detection API CLI - JSON interface for device enumeration."""
import json
import sys
from device_detection.detector import (
    detect_all_devices,
    detect_adb_devices,
    detect_ios_devices,
    generate_device_passport,
)


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: device_detection_api_cli.py <command> [args...]"}))
        sys.exit(1)
    
    command = sys.argv[1]
    
    try:
        if command == "detect-all":
            devices = detect_all_devices()
            print(json.dumps({"ok": True, "devices": devices}))
        
        elif command == "detect-adb":
            devices = detect_adb_devices()
            print(json.dumps({"ok": True, "devices": devices}))
        
        elif command == "detect-ios":
            devices = detect_ios_devices()
            print(json.dumps({"ok": True, "devices": devices}))
        
        elif command == "generate-passport":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Usage: generate-passport <device_json>"}))
                sys.exit(1)
            device_json = sys.argv[2]
            device_info = json.loads(device_json)
            passport = generate_device_passport(device_info)
            print(json.dumps({"ok": True, "passport": passport.to_dict()}))
        
        else:
            print(json.dumps({"error": f"Unknown command: {command}"}))
            sys.exit(1)
    
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
