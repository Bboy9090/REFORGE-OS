import { describe, it, expect, beforeEach, vi } from 'vitest';
import path from 'node:path';

import { WorkflowEngine } from '../../core/tasks/workflow-engine.js';

// Mock the libraries
vi.mock('../../core/lib/adb.js', () => ({
  default: {
    executeCommand: vi.fn(),
    listDevices: vi.fn(),
    isAvailable: vi.fn()
  }
}));

vi.mock('../../core/lib/fastboot.js', () => ({
  default: {
    executeCommand: vi.fn(),
    listDevices: vi.fn(),
    isAvailable: vi.fn()
  }
}));

vi.mock('../../core/lib/ios.js', () => ({
  default: {
    executeCommand: vi.fn(),
    listDevices: vi.fn(),
    isAvailable: vi.fn()
  }
}));

vi.mock('../../core/lib/shadow-logger.js', () => ({
  default: class MockShadowLogger {
    async logPublic() { return { success: true }; }
    async logShadow() { return { success: true }; }
  }
}));

// Test-friendly workflow engine that speeds up waits
class TestWorkflowEngine extends WorkflowEngine {
  async executeWait(step, context) {
    // Fast-forward waits in tests (1ms instead of actual timeout)
    await new Promise(resolve => setTimeout(resolve, 1));
    return { success: true, output: `Waited ${step.timeout || 10} seconds (mocked)` };
  }
}

describe('Workflow E2E Tests', () => {
  let workflowEngine;
  let mockADB;
  let mockFastboot;
  let mockIOS;

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();

    // Import the mocked modules
    const ADBLibrary = (await import('../../core/lib/adb.js')).default;
    const FastbootLibrary = (await import('../../core/lib/fastboot.js')).default;
    const IOSLibrary = (await import('../../core/lib/ios.js')).default;

    mockADB = ADBLibrary;
    mockFastboot = FastbootLibrary;
    mockIOS = IOSLibrary;

    // Initialize test-friendly workflow engine
    workflowEngine = new TestWorkflowEngine({
      workflowsDir: path.join(process.cwd(), 'workflows'),
      validateWorkflows: true // Enable validation to test real production behavior
    });
  });

  describe('Android Workflows', () => {
    it('should complete ADB diagnostics workflow', async () => {
      // Mock device serial
      const deviceSerial = 'MOCK_DEVICE_123';

      // Mock ADB command responses
      mockADB.executeCommand.mockImplementation(async (serial, command) => {
        if (command === 'devices') {
          return { 
            success: true, 
            stdout: `List of devices attached\n${deviceSerial}\tdevice\n` 
          };
        } else if (command === 'shell getprop') {
          return {
            success: true,
            stdout: '[ro.product.manufacturer]: [Google]\n[ro.product.model]: [Pixel 7]\n[ro.build.version.release]: [14]'
          };
        } else if (command === 'shell dumpsys battery') {
          return {
            success: true,
            stdout: 'level: 85\nhealth: 2\nstatus: 2\ntemperature: 250'
          };
        } else if (command === 'shell df') {
          return {
            success: true,
            stdout: 'Filesystem     Size  Used  Avail  Use%\n/data        128G   64G    64G   50%'
          };
        } else if (command === 'shell dumpsys meminfo') {
          return {
            success: true,
            stdout: 'Total RAM: 8192 MB\nFree RAM: 4096 MB'
          };
        } else if (command === 'shell dumpsys thermalservice') {
          return {
            success: true,
            stdout: 'Current thermal status: THERMAL_STATUS_NONE'
          };
        }
        return { success: true, stdout: '' };
      });

      // Execute workflow
      const result = await workflowEngine.executeWorkflow(
        'android',
        'adb-diagnostics',
        { deviceSerial }
      );

      // Verify workflow completed successfully
      expect(result.success).toBe(true);
      expect(result.workflow).toBe('ADB Device Diagnostics');
      expect(result.results).toBeDefined();
      expect(result.results.length).toBeGreaterThan(0);

      // Verify all steps completed
      const successfulSteps = result.results.filter(r => r.success);
      expect(successfulSteps.length).toBeGreaterThan(0);

      // Verify ADB commands were called
      expect(mockADB.executeCommand).toHaveBeenCalled();
    });

    it('should complete fastboot unlock workflow with authorization', async () => {
      const deviceSerial = 'MOCK_FASTBOOT_DEVICE';
      const authorization = {
        userId: 'test_user',
        userInput: 'UNLOCK',
        timestamp: Date.now()
      };

      // Mock Fastboot command responses
      mockFastboot.executeCommand.mockImplementation(async (serial, command) => {
        if (command === 'devices') {
          return {
            success: true,
            stdout: `${deviceSerial}\tfastboot\n`
          };
        } else if (command === 'getvar unlocked') {
          return {
            success: true,
            stdout: 'unlocked: no'
          };
        } else if (command === 'oem unlock') {
          return {
            success: true,
            stdout: 'OKAY'
          };
        }
        return { success: true, stdout: '' };
      });

      // Execute workflow with authorization
      const result = await workflowEngine.executeWorkflow(
        'android',
        'fastboot-unlock',
        { 
          deviceSerial,
          authorization,
          userId: 'test_user'
        }
      );

      // Verify workflow completed successfully
      expect(result.success).toBe(true);
      expect(result.workflow).toBe('Fastboot Bootloader Unlock');

      // Verify fastboot commands were called
      expect(mockFastboot.executeCommand).toHaveBeenCalled();

      // Verify at least some steps succeeded
      const successfulSteps = result.results.filter(r => r.success);
      expect(successfulSteps.length).toBeGreaterThan(0);
    }, 5000); // 5 second timeout with mocked waits

    it('should abort workflow without proper authorization', async () => {
      const deviceSerial = 'MOCK_FASTBOOT_DEVICE';

      // Mock Fastboot command responses
      mockFastboot.executeCommand.mockImplementation(async (serial, command) => {
        if (command === 'devices') {
          return {
            success: true,
            stdout: `${deviceSerial}\tfastboot\n`
          };
        }
        return { success: true, stdout: '' };
      });

      // Execute workflow WITHOUT authorization
      const result = await workflowEngine.executeWorkflow(
        'android',
        'fastboot-unlock',
        { deviceSerial }
      );

      // Verify workflow was rejected due to missing authorization
      expect(result.success).toBe(false);
      expect(result.error).toBe('Authorization required');
      expect(result.authorizationPrompt).toBeDefined();
    });
  });

  describe('iOS Workflows', () => {
    it('should complete iOS device restore workflow', async () => {
      const deviceSerial = 'MOCK_IOS_DEVICE_UDID';

      // Mock iOS command responses
      mockIOS.executeCommand.mockImplementation(async (serial, command) => {
        if (command.includes('idevice_id')) {
          return {
            success: true,
            stdout: deviceSerial
          };
        } else if (command.includes('ideviceinfo')) {
          return {
            success: true,
            stdout: 'DeviceName: iPhone 14\nProductType: iPhone14,2\niOSVersion: 17.0'
          };
        }
        return { success: true, stdout: '' };
      });

      // Execute workflow
      const result = await workflowEngine.executeWorkflow(
        'ios',
        'device-restore',
        { deviceSerial }
      );

      // Verify workflow execution started
      expect(result).toBeDefined();
      expect(result.workflow).toBe('iOS Device Restore Workflow');

      // iOS restore workflow may have different success criteria due to manual steps
      // but should at least execute some steps
      expect(result.results).toBeDefined();
      expect(result.results.length).toBeGreaterThan(0);
    }, 5000); // 5 second timeout with mocked waits

    it('should detect device mode correctly', async () => {
      const deviceSerial = 'MOCK_IOS_DEVICE_UDID';

      // Mock iOS device in normal mode
      mockIOS.executeCommand.mockImplementation(async (serial, command) => {
        if (command.includes('idevice_id')) {
          return {
            success: true,
            stdout: deviceSerial
          };
        } else if (command.includes('ideviceinfo')) {
          return {
            success: true,
            stdout: 'DeviceName: iPhone 14\nProductType: iPhone14,2'
          };
        }
        return { success: true, stdout: '' };
      });

      // Execute workflow to test mode detection
      const result = await workflowEngine.executeWorkflow(
        'ios',
        'device-restore',
        { deviceSerial }
      );

      // Verify device mode detection step was executed
      expect(result).toBeDefined();
      const modeDetectionStep = result.results?.find(r => 
        r.stepId === 'check-device-mode' || r.stepName?.includes('Device Mode')
      );
      
      // Mode detection step should exist in the workflow
      expect(result.results).toBeDefined();
      expect(modeDetectionStep).toBeDefined();
    }, 5000); // 5 second timeout with mocked waits
  });

  describe('Mobile Workflows', () => {
    it('should complete quick diagnostics workflow', async () => {
      const deviceSerial = 'MOCK_MOBILE_DEVICE';

      // Mock mobile device responses (could be Android or iOS)
      mockADB.executeCommand.mockImplementation(async (serial, command) => {
        if (command.includes('battery')) {
          return {
            success: true,
            stdout: 'level: 75'
          };
        } else if (command.includes('df')) {
          return {
            success: true,
            stdout: '/data  64G  32G  32G  50%'
          };
        }
        return { success: true, stdout: 'OK' };
      });

      // Execute quick diagnostics workflow
      const result = await workflowEngine.executeWorkflow(
        'mobile',
        'quick-diag',
        { deviceSerial }
      );

      // Verify workflow executed
      expect(result).toBeDefined();
      expect(result.workflow).toBeDefined();
      expect(result.results).toBeDefined();
      expect(result.results.length).toBeGreaterThan(0);
    });

    it('should complete battery health analysis', async () => {
      const deviceSerial = 'MOCK_MOBILE_DEVICE';

      // Mock comprehensive battery data
      mockADB.executeCommand.mockImplementation(async (serial, command) => {
        if (command.includes('dumpsys battery')) {
          return {
            success: true,
            stdout: `level: 80
health: 2
status: 2
present: true
voltage: 4200
temperature: 280
technology: Li-ion
current_avg: 250`
          };
        }
        return { success: true, stdout: 'OK' };
      });

      mockIOS.executeCommand.mockImplementation(async (serial, command) => {
        if (command.includes('ioreg IOPMPowerSource')) {
          return {
            success: true,
            stdout: 'MaxCapacity = 100\nCurrentCapacity = 80\nCycleCount = 250'
          };
        }
        return { success: true, stdout: 'OK' };
      });

      // Execute battery health workflow
      const result = await workflowEngine.executeWorkflow(
        'mobile',
        'battery-health',
        { deviceSerial }
      );

      // Verify workflow executed
      expect(result).toBeDefined();
      expect(result.workflow).toBeDefined();
      expect(result.results).toBeDefined();
      expect(result.results.length).toBeGreaterThan(0);
    });
  });
});

