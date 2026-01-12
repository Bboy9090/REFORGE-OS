#!/usr/bin/env python3
"""Reports API CLI - JSON interface for Tauri."""
import sys
import json
from reports.pdf_export import export_case_pdf
from history.manager import load_case


def cmd_export_pdf(ticket_id: str, case_data_json: str = None):
    """Export a case to PDF."""
    try:
        if case_data_json:
            case_data = json.loads(case_data_json)
        else:
            case_data = load_case(ticket_id)
            if not case_data:
                print(json.dumps({"error": f"Case not found: {ticket_id}"}))
                sys.exit(1)
        
        filepath = export_case_pdf(ticket_id, case_data)
        result = {"success": True, "filepath": filepath, "ticket_id": ticket_id}
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e), "ticket_id": ticket_id}))
        sys.exit(1)


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Command required"}))
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    try:
        if cmd == "export_pdf":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Usage: export_pdf <ticket_id> [case_data_json]"}))
                sys.exit(1)
            ticket_id = sys.argv[2]
            case_data_json = sys.argv[3] if len(sys.argv) > 3 else None
            cmd_export_pdf(ticket_id, case_data_json)
        else:
            print(json.dumps({"error": f"Unknown command: {cmd}"}))
            sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
