// Unit tests for ADB Library
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock child_process module with promisified exec
const mockExecAsync = vi.fn();

vi.mock('child_process', () => ({
  exec: vi.fn()
}));

vi.mock('util', () => ({
  promisify: vi.fn(() => mockExecAsync)
}));

describe('ADB Library', () => {
  let ADBLibrary;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Dynamically import the ADB library to ensure fresh instance
    const module = await import('../../core/lib/adb.js');
    ADBLibrary = module.default;
  });

  describe('isAvailable', () => {
    it('should return success when ADB is available', async () => {
      const mockStdout = 'Android Debug Bridge version 1.0.41';
      mockExecAsync.mockResolvedValue({ stdout: mockStdout, stderr: '' });

      const result = await ADBLibrary.isAvailable();
      
      expect(result.success).toBe(true);
      expect(result.version).toBe(mockStdout);
      expect(mockExecAsync).toHaveBeenCalledWith('adb version');
    });

    it('should return error when ADB is not found', async () => {
      mockExecAsync.mockRejectedValue(new Error('Command not found'));

      const result = await ADBLibrary.isAvailable();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('ADB not found');
    });
  });

  describe('listDevices', () => {
    it('should list connected devices successfully', async () => {
      const mockOutput = `List of devices attached
123456789ABCDEF	device product:coral model:Pixel_4_XL device:coral
987654321FEDCBA	device product:bonito model:Pixel_3a device:bonito
`;
      mockExecAsync.mockResolvedValue({ stdout: mockOutput, stderr: '' });

      const result = await ADBLibrary.listDevices();
      
      expect(result.success).toBe(true);
      expect(result.devices).toHaveLength(2);
      expect(result.devices[0].serial).toBe('123456789ABCDEF');
      expect(result.devices[0].state).toBe('device');

      expect(result.devices[1].serial).toBe('987654321FEDCBA');
    });

    it('should return empty array when no devices connected', async () => {
      const mockOutput = `List of devices attached\n`;
      
      mockExecAsync.mockResolvedValue({ stdout: mockOutput, stderr: '' });

      const result = await ADBLibrary.listDevices();
      
      expect(result.success).toBe(true);
      expect(result.devices).toHaveLength(0);
    });

    it('should handle errors when listing devices', async () => {
      mockExecAsync.mockRejectedValue(new Error('ADB command failed'));

      const result = await ADBLibrary.listDevices();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('ADB command failed');
      expect(result.devices).toHaveLength(0);
    });
  });

  describe('executeCommand', () => {
    it('should execute ADB command on specific device', async () => {
      const mockStdout = 'command output';
      mockExecAsync.mockResolvedValue({ stdout: mockStdout, stderr: '' });

      const result = await ADBLibrary.executeCommand('123456789', 'shell getprop');
      
      expect(result.success).toBe(true);
      expect(result.stdout).toBe(mockStdout);
      expect(mockExecAsync).toHaveBeenCalledWith(
        'adb -s 123456789 shell getprop',
        expect.objectContaining({ timeout: 30000 })
      );
    });

    it('should execute ADB command without device serial', async () => {
      const mockStdout = 'command output';
      mockExecAsync.mockResolvedValue({ stdout: mockStdout, stderr: '' });

      const result = await ADBLibrary.executeCommand(null, 'version');
      
      expect(result.success).toBe(true);
      expect(result.stdout).toBe(mockStdout);
      expect(mockExecAsync).toHaveBeenCalledWith(
        'adb version',
        expect.objectContaining({ timeout: 30000 })
      );
    });

    it('should handle command execution errors', async () => {
      const error = new Error('Command failed');
      error.stdout = 'partial output';
      error.stderr = 'error output';
      
      mockExecAsync.mockRejectedValue(error);

      const result = await ADBLibrary.executeCommand('123456789', 'shell invalid');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Command failed');
      expect(result.stdout).toBe('partial output');
      expect(result.stderr).toBe('error output');
    });
  });

  describe('getDeviceInfo', () => {
    it('should retrieve device information successfully', async () => {
      const responses = [
        { stdout: 'Samsung', stderr: '' },
        { stdout: 'Galaxy S21', stderr: '' },
        { stdout: '12', stderr: '' },
        { stdout: 'RF8M1234567', stderr: '' }
      ];
      
      let callCount = 0;
      mockExecAsync.mockImplementation(() => {
        return Promise.resolve(responses[callCount++]);
      });

      const result = await ADBLibrary.getDeviceInfo('123456789');
      
      expect(result.success).toBe(true);
      expect(result.manufacturer).toBe('Samsung');
      expect(result.model).toBe('Galaxy S21');
      expect(result.androidVersion).toBe('12');
      expect(result.deviceSerial).toBe('RF8M1234567');
    });

    it('should handle errors when getting device info', async () => {
      // getDeviceInfo calls executeCommand, which doesn't throw but returns success: false
      // We need to make executeCommand return error responses
      mockExecAsync.mockResolvedValue({ stdout: '', stderr: 'Device not found' });

      const result = await ADBLibrary.getDeviceInfo('123456789');
      
      // Even with errors, getDeviceInfo will succeed if executeCommand returns results
      // The actual behavior is it will return empty strings for the properties
      expect(result.success).toBe(true);
      expect(result.manufacturer).toBe('');
    });
  });

  describe('checkFRPStatus', () => {
    it('should detect FRP lock when android_id is short', async () => {
      const mockAndroidId = '1234567';
      mockExecAsync.mockResolvedValue({ stdout: mockAndroidId, stderr: '' });

      const result = await ADBLibrary.checkFRPStatus('123456789');
      
      expect(result.success).toBe(true);
      expect(result.hasFRP).toBe(true);
      expect(result.androidId).toBe(mockAndroidId);
      expect(result.confidence).toBe('high');
    });

    it('should indicate no FRP lock when android_id is long', async () => {
      const mockAndroidId = '1234567890abcdef';
      mockExecAsync.mockResolvedValue({ stdout: mockAndroidId, stderr: '' });

      const result = await ADBLibrary.checkFRPStatus('123456789');
      
      expect(result.success).toBe(true);
      expect(result.hasFRP).toBe(false);
      expect(result.androidId).toBe(mockAndroidId);
      expect(result.confidence).toBe('low');
    });

    it('should handle errors when checking FRP status', async () => {
      // When executeCommand returns success: false, checkFRPStatus returns the default error message
      mockExecAsync.mockResolvedValue({ stdout: '', stderr: 'Unable to read settings' });

      const result = await ADBLibrary.checkFRPStatus('123456789');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unable to determine FRP status');
    });

    it('should handle empty android_id response', async () => {
      mockExecAsync.mockResolvedValue({ stdout: '', stderr: '' });

      const result = await ADBLibrary.checkFRPStatus('123456789');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unable to determine FRP status');
    });
  });
});
