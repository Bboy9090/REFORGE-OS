# Design Principles for Compliant iOS Tooling

**Version:** 1.0  
**Date:** December 24, 2024  
**Purpose:** Extracted design principles for legal, ethical, and platform-respectful iOS tool development

---

## Overview

This document distills design principles from established iOS tooling ecosystems into actionable patterns that can guide Bobby's Workshop development without referencing proprietary implementations or encouraging security circumvention.

These principles emphasize **user agency**, **transparency**, **legal compliance**, and **respect for platform boundaries**.

---

## Core Design Principles

### Principle 1: User-Initiated Operations Only

**Philosophy**: Technology should empower users, not act autonomously

#### Key Characteristics
- Every operation requires explicit user trigger
- No background processes or silent automation
- Clear "Execute" buttons for all operations
- Confirmation dialogs before any action that modifies device state

#### Implementation Pattern
```typescript
// ✅ COMPLIANT: User-initiated action
async function performOperation(deviceId: string, operation: string) {
  // Step 1: Show what will happen
  displayOperationPreview(operation);
  
  // Step 2: Get explicit user confirmation
  const confirmed = await getUserConfirmation(
    `Perform ${operation} on device ${deviceId}?`
  );
  
  if (!confirmed) {
    logEvent('operation_cancelled', { deviceId, operation });
    return { cancelled: true };
  }
  
  // Step 3: Execute with visibility
  return await executeWithProgress(deviceId, operation);
}

// ❌ NON-COMPLIANT: Silent automation
async function autoPerform(deviceId: string) {
  // Executes without user knowledge - PROHIBITED
  await silentOperation(deviceId);
}
```

#### User Experience Impact
- Users maintain full control over their devices
- No surprises or unexpected behavior
- Clear understanding of what the tool does
- Ability to decline or abort at any point

---

### Principle 2: Transparent Workflows

**Philosophy**: Users should see and understand everything the tool does

#### Key Characteristics
- Real-time progress updates for all operations
- Detailed, human-readable logs
- Clear status indicators at every step
- Explanation of operation purpose and impact

#### Implementation Pattern
```typescript
// ✅ COMPLIANT: Transparent operation
async function transparentRestore(deviceId: string, ipsw: string) {
  const logger = new OperationLogger('Restore');
  
  logger.info('Starting device restore operation');
  logger.info(`Device: ${deviceId}`);
  logger.info(`Firmware: ${ipsw}`);
  
  // Verify firmware file
  logger.info('Step 1/5: Verifying firmware file integrity...');
  await verifyIPSW(ipsw, (progress) => {
    logger.progress(`Verification: ${progress}%`);
  });
  
  // Enter recovery mode
  logger.info('Step 2/5: Preparing device (entering recovery mode)...');
  logger.info('Please wait, device will reboot...');
  await enterRecoveryMode(deviceId);
  
  // Continue with visible steps...
  logger.info('Step 3/5: Uploading firmware to device...');
  await uploadFirmware(deviceId, ipsw, (progress) => {
    logger.progress(`Upload: ${progress}%`);
  });
  
  logger.info('Restore complete! Device will reboot.');
  return { success: true, duration: logger.getDuration() };
}

// ❌ NON-COMPLIANT: Hidden operations
async function mysteriousRestore(deviceId: string) {
  // User has no idea what's happening - PROHIBITED
  await doUndocumentedThings();
  return { success: true }; // No visibility
}
```

#### User Experience Impact
- Users can monitor operation progress
- Troubleshooting is easier with detailed logs
- Trust is built through transparency
- Users can identify if operation is stuck or progressing normally

---

### Principle 3: Physical Device Access Requirement

**Philosophy**: Remote operations enable abuse; local operations respect ownership

#### Key Characteristics
- USB connection required for all device operations
- No wireless device manipulation by default
- No cloud-based bypass mechanisms
- Physical presence verifies ownership/authorization

#### Implementation Pattern
```typescript
// ✅ COMPLIANT: Requires physical connection
async function detectConnectedDevice(): Promise<Device | null> {
  // Only detect devices physically connected via USB
  const usbDevices = await scanUSBDevices();
  
  const iosDevices = usbDevices.filter(device => 
    device.vendorId === 0x05AC && // Apple vendor ID
    device.isConnected === true && // Physical connection
    device.interface === 'USB' // Not network
  );
  
  if (iosDevices.length === 0) {
    return null;
  }
  
  return iosDevices[0];
}

// ❌ NON-COMPLIANT: Remote operations
async function remoteManipulation(deviceIp: string) {
  // Operates on devices over network - PROHIBITED
  await networkCommand(deviceIp); // Enables unauthorized access
}
```

#### Security Benefits
- Prevents unauthorized remote access
- Physical access barrier deters theft-related abuse
- Verifies user has physical possession
- Reduces attack surface (no network protocols)

---

### Principle 4: Leverage Standard Mechanisms

**Philosophy**: Use what the platform provides; don't circumvent security

#### Key Characteristics
- Use Apple-documented APIs and protocols
- Leverage user-accessible device modes (DFU, Recovery)
- Follow Apple's recovery procedures
- No exploitation of security vulnerabilities

#### Implementation Pattern
```typescript
// ✅ COMPLIANT: Uses standard libimobiledevice
async function getDeviceInfo(udid: string): Promise<DeviceInfo> {
  try {
    // Use Apple's documented protocol via libimobiledevice
    const result = await exec(`ideviceinfo -u ${udid} -x`);
    const info = parseXML(result.stdout);
    
    return {
      udid: info.UniqueDeviceID,
      model: info.ProductType,
      iosVersion: info.ProductVersion,
      deviceName: info.DeviceName,
      serialNumber: info.SerialNumber
    };
  } catch (error) {
    throw new Error(
      `Failed to retrieve device info: ${error.message}\n` +
      'Ensure device is connected and trusted via iTunes/Finder.'
    );
  }
}

// ❌ NON-COMPLIANT: Exploits vulnerabilities
async function exploitDevice(udid: string) {
  // Uses undocumented exploits - PROHIBITED
  await sendExploitPayload(udid); // Circumvents security
}
```

#### Platform Respect
- Maintains compatibility with iOS updates
- Doesn't trigger Apple security alerts
- Works within Apple's expected use cases
- Respects platform security model

---

### Principle 5: Clear Legal Boundaries

**Philosophy**: Be explicit about authorized use; don't enable abuse

#### Key Characteristics
- Prominent legal disclaimers
- Device ownership assumptions stated clearly
- Prohibited use cases explicitly listed
- User accepts responsibility for compliance

#### Implementation Pattern
```typescript
// ✅ COMPLIANT: Legal boundary enforcement
async function initializeApplication() {
  const legalAccepted = await checkLegalAcceptance();
  
  if (!legalAccepted) {
    const acceptance = await displayLegalDisclaimer({
      title: 'Authorized Use Only',
      content: `
        This software is intended for use ONLY on:
        • Devices you personally own
        • Devices where you have explicit written authorization
        • Legitimate repair and diagnostic purposes
        
        PROHIBITED USES:
        • Bypassing activation lock
        • Removing MDM without authorization
        • Accessing devices you do not own
        • Circumventing security for malicious purposes
        
        Misuse may violate:
        • Computer Fraud and Abuse Act (CFAA)
        • Digital Millennium Copyright Act (DMCA)
        • Computer Misuse Act (UK)
        • Similar laws in other jurisdictions
        
        By proceeding, you acknowledge:
        • You have legal authority over devices you service
        • You accept sole responsibility for compliance
        • Developers assume no liability for misuse
      `,
      requireExplicitAcceptance: true
    });
    
    if (!acceptance.accepted) {
      console.log('Application cannot start without legal acceptance.');
      process.exit(1);
    }
    
    await recordLegalAcceptance({
      timestamp: new Date(),
      userIp: acceptance.userIp,
      accepted: true
    });
  }
}

// Feature-level boundary enforcement
async function performSensitiveOperation(deviceId: string) {
  // Check legal acceptance per session
  if (!hasActiveLegalAcceptance()) {
    throw new Error(
      'Legal disclaimer must be accepted before performing operations'
    );
  }
  
  // Remind user of responsibilities for sensitive operations
  await confirmAuthorization(
    'You confirm you have legal authority over this device?'
  );
  
  // Proceed with operation...
}

// ❌ NON-COMPLIANT: No legal boundaries
async function unsafeOperation(deviceId: string) {
  // No disclaimer, no authorization check - PROHIBITED
  await performRiskyAction(deviceId);
}
```

#### Legal Protection
- Clear user responsibility assignment
- Documented authorized use cases
- Protection against liability claims
- Demonstrates good-faith compliance effort

---

## Operational Patterns

### Pattern 1: Multi-Step Confirmation for Destructive Actions

**Use Case**: Operations that permanently alter or erase data

#### Implementation
```typescript
interface DestructiveOperationConfig {
  operationName: string;
  warningMessages: string[];
  impactDescription: string;
  typedConfirmation: string; // e.g., "ERASE", "DELETE"
  estimatedDuration: string;
}

async function confirmDestructiveOperation(
  config: DestructiveOperationConfig
): Promise<boolean> {
  console.log('\n' + '='.repeat(60));
  console.log(`⚠️  DESTRUCTIVE OPERATION: ${config.operationName}`);
  console.log('='.repeat(60));
  
  console.log(`\n${config.impactDescription}\n`);
  
  console.log('WARNINGS:');
  config.warningMessages.forEach((msg, idx) => {
    console.log(`  ${idx + 1}. ${msg}`);
  });
  
  console.log(`\nEstimated Duration: ${config.estimatedDuration}`);
  
  // First confirmation: Yes/No
  const proceed = await promptYesNo(
    '\nDo you understand and wish to proceed?'
  );
  
  if (!proceed) {
    console.log('Operation cancelled.');
    return false;
  }
  
  // Second confirmation: Typed verification
  console.log(
    `\nType "${config.typedConfirmation}" (exactly) to confirm:`
  );
  const typed = await readInput();
  
  if (typed !== config.typedConfirmation) {
    console.log(
      `❌ Confirmation failed. Expected "${config.typedConfirmation}", ` +
      `got "${typed}". Operation cancelled.`
    );
    return false;
  }
  
  // Third confirmation: Final chance
  const finalConfirm = await promptYesNo(
    'This is your last chance to abort. Continue?'
  );
  
  return finalConfirm;
}

// Usage
async function eraseDevice(deviceId: string) {
  const confirmed = await confirmDestructiveOperation({
    operationName: 'Device Erase',
    warningMessages: [
      'ALL DATA will be permanently deleted',
      'This operation CANNOT be undone',
      'Ensure all important data is backed up',
      'Device will require setup after erase'
    ],
    impactDescription: 
      'This will completely erase all data on the device including:\n' +
      '  • Photos and videos\n' +
      '  • Messages and contacts\n' +
      '  • Apps and app data\n' +
      '  • Settings and preferences',
    typedConfirmation: 'ERASE',
    estimatedDuration: '10-15 minutes'
  });
  
  if (!confirmed) {
    return { cancelled: true };
  }
  
  // Proceed with erase...
}
```

---

### Pattern 2: Progress Streaming with Abort Capability

**Use Case**: Long-running operations that user should monitor

#### Implementation
```typescript
interface OperationProgress {
  phase: string;
  progress: number; // 0-100
  message: string;
  abortable: boolean;
}

class AbortableOperation {
  private aborted = false;
  private listeners: ((progress: OperationProgress) => void)[] = [];
  
  onProgress(callback: (progress: OperationProgress) => void) {
    this.listeners.push(callback);
  }
  
  abort() {
    this.aborted = true;
  }
  
  protected updateProgress(progress: OperationProgress) {
    this.listeners.forEach(listener => listener(progress));
  }
  
  protected checkAborted() {
    if (this.aborted) {
      throw new Error('Operation aborted by user');
    }
  }
  
  async execute(): Promise<void> {
    // Override in subclass
    throw new Error('Not implemented');
  }
}

class DeviceRestoreOperation extends AbortableOperation {
  constructor(
    private deviceId: string,
    private firmwarePath: string
  ) {
    super();
  }
  
  async execute(): Promise<void> {
    try {
      // Phase 1: Verification
      this.updateProgress({
        phase: 'verification',
        progress: 0,
        message: 'Verifying firmware file...',
        abortable: true
      });
      
      await this.verifyFirmware();
      this.checkAborted();
      
      // Phase 2: Preparation
      this.updateProgress({
        phase: 'preparation',
        progress: 20,
        message: 'Entering recovery mode...',
        abortable: true
      });
      
      await this.enterRecoveryMode();
      this.checkAborted();
      
      // Phase 3: Upload (not abortable during this phase)
      this.updateProgress({
        phase: 'upload',
        progress: 40,
        message: 'Uploading firmware (do not disconnect)...',
        abortable: false
      });
      
      await this.uploadFirmware((uploadProgress) => {
        this.updateProgress({
          phase: 'upload',
          progress: 40 + (uploadProgress * 0.4),
          message: `Uploading firmware: ${uploadProgress}%`,
          abortable: false
        });
      });
      
      // Phase 4: Installation
      this.updateProgress({
        phase: 'installation',
        progress: 80,
        message: 'Installing firmware...',
        abortable: false
      });
      
      await this.installFirmware();
      
      // Phase 5: Completion
      this.updateProgress({
        phase: 'completion',
        progress: 100,
        message: 'Restore complete! Device will reboot.',
        abortable: false
      });
      
    } catch (error) {
      if (error.message.includes('aborted')) {
        this.updateProgress({
          phase: 'aborted',
          progress: 0,
          message: 'Operation aborted by user',
          abortable: false
        });
      }
      throw error;
    }
  }
  
  private async verifyFirmware() { /* ... */ }
  private async enterRecoveryMode() { /* ... */ }
  private async uploadFirmware(onProgress: (p: number) => void) { /* ... */ }
  private async installFirmware() { /* ... */ }
}

// Usage
async function performRestore(deviceId: string, firmwarePath: string) {
  const operation = new DeviceRestoreOperation(deviceId, firmwarePath);
  
  operation.onProgress((progress) => {
    console.log(
      `[${progress.phase}] ${progress.progress}% - ${progress.message}`
    );
    
    if (progress.abortable) {
      console.log('  (Press Ctrl+C to abort)');
    }
  });
  
  // Allow user to abort with Ctrl+C
  process.on('SIGINT', () => {
    console.log('\nAborting operation...');
    operation.abort();
  });
  
  try {
    await operation.execute();
    console.log('✅ Restore completed successfully');
  } catch (error) {
    if (error.message.includes('aborted')) {
      console.log('⚠️  Operation aborted by user');
    } else {
      console.error('❌ Restore failed:', error.message);
    }
  }
}
```

---

### Pattern 3: State Verification Before Operations

**Use Case**: Ensure device is in correct state before proceeding

#### Implementation
```typescript
enum DeviceState {
  NORMAL = 'normal',
  RECOVERY = 'recovery',
  DFU = 'dfu',
  UNKNOWN = 'unknown'
}

async function getCurrentDeviceState(udid: string): Promise<DeviceState> {
  try {
    // Try normal mode detection
    const normalInfo = await exec(`ideviceinfo -u ${udid}`);
    if (normalInfo.stdout.includes('ProductType')) {
      return DeviceState.NORMAL;
    }
  } catch (error) {
    // Normal mode failed, try recovery
  }
  
  try {
    // Recovery mode allows limited queries
    const recoveryInfo = await exec(`ideviceinfo -u ${udid} -k ProductType`);
    if (recoveryInfo.stdout) {
      return DeviceState.RECOVERY;
    }
  } catch (error) {
    // Recovery failed, might be DFU
  }
  
  // Check for DFU mode (appears as USB device without UDID)
  const usbDevices = await scanUSBDevices();
  const dfuDevice = usbDevices.find(d => 
    d.vendorId === 0x05AC && 
    d.productId >= 0x1220 && d.productId <= 0x1230 // DFU PID range
  );
  
  if (dfuDevice) {
    return DeviceState.DFU;
  }
  
  return DeviceState.UNKNOWN;
}

async function requireDeviceState(
  udid: string,
  requiredState: DeviceState
): Promise<void> {
  const currentState = await getCurrentDeviceState(udid);
  
  if (currentState === requiredState) {
    return; // State is correct
  }
  
  // State is incorrect, provide guidance
  const instructions = getStateTransitionInstructions(
    currentState,
    requiredState
  );
  
  throw new Error(
    `Device must be in ${requiredState} mode.\n` +
    `Current state: ${currentState}\n\n` +
    `Instructions:\n${instructions}\n\n` +
    'Please follow the instructions and try again.'
  );
}

function getStateTransitionInstructions(
  from: DeviceState,
  to: DeviceState
): string {
  if (to === DeviceState.DFU) {
    return `
To enter DFU mode:
1. Connect device to computer via USB
2. Press and quickly release Volume Up button
3. Press and quickly release Volume Down button
4. Press and hold Side button until screen goes black
5. While holding Side, press and hold Volume Down for 5 seconds
6. Release Side button but continue holding Volume Down for 5 more seconds
7. Screen should remain black (if Apple logo appears, start over)
    `.trim();
  }
  
  if (to === DeviceState.RECOVERY) {
    return `
To enter Recovery mode:
1. Connect device to computer via USB
2. Open iTunes or Finder
3. Press and quickly release Volume Up button
4. Press and quickly release Volume Down button
5. Press and hold Side button until you see Recovery mode screen
   (iTunes logo with cable pointing to computer)
    `.trim();
  }
  
  if (to === DeviceState.NORMAL) {
    return `
To exit recovery/DFU mode:
1. Force restart the device:
   - Press and quickly release Volume Up
   - Press and quickly release Volume Down
   - Press and hold Side button until Apple logo appears
2. Device will boot to normal mode
    `.trim();
  }
  
  return 'State transition instructions not available.';
}

// Usage
async function performRestoreOperation(udid: string) {
  console.log('Checking device state...');
  
  try {
    await requireDeviceState(udid, DeviceState.RECOVERY);
    console.log('✅ Device is in recovery mode, proceeding...');
    
    // Perform restore operation
    await restoreDevice(udid);
    
  } catch (error) {
    console.error('❌ Cannot proceed:', error.message);
    process.exit(1);
  }
}
```

---

### Pattern 4: Rollback Support for Configuration Changes

**Use Case**: Changes that can be safely reversed if they fail

#### Implementation
```typescript
interface DeviceSnapshot {
  deviceId: string;
  timestamp: Date;
  configuration: any;
  state: any;
}

class RollbackManager {
  private snapshots = new Map<string, DeviceSnapshot[]>();
  
  async createSnapshot(
    deviceId: string,
    description: string
  ): Promise<string> {
    const snapshot: DeviceSnapshot = {
      deviceId,
      timestamp: new Date(),
      configuration: await this.captureConfiguration(deviceId),
      state: await this.captureState(deviceId)
    };
    
    const snapshotId = `${deviceId}-${Date.now()}`;
    
    if (!this.snapshots.has(deviceId)) {
      this.snapshots.set(deviceId, []);
    }
    
    this.snapshots.get(deviceId)!.push(snapshot);
    
    console.log(
      `📸 Snapshot created: ${snapshotId}\n` +
      `   Description: ${description}\n` +
      `   Time: ${snapshot.timestamp.toISOString()}`
    );
    
    return snapshotId;
  }
  
  async rollback(deviceId: string): Promise<void> {
    const snapshots = this.snapshots.get(deviceId);
    
    if (!snapshots || snapshots.length === 0) {
      throw new Error('No snapshots available for rollback');
    }
    
    const snapshot = snapshots[snapshots.length - 1];
    
    console.log(
      `🔄 Rolling back to snapshot from ${snapshot.timestamp.toISOString()}...`
    );
    
    await this.restoreConfiguration(deviceId, snapshot.configuration);
    await this.restoreState(deviceId, snapshot.state);
    
    console.log('✅ Rollback complete');
  }
  
  private async captureConfiguration(deviceId: string): Promise<any> {
    // Capture current configuration
    return { /* ... */ };
  }
  
  private async captureState(deviceId: string): Promise<any> {
    // Capture current state
    return { /* ... */ };
  }
  
  private async restoreConfiguration(deviceId: string, config: any) {
    // Restore configuration
  }
  
  private async restoreState(deviceId: string, state: any) {
    // Restore state
  }
}

// Usage
async function applyConfigurationWithRollback(
  deviceId: string,
  newConfig: any
) {
  const rollbackMgr = new RollbackManager();
  
  // Create snapshot before changes
  await rollbackMgr.createSnapshot(
    deviceId,
    'Before configuration change'
  );
  
  try {
    console.log('Applying new configuration...');
    await applyConfiguration(deviceId, newConfig);
    
    console.log('Verifying configuration...');
    await verifyConfiguration(deviceId, newConfig);
    
    console.log('✅ Configuration applied successfully');
    
  } catch (error) {
    console.error('❌ Configuration failed:', error.message);
    console.log('Attempting rollback...');
    
    try {
      await rollbackMgr.rollback(deviceId);
      console.log('✅ Rolled back to previous state');
    } catch (rollbackError) {
      console.error('❌ Rollback failed:', rollbackError.message);
      console.error('⚠️  Device may be in inconsistent state');
      console.error('   Manual recovery may be required');
    }
    
    throw error;
  }
}
```

---

## Documentation Patterns

### Pattern 1: Prerequisites Declaration

Every feature should clearly state prerequisites:

```markdown
## Prerequisites

Before using this feature, ensure:

### Device Requirements
- [ ] Device is physically connected via USB
- [ ] Device is charged to at least 50% battery
- [ ] Device is unlocked and trust dialog accepted
- [ ] iTunes/Finder is not running

### User Requirements
- [ ] You own the device OR have written authorization from owner
- [ ] Device is not reported stolen or lost
- [ ] You understand the risks involved
- [ ] You have backed up important data

### Software Requirements
- [ ] libimobiledevice installed (`brew install libimobiledevice`)
- [ ] USB drivers installed (Windows only)
- [ ] Backend server running on port 3001

### Legal Requirements
- [ ] Legal disclaimer has been read and accepted
- [ ] You accept sole responsibility for compliance
- [ ] You will not use this tool for unauthorized access
```

---

### Pattern 2: Risk Disclosure

Every potentially destructive operation should have risk disclosure:

```markdown
## ⚠️ Risk Disclosure

### Data Loss Risk
- **HIGH**: This operation will erase ALL data on the device
- **Cannot be undone**: Once started, data cannot be recovered
- **Backup required**: Ensure all important data is backed up

### Device Risk
- **Bricking**: Interrupting this operation may render device temporarily unusable
- **Recovery**: Device can be recovered via iTunes/Finder restore
- **Time**: Operation takes 10-20 minutes; do NOT disconnect during this time

### Warranty Impact
- **May void warranty**: This operation may void manufacturer warranty
- **Service**: Apple may refuse service if modification detected
- **Responsibility**: You accept all warranty risks

### Legal Risks
- **Authorized use only**: Use only on devices you own or have authorization for
- **Criminal liability**: Unauthorized use may constitute criminal activity
- **Sole responsibility**: You are solely responsible for legal compliance
```

---

### Pattern 3: Step-by-Step Instructions

Operations should have clear, numbered steps:

```markdown
## Entering DFU Mode (iPhone 8 and newer)

### What is DFU Mode?
Device Firmware Update (DFU) mode is a special state that allows firmware 
updates and recovery operations. Unlike recovery mode, DFU mode loads no 
software and allows complete firmware replacement.

### When to Use DFU Mode
- Device is unresponsive and won't enter recovery mode
- Need to downgrade iOS (not recommended)
- Performing low-level recovery operations
- Device stuck in boot loop

### Instructions

1. **Prepare**
   - Connect device to computer via USB cable
   - Close iTunes/Finder if running
   - Ensure device is charged to at least 50%

2. **Begin Sequence**
   - Press and quickly release Volume Up button
   - Press and quickly release Volume Down button
   - Press and hold Side button

3. **Enter DFU**
   - After about 8 seconds (when screen goes black), while still holding Side button:
   - Press and hold Volume Down button
   - Hold BOTH buttons for exactly 5 seconds

4. **Final Step**
   - Release Side button but keep holding Volume Down
   - Continue holding Volume Down for 5 more seconds

5. **Verify**
   - Screen should remain completely black
   - If Apple logo appears, you're in recovery mode (start over)
   - If screen shows anything, you're not in DFU mode (start over)
   - Computer should detect device (check device manager/system profiler)

### Troubleshooting
- **Apple logo appears**: You entered recovery mode, not DFU. Try again with exact timing.
- **Nothing happens**: Try a different USB cable or USB port
- **Computer doesn't detect**: Check if iTunes/Finder is running (close it)
- **Button timing**: The timing is precise; practice makes perfect

### Exiting DFU Mode
To exit DFU mode and return to normal operation:
- Press and quickly release Volume Up
- Press and quickly release Volume Down
- Press and hold Side button until Apple logo appears
```

---

## Error Handling Patterns

### Pattern 1: Actionable Error Messages

```typescript
// ✅ COMPLIANT: Helpful error with recovery steps
function createActionableError(
  operation: string,
  error: Error,
  context: any
): Error {
  const troubleshooting = getTroubleshootingSteps(error);
  
  return new Error(
    `${operation} failed: ${error.message}\n\n` +
    `Context:\n` +
    `  Device: ${context.deviceId}\n` +
    `  State: ${context.deviceState}\n` +
    `  Connection: ${context.connectionType}\n\n` +
    `Troubleshooting:\n` +
    troubleshooting.map((step, idx) => 
      `  ${idx + 1}. ${step}`
    ).join('\n') + '\n\n' +
    `For more help, visit: ${getSupportUrl(operation)}`
  );
}

function getTroubleshootingSteps(error: Error): string[] {
  if (error.message.includes('device not found')) {
    return [
      'Ensure device is connected via USB cable',
      'Try a different USB cable or port',
      'Unlock device and accept trust dialog',
      'Restart the device',
      'Restart this application'
    ];
  }
  
  if (error.message.includes('permission denied')) {
    return [
      'Check USB permissions (may need sudo on Linux)',
      'Ensure device is not being used by another application',
      'Close iTunes/Finder if running',
      'Check udev rules (Linux only)'
    ];
  }
  
  if (error.message.includes('timeout')) {
    return [
      'Operation took too long - device may be unresponsive',
      'Try restarting the device',
      'Ensure device is charged (at least 50%)',
      'Check USB cable quality',
      'Try again with a longer timeout'
    ];
  }
  
  return [
    'Check device connection',
    'Restart the device',
    'Restart this application',
    'Check the logs for more details',
    'Contact support if issue persists'
  ];
}

// ❌ NON-COMPLIANT: Unhelpful error
throw new Error('Operation failed'); // No context, no recovery steps
```

---

### Pattern 2: Graceful Degradation

```typescript
// ✅ COMPLIANT: Partial success with clear messaging
async function getComprehensiveDeviceInfo(udid: string): Promise<DeviceInfo> {
  const info: DeviceInfo = {
    udid,
    status: 'partial',
    errors: []
  };
  
  // Critical information (must succeed)
  try {
    info.model = await getModel(udid);
  } catch (error) {
    throw new Error(
      `Cannot retrieve basic device information: ${error.message}\n` +
      'Device may not be properly connected.'
    );
  }
  
  // Optional information (graceful failure)
  try {
    info.batteryLevel = await getBatteryLevel(udid);
  } catch (error) {
    info.errors.push('Battery information unavailable');
    info.batteryLevel = null;
  }
  
  try {
    info.storageInfo = await getStorageInfo(udid);
  } catch (error) {
    info.errors.push('Storage information unavailable');
    info.storageInfo = null;
  }
  
  try {
    info.networkInfo = await getNetworkInfo(udid);
  } catch (error) {
    info.errors.push('Network information unavailable');
    info.networkInfo = null;
  }
  
  if (info.errors.length > 0) {
    console.warn(
      '⚠️  Some device information could not be retrieved:\n' +
      info.errors.map(e => `  • ${e}`).join('\n')
    );
  }
  
  info.status = info.errors.length === 0 ? 'complete' : 'partial';
  
  return info;
}

// ❌ NON-COMPLIANT: All-or-nothing
async function getDeviceInfoBad(udid: string): Promise<DeviceInfo> {
  // If ANY query fails, everything fails
  return {
    model: await getModel(udid),
    battery: await getBatteryLevel(udid), // Failure here loses all data
    storage: await getStorageInfo(udid),
    network: await getNetworkInfo(udid)
  };
}
```

---

## Summary Checklist

When implementing a new feature, verify compliance with these principles:

### User Control
- [ ] Operation requires explicit user initiation
- [ ] User can see operation progress in real-time
- [ ] User can abort operation at safe points
- [ ] No background automation or silent operations

### Transparency
- [ ] Operation purpose and impact clearly explained
- [ ] Real-time progress updates provided
- [ ] Detailed logs available for review
- [ ] Status indicators show current operation state

### Physical Access
- [ ] USB connection required for device operations
- [ ] No remote or wireless device manipulation
- [ ] Physical presence verifies ownership/authorization

### Platform Compliance
- [ ] Uses Apple-documented mechanisms only
- [ ] Leverages user-accessible device modes
- [ ] No exploitation of security vulnerabilities
- [ ] Follows Apple's recovery procedures

### Legal Boundaries
- [ ] Legal disclaimer displayed and accepted
- [ ] Device ownership assumptions stated clearly
- [ ] Prohibited use cases explicitly listed
- [ ] User accepts responsibility for compliance

### Documentation
- [ ] Prerequisites clearly stated
- [ ] Risk disclosures prominent
- [ ] Step-by-step instructions provided
- [ ] Troubleshooting guidance included
- [ ] Support resources linked

### Error Handling
- [ ] Errors provide actionable recovery steps
- [ ] Context included in error messages
- [ ] Graceful degradation where appropriate
- [ ] Support resources provided

### Audit Trail
- [ ] Operations logged for accountability
- [ ] User confirmations recorded
- [ ] Evidence chain maintained
- [ ] Compliance audit supported

---

## Document Metadata

**Version:** 1.0  
**Date:** December 24, 2024  
**Maintained By:** Bobby's Workshop Research Team  
**Purpose:** Design principles for compliant iOS tooling  
**Next Review:** March 24, 2025

**Related Documents:**
- [Full Analysis](./IOS_TOOLING_ECOSYSTEM_ANALYSIS.md)
- [Comparison Matrix](./COMPARISON_MATRIX.md)
- [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md)

---

**Core Philosophy**: Empower users with tools that respect platform boundaries, 
maintain legal compliance, and operate with complete transparency. Technology 
should serve users, not manipulate devices behind their backs.
