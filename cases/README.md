# Case Management System

Legitimate repair shop case/ticket management for device repair workflows.

## Features

- **Case Creation**: Create repair cases with customer information
- **Case Tracking**: Track case status (intake → in-progress → waiting-parts → completed → closed)
- **Device Association**: Link devices to cases with full metadata
- **Device Passports**: Generate device passports with platform, model, serial, connection state

## Usage

### Python API

```python
from cases.manager import create_case, add_device_to_case, list_cases

# Create a case
case_id = create_case(
    customer_name="John Doe",
    customer_email="john@example.com",
    customer_phone="555-1234",
    notes="Screen repair needed"
)

# Add device to case
device_id = add_device_to_case(
    case_id=case_id,
    platform="android",
    model="Pixel 7",
    serial="ABC123",
    connection_state="adb"
)

# List cases
cases = list_cases(status="in-progress")
```

### CLI Interface

```bash
# Create case
python cases_api_cli.py create "John Doe" "john@example.com" "555-1234" "Screen repair"

# List cases
python cases_api_cli.py list

# Add device
python cases_api_cli.py add-device <case_id> android "Pixel 7" "ABC123"

# Get case devices
python cases_api_cli.py get-devices <case_id>
```

## Data Storage

Cases and devices are stored in JSON files:
- `storage/cases/cases.json` - Case records
- `storage/cases/case_devices.json` - Device records linked to cases

## Compliance

- ✅ All operations are logged
- ✅ No bypass or circumvention capabilities
- ✅ Authorized device access only
- ✅ Full audit trail
