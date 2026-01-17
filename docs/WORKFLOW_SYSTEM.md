# Workflow System Documentation

## Overview

Bobby's World Tools uses a JSON-based workflow system for defining reproducible device operations across Android, iOS, Windows, and IoT platforms. Workflows support validation, rollback, step-by-step logging, and retry logic.

## Workflow Structure

### Basic Example

```json
{
  "id": "android-adb-diagnostics",
  "name": "ADB Device Diagnostics",
  "description": "Comprehensive diagnostic scan of Android device via ADB",
  "platform": "android",
  "category": "diagnostics",
  "risk_level": "low",
  "requires_authorization": false,
  "estimated_duration": 120,
  "rollback_supported": false,
  "steps": [
    {
      "id": "check-adb",
      "name": "Verify ADB Connection",
      "type": "command",
      "action": "adb devices",
      "success_criteria": "device listed with 'device' status",
      "on_failure": "abort"
    }
  ],
  "output": {
    "format": "json",
    "fields": ["device_serial", "manufacturer", "model"]
  }
}
```

## Workflow Properties

### Required Fields

- **id**: Unique identifier (alphanumeric with hyphens)
- **name**: Human-readable workflow name
- **platform**: Target platform (`android`, `ios`, `windows`, `iot`, `universal`)
- **category**: Workflow category (`diagnostics`, `bypass`, `flashing`, `recovery`, `maintenance`, `testing`)
- **risk_level**: Risk assessment (`low`, `medium`, `high`, `destructive`)
- **steps**: Array of workflow steps (minimum 1)

### Optional Fields

- **description**: Detailed workflow description
- **requires_authorization**: Whether explicit user authorization is required (default: false)
- **authorization_prompt**: Prompt text for user authorization
- **legal_notice**: Legal warning or disclaimer
- **estimated_duration**: Estimated time in seconds
- **rollback_supported**: Whether rollback is available on failure (default: false)
- **rollback_steps**: Steps to execute on rollback
- **output**: Output format specification

## Workflow Steps

### Step Types

#### 1. Command

Execute a system command (adb, fastboot, shell, etc.).

```json
{
  "id": "get-device-info",
  "name": "Get Device Information",
  "type": "command",
  "action": "adb shell getprop",
  "success_criteria": "properties returned",
  "on_failure": "continue",
  "timeout": 30,
  "retry_count": 2
}
```

#### 2. Check

Verify a condition or state.

```json
{
  "id": "verify-frp-status",
  "name": "Verify FRP Status",
  "type": "check",
  "action": "check_frp_status",
  "success_criteria": "FRP status determined",
  "on_failure": "abort"
}
```

#### 3. Wait

Pause execution for a specified duration.

```json
{
  "id": "wait-for-device",
  "name": "Wait for Device",
  "type": "wait",
  "timeout": 10,
  "on_failure": "continue"
}
```

#### 4. Prompt

Request user input or confirmation.

```json
{
  "id": "require-authorization",
  "name": "Require User Authorization",
  "type": "prompt",
  "action": "confirm_ownership",
  "prompt_text": "Type 'I OWN THIS DEVICE' to confirm",
  "required_input": "I OWN THIS DEVICE",
  "on_failure": "abort"
}
```

#### 5. Log

Create a log entry (public or shadow).

```json
{
  "id": "log-shadow",
  "name": "Log to Shadow Logs",
  "type": "log",
  "action": "shadow_log",
  "log_data": {
    "operation": "frp_bypass_initiated",
    "device_serial": "$device_serial"
  },
  "on_failure": "continue"
}
```

### Step Properties

**Required:**

- `id`: Unique step identifier
- `name`: Human-readable step name
- `type`: Step type (command, check, wait, prompt, log)
- `on_failure`: Failure handling (`abort`, `continue`, `retry`)

**Optional:**

- `action`: Action to perform
- `success_criteria`: Success determination criteria
- `timeout`: Timeout in seconds
- `retry_count`: Number of retries (0-5)
- `prompt_text`: User prompt text
- `required_input`: Required user input for prompts
- `log_data`: Data to log
- `note`: Additional notes or warnings
- `rollback_step_id`: ID of step to execute for rollback

## Failure Handling

### on_failure Options

1. **abort**: Stop workflow execution immediately
2. **continue**: Continue to next step despite failure
3. **retry**: Retry the step based on `retry_count`

### Example with Retry

```json
{
  "id": "connect-device",
  "name": "Connect to Device",
  "type": "command",
  "action": "adb connect 192.168.1.100",
  "on_failure": "retry",
  "retry_count": 3,
  "timeout": 10
}
```

## Rollback Support

Workflows can support automatic rollback on failure.

### Method 1: Explicit Rollback Steps

```json
{
  "id": "network-config",
  "name": "Network Configuration",
  "rollback_supported": true,
  "steps": [
    {
      "id": "backup-config",
      "name": "Backup Configuration",
      "type": "command",
      "action": "cp /etc/network/interfaces /etc/network/interfaces.backup",
      "on_failure": "abort"
    },
    {
      "id": "apply-config",
      "name": "Apply New Configuration",
      "type": "command",
      "action": "echo 'new config' > /etc/network/interfaces",
      "on_failure": "abort"
    }
  ],
  "rollback_steps": [
    {
      "id": "restore-config",
      "name": "Restore Configuration",
      "type": "command",
      "action": "cp /etc/network/interfaces.backup /etc/network/interfaces",
      "on_failure": "continue"
    }
  ]
}
```

### Method 2: Step-Level Rollback

```json
{
  "steps": [
    {
      "id": "modify-setting",
      "name": "Modify Setting",
      "type": "command",
      "action": "some_command",
      "on_failure": "abort",
      "rollback_step_id": "restore-setting"
    },
    {
      "id": "restore-setting",
      "name": "Restore Setting",
      "type": "command",
      "action": "restore_command",
      "on_failure": "continue"
    }
  ]
}
```

## Platform-Specific Commands

### Android (ADB)

```json
{
  "platform": "android",
  "steps": [
    {
      "type": "command",
      "action": "adb shell getprop ro.build.version.release"
    },
    {
      "type": "command",
      "action": "adb push local.txt /sdcard/remote.txt"
    }
  ]
}
```

### Android (Fastboot)

```json
{
  "platform": "android",
  "steps": [
    {
      "type": "command",
      "action": "fastboot getvar product"
    },
    {
      "type": "command",
      "action": "fastboot flash boot boot.img"
    }
  ]
}
```

### iOS

```json
{
  "platform": "ios",
  "steps": [
    {
      "type": "command",
      "action": "ideviceinfo -k ProductVersion"
    },
    {
      "type": "command",
      "action": "idevicescreenshot screenshot.png"
    }
  ]
}
```

### Windows

```json
{
  "platform": "windows",
  "steps": [
    {
      "type": "command",
      "action": "systeminfo"
    },
    {
      "type": "command",
      "action": "wmic diskdrive get status"
    }
  ]
}
```

### IoT

```json
{
  "platform": "iot",
  "steps": [
    {
      "type": "command",
      "action": "ping -c 4 8.8.8.8"
    },
    {
      "type": "command",
      "action": "cat /sys/class/thermal/thermal_zone0/temp"
    }
  ]
}
```

## Workflow Validation

Workflows are automatically validated against the JSON Schema defined in `workflows/workflow-schema.json`.

### Validation Example

```javascript
import { WorkflowEngine } from "./core/tasks/workflow-engine.js";

const engine = new WorkflowEngine();
const result = await engine.loadWorkflow("android", "adb-diagnostics");

if (!result.success) {
  console.error("Validation errors:", result.validationErrors);
}
```

## Execution

### Via API

```bash
curl -X POST http://localhost:3001/api/trapdoor/workflow/execute \
  -H "Content-Type: application/json" \
  -H "X-API-Key: admin-key" \
  -d '{
    "category": "android",
    "workflowId": "adb-diagnostics",
    "deviceSerial": "ABC123XYZ"
  }'
```

### Via Workflow Engine

```javascript
const engine = new WorkflowEngine();
const result = await engine.executeWorkflow("android", "adb-diagnostics", {
  deviceSerial: "ABC123XYZ",
  userId: "admin",
  authorization: null,
});

console.log("Success:", result.success);
console.log("Results:", result.results);
```

## Step-by-Step Logging

Every workflow step is logged with detailed information:

```
[WorkflowEngine] Step 1/5: Verify ADB Connection - SUCCESS
[WorkflowEngine] Step 2/5: Get Device Information - SUCCESS
[WorkflowEngine] Step 3/5: Check Battery Status - SUCCESS
[WorkflowEngine] Step 4/5: Check Storage Status - SUCCESS
[WorkflowEngine] Step 5/5: Check Memory Status - SUCCESS
```

### Log Details

Each step result includes:

- `stepId`: Unique step identifier
- `stepName`: Human-readable name
- `stepIndex`: Position in workflow
- `success`: Boolean success indicator
- `output`: Command output or result
- `error`: Error message (if failed)
- `timestamp`: ISO 8601 timestamp
- `retriedCount`: Number of retries (if applicable)

## Workflow Categories

### Available Categories

1. **diagnostics**: Device diagnostic workflows
2. **bypass**: Security bypass workflows (authorized only)
3. **flashing**: Firmware flashing workflows
4. **recovery**: Device recovery workflows
5. **maintenance**: System maintenance workflows
6. **testing**: Hardware/software testing workflows

### Listing Workflows by Category

```bash
curl http://localhost:3001/api/trapdoor/workflows \
  -H "X-API-Key: admin-key" | jq '.workflows[] | select(.category=="diagnostics")'
```

## Best Practices

1. **Use descriptive IDs and names** for clarity
2. **Set appropriate risk levels** for workflows
3. **Include authorization** for destructive operations
4. **Add legal notices** where required
5. **Provide rollback steps** for critical operations
6. **Test workflows thoroughly** before deployment
7. **Document success criteria** clearly
8. **Use retry logic** for flaky operations
9. **Include notes** for complex steps
10. **Validate against schema** before deployment

## Creating Custom Workflows

1. Create a JSON file in the appropriate category directory
2. Follow the workflow schema structure
3. Test with the workflow engine
4. Validate against schema
5. Document any special requirements

### Example Directory Structure

```
workflows/
├── android/
│   ├── adb-diagnostics.json
│   ├── fastboot-unlock.json
│   └── partition-mapping.json
├── ios/
│   ├── diagnostics.json
│   └── restore.json
├── windows/
│   ├── system-diagnostics.json
│   └── network-diagnostics.json
├── iot/
│   ├── device-diagnostics.json
│   └── sensor-test.json
└── workflow-schema.json
```

## Troubleshooting

### Workflow Not Found

- Check category and workflowId spelling
- Ensure JSON file exists in correct directory
- Verify file has `.json` extension

### Validation Errors

- Run workflow through schema validator
- Check all required fields are present
- Verify enum values (platform, category, risk_level)

### Execution Failures

- Review step-by-step logs
- Check device connectivity
- Verify required tools (adb, fastboot, etc.) are installed
- Test commands manually before adding to workflow

## Advanced Features

### Variable Substitution

Use `$variable_name` syntax in commands:

```json
{
  "action": "adb -s $device_serial shell getprop",
  "log_data": {
    "device": "$device_serial",
    "user": "$userId"
  }
}
```

### Conditional Execution

Use success criteria to branch workflow logic:

```json
{
  "id": "check-root",
  "name": "Check Root Access",
  "type": "check",
  "action": "check_root",
  "success_criteria": "root access available",
  "on_failure": "continue"
}
```

## Support

For workflow system issues:

- GitHub Issues: https://github.com/Bboy9090/Bobbys_World_Tools/issues
- Schema Reference: `workflows/workflow-schema.json`
- Examples: All workflow files in `workflows/` directory
