# Workflow Schema Documentation

## Overview

Bobby's World Tools uses JSON-defined workflows for reproducible device operations. All workflows are validated against a schema before execution to ensure safety and correctness.

## Workflow Structure

### Top-Level Fields

```json
{
  "id": "workflow-id",
  "name": "Workflow Name",
  "description": "Detailed description",
  "platform": "android",
  "category": "diagnostics",
  "risk_level": "low",
  "requires_authorization": false,
  "authorization_prompt": "Optional authorization text",
  "supported_devices": ["android", "ios"],
  "estimated_duration": "5-10 minutes",
  "steps": [...],
  "output_format": {...},
  "metadata": {...}
}
```

### Field Specifications

#### `id` (required)

- **Type:** `string`
- **Pattern:** `^[a-z0-9-]+$` (kebab-case)
- **Description:** Unique workflow identifier
- **Example:** `"adb-diagnostics"`, `"iot-firmware-update"`

#### `name` (required)

- **Type:** `string`
- **Length:** 1-200 characters
- **Description:** Human-readable workflow name
- **Example:** `"ADB Device Diagnostics"`

#### `description` (required)

- **Type:** `string`
- **Length:** 10-1000 characters
- **Description:** Detailed workflow description
- **Example:** `"Comprehensive diagnostic workflow for Android devices..."`

#### `platform` (required)

- **Type:** `string`
- **Enum:** `android`, `ios`, `windows`, `iot`, `mobile`, `universal`
- **Description:** Target platform for workflow
- **Example:** `"android"`

#### `category` (required)

- **Type:** `string`
- **Enum:** `diagnostics`, `maintenance`, `repair`, `bypass`, `flash`, `backup`, `restore`
- **Description:** Workflow category
- **Example:** `"diagnostics"`

#### `risk_level` (required)

- **Type:** `string`
- **Enum:** `low`, `medium`, `high`, `destructive`
- **Description:** Risk level of workflow operations
- **Details:**
  - `low`: Read-only operations, no device modification
  - `medium`: Non-destructive device modifications
  - `high`: Potentially destructive operations, requires user confirmation
  - `destructive`: Data-erasing operations, requires explicit authorization

#### `requires_authorization` (optional)

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Whether workflow requires explicit user authorization
- **When true:** `authorization_prompt` is required

#### `authorization_prompt` (conditional)

- **Type:** `string`
- **Required when:** `requires_authorization` is `true`
- **Description:** Text prompt shown to user for authorization
- **Example:** `"Type 'I OWN THIS DEVICE' to confirm"`

#### `supported_devices` (optional)

- **Type:** `array` of `string`
- **Default:** `[platform]`
- **Description:** List of supported device types
- **Example:** `["android", "ios", "windows"]`

#### `estimated_duration` (optional)

- **Type:** `string`
- **Pattern:** `^[0-9]+-[0-9]+ (seconds|minutes|hours)$`
- **Default:** `"unknown"`
- **Description:** Estimated execution time
- **Example:** `"5-10 minutes"`

#### `steps` (required)

- **Type:** `array` of step objects
- **Min items:** 1
- **Description:** Sequence of workflow steps
- **See:** [Step Schema](#step-schema)

#### `output_format` (optional)

- **Type:** `object`
- **Description:** Expected output format
- **Properties:**
  - `type`: `"json"`, `"text"`, or `"xml"`
  - `fields`: Array of expected output field names

#### `metadata` (optional)

- **Type:** `object`
- **Description:** Workflow metadata
- **Properties:**
  - `author`: Author name
  - `version`: Semver version (e.g., `"1.0.0"`)
  - `created`: ISO 8601 date
  - `tags`: Array of tags

---

## Step Schema

Each workflow step defines a single operation to perform.

### Step Structure

```json
{
  "id": "step-id",
  "name": "Step Name",
  "type": "command",
  "action": "command_to_execute",
  "description": "What this step does",
  "success_criteria": "How to determine success",
  "on_failure": "abort",
  "timeout": 30000,
  "retry_count": 3,
  "retry_delay": 2000
}
```

### Step Fields

#### `id` (required)

- **Type:** `string`
- **Pattern:** `^[a-z0-9-]+$` (kebab-case)
- **Unique:** Within workflow
- **Description:** Unique step identifier
- **Example:** `"device-info"`, `"connectivity-test"`

#### `name` (required)

- **Type:** `string`
- **Length:** 1-200 characters
- **Description:** Human-readable step name
- **Example:** `"Device Information Collection"`

#### `type` (required)

- **Type:** `string`
- **Enum:** `command`, `check`, `wait`, `prompt`, `log`, `probe`
- **Description:** Type of operation
- **Details:**
  - `command`: Execute a system command
  - `check`: Perform a validation check
  - `wait`: Wait for specified time
  - `prompt`: Prompt user for input/confirmation
  - `log`: Log information
  - `probe`: Probe for devices/capabilities

#### `action` (required)

- **Type:** `string`
- **Description:** Action to perform (command, check name, etc.)
- **Examples:**
  - `"adb shell getprop"` (for command type)
  - `"testDeviceConnection"` (for check type)
  - `"shadow_log"` (for log type)

#### `description` (required)

- **Type:** `string`
- **Description:** Detailed step description
- **Example:** `"Verify stable connection to device"`

#### `success_criteria` (required)

- **Type:** `string`
- **Description:** Criteria for determining step success
- **Example:** `"Command executes successfully"`, `"Device responds"`

#### `on_failure` (required)

- **Type:** `string`
- **Enum:** `abort`, `continue`, `retry`, `rollback`
- **Description:** Action to take if step fails
- **Details:**
  - `abort`: Stop workflow execution immediately
  - `continue`: Continue to next step despite failure
  - `retry`: Retry step according to `retry_count`
  - `rollback`: Execute rollback steps (if defined)

#### `timeout` (optional)

- **Type:** `number`
- **Range:** 1000 - 3,600,000 (1 second - 1 hour)
- **Default:** 30000 (30 seconds)
- **Units:** Milliseconds
- **Description:** Maximum time to wait for step completion

#### `retry_count` (conditional)

- **Type:** `number`
- **Range:** 1 - 10
- **Required when:** `on_failure` is `"retry"`
- **Description:** Number of retry attempts
- **Default:** 1

#### `retry_delay` (conditional)

- **Type:** `number`
- **Range:** 1000 - 60,000 (1-60 seconds)
- **Default:** 2000 (2 seconds)
- **Units:** Milliseconds
- **Description:** Delay between retry attempts

---

## Platform-Specific Steps

### Android (ADB)

```json
{
  "type": "command",
  "action": "adb shell getprop",
  "platform_specific": {
    "android": {
      "requires": ["adb"],
      "parse": "properties"
    }
  }
}
```

### iOS

```json
{
  "type": "command",
  "action": "ideviceinfo",
  "platform_specific": {
    "ios": {
      "requires": ["libimobiledevice"],
      "parse": "key_value"
    }
  }
}
```

### Windows

```json
{
  "type": "command",
  "action": "systeminfo",
  "platform_specific": {
    "windows": {
      "requires": ["cmd"],
      "parse": "text"
    }
  }
}
```

### IoT

```json
{
  "type": "probe",
  "action": "discoverMqttDevices",
  "mqtt_config": {
    "broker": "localhost",
    "port": 1883,
    "topics": ["homeassistant/+/config"]
  }
}
```

---

## Complete Example

### Low-Risk Diagnostic Workflow

```json
{
  "id": "android-quick-diagnostics",
  "name": "Android Quick Diagnostics",
  "description": "Fast diagnostic check for Android devices including basic info, battery, and connectivity",
  "platform": "android",
  "category": "diagnostics",
  "risk_level": "low",
  "requires_authorization": false,
  "supported_devices": ["android"],
  "estimated_duration": "1-2 minutes",
  "steps": [
    {
      "id": "detect-device",
      "name": "Detect Android Device",
      "type": "command",
      "action": "adb devices",
      "description": "Check for connected Android devices",
      "success_criteria": "At least one device detected",
      "on_failure": "abort",
      "timeout": 10000
    },
    {
      "id": "device-info",
      "name": "Get Device Information",
      "type": "command",
      "action": "adb shell getprop ro.product.model",
      "description": "Retrieve device model information",
      "success_criteria": "Model name retrieved",
      "on_failure": "continue",
      "timeout": 5000
    },
    {
      "id": "battery-check",
      "name": "Check Battery Status",
      "type": "command",
      "action": "adb shell dumpsys battery",
      "description": "Check battery level and health",
      "success_criteria": "Battery information retrieved",
      "on_failure": "continue",
      "timeout": 5000
    },
    {
      "id": "connectivity-test",
      "name": "Test Device Connectivity",
      "type": "check",
      "action": "testAdbConnection",
      "description": "Verify stable ADB connection",
      "success_criteria": "Device responds to ping",
      "on_failure": "retry",
      "retry_count": 3,
      "retry_delay": 2000,
      "timeout": 10000
    },
    {
      "id": "diagnostic-complete",
      "name": "Log Diagnostic Completion",
      "type": "log",
      "action": "public_log",
      "log_data": {
        "operation": "android_quick_diagnostics_complete",
        "message": "Android quick diagnostics completed"
      },
      "description": "Log successful completion",
      "success_criteria": "Logged successfully",
      "on_failure": "continue"
    }
  ],
  "output_format": {
    "type": "json",
    "fields": [
      "device_model",
      "battery_level",
      "battery_health",
      "connectivity_status"
    ]
  },
  "metadata": {
    "author": "Bobby's World Tools",
    "version": "1.0.0",
    "created": "2025-12-17",
    "tags": ["android", "diagnostics", "quick", "non-destructive"]
  }
}
```

### High-Risk Destructive Workflow

```json
{
  "id": "android-factory-reset",
  "name": "Android Factory Reset",
  "description": "Perform complete factory reset on Android device (ERASES ALL DATA)",
  "platform": "android",
  "category": "maintenance",
  "risk_level": "destructive",
  "requires_authorization": true,
  "authorization_prompt": "Type 'FACTORY RESET' to confirm (ALL DATA WILL BE ERASED)",
  "supported_devices": ["android"],
  "estimated_duration": "5-10 minutes",
  "steps": [
    {
      "id": "backup-check",
      "name": "Verify Backup Status",
      "type": "prompt",
      "action": "confirmBackup",
      "prompt_text": "Have you backed up all important data?",
      "required_input": "YES",
      "description": "Confirm user has backed up data",
      "success_criteria": "User confirms backup",
      "on_failure": "abort"
    },
    {
      "id": "authorization-check",
      "name": "Verify Authorization",
      "type": "prompt",
      "action": "confirmAuthorization",
      "prompt_text": "Type 'FACTORY RESET' to proceed",
      "required_input": "FACTORY RESET",
      "description": "Explicit authorization required",
      "success_criteria": "Correct authorization text entered",
      "on_failure": "abort"
    },
    {
      "id": "execute-reset",
      "name": "Execute Factory Reset",
      "type": "command",
      "action": "adb shell recovery --wipe_data",
      "description": "Perform factory reset operation",
      "success_criteria": "Reset command executed",
      "on_failure": "abort",
      "timeout": 300000
    },
    {
      "id": "reboot-device",
      "name": "Reboot Device",
      "type": "command",
      "action": "adb reboot",
      "description": "Reboot device to complete reset",
      "success_criteria": "Reboot initiated",
      "on_failure": "continue",
      "timeout": 10000
    },
    {
      "id": "log-reset",
      "name": "Log Factory Reset",
      "type": "log",
      "action": "shadow_log",
      "log_data": {
        "operation": "factory_reset_complete",
        "risk_level": "destructive"
      },
      "description": "Log destructive operation to shadow logs",
      "success_criteria": "Logged to shadow logs",
      "on_failure": "continue"
    }
  ],
  "output_format": {
    "type": "json",
    "fields": ["reset_status", "reboot_status"]
  },
  "metadata": {
    "author": "Bobby's World Tools",
    "version": "1.0.0",
    "created": "2025-12-17",
    "tags": ["android", "factory-reset", "destructive", "data-erasure"]
  }
}
```

---

## Validation

All workflows are automatically validated before execution. Validation checks:

1. ✅ Required fields present
2. ✅ Field types correct
3. ✅ Enum values valid
4. ✅ ID formats (kebab-case)
5. ✅ No duplicate step IDs
6. ✅ Authorization prompt present when required
7. ✅ Retry settings valid when `on_failure` is `"retry"`
8. ✅ Timeout values in valid range
9. ✅ Step types recognized
10. ✅ Platform values valid

---

## Best Practices

### 1. ID Naming

- Use kebab-case: `device-info`, `battery-check`
- Be descriptive but concise
- Include platform prefix for platform-specific workflows

### 2. Risk Levels

- Use `low` for read-only operations
- Use `medium` for safe modifications
- Use `high` for risky operations
- Use `destructive` only when data loss occurs

### 3. Authorization

- Always require authorization for high/destructive workflows
- Make authorization prompts clear and explicit
- Include warnings about data loss

### 4. Error Handling

- Use `abort` for critical steps
- Use `retry` for network/connectivity issues
- Use `continue` for optional steps
- Set appropriate `retry_count` (3-5 attempts recommended)

### 5. Timeouts

- Set realistic timeouts based on operation
- Network operations: 10-30 seconds
- File operations: 30-60 seconds
- Flash/update operations: 5-10 minutes

### 6. Descriptions

- Write clear, detailed descriptions
- Explain what the step does and why
- Include expected outcomes

---

## Workflow Categories

### Diagnostics

Non-invasive device information gathering and health checks.

### Maintenance

Routine device maintenance operations (updates, cleanup).

### Repair

Device repair and recovery operations.

### Bypass

Security bypass operations (FRP, MDM) - **requires authorization**.

### Flash

Firmware flashing and updating operations.

### Backup

Data backup operations.

### Restore

Data restoration operations.

---

## Version History

### v1.0.0 (2025-12-17)

- Initial workflow schema release
- Support for 6 step types
- Support for 4 risk levels
- Built-in validation
- Platform-specific configurations
