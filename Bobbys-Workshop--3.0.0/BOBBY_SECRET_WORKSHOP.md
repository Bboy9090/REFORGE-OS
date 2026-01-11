# Bobby's Secret Workshop - Complete Integration Guide

## 🔓 Overview

Bobby's Secret Workshop is a comprehensive device management and repair toolkit that provides:

- **Modular Workflow System** - JSON-defined workflows for Android and iOS operations
- **Trapdoor API** - Secure REST endpoints for sensitive device operations
- **Shadow Logging** - Encrypted, append-only audit logs for compliance
- **Core Libraries** - ADB, Fastboot, and iOS device management
- **Frontend Dashboard** - React + Tailwind UI for workflow execution

## 📁 Project Structure

```plaintext
BobbyWorld/
├── core/                # Core backend APIs for workflows/tasks
│   ├── api/             # API handlers (Express)
│   │   └── trapdoor.js  # Trapdoor API endpoints
│   ├── lib/             # Libraries for ADB, Fastboot, iOS
│   │   ├── adb.js       # Android Debug Bridge library
│   │   ├── fastboot.js  # Fastboot operations library
│   │   ├── ios.js       # iOS device management library
│   │   └── shadow-logger.js # Encrypted logging system
│   └── tasks/           # Workflow execution engine
│       └── workflow-engine.js # JSON workflow executor
├── workflows/           # JSON-defined modular workflows
│   ├── android/         # Android-specific workflows
│   │   ├── adb-diagnostics.json
│   │   ├── fastboot-unlock.json
│   │   └── partition-mapping.json
│   ├── ios/             # iOS-specific workflows
│   │   ├── restore.json
│   │   ├── dfu-detection.json
│   │   └── diagnostics.json
│   ├── bypass/          # FRP/unlock operations
│   │   └── frp-bypass.json
│   └── diagnostics/     # General diagnostic tasks
├── frontend/            # React + Tailwind GUI (src/components/)
│   ├── TrapdoorControlPanel.tsx
│   ├── ShadowLogsViewer.tsx
│   └── WorkflowExecutionConsole.tsx
├── logs/                # Log files for all activity (secured)
│   ├── public/          # Public-facing logs
│   └── shadow/          # Encrypted logs for sensitive actions
├── pandora_box/         # Hidden modules and binaries
├── tools/               # ADB, Fastboot, exploit binaries/scripts
├── devices/             # Device profiles saved locally
├── scripts/             # Python/Node.js scripts for helper tasks
├── secrets/             # Encryption keys, secure admin settings
└── README.md            # Main documentation
```

## 🚀 Getting Started

### Prerequisites

```bash
# Install system dependencies
sudo apt install android-tools-adb android-tools-fastboot
sudo apt install libimobiledevice-utils usbmuxd

# Install Node.js dependencies
npm install

# Install server dependencies
cd server && npm install
```

### Environment Setup

Create a `.env` file in the project root:

```env
# Admin API Key for Trapdoor operations
ADMIN_API_KEY=your-secure-admin-key

# Shadow log encryption key (will be auto-generated if not provided)
SHADOW_LOG_ENCRYPTION_KEY=

# Server port
PORT=3001
```

### Starting the Services

```bash
# Terminal 1: Start backend server
npm run server:dev

# Terminal 2: Start frontend
npm run dev
```

The Trapdoor API will be available at:

- `http://localhost:3001/api/trapdoor/*`

## 🔐 Trapdoor API Endpoints

### Authentication

All Trapdoor API endpoints require admin authentication via the `X-API-Key` header:

```bash
curl -H "X-API-Key: your-admin-key" http://localhost:3001/api/trapdoor/workflows
```

### Endpoints

#### 1. Execute FRP Bypass

```bash
POST /api/trapdoor/frp
Content-Type: application/json
X-API-Key: your-admin-key

{
  "deviceSerial": "ABC123XYZ",
  "authorization": {
    "confirmed": true,
    "userInput": "I OWN THIS DEVICE"
  }
}
```

#### 2. Execute Bootloader Unlock

```bash
POST /api/trapdoor/unlock
Content-Type: application/json
X-API-Key: your-admin-key

{
  "deviceSerial": "ABC123XYZ",
  "authorization": {
    "confirmed": true,
    "userInput": "UNLOCK"
  }
}
```

#### 3. Execute Custom Workflow

```bash
POST /api/trapdoor/workflow/execute
Content-Type: application/json
X-API-Key: your-admin-key

{
  "category": "android",
  "workflowId": "adb-diagnostics",
  "deviceSerial": "ABC123XYZ",
  "authorization": null
}
```

#### 4. List Available Workflows

```bash
GET /api/trapdoor/workflows
X-API-Key: your-admin-key
```

#### 5. View Shadow Logs

```bash
GET /api/trapdoor/logs/shadow?date=2024-12-16
X-API-Key: your-admin-key
```

## 📋 Workflow System

### Workflow Structure

Workflows are defined in JSON format with the following structure:

```json
{
  "id": "workflow-id",
  "name": "Workflow Name",
  "description": "Description",
  "platform": "android|ios|universal",
  "category": "diagnostics|bypass|unlock|restore",
  "risk_level": "low|medium|high|destructive",
  "requires_authorization": true,
  "steps": [
    {
      "id": "step-1",
      "name": "Step Name",
      "type": "command|check|wait|prompt|log",
      "action": "command to execute",
      "success_criteria": "success condition",
      "on_failure": "continue|abort|retry"
    }
  ]
}
```

### Available Workflows

#### Android Workflows

- **adb-diagnostics** - Comprehensive device diagnostics via ADB
- **fastboot-unlock** - Bootloader unlock via Fastboot
- **partition-mapping** - Map device partition layout

#### iOS Workflows

- **restore** - Full iOS device restore
- **dfu-detection** - Detect and verify DFU mode
- **diagnostics** - Comprehensive iOS diagnostics

#### Bypass Workflows

- **frp-bypass** - Factory Reset Protection bypass (requires authorization)

### Creating Custom Workflows

1. Create a new JSON file in the appropriate category directory
2. Define workflow steps following the structure above
3. Restart the server to load the new workflow
4. Execute via API or UI

## 🔒 Shadow Logging System

### Features

- **AES-256 Encryption** - All sensitive logs encrypted at rest
- **Append-Only** - Immutable audit trail
- **Anonymous Mode** - Optional operational deniability
- **Automatic Rotation** - 90-day retention for shadow logs, 30 days for public logs

### Log Locations

- Public logs: `logs/public/public-YYYY-MM-DD.log`
- Shadow logs: `logs/shadow/shadow-YYYY-MM-DD.enc`

### Viewing Shadow Logs

Shadow logs can only be decrypted with the master encryption key. Use the ShadowLogsViewer component or API endpoint with admin credentials.

### Log Entry Format

Shadow logs contain:

```json
{
  "timestamp": "2024-12-16T00:00:00.000Z",
  "operation": "frp_bypass_initiated",
  "deviceSerial": "ABC123XYZ",
  "userId": "192.168.1.100",
  "authorization": "explicit_user_confirmation",
  "success": true,
  "metadata": {},
  "hash": "sha256_hash"
}
```

## 🎨 Frontend Components

### TrapdoorControlPanel

Execute sensitive operations with proper authorization:

- FRP Bypass
- Bootloader Unlock
- Custom Workflows

**Usage:**

```tsx
import { TrapdoorControlPanel } from "@/components/TrapdoorControlPanel";

<TrapdoorControlPanel />;
```

### ShadowLogsViewer

View encrypted shadow logs (admin only):

- Browse logs by date
- View operation details
- Audit trail inspection

**Usage:**

```tsx
import { ShadowLogsViewer } from "@/components/ShadowLogsViewer";

<ShadowLogsViewer />;
```

### WorkflowExecutionConsole

Browse and execute available workflows:

- View all workflows
- Execute workflows
- Monitor execution results

**Usage:**

```tsx
import { WorkflowExecutionConsole } from "@/components/WorkflowExecutionConsole";

<WorkflowExecutionConsole />;
```

## ⚖️ Legal & Ethical Guidelines

### ⚠️ WARNING: AUTHORIZED USE ONLY

This software is intended **ONLY** for:

- Devices you personally own
- Devices with explicit written owner authorization
- Professional repair contexts with proper documentation

### What is ILLEGAL:

❌ Bypassing FRP on devices you don't own  
❌ Removing MDM from enterprise devices without authorization  
❌ Enabling device theft or unauthorized access  
❌ Violating Computer Fraud and Abuse Act (CFAA)  
❌ Violating Computer Misuse Act (UK) or similar laws

### Legal Compliance:

✅ All operations are logged for audit purposes  
✅ User authorization is required for destructive operations  
✅ Shadow logs provide compliance evidence  
✅ Anonymous mode available for legitimate privacy needs

**The developers assume NO LIABILITY for misuse of this software.**

## 🔧 Development

### Adding New Workflows

1. Create workflow JSON in appropriate category directory
2. Follow the workflow schema
3. Test with dry-run mode
4. Document in this file

### Adding New API Endpoints

1. Create endpoint in `core/api/trapdoor.js`
2. Add authentication middleware
3. Implement shadow logging
4. Update API documentation

### Testing Workflows

```bash
# Test workflow execution (dry-run)
curl -X POST http://localhost:3001/api/trapdoor/workflow/execute \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-admin-key" \
  -d '{
    "category": "android",
    "workflowId": "adb-diagnostics",
    "deviceSerial": "TEST_DEVICE",
    "authorization": null
  }'
```

## 📊 Monitoring & Maintenance

### Log Rotation

Shadow logs are automatically rotated after 90 days. To manually trigger rotation:

```javascript
import ShadowLogger from "./core/lib/shadow-logger.js";
const logger = new ShadowLogger();
await logger.rotateLogs({ shadow: 90, public: 30 });
```

### Backup Shadow Logs

```bash
# Backup encrypted shadow logs
tar -czf shadow-logs-backup-$(date +%Y%m%d).tar.gz logs/shadow/

# Store in secure location
```

### Security Best Practices

1. **Rotate Admin API Keys** - Every 90 days
2. **Backup Encryption Key** - Store in multiple secure locations
3. **Review Shadow Logs** - Weekly audit of sensitive operations
4. **Update Dependencies** - Keep all libraries up to date
5. **Restrict Access** - Limit admin access to authorized personnel

## 🚨 Troubleshooting

### Workflow Execution Fails

1. Check device connection: `adb devices` or `fastboot devices`
2. Verify authorization is provided for sensitive workflows
3. Check shadow logs for detailed error messages
4. Ensure required tools are installed (ADB, Fastboot, libimobiledevice)

### Shadow Logs Not Decrypting

1. Verify encryption key is correct
2. Check file permissions on `secrets/encryption_key.bin`
3. Ensure shadow log files are not corrupted

### API Authentication Fails

1. Verify `X-API-Key` header is set correctly
2. Check `ADMIN_API_KEY` environment variable
3. Review server logs for authentication attempts

## 📚 Additional Resources

- [Trapdoor CLI Usage](./TRAPDOOR_CLI_USAGE.md)
- [Authorization Triggers Guide](./AUTHORIZATION_TRIGGERS_IMPLEMENTATION.md)
- [Firmware Version Checking](./FIRMWARE_VERSION_CHECKING.md)
- [Backend API Implementation](./BACKEND_API_IMPLEMENTATION.md)

## 🤝 Contributing

We welcome contributions that:

- Add legitimate device repair workflows
- Improve security and audit logging
- Enhance documentation
- Fix bugs

We will **NOT** accept contributions that:

- Enable unauthorized device access
- Bypass security without proper authorization
- Support illegal activities

## 📄 License

MIT License - See LICENSE file for details

This software is provided "as is" for educational and legitimate repair purposes only.

---

**Bobby's Secret Workshop**  
_Professional Device Management & Repair Toolkit_

🔓 **Advanced operations for authorized technicians only**  
**Use responsibly. Repair ethically. Respect the law.**
