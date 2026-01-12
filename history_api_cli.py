#!/usr/bin/env python3
"""History API CLI - JSON interface for Tauri."""
import sys
import json
from history.manager import list_cases as _list_cases, load_case as _load_case, create_master_ticket, list_master_tickets, attach_case_to_master


def cmd_list_cases():
    """List all cases."""
    cases = _list_cases()
    print(json.dumps(cases, indent=2))


def cmd_load_case(ticket_id: str):
    """Load a case."""
    case = _load_case(ticket_id)
    if case:
        print(json.dumps(case, indent=2))
    else:
        print(json.dumps({"error": f"Case not found: {ticket_id}"}))
        sys.exit(1)


def cmd_list_master_tickets():
    """List all master tickets."""
    tickets = list_master_tickets()
    print(json.dumps(tickets, indent=2))


def cmd_create_master_ticket(label: str, description: str = ""):
    """Create a master ticket."""
    ticket = create_master_ticket(label, description)
    print(json.dumps(ticket, indent=2))


def cmd_attach_case(master_id: str, case_id: str):
    """Attach case to master ticket."""
    try:
        ticket = attach_case_to_master(master_id, case_id)
        print(json.dumps(ticket, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Command required"}))
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    try:
        if cmd == "list_cases":
            cmd_list_cases()
        elif cmd == "load_case":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Usage: load_case <ticket_id>"}))
                sys.exit(1)
            cmd_load_case(sys.argv[2])
        elif cmd == "list_master_tickets":
            cmd_list_master_tickets()
        elif cmd == "create_master_ticket":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Usage: create_master_ticket <label> [description]"}))
                sys.exit(1)
            description = sys.argv[3] if len(sys.argv) > 3 else ""
            cmd_create_master_ticket(sys.argv[2], description)
        elif cmd == "attach_case":
            if len(sys.argv) < 4:
                print(json.dumps({"error": "Usage: attach_case <master_id> <case_id>"}))
                sys.exit(1)
            cmd_attach_case(sys.argv[2], sys.argv[3])
        else:
            print(json.dumps({"error": f"Unknown command: {cmd}"}))
            sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
