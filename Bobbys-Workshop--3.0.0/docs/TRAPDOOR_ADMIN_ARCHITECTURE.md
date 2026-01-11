# Trapdoor Admin Architecture

**Version:** 1.0  
**Status:** Architecture Specification  
**Last Updated:** 2024-12-27

## Executive Summary

The Trapdoor Admin subsystem provides a secure, auditable architecture for privileged device operations in Bobby's Workshop. This document defines the complete architecture including UI isolation, authorization models, operation envelopes, security hardening, and developer workflows.

**Core Principles:**
- **Legal Operations Only** - No bypass/exploit/evasion features
- **Strict Separation** - Admin endpoints isolated from normal UI
- **Explicit Authorization** - Role-based access with operation allowlists
- **Complete Auditability** - All operations logged with shadow encryption
- **Defensive by Default** - Input validation, path safety, rate limiting

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Authorization Model](#authorization-model)
3. [Operation Envelopes](#operation-envelopes)
4. [Security Checklist](#security-checklist)
5. [Developer Guide](#developer-guide)
6. [Appendices](#appendices)

---

## System Architecture

### Architectural Layers

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface Layer                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Normal    │  │  Pandora's  │  │   Shadow    │     │
│  │   Tabs      │  │    Room     │  │  Logs UI    │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
└─────────┼─────────────────┼─────────────────┼───────────┘
          │                 │                 │
          │ Public API      │ Admin API       │ Admin Read
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│                      API Gateway Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   /api/*     │  │/api/trapdoor/*│ │ /api/logs/*  │  │
│  │  (Public)    │  │  (Protected)  │ │ (Protected)  │  │
│  └──────┬───────┘  └───────┬───────┘ └──────┬────────┘  │
│         │                  │                 │           │
│         │                  ▼                 │           │
│         │          ┌───────────────┐         │           │
│         │          │ requireAdmin  │         │           │
│         │          │  Middleware   │         │           │
│         │          └───────┬───────┘         │           │
└─────────┼──────────────────┼─────────────────┼───────────┘
          │                  │                 │
          ▼                  ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│                   Core Operations Layer                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Catalog    │  │   Workflow   │  │    Shadow    │  │
│  │    API       │  │    Engine    │  │   Logger     │  │
│  └──────┬───────┘  └───────┬──────┘  └──────┬────────┘  │
│         │                  │                 │           │
│         │  ┌───────────────┴─────┐          │           │
│         │  │  Policy Evaluator   │          │           │
│         │  │  (Role + Operation) │          │           │
│         │  └─────────────────────┘          │           │
└─────────┼──────────────────────────────────┼────────────┘
          │                                   │
          ▼                                   ▼
┌─────────────────────────────────────────────────────────┐
│                   Provider Layer (Real)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │   ADB    │  │ Fastboot │  │   iOS    │  │  File   │ │
│  │ Provider │  │ Provider │  │ Provider │  │ System  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
└───────┼─────────────┼─────────────┼──────────────┼──────┘
        │             │             │              │
        ▼             ▼             ▼              ▼
   ┌────────────────────────────────────────────────────┐
   │           Operating System / Hardware               │
   │  (USB devices, file system, network, processes)    │
   └────────────────────────────────────────────────────┘
```

### Layer Responsibilities

#### 1. User Interface Layer

**Purpose:** Present operations to users with clear authorization requirements

**Constraints:**
- ✅ UI **NEVER** directly calls OS APIs
- ✅ All privileged operations go through Trapdoor API
- ✅ Clear visual distinction between normal and admin features
- ✅ Authorization prompts mandatory for destructive operations

**Components:**
- **Pandora's Room Tab** - Admin operation controls
- **TrapdoorControlPanel** - Workflow execution interface
- **ShadowLogsViewer** - Encrypted log viewer (admin only)

#### 2. API Gateway Layer

**Purpose:** Route requests, enforce authentication, apply rate limits

**Endpoints:**

| Route Pattern | Auth Required | Rate Limit | Purpose |
|--------------|---------------|------------|---------|
| `/api/catalog` | No | 100/min | Public catalog access |
| `/api/tools/inspect` | No | 50/min | Tool availability checks |
| `/api/trapdoor/*` | **Yes** | 20/min | Admin operations |
| `/api/logs/shadow` | **Yes** | 10/min | Shadow log access |

**Authentication Methods:**
1. **X-API-Key Header** (Development)
   - Static key from environment
   - Suitable for internal use only
   
2. **X-Secret-Room-Passcode** (Alternative)
   - Configurable passcode
   - Can be rotated independently

3. **JWT Tokens** (Production - Recommended)
   - Time-limited tokens
   - Role-based claims
   - Refresh token support

#### 3. Core Operations Layer

**Purpose:** Execute workflows, enforce policies, maintain audit trail

**Components:**

**Workflow Engine** (`core/tasks/workflow-engine.js`)
- Loads workflows from JSON definitions
- Executes steps sequentially
- Handles authorization prompts
- Returns operation envelopes

**Policy Evaluator**
- Checks role against operation requirements
- Evaluates risk levels
- Returns allow/deny with reason
- Logs policy decisions

**Shadow Logger** (`core/lib/shadow-logger.js`)
- AES-256 encryption for sensitive logs
- Append-only audit trail
- 90-day retention for shadow logs
- Automatic rotation

#### 4. Provider Layer

**Purpose:** Execute actual device operations, file I/O, command execution

**Constraints:**
- ✅ All providers must validate inputs
- ✅ Path traversal protection mandatory
- ✅ Command injection prevention required
- ✅ No shell execution with user input
- ✅ Timeout enforcement on all operations

**Providers:**

**ADB Provider** (`core/lib/adb.js`)
- Device detection
- ADB command execution
- State verification
- Error handling

**Fastboot Provider** (`core/lib/fastboot.js`)
- Fastboot mode detection
- Partition operations
- Bootloader operations
- Device reboot

**iOS Provider** (`core/lib/ios.js`)
- Device detection via libimobiledevice
- DFU mode handling
- Restore operations
- Backup operations

**File System Provider**
- Secure file reads (no traversal)
- Temporary file management
- Path validation
- Size limits enforced

---

## Authorization Model

### Roles and Permissions

#### Role Hierarchy

```
Owner (Highest Privilege)
  ├─ All capabilities enabled
  ├─ Can execute destructive operations
  ├─ Access to all logs and audits
  └─ Can manage technician accounts
  
Admin (High Privilege)
  ├─ Execute most operations
  ├─ Access shadow logs
  ├─ Cannot modify system settings
  └─ Cannot create new admin accounts
  
Technician (Standard Privilege)
  ├─ Diagnostics and inspections
  ├─ Low to medium risk operations
  ├─ Cannot execute destructive operations
  └─ Read-only log access
  
Viewer (Read-Only)
  ├─ View device information
  ├─ Read public logs
  ├─ Cannot execute operations
  └─ Cannot access shadow logs
```

#### Permission Matrix

| Operation Category | Owner | Admin | Technician | Viewer |
|-------------------|-------|-------|------------|--------|
| **Diagnostics** |
| Device Detection | ✅ | ✅ | ✅ | ✅ |
| System Information | ✅ | ✅ | ✅ | ✅ |
| Log File Reading | ✅ | ✅ | ✅ | ✅ |
| Battery Diagnostics | ✅ | ✅ | ✅ | ❌ |
| **Safe Operations** |
| Device Reboot | ✅ | ✅ | ✅ | ❌ |
| Screenshot Capture | ✅ | ✅ | ✅ | ❌ |
| Log Collection | ✅ | ✅ | ✅ | ❌ |
| **Medium Risk** |
| Backup Creation | ✅ | ✅ | ⚠️ | ❌ |
| Restore Operations | ✅ | ✅ | ⚠️ | ❌ |
| App Installation | ✅ | ✅ | ⚠️ | ❌ |
| **Destructive** |
| Factory Reset | ✅ | ⚠️ | ❌ | ❌ |
| Partition Flash | ✅ | ⚠️ | ❌ | ❌ |
| Bootloader Unlock | ✅ | ❌ | ❌ | ❌ |
| **Administrative** |
| Shadow Log Access | ✅ | ✅ | ❌ | ❌ |
| Policy Modification | ✅ | ❌ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ |

**Legend:**
- ✅ Allowed
- ⚠️ Requires explicit confirmation
- ❌ Denied

### Operation Allowlists

Each operation has an explicit allowlist defining:

```json
{
  "operation": "reboot_device",
  "displayName": "Reboot Device",
  "category": "safe",
  "riskLevel": "low",
  "requiresConfirmation": false,
  "allowedRoles": ["owner", "admin", "technician"],
  "requiredCapabilities": ["adb"],
  "auditLogging": "standard",
  "rateLimitPerMinute": 10
}
```

**Risk Levels:**

1. **Low** - Read-only operations, no state changes
   - Device detection
   - Information queries
   - Log reading

2. **Medium** - Reversible state changes
   - Device reboot
   - App installation
   - Backup creation

3. **High** - Data modifications, limited reversibility
   - Factory reset
   - System updates
   - Restore operations

4. **Destructive** - Permanent changes, cannot be undone
   - Partition flashing
   - Bootloader unlock
   - Secure erase

### Policy Evaluation Flow

```
┌─────────────────────┐
│  Operation Request  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Extract: operation │
│     role, params    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Load Operation Spec │
│   from Allowlist    │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ Role Check   │
    │ role ∈       │
    │ allowedRoles?│
    └──────┬───────┘
           │
      NO   │   YES
    ┌──────┴─────┐
    ▼            ▼
┌────────┐  ┌────────────┐
│ DENY   │  │ Risk Check │
│ Return │  │ riskLevel? │
│ policy-│  └──────┬─────┘
│ deny   │         │
│envelope│    Destructive
└────────┘         │
                   ▼
          ┌────────────────┐
          │ Confirmation   │
          │ Required?      │
          └────┬───────────┘
               │
          NO   │   YES
         ┌─────┴──────┐
         ▼            ▼
    ┌────────┐  ┌──────────┐
    │ ALLOW  │  │ Prompt   │
    │ Proceed│  │ User     │
    │ to exec│  └────┬─────┘
    └────────┘       │
                Confirmed?
                     │
                YES  │  NO
               ┌─────┴──────┐
               ▼            ▼
          ┌────────┐  ┌────────┐
          │ ALLOW  │  │ DENY   │
          │ Execute│  │ Return │
          │        │  │ denied │
          └────────┘  └────────┘
```

---

## Operation Envelopes

### Envelope Structure

All Trapdoor operations use standardized operation envelopes (see OPERATION_ENVELOPES.md for full specification).

**Base Structure:**

```typescript
interface OperationEnvelope {
  envelope: {
    type: 'inspect' | 'execute' | 'simulate' | 'policy-deny';
    version: string;
    timestamp: string;
    correlationId: string;
  };
  operation: {
    id: string;
    status: 'success' | 'failure' | 'denied' | 'partial';
    error?: {
      message: string;
      code: string;
      details?: any;
    };
  };
  data: any;
  metadata: Record<string, any>;
}
```

### Operation Lifecycle

#### 1. Request Phase

**Validation:**
- Schema validation (Zod/Yup)
- Parameter type checking
- Required field verification

**Example Request:**

```json
{
  "operation": "reboot_device",
  "params": {
    "deviceSerial": "ABC123",
    "mode": "system"
  },
  "role": "technician",
  "correlationId": "req-abc-123"
}
```

#### 2. Policy Evaluation Phase

**Checks:**
- Role authorization
- Risk level assessment
- Rate limiting
- Capability verification

**Simulate Envelope (Dry Run):**

```json
{
  "envelope": {
    "type": "simulate",
    "version": "1.0",
    "timestamp": "2024-12-27T15:00:00.000Z",
    "correlationId": "req-abc-123"
  },
  "operation": {
    "id": "reboot_device",
    "status": "success"
  },
  "data": {
    "wouldSucceed": true,
    "simulation": {
      "checks": [
        {"name": "policy_evaluation", "passed": true},
        {"name": "device_availability", "passed": true},
        {"name": "adb_connection", "passed": true}
      ],
      "requirements": ["device_connected", "adb_authorized"],
      "warnings": []
    }
  },
  "metadata": {
    "role": "technician",
    "riskLevel": "low",
    "requiresConfirmation": false
  }
}
```

#### 3. Execution Phase

**Workflow Steps:**
1. Load workflow definition
2. Validate device state
3. Execute steps sequentially
4. Capture output/errors
5. Verify success criteria

**Execute Envelope (Success):**

```json
{
  "envelope": {
    "type": "execute",
    "version": "1.0",
    "timestamp": "2024-12-27T15:00:01.000Z",
    "correlationId": "req-abc-123"
  },
  "operation": {
    "id": "reboot_device",
    "status": "success"
  },
  "data": {
    "success": true,
    "result": {
      "deviceSerial": "ABC123",
      "rebootMode": "system",
      "message": "Device rebooted successfully"
    }
  },
  "metadata": {
    "executionTimeMs": 2345,
    "role": "technician",
    "capability": "Reboot Device"
  }
}
```

#### 4. Audit Logging Phase

**Shadow Log Entry:**

```json
{
  "auditId": "audit-abc-123",
  "timestamp": "2024-12-27T15:00:01.000Z",
  "operation": "reboot_device",
  "deviceSerial": "ABC123",
  "userId": "tech@workshop.local",
  "ipAddress": "192.168.1.100",
  "role": "technician",
  "status": "success",
  "riskLevel": "low",
  "confirmationRequired": false,
  "correlationId": "req-abc-123",
  "metadata": {
    "executionTimeMs": 2345,
    "rebootMode": "system"
  }
}
```

### Error Handling

**Execute Envelope (Failure):**

```json
{
  "envelope": {
    "type": "execute",
    "version": "1.0",
    "timestamp": "2024-12-27T15:00:01.000Z",
    "correlationId": "req-abc-123"
  },
  "operation": {
    "id": "reboot_device",
    "status": "failure",
    "error": {
      "message": "Device not found or not authorized",
      "code": "DEVICE_NOT_AVAILABLE",
      "details": {
        "deviceSerial": "ABC123",
        "adbDevices": [],
        "suggestion": "Connect device and authorize ADB debugging"
      }
    }
  },
  "data": {
    "success": false,
    "result": null
  },
  "metadata": {
    "executionTimeMs": 156,
    "role": "technician"
  }
}
```

**Policy Deny Envelope:**

```json
{
  "envelope": {
    "type": "policy-deny",
    "version": "1.0",
    "timestamp": "2024-12-27T15:00:00.000Z",
    "correlationId": "req-abc-456"
  },
  "operation": {
    "id": "unlock_bootloader",
    "status": "denied"
  },
  "data": {
    "denied": true,
    "reason": "Destructive operations require owner role. Current role: technician",
    "policy": {
      "matchedRule": "deny_destructive_for_technician",
      "allowedRoles": ["owner"],
      "currentRole": "technician"
    }
  },
  "metadata": {
    "requestedRole": "technician",
    "requiredRoles": ["owner"],
    "capability": "Unlock Bootloader"
  }
}
```

---

## Security Checklist

### Input Validation

#### ✅ Required Validations

**Device Identifiers:**
```javascript
// GOOD: Validate serial number format
const SERIAL_REGEX = /^[A-Za-z0-9]{6,20}$/;
if (!SERIAL_REGEX.test(deviceSerial)) {
  throw new Error('Invalid device serial format');
}
```

**File Paths:**
```javascript
// GOOD: Prevent path traversal
import path from 'path';

function validatePath(userPath, baseDir) {
  const resolved = path.resolve(baseDir, userPath);
  if (!resolved.startsWith(baseDir)) {
    throw new Error('Path traversal attempt detected');
  }
  return resolved;
}
```

**Operation Parameters:**
```javascript
// GOOD: Use schema validation
import { z } from 'zod';

const RebootSchema = z.object({
  deviceSerial: z.string().regex(/^[A-Za-z0-9]{6,20}$/),
  mode: z.enum(['system', 'recovery', 'bootloader']),
  timeout: z.number().min(1000).max(60000).optional()
});

// Validate before execution
const validated = RebootSchema.parse(params);
```

### Command Execution Hardening

#### ❌ Prohibited Patterns

```javascript
// NEVER: Shell execution with user input
exec(`adb -s ${userSerial} reboot`); // DANGER: Command injection!

// NEVER: String concatenation for commands
const cmd = 'adb -s ' + userInput + ' shell'; // DANGER!
```

#### ✅ Safe Patterns

```javascript
// GOOD: Array-based command execution
import { spawn } from 'child_process';

function executeAdbCommand(serial, command, args = []) {
  // Validate serial first
  if (!SERIAL_REGEX.test(serial)) {
    throw new Error('Invalid serial');
  }
  
  // Use array, not shell
  const adb = spawn('adb', ['-s', serial, command, ...args], {
    shell: false, // Important: no shell
    timeout: 30000
  });
  
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    
    adb.stdout.on('data', data => stdout += data);
    adb.stderr.on('data', data => stderr += data);
    
    adb.on('close', code => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed: ${stderr}`));
      }
    });
    
    adb.on('error', reject);
  });
}
```

### Path Safety

#### File System Operations

```javascript
// GOOD: Safe file operations
import fs from 'fs/promises';
import path from 'path';

async function readDeviceLog(deviceSerial, filename) {
  // Define allowed base directory
  const baseDir = path.resolve('/var/log/workshop/devices', deviceSerial);
  
  // Validate device serial
  if (!SERIAL_REGEX.test(deviceSerial)) {
    throw new Error('Invalid device serial');
  }
  
  // Validate filename (no path components)
  if (filename.includes('/') || filename.includes('\\')) {
    throw new Error('Invalid filename');
  }
  
  // Construct and validate full path
  const fullPath = path.join(baseDir, filename);
  if (!fullPath.startsWith(baseDir)) {
    throw new Error('Path traversal attempt');
  }
  
  // Additional check: file must exist and be regular file
  const stats = await fs.stat(fullPath);
  if (!stats.isFile()) {
    throw new Error('Not a regular file');
  }
  
  // Check file size (prevent DoS)
  const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB
  if (stats.size > MAX_LOG_SIZE) {
    throw new Error('Log file too large');
  }
  
  return await fs.readFile(fullPath, 'utf8');
}
```

### Rate Limiting

#### Implementation

```javascript
// GOOD: Rate limiting middleware
import rateLimit from 'express-rate-limit';

// Trapdoor API rate limiter
const trapdoorLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please wait before retrying.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Identify by API key or IP
  keyGenerator: (req) => {
    return req.headers['x-api-key'] || req.ip;
  }
});

router.use('/api/trapdoor', trapdoorLimiter);
```

### Logging Best Practices

#### Shadow Log Content

**✅ Log These:**
- Operation type and parameters
- User identifier (role, IP)
- Timestamp (ISO 8601)
- Result (success/failure)
- Device identifier
- Correlation ID

**❌ Never Log These:**
- Passwords or API keys
- Personal identification numbers
- Credit card information
- Private keys or certificates
- User password inputs

#### Example

```javascript
// GOOD: Safe logging
await shadowLogger.logShadow({
  operation: 'device_backup',
  deviceSerial: deviceInfo.serial,
  userId: req.user.email,
  ipAddress: req.ip,
  role: req.user.role,
  authorization: 'explicit_user_confirmation',
  success: true,
  metadata: {
    backupSize: backupSizeBytes,
    backupPath: path.basename(backupFile), // Only filename, not full path
    duration: executionTimeMs
  }
});

// BAD: Leaking sensitive data
await logger.log({
  user: req.user.password, // NEVER LOG PASSWORDS!
  apiKey: process.env.ADMIN_API_KEY, // NEVER LOG KEYS!
  fullPath: '/home/admin/.ssh/id_rsa' // AVOID FULL PATHS
});
```

### Timeout Enforcement

```javascript
// GOOD: Timeout on all operations
async function executeWithTimeout(operation, timeoutMs = 30000) {
  return Promise.race([
    operation(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
    )
  ]);
}

// Usage
try {
  const result = await executeWithTimeout(
    () => executeAdbCommand(serial, 'shell', ['getprop']),
    10000 // 10 second timeout
  );
} catch (error) {
  if (error.message === 'Operation timeout') {
    // Handle timeout specifically
    return createErrorEnvelope('OPERATION_TIMEOUT', 'Device did not respond in time');
  }
  throw error;
}
```

### Defense in Depth

**Security Layers:**

1. **Input Validation** - Reject malformed requests
2. **Authentication** - Verify user identity
3. **Authorization** - Check role permissions
4. **Rate Limiting** - Prevent abuse
5. **Command Hardening** - Safe execution patterns
6. **Path Validation** - Prevent traversal
7. **Timeout Enforcement** - Prevent hangs
8. **Output Sanitization** - Clean error messages
9. **Audit Logging** - Track all operations
10. **Encryption** - Protect sensitive logs

---

## Developer Guide

### Adding a New Safe Operation

This guide walks through adding a new operation from start to finish.

#### Step 1: Define Operation Specification

**File:** `core/catalog/operations/device-screenshot.json`

```json
{
  "operation": "capture_screenshot",
  "displayName": "Capture Screenshot",
  "description": "Capture device screen to image file",
  "category": "diagnostics",
  "riskLevel": "low",
  "requiresConfirmation": false,
  "allowedRoles": ["owner", "admin", "technician"],
  "requiredCapabilities": ["adb"],
  "parameters": {
    "deviceSerial": {
      "type": "string",
      "required": true,
      "pattern": "^[A-Za-z0-9]{6,20}$",
      "description": "Device serial number"
    },
    "outputPath": {
      "type": "string",
      "required": false,
      "description": "Output file path (auto-generated if not provided)"
    }
  },
  "auditLogging": "standard",
  "rateLimitPerMinute": 10,
  "estimatedDuration": 5000
}
```

#### Step 2: Create Workflow Definition

**File:** `workflows/android/device-screenshot.json`

```json
{
  "id": "device-screenshot",
  "name": "Capture Device Screenshot",
  "description": "Capture screenshot from Android device via ADB",
  "platform": "android",
  "category": "diagnostics",
  "risk_level": "low",
  "requires_authorization": false,
  "steps": [
    {
      "id": "check-device",
      "name": "Verify device connection",
      "type": "check",
      "action": "adb_device_connected",
      "success_criteria": "device_state == 'device'",
      "on_failure": "abort"
    },
    {
      "id": "capture-screen",
      "name": "Capture screenshot",
      "type": "command",
      "action": "adb shell screencap -p /sdcard/screen.png",
      "success_criteria": "exit_code == 0",
      "on_failure": "abort"
    },
    {
      "id": "pull-file",
      "name": "Pull screenshot from device",
      "type": "command",
      "action": "adb pull /sdcard/screen.png",
      "success_criteria": "file_exists",
      "on_failure": "abort"
    },
    {
      "id": "cleanup",
      "name": "Remove temp file from device",
      "type": "command",
      "action": "adb shell rm /sdcard/screen.png",
      "success_criteria": "exit_code == 0",
      "on_failure": "continue"
    }
  ],
  "metadata": {
    "status": "done",
    "placeholder_found": false,
    "version": "1.0.0",
    "author": "Workshop Team",
    "created_at": 1735315200000,
    "updated_at": 1735315200000,
    "tags": ["screenshot", "diagnostics", "android"]
  }
}
```

#### Step 3: Implement Operation Handler

**File:** `core/operations/device-screenshot.js`

```javascript
import { executeAdbCommand, validateDeviceSerial } from '../lib/adb.js';
import { createExecuteEnvelope, createErrorEnvelope } from '../lib/operation-envelope.js';
import path from 'path';
import fs from 'fs/promises';

/**
 * Capture screenshot from Android device
 * @param {Object} params - Operation parameters
 * @param {string} params.deviceSerial - Device serial number
 * @param {string} [params.outputPath] - Optional output path
 * @returns {Promise<OperationEnvelope>}
 */
export async function captureScreenshot(params) {
  const { deviceSerial, outputPath } = params;
  
  try {
    // Input validation
    validateDeviceSerial(deviceSerial);
    
    // Generate output path if not provided
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = outputPath || `screenshot-${deviceSerial}-${timestamp}.png`;
    const outputDir = path.resolve('./screenshots');
    const fullPath = path.join(outputDir, path.basename(filename));
    
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    // Step 1: Capture on device
    await executeAdbCommand(deviceSerial, 'shell', [
      'screencap', '-p', '/sdcard/workshop-screen.png'
    ]);
    
    // Step 2: Pull to local
    await executeAdbCommand(deviceSerial, 'pull', [
      '/sdcard/workshop-screen.png',
      fullPath
    ]);
    
    // Step 3: Cleanup device (best effort)
    try {
      await executeAdbCommand(deviceSerial, 'shell', [
        'rm', '/sdcard/workshop-screen.png'
      ]);
    } catch (cleanupError) {
      // Non-critical, continue
      console.warn('Screenshot cleanup failed:', cleanupError.message);
    }
    
    // Verify file exists
    const stats = await fs.stat(fullPath);
    
    return createExecuteEnvelope({
      operation: 'capture_screenshot',
      success: true,
      result: {
        deviceSerial,
        outputPath: fullPath,
        fileSizeBytes: stats.size,
        message: 'Screenshot captured successfully'
      },
      metadata: {
        executionTimeMs: Date.now() - startTime
      }
    });
  } catch (error) {
    return createErrorEnvelope(
      'capture_screenshot',
      'SCREENSHOT_FAILED',
      `Failed to capture screenshot: ${error.message}`,
      { deviceSerial, originalError: error.message }
    );
  }
}
```

#### Step 4: Add API Endpoint

**File:** `core/api/trapdoor.js`

```javascript
/**
 * POST /api/trapdoor/screenshot
 * Capture device screenshot
 */
router.post('/screenshot', requireAdmin, async (req, res) => {
  try {
    const { deviceSerial, outputPath } = req.body;
    
    if (!deviceSerial) {
      return res.status(400).json({
        error: 'Device serial required'
      });
    }
    
    // Log operation request
    await shadowLogger.logShadow({
      operation: 'screenshot_requested',
      deviceSerial,
      userId: req.ip,
      authorization: 'ADMIN',
      success: true,
      metadata: { timestamp: new Date().toISOString() }
    });
    
    // Execute operation
    const result = await captureScreenshot({ deviceSerial, outputPath });
    
    // Log completion
    await shadowLogger.logShadow({
      operation: 'screenshot_completed',
      deviceSerial,
      userId: req.ip,
      authorization: 'ADMIN',
      success: result.operation.status === 'success',
      metadata: {
        timestamp: new Date().toISOString(),
        result: result.data.result
      }
    });
    
    return res.json(result);
  } catch (error) {
    console.error('Screenshot error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});
```

#### Step 5: Write Tests

**File:** `tests/operations/device-screenshot.test.js`

```javascript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { captureScreenshot } from '../../core/operations/device-screenshot.js';
import fs from 'fs/promises';
import path from 'path';

describe('captureScreenshot', () => {
  const testSerial = 'TEST123456';
  const screenshotDir = path.resolve('./screenshots');
  
  afterEach(async () => {
    // Cleanup test files
    try {
      const files = await fs.readdir(screenshotDir);
      for (const file of files) {
        if (file.startsWith(`screenshot-${testSerial}`)) {
          await fs.unlink(path.join(screenshotDir, file));
        }
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });
  
  it('should validate device serial', async () => {
    const result = await captureScreenshot({
      deviceSerial: 'invalid../serial'
    });
    
    expect(result.operation.status).toBe('failure');
    expect(result.operation.error.code).toBe('INVALID_SERIAL');
  });
  
  it('should return execute envelope on success', async () => {
    // Note: This requires a real device or mock
    const result = await captureScreenshot({
      deviceSerial: testSerial
    });
    
    expect(result.envelope.type).toBe('execute');
    expect(result.operation.id).toBe('capture_screenshot');
  });
  
  it('should create output directory if missing', async () => {
    // Remove directory if exists
    await fs.rm(screenshotDir, { recursive: true, force: true });
    
    await captureScreenshot({ deviceSerial: testSerial });
    
    const stats = await fs.stat(screenshotDir);
    expect(stats.isDirectory()).toBe(true);
  });
});
```

#### Step 6: Add Documentation

**File:** `docs/operations/device-screenshot.md`

```markdown
# Device Screenshot Operation

## Overview

Capture a screenshot from a connected Android device via ADB.

## Authorization

- **Allowed Roles:** Owner, Admin, Technician
- **Risk Level:** Low
- **Requires Confirmation:** No

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `deviceSerial` | string | Yes | Device serial number (6-20 alphanumeric) |
| `outputPath` | string | No | Custom output filename (auto-generated if omitted) |

## Example Usage

### API Request

\`\`\`bash
curl -X POST http://localhost:3001/api/trapdoor/screenshot \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-admin-key" \
  -d '{
    "deviceSerial": "ABC123XYZ"
  }'
\`\`\`

### Response (Success)

\`\`\`json
{
  "envelope": {
    "type": "execute",
    "version": "1.0",
    "timestamp": "2024-12-27T15:30:00.000Z",
    "correlationId": "abc-123"
  },
  "operation": {
    "id": "capture_screenshot",
    "status": "success"
  },
  "data": {
    "success": true,
    "result": {
      "deviceSerial": "ABC123XYZ",
      "outputPath": "/path/to/screenshot-ABC123XYZ-2024-12-27.png",
      "fileSizeBytes": 245632,
      "message": "Screenshot captured successfully"
    }
  },
  "metadata": {
    "executionTimeMs": 3421
  }
}
\`\`\`

## Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `INVALID_SERIAL` | Device serial validation failed | Provide valid serial (6-20 alphanumeric chars) |
| `DEVICE_NOT_FOUND` | Device not connected or not authorized | Connect device and authorize ADB |
| `SCREENSHOT_FAILED` | ADB command failed | Check device state, ensure screen is on |
| `FILE_WRITE_FAILED` | Cannot write to output directory | Check disk space and permissions |

## Implementation Notes

- Screenshots saved to `./screenshots/` directory
- Temporary file on device is cleaned up automatically
- Output filename format: `screenshot-{serial}-{timestamp}.png`
- Maximum timeout: 30 seconds

## Related Operations

- `device_info` - Get device information
- `device_reboot` - Reboot device
- `adb_diagnostics` - Run full ADB diagnostics
```

#### Step 7: Update Operation Catalog

**File:** `core/catalog/catalog.json`

```json
{
  "capabilities": [
    {
      "id": "capture_screenshot",
      "name": "Capture Screenshot",
      "category": "diagnostics",
      "riskLevel": "low",
      "roles": ["owner", "admin", "technician"],
      "endpoint": "/api/trapdoor/screenshot",
      "documentation": "/docs/operations/device-screenshot.md"
    }
    // ... other capabilities
  ]
}
```

### Operation Template Checklist

Use this checklist when adding any new operation:

- [ ] **Operation spec defined** with risk level, roles, parameters
- [ ] **Workflow JSON created** with all steps documented
- [ ] **Input validation** implemented (schemas, regex, type checking)
- [ ] **Command execution** uses safe patterns (no shell injection)
- [ ] **Path validation** prevents traversal attacks
- [ ] **Timeout enforcement** prevents hanging operations
- [ ] **Error handling** returns proper envelopes with error codes
- [ ] **Shadow logging** captures operation request and result
- [ ] **API endpoint** added with authentication middleware
- [ ] **Tests written** for success and failure cases
- [ ] **Documentation created** with examples and error codes
- [ ] **Catalog updated** with new capability entry
- [ ] **Rate limiting** configured appropriately
- [ ] **Audit review** confirms no security issues

---

## Appendices

### Appendix A: Operation Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **diagnostics** | Read-only information gathering | Device info, logs, battery status |
| **safe** | Low-risk state changes | Reboot, screenshot, app list |
| **backup** | Data preservation operations | Full backup, app data backup |
| **restore** | Data restoration operations | Full restore, factory reset (with data) |
| **destructive** | Permanent data modifications | Factory reset, partition flash, unlock |

### Appendix B: Audit Log Retention

| Log Type | Retention | Encryption | Location |
|----------|-----------|------------|----------|
| Shadow Logs | 90 days | AES-256-CBC | `logs/shadow/` |
| Public Logs | 30 days | None | `logs/public/` |
| Operation Metrics | 1 year | None | Database |
| Failed Auth Attempts | 90 days | AES-256-CBC | `logs/shadow/` |

### Appendix C: Related Documents

- **[Operation Envelopes](../OPERATION_ENVELOPES.md)** - Complete envelope specification
- **[Workflow System](./WORKFLOW_SYSTEM.md)** - Workflow engine documentation
- **[Shadow Logger](../BOBBY_SECRET_WORKSHOP.md#shadow-logging-system)** - Encrypted logging system
- **[Security Notes](../SECURITY_NOTES.md)** - Security best practices
- **[Trapdoor API](./TRAPDOOR_API.md)** - API endpoint reference

### Appendix D: Security Threat Model

**Threat Actors:**

1. **External Attackers** - Unauthorized remote access attempts
2. **Malicious Insiders** - Authorized users abusing privileges
3. **Compromised Credentials** - Stolen API keys or passwords
4. **Supply Chain** - Compromised dependencies or tools

**Mitigations:**

| Threat | Mitigation |
|--------|------------|
| Remote exploitation | API authentication, rate limiting, input validation |
| Privilege escalation | Role-based access, operation allowlists, audit logging |
| Credential theft | JWT with expiration, key rotation, secure storage |
| Code injection | Command hardening, no shell execution, array-based commands |
| Path traversal | Path validation, base directory restrictions |
| DoS attacks | Rate limiting, timeout enforcement, resource limits |
| Data exfiltration | Audit logging, shadow encryption, access controls |

### Appendix E: Compliance Considerations

**Regulatory Requirements:**

- **GDPR** - User consent for data processing, right to access logs
- **HIPAA** - If handling medical device data, encryption at rest/transit required
- **SOX** - Audit trail for all administrative actions
- **PCI DSS** - If processing payment devices, additional security controls

**Compliance Features:**

- ✅ Audit logging with tamper-evidence (append-only)
- ✅ Encryption of sensitive logs (AES-256)
- ✅ Role-based access control
- ✅ Explicit authorization for destructive operations
- ✅ Retention policies with automatic rotation
- ✅ Correlation IDs for request tracing

### Appendix F: Glossary

| Term | Definition |
|------|------------|
| **Trapdoor** | Secure admin subsystem for privileged operations |
| **Operation Envelope** | Standardized response format for all operations |
| **Shadow Logger** | Encrypted audit logging system |
| **Workflow Engine** | JSON-defined operation execution system |
| **Policy Evaluator** | Authorization decision engine |
| **Risk Level** | Classification of operation danger (low/medium/high/destructive) |
| **Correlation ID** | Unique identifier for request tracking across systems |
| **Allowlist** | Explicit list of permitted operations per role |

---

## Conclusion

The Trapdoor Admin Architecture provides a secure, auditable foundation for privileged operations in Bobby's Workshop. By following the principles of explicit authorization, operation envelopes, defense in depth, and complete auditability, we ensure that all operations are:

1. **Legal** - Only legitimate device operations, no exploits
2. **Safe** - Input validated, commands hardened, paths secured
3. **Auditable** - Every operation logged with shadow encryption
4. **Defensible** - Clear authorization trail, policy enforcement

Use this architecture document as the canonical reference when adding new operations, modifying authorization policies, or reviewing security posture.

**Remember:** Every line of code in the Trapdoor subsystem should be defensible in a court of law.

---

**Document Version:** 1.0  
**Last Review:** 2024-12-27  
**Next Review:** 2025-03-27 (quarterly)  
**Document Owner:** Workshop Security Team
