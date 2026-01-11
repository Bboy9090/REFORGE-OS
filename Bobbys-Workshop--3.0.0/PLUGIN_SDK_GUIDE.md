# Bobby's World Plugin SDK

## Overview

The Bobby's World Plugin SDK enables developers to extend the platform with custom device detection, diagnostics, flashing, and workflow capabilities. The SDK provides TypeScript/JavaScript interfaces with optional Rust bindings for performance-critical operations.

## Architecture

### Plugin Types

1. **Detection Plugins**: Identify devices, modes, and hardware states
2. **Diagnostic Plugins**: Run hardware tests, check system health
3. **Flashing Plugins**: Custom firmware flashing protocols
4. **Recovery Plugins**: Device unbrick and recovery workflows
5. **Security Plugins**: Lock state analysis and educational resources
6. **Workflow Plugins**: Automated repair workflows
7. **Utility Plugins**: General-purpose tools

### Risk Levels

- **Safe**: Read-only operations, no device modification
- **Moderate**: Non-destructive writes (logs, temp files)
- **High**: Device configuration changes
- **Critical**: Firmware flashing, security modifications

## Creating a Plugin

### Basic Structure

```typescript
import {
  Plugin,
  PluginContext,
  PluginAPI,
  PluginManifest,
  PluginResult,
} from "@/types/plugin-sdk";

const manifest: PluginManifest = {
  id: "com.example.myplugin",
  name: "My Plugin",
  version: "1.0.0",
  author: "Your Name",
  description: "Custom device detection plugin",
  category: "device-detection",
  capabilities: ["detection"],
  riskLevel: "safe",
  requiredPermissions: ["device:read"],
  supportedPlatforms: ["android", "ios"],
  minimumSDKVersion: "1.0.0",
  entryPoint: "./index.js",
  license: "MIT",
  certification: {
    certifiedBy: "self",
    status: "pending",
    signatureHash: "sha256:...",
  },
};

const plugin: Plugin = {
  manifest,

  async initialize(context: PluginContext, api: PluginAPI) {
    context.logger.info("Plugin initialized", { version: manifest.version });

    const settings = await context.kv.get("plugin-settings");
    if (!settings) {
      await context.kv.set("plugin-settings", { enabled: true });
    }
  },

  async detect(device) {
    return {
      detected: true,
      confidence: 0.95,
      platform: "android",
      brand: "samsung",
      model: "Galaxy S21",
      deviceMode: "fastboot",
      capabilities: ["fastboot_flash", "oem_unlock"],
      correlationBadge: "CORRELATED",
      matchedIds: ["ABC123XYZ"],
    };
  },

  async diagnose(device) {
    return {
      passed: true,
      findings: [
        {
          category: "hardware",
          severity: "info",
          title: "Battery Health",
          description: "Battery capacity at 92%",
        },
      ],
      healthScore: 92,
      recommendations: ["Battery in good condition"],
    };
  },

  async cleanup() {
    // Cleanup resources
  },
};

export default plugin;
```

### Plugin API

Plugins have access to:

```typescript
interface PluginAPI {
  getDeviceInfo(serial: string): Promise<DeviceInfo>;

  executeCommand(command: string, args: string[]): Promise<CommandResult>;

  detectDevices(): Promise<DetectedDevice[]>;

  startFlashOperation(config: FlashConfig): Promise<string>;

  monitorProgress(jobId: string): AsyncIterableIterator<ProgressUpdate>;

  createEvidence(data: EvidenceData): Promise<string>;

  requestPermission(permission: string): Promise<boolean>;

  showNotification(notification: Notification): void;

  openDialog(dialog: Dialog): Promise<DialogResult>;
}
```

### Plugin Context

```typescript
interface PluginContext {
  pluginId: string;
  version: string;
  environment: "dev" | "staging" | "production";

  user: {
    id: string;
    isOwner: boolean;
    permissions: string[];
  };

  device?: {
    serial: string;
    platform: string;
    brand: string;
    model: string;
  };

  kv: {
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T): Promise<void>;
    delete(key: string): Promise<void>;
    keys(): Promise<string[]>;
  };

  logger: {
    info(message: string, metadata?: Record<string, any>): void;
    warn(message: string, metadata?: Record<string, any>): void;
    error(message: string, metadata?: Record<string, any>): void;
    debug(message: string, metadata?: Record<string, any>): void;
  };

  emit(event: string, data: any): void;
  on(event: string, handler: (data: any) => void): () => void;
}
```

## Rust Plugin Interface (Advanced)

For performance-critical operations, plugins can be written in Rust:

```rust
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct PluginManifest {
    pub id: String,
    pub name: String,
    pub version: String,
    pub author: String,
    pub description: String,
    pub category: PluginCategory,
    pub capabilities: Vec<PluginCapability>,
    pub risk_level: PluginRiskLevel,
    pub required_permissions: Vec<String>,
    pub supported_platforms: Vec<String>,
    pub minimum_sdk_version: String,
    pub entry_point: String,
    pub license: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum PluginCategory {
    DeviceDetection,
    Diagnostics,
    Flashing,
    Recovery,
    Security,
    Workflow,
    Utility,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PluginRiskLevel {
    Safe,
    Moderate,
    High,
    Critical,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PluginCapability {
    Detection,
    Diagnostics,
    Flash,
    Recovery,
    Backup,
    Restore,
    Unlock,
    Root,
    Custom,
}

pub trait Plugin: Send + Sync {
    fn manifest(&self) -> &PluginManifest;

    fn initialize(&mut self, context: PluginContext) -> Result<(), PluginError>;

    fn detect(&self, device: &DetectedDevice) -> Result<DetectionResult, PluginError>;

    fn diagnose(&self, device: &DetectedDevice) -> Result<DiagnosticResult, PluginError>;

    fn flash(&self, config: &FlashConfig) -> Result<FlashResult, PluginError>;

    fn cleanup(&mut self) -> Result<(), PluginError>;
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DetectionResult {
    pub detected: bool,
    pub confidence: f64,
    pub platform: Option<String>,
    pub brand: Option<String>,
    pub model: Option<String>,
    pub device_mode: Option<String>,
    pub capabilities: Option<Vec<String>>,
    pub correlation_badge: Option<String>,
    pub matched_ids: Option<Vec<String>>,
    pub warnings: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DiagnosticResult {
    pub passed: bool,
    pub findings: Vec<DiagnosticFinding>,
    pub health_score: Option<u8>,
    pub recommendations: Option<Vec<String>>,
    pub next_steps: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DiagnosticFinding {
    pub category: String,
    pub severity: FindingSeverity,
    pub title: String,
    pub description: String,
    pub resolution: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum FindingSeverity {
    Info,
    Warning,
    Error,
    Critical,
}

// FFI bindings for TypeScript interop
#[no_mangle]
pub extern "C" fn plugin_detect(
    plugin_ptr: *mut Box<dyn Plugin>,
    device_json: *const c_char,
) -> *mut c_char {
    // Implementation
}

#[no_mangle]
pub extern "C" fn plugin_diagnose(
    plugin_ptr: *mut Box<dyn Plugin>,
    device_json: *const c_char,
) -> *mut c_char {
    // Implementation
}
```

## Certification Process

### 1. Self-Certification

All plugins start as self-certified:

```typescript
certification: {
  certifiedBy: 'self',
  status: 'pending',
  signatureHash: 'sha256:...',
}
```

### 2. Community Review

Community members can review and vouch for plugins:

- Code review
- Security audit
- Functionality testing

### 3. Bobby Certification

The platform owner can certify plugins as trusted:

- Full code audit
- Security verification
- Integration testing
- Performance benchmarking

### 4. OEM Certification

Device manufacturers can certify official plugins:

- Firmware compatibility
- Hardware validation
- Warranty compliance

## Security & Sandboxing

### Permissions Model

Plugins must declare required permissions:

```typescript
requiredPermissions: [
  "device:read", // Read device information
  "device:write", // Modify device settings
  "device:flash", // Flash firmware
  "device:command", // Execute system commands
  "storage:read", // Read local storage
  "storage:write", // Write local storage
  "network:request", // Make network requests
  "user:data", // Access user data
];
```

### Sandboxing

Plugins run in isolated contexts:

- No direct file system access
- No raw command execution
- All operations via Plugin API
- Resource limits enforced
- Audit logging enabled

### Policy Gates

```typescript
securityPolicy: {
  allowUncertified: false,
  requireSignature: true,
  allowedRiskLevels: ['safe', 'moderate'],
  maxExecutionsPerDay: 100,
  requireUserConfirmationFor: ['high', 'critical'],
  blocklist: [],
  allowlist: [],
  sandboxEnabled: true,
  auditLogging: true,
}
```

## Plugin Distribution

### Installation

```typescript
// Install from file
await pluginRegistry.installFromFile("./my-plugin.js");

// Install from URL
await pluginRegistry.installFromURL("https://example.com/plugin.js");

// Install from package
await pluginRegistry.installFromPackage("com.example.myplugin@1.0.0");
```

### Publishing

1. Package plugin with manifest
2. Generate signature hash
3. Submit for review
4. Wait for certification
5. Publish to registry

## Example Plugins

### Samsung Odin Detection Plugin

```typescript
const samsungOdinPlugin: Plugin = {
  manifest: {
    id: "com.bobby.samsung-odin",
    name: "Samsung Odin Mode Detection",
    version: "1.0.0",
    author: "Bobby",
    description: "Detects Samsung devices in Odin download mode",
    category: "device-detection",
    capabilities: ["detection"],
    riskLevel: "safe",
    requiredPermissions: ["device:read"],
    supportedPlatforms: ["android"],
    supportedDevices: ["samsung"],
    minimumSDKVersion: "1.0.0",
    entryPoint: "./index.js",
    license: "MIT",
    certification: {
      certifiedBy: "bobby",
      status: "certified",
      signatureHash: "sha256:abc123...",
      certificationDate: Date.now(),
    },
  },

  async initialize(context, api) {
    context.logger.info("Samsung Odin plugin initialized");
  },

  async detect(device) {
    // Check USB VID/PID for Samsung download mode
    if (device.vendorId === "04e8" && device.productId === "685d") {
      return {
        detected: true,
        confidence: 1.0,
        platform: "android",
        brand: "samsung",
        deviceMode: "download",
        capabilities: ["odin_flash", "pit_flash", "bootloader_flash"],
        correlationBadge: "CORRELATED",
      };
    }

    return { detected: false, confidence: 0 };
  },
};
```

### Battery Diagnostics Plugin

```typescript
const batteryDiagnosticsPlugin: Plugin = {
  manifest: {
    id: "com.bobby.battery-diag",
    name: "Battery Diagnostics",
    version: "1.0.0",
    author: "Bobby",
    description: "Analyzes battery health and capacity",
    category: "diagnostics",
    capabilities: ["diagnostics"],
    riskLevel: "safe",
    requiredPermissions: ["device:read", "device:command"],
    supportedPlatforms: ["android", "ios"],
    minimumSDKVersion: "1.0.0",
    entryPoint: "./index.js",
    license: "MIT",
  },

  async initialize(context, api) {
    context.logger.info("Battery diagnostics plugin initialized");
  },

  async diagnose(device) {
    const deviceInfo = await api.getDeviceInfo(device.serial);

    // Execute battery health check
    const result = await api.executeCommand("dumpsys", ["battery"]);

    const capacity = parseBatteryCapacity(result.stdout);
    const health = parseBatteryHealth(result.stdout);
    const temperature = parseBatteryTemp(result.stdout);

    const findings: DiagnosticFinding[] = [];

    if (capacity < 80) {
      findings.push({
        category: "battery",
        severity: "warning",
        title: "Battery Degradation",
        description: `Battery capacity at ${capacity}%`,
        resolution: "Consider battery replacement",
      });
    }

    if (temperature > 45) {
      findings.push({
        category: "battery",
        severity: "error",
        title: "High Temperature",
        description: `Battery temperature: ${temperature}°C`,
        resolution: "Allow device to cool before operation",
      });
    }

    const healthScore = Math.min(capacity, 100 - (temperature - 25) * 2);

    return {
      passed: capacity >= 80 && temperature < 45,
      findings,
      healthScore,
      recommendations: [
        "Monitor battery health monthly",
        "Avoid extreme temperatures",
        "Use official charger",
      ],
    };
  },
};
```

## Best Practices

1. **Error Handling**: Always catch and handle errors gracefully
2. **Logging**: Use context.logger for all logging
3. **Permissions**: Request minimal required permissions
4. **Testing**: Test on multiple devices and platforms
5. **Documentation**: Document all capabilities and limitations
6. **Versioning**: Follow semantic versioning
7. **Security**: Never hardcode credentials or keys
8. **Performance**: Optimize for low resource usage
9. **Compatibility**: Support multiple device generations
10. **User Experience**: Provide clear messages and progress updates

## API Reference

See the full TypeScript type definitions in `/src/types/plugin-sdk.ts` for complete API documentation.

## Support

- GitHub Issues: https://github.com/bobby/world/issues
- Documentation: https://docs.bobbyworld.dev
- Community: https://community.bobbyworld.dev
