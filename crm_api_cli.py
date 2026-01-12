#!/usr/bin/env python3
"""CRM API CLI - JSON interface for Tauri."""
import sys
import json
from crm.manager import list_customers as _list_customers, add_customer as _add_customer, list_devices as _list_devices, add_device as _add_device


def cmd_list_customers():
    """List all customers."""
    customers = _list_customers()
    print(json.dumps(customers, indent=2))


def cmd_add_customer(name: str, phone: str = "", email: str = ""):
    """Add a customer."""
    customer_id = _add_customer(name, phone, email)
    customer = {"id": customer_id, "name": name, "phone": phone, "email": email}
    print(json.dumps(customer, indent=2))


def cmd_list_devices(customer_id: str = None):
    """List devices."""
    devices = _list_devices(customer_id)
    print(json.dumps(devices, indent=2))


def cmd_add_device(customer_id: str, brand: str, model: str, serial: str):
    """Add a device."""
    device_id = _add_device(customer_id, brand, model, serial)
    device = {"id": device_id, "customer_id": customer_id, "brand": brand, "model": model, "serial": serial}
    print(json.dumps(device, indent=2))


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Command required"}))
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    try:
        if cmd == "list_customers":
            cmd_list_customers()
        elif cmd == "add_customer":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Usage: add_customer <name> [phone] [email]"}))
                sys.exit(1)
            name = sys.argv[2]
            phone = sys.argv[3] if len(sys.argv) > 3 else ""
            email = sys.argv[4] if len(sys.argv) > 4 else ""
            cmd_add_customer(name, phone, email)
        elif cmd == "list_devices":
            customer_id = sys.argv[2] if len(sys.argv) > 2 else None
            cmd_list_devices(customer_id)
        elif cmd == "add_device":
            if len(sys.argv) < 6:
                print(json.dumps({"error": "Usage: add_device <customer_id> <brand> <model> <serial>"}))
                sys.exit(1)
            cmd_add_device(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
        else:
            print(json.dumps({"error": f"Unknown command: {cmd}"}))
            sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
