#!/usr/bin/env python3
"""Case Management API CLI - JSON interface for cases."""
import json
import sys
from cases.manager import (
    create_case,
    get_case,
    list_cases,
    update_case_status,
    update_case,
    add_device_to_case,
    get_case_devices,
    get_device,
)


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: cases_api_cli.py <command> [args...]"}))
        sys.exit(1)
    
    command = sys.argv[1]
    
    try:
        if command == "create":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Usage: create <customer_name> [email] [phone] [notes]"}))
                sys.exit(1)
            customer_name = sys.argv[2]
            email = sys.argv[3] if len(sys.argv) > 3 else ""
            phone = sys.argv[4] if len(sys.argv) > 4 else ""
            notes = sys.argv[5] if len(sys.argv) > 5 else ""
            case_id = create_case(customer_name, email, phone, notes)
            print(json.dumps({"ok": True, "case_id": case_id}))
        
        elif command == "get":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Usage: get <case_id>"}))
                sys.exit(1)
            case_id = sys.argv[2]
            case = get_case(case_id)
            if case:
                print(json.dumps({"ok": True, "case": case}))
            else:
                print(json.dumps({"ok": False, "error": "Case not found"}))
        
        elif command == "list":
            status = sys.argv[2] if len(sys.argv) > 2 else None
            cases = list_cases(status)
            print(json.dumps({"ok": True, "cases": cases}))
        
        elif command == "update-status":
            if len(sys.argv) < 4:
                print(json.dumps({"error": "Usage: update-status <case_id> <status>"}))
                sys.exit(1)
            case_id = sys.argv[2]
            status = sys.argv[3]
            success = update_case_status(case_id, status)
            print(json.dumps({"ok": success}))
        
        elif command == "add-device":
            if len(sys.argv) < 4:
                print(json.dumps({"error": "Usage: add-device <case_id> <platform> [model] [serial] [imei]"}))
                sys.exit(1)
            case_id = sys.argv[2]
            platform = sys.argv[3]
            model = sys.argv[4] if len(sys.argv) > 4 else None
            serial = sys.argv[5] if len(sys.argv) > 5 else None
            imei = sys.argv[6] if len(sys.argv) > 6 else None
            device_id = add_device_to_case(case_id, platform, model, serial, imei)
            print(json.dumps({"ok": True, "device_id": device_id}))
        
        elif command == "get-devices":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Usage: get-devices <case_id>"}))
                sys.exit(1)
            case_id = sys.argv[2]
            devices = get_case_devices(case_id)
            print(json.dumps({"ok": True, "devices": devices}))
        
        else:
            print(json.dumps({"error": f"Unknown command: {command}"}))
            sys.exit(1)
    
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
