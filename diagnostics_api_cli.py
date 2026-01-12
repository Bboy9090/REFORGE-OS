#!/usr/bin/env python3
"""Diagnostics API CLI - JSON interface for authorized diagnostics."""
import json
import sys
from diagnostics.adb_diagnostics import (
    run_authorized_adb_diagnostics,
    get_device_properties,
    capture_bugreport,
    capture_logcat_snapshot,
    check_adb_authorization,
)
from diagnostics.report_generator import generate_diagnostics_report, generate_json_report


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: diagnostics_api_cli.py <command> [args...]"}))
        sys.exit(1)
    
    command = sys.argv[1]
    
    try:
        if command == "check-auth":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Usage: check-auth <device_serial>"}))
                sys.exit(1)
            device_serial = sys.argv[2]
            authorized = check_adb_authorization(device_serial)
            print(json.dumps({"ok": True, "authorized": authorized, "device_serial": device_serial}))
        
        elif command == "get-properties":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Usage: get-properties <device_serial>"}))
                sys.exit(1)
            device_serial = sys.argv[2]
            result = get_device_properties(device_serial)
            print(json.dumps({"ok": result.success, "result": result.to_dict()}))
        
        elif command == "capture-logcat":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Usage: capture-logcat <device_serial> [output_dir]"}))
                sys.exit(1)
            device_serial = sys.argv[2]
            output_dir = sys.argv[3] if len(sys.argv) > 3 else "storage/diagnostics"
            result = capture_logcat_snapshot(device_serial, output_dir)
            print(json.dumps({"ok": result.success, "result": result.to_dict()}))
        
        elif command == "capture-bugreport":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Usage: capture-bugreport <device_serial> [output_dir]"}))
                sys.exit(1)
            device_serial = sys.argv[2]
            output_dir = sys.argv[3] if len(sys.argv) > 3 else "storage/diagnostics"
            result = capture_bugreport(device_serial, output_dir)
            print(json.dumps({"ok": result.success, "result": result.to_dict()}))
        
        elif command == "run-diagnostics":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Usage: run-diagnostics <device_serial> [operations...]"}))
                sys.exit(1)
            device_serial = sys.argv[2]
            operations = sys.argv[3:] if len(sys.argv) > 3 else None
            output_dir = "storage/diagnostics"
            results = run_authorized_adb_diagnostics(device_serial, operations, output_dir)
            print(json.dumps({"ok": True, "diagnostics": results}))
        
        elif command == "generate-report":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Usage: generate-report <diagnostics_json> [case_id] [device_id]"}))
                sys.exit(1)
            diagnostics_json = sys.argv[2]
            diagnostics_data = json.loads(diagnostics_json)
            case_id = sys.argv[3] if len(sys.argv) > 3 else None
            device_id = sys.argv[4] if len(sys.argv) > 4 else None
            report_path = generate_diagnostics_report(diagnostics_data, case_id, device_id)
            json_path = generate_json_report(diagnostics_data)
            print(json.dumps({"ok": True, "markdown_report": report_path, "json_report": json_path}))
        
        else:
            print(json.dumps({"error": f"Unknown command: {command}"}))
            sys.exit(1)
    
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
