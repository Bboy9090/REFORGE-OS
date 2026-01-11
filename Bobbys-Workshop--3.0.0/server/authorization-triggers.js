import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { getManagedPlatformToolsDir } from './platform-tools.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

const COMMAND_TIMEOUT = 30000;

const IS_WINDOWS = process.platform === 'win32';

function sanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input');
  }
  return input.replace(/[^a-zA-Z0-9_\-:.]/g, '');
}

function quoteForShell(value) {
  if (value === null || value === undefined) return '""';
  const stringValue = String(value);
  // Works for both cmd.exe and POSIX shells for our usage.
  return `"${stringValue.replace(/"/g, '\\"')}"`;
}

function resolveToolPath(toolBaseName) {
  const envVar = `${toolBaseName.toUpperCase()}_PATH`;
  const explicitPath = process.env[envVar] || null;
  if (explicitPath && fs.existsSync(explicitPath)) return explicitPath;

  // Prefer app-managed Android platform-tools if present.
  if (toolBaseName === 'adb' || toolBaseName === 'fastboot') {
    const exeName = IS_WINDOWS ? `${toolBaseName}.exe` : toolBaseName;
    const candidate = path.join(getManagedPlatformToolsDir(), exeName);
    if (fs.existsSync(candidate)) return candidate;
  }

  try {
    if (IS_WINDOWS) {
      const out = execSync(`where ${toolBaseName}`, { stdio: 'pipe', timeout: 2000, encoding: 'utf8' });
      const first = out.split(/\r?\n/).map(l => l.trim()).filter(Boolean)[0];
      return first || null;
    }
    const out = execSync(`command -v ${toolBaseName}`, { stdio: 'pipe', timeout: 2000, encoding: 'utf8' });
    const resolved = out.trim();
    return resolved || null;
  } catch {
    return null;
  }
}

function commandExists(cmd) {
  return !!resolveToolPath(cmd);
}

function getToolCommand(toolBaseName) {
  return resolveToolPath(toolBaseName) || toolBaseName;
}

function getPythonCommand() {
  const python3 = resolveToolPath('python3');
  if (python3) return python3;
  const python = resolveToolPath('python');
  if (python) return python;
  return null;
}

async function executeCommand(command, timeoutMs = COMMAND_TIMEOUT) {
  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout: timeoutMs,
      encoding: 'utf8'
    });
    return {
      success: true,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0
    };
  } catch (error) {
    return {
      success: false,
      stdout: error.stdout?.trim() || '',
      stderr: error.stderr?.trim() || error.message,
      exitCode: error.code || 1,
      error: error.message
    };
  }
}

function logAuthorizationTrigger(data) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    ...data
  };
  
  const logDir = path.join(__dirname, '../.pandora_private/logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const logFile = path.join(logDir, `authorization-triggers-${timestamp.split('T')[0]}.log`);
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  
  console.log('[Authorization Trigger]', JSON.stringify(logEntry, null, 2));
}

export class AuthorizationTriggers {
  
  static async triggerADBUSBDebugging(serial) {
    const sanitizedSerial = sanitizeInput(serial);
    const authType = 'adb_usb_debugging';
    
    if (!commandExists('adb')) {
      const result = {
        success: false,
        message: 'ADB not installed on system',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'Command not found: adb',
        toolMissing: true,
        installGuide: 'https://developer.android.com/studio/command-line/adb'
      };
      logAuthorizationTrigger({ action: 'trigger_adb_usb_debugging', serial: sanitizedSerial, ...result });
      return result;
    }
    
    const adbCmd = getToolCommand('adb');
    const command = `${quoteForShell(adbCmd)} -s ${sanitizedSerial} shell getprop ro.build.version.release`;
    const execResult = await executeCommand(command);
    
    if (execResult.success) {
      const result = {
        success: true,
        message: 'ADB authorization dialog triggered on device',
        triggered: true,
        requiresUserAction: true,
        authorizationType: authType,
        commandOutput: execResult.stdout,
        stderr: execResult.stderr,
        exitCode: execResult.exitCode,
        deviceSerial: sanitizedSerial,
        androidVersion: execResult.stdout
      };
      logAuthorizationTrigger({ action: 'trigger_adb_usb_debugging', serial: sanitizedSerial, ...result });
      return result;
    } else {
      const isUnauthorized = execResult.stderr.includes('unauthorized') || 
                           execResult.stderr.includes('device unauthorized');
      
      const result = {
        success: false,
        message: isUnauthorized ? 
          'Device unauthorized - waiting for user approval' : 
          'Failed to trigger ADB authorization',
        triggered: isUnauthorized,
        requiresUserAction: isUnauthorized,
        authorizationType: authType,
        error: execResult.stderr || execResult.error,
        commandOutput: execResult.stdout,
        exitCode: execResult.exitCode,
        deviceSerial: sanitizedSerial
      };
      logAuthorizationTrigger({ action: 'trigger_adb_usb_debugging', serial: sanitizedSerial, ...result });
      return result;
    }
  }
  
  static async triggerFileTransferAuth(serial) {
    const sanitizedSerial = sanitizeInput(serial);
    const authType = 'file_transfer_permission';
    
    if (!commandExists('adb')) {
      const result = {
        success: false,
        message: 'ADB not installed on system',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'Command not found: adb',
        toolMissing: true
      };
      logAuthorizationTrigger({ action: 'trigger_file_transfer_auth', serial: sanitizedSerial, ...result });
      return result;
    }
    
    const tmpFile = path.join(os.tmpdir(), `pandora_auth_test_${sanitizedSerial}_${Date.now()}.txt`);
    try {
      fs.writeFileSync(tmpFile, 'Pandora Codex authorization test\n');
    } catch (error) {
      const result = {
        success: false,
        message: 'Failed to create test file',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: error.message
      };
      logAuthorizationTrigger({ action: 'trigger_file_transfer_auth', serial: sanitizedSerial, ...result });
      return result;
    }
    
    const adbCmd = getToolCommand('adb');
    const command = `${quoteForShell(adbCmd)} -s ${sanitizedSerial} push ${quoteForShell(tmpFile)} /sdcard/Download/pandora_auth_test.txt`;
    const execResult = await executeCommand(command);
    
    try {
      fs.unlinkSync(tmpFile);
    } catch {}
    
    if (execResult.success) {
      const cleanupCmd = `${quoteForShell(adbCmd)} -s ${sanitizedSerial} shell rm /sdcard/Download/pandora_auth_test.txt`;
      await executeCommand(cleanupCmd);
      
      const result = {
        success: true,
        message: 'File transfer authorization triggered successfully',
        triggered: true,
        requiresUserAction: true,
        authorizationType: authType,
        commandOutput: execResult.stdout,
        stderr: execResult.stderr,
        exitCode: execResult.exitCode,
        deviceSerial: sanitizedSerial
      };
      logAuthorizationTrigger({ action: 'trigger_file_transfer_auth', serial: sanitizedSerial, ...result });
      return result;
    } else {
      const result = {
        success: false,
        message: 'File transfer authorization required',
        triggered: true,
        requiresUserAction: true,
        authorizationType: authType,
        error: execResult.stderr || execResult.error,
        commandOutput: execResult.stdout,
        exitCode: execResult.exitCode,
        deviceSerial: sanitizedSerial
      };
      logAuthorizationTrigger({ action: 'trigger_file_transfer_auth', serial: sanitizedSerial, ...result });
      return result;
    }
  }
  
  static async triggerBackupAuth(serial) {
    const sanitizedSerial = sanitizeInput(serial);
    const authType = 'backup_authorization';
    
    if (!commandExists('adb')) {
      const result = {
        success: false,
        message: 'ADB not installed on system',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'Command not found: adb',
        toolMissing: true
      };
      logAuthorizationTrigger({ action: 'trigger_backup_auth', serial: sanitizedSerial, ...result });
      return result;
    }
    
    const adbCmd = getToolCommand('adb');
    const command = `${quoteForShell(adbCmd)} -s ${sanitizedSerial} backup -noapk -noshared com.android.settings`;
    const execResult = await executeCommand(command, 10000);
    
    const result = {
      success: execResult.success || execResult.stderr.includes('Now unlock'),
      message: execResult.success || execResult.stderr.includes('Now unlock') ? 
        'Backup authorization dialog triggered on device' : 
        'Failed to trigger backup authorization',
      triggered: true,
      requiresUserAction: true,
      authorizationType: authType,
      commandOutput: execResult.stdout,
      stderr: execResult.stderr,
      exitCode: execResult.exitCode,
      deviceSerial: sanitizedSerial,
      note: 'Backup authorization may require device screen to be unlocked'
    };
    
    logAuthorizationTrigger({ action: 'trigger_backup_auth', serial: sanitizedSerial, ...result });
    return result;
  }
  
  static async triggerScreenCaptureAuth(serial) {
    const sanitizedSerial = sanitizeInput(serial);
    const authType = 'screen_capture_permission';
    
    if (!commandExists('adb')) {
      const result = {
        success: false,
        message: 'ADB not installed on system',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'Command not found: adb',
        toolMissing: true
      };
      logAuthorizationTrigger({ action: 'trigger_screen_capture_auth', serial: sanitizedSerial, ...result });
      return result;
    }
    
    const adbCmd = getToolCommand('adb');
    const command = `${quoteForShell(adbCmd)} -s ${sanitizedSerial} shell screencap -p /sdcard/pandora_screen_test.png`;
    const execResult = await executeCommand(command);
    
    if (execResult.success) {
      const cleanupCmd = `${quoteForShell(adbCmd)} -s ${sanitizedSerial} shell rm /sdcard/pandora_screen_test.png`;
      await executeCommand(cleanupCmd);
      
      const result = {
        success: true,
        message: 'Screen capture permission verified',
        triggered: true,
        requiresUserAction: false,
        authorizationType: authType,
        commandOutput: execResult.stdout,
        stderr: execResult.stderr,
        exitCode: execResult.exitCode,
        deviceSerial: sanitizedSerial,
        note: 'May trigger screen recording permission on Android 10+'
      };
      logAuthorizationTrigger({ action: 'trigger_screen_capture_auth', serial: sanitizedSerial, ...result });
      return result;
    } else {
      const result = {
        success: false,
        message: 'Screen capture permission required',
        triggered: true,
        requiresUserAction: true,
        authorizationType: authType,
        error: execResult.stderr || execResult.error,
        commandOutput: execResult.stdout,
        exitCode: execResult.exitCode,
        deviceSerial: sanitizedSerial
      };
      logAuthorizationTrigger({ action: 'trigger_screen_capture_auth', serial: sanitizedSerial, ...result });
      return result;
    }
  }
  
  static async triggerIOSTrustComputer(udid) {
    const sanitizedUdid = sanitizeInput(udid);
    const authType = 'ios_trust_computer';
    
    if (!commandExists('ideviceinfo')) {
      const result = {
        success: false,
        message: 'libimobiledevice not installed on system',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'Command not found: ideviceinfo',
        toolMissing: true,
        installGuide: 'Install libimobiledevice: brew install libimobiledevice'
      };
      logAuthorizationTrigger({ action: 'trigger_ios_trust_computer', udid: sanitizedUdid, ...result });
      return result;
    }
    
    const command = `ideviceinfo -u ${sanitizedUdid}`;
    const execResult = await executeCommand(command);
    
    if (execResult.success) {
      const result = {
        success: true,
        message: 'iOS device trusted and connected',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        commandOutput: execResult.stdout,
        stderr: execResult.stderr,
        exitCode: execResult.exitCode,
        deviceUdid: sanitizedUdid,
        note: 'Device already trusted'
      };
      logAuthorizationTrigger({ action: 'trigger_ios_trust_computer', udid: sanitizedUdid, ...result });
      return result;
    } else {
      const isNotTrusted = execResult.stderr.includes('lockdownd') || 
                          execResult.stderr.includes('not trusted') ||
                          execResult.stderr.includes('pair');
      
      const result = {
        success: false,
        message: isNotTrusted ? 
          'iOS trust computer dialog triggered on device' : 
          'Failed to connect to iOS device',
        triggered: isNotTrusted,
        requiresUserAction: isNotTrusted,
        authorizationType: authType,
        error: execResult.stderr || execResult.error,
        commandOutput: execResult.stdout,
        exitCode: execResult.exitCode,
        deviceUdid: sanitizedUdid,
        note: isNotTrusted ? 'User must tap "Trust" and enter device passcode' : undefined
      };
      logAuthorizationTrigger({ action: 'trigger_ios_trust_computer', udid: sanitizedUdid, ...result });
      return result;
    }
  }
  
  static async triggerIOSPairing(udid) {
    const sanitizedUdid = sanitizeInput(udid);
    const authType = 'ios_pairing';
    
    if (!commandExists('idevicepair')) {
      const result = {
        success: false,
        message: 'libimobiledevice not installed on system',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'Command not found: idevicepair',
        toolMissing: true
      };
      logAuthorizationTrigger({ action: 'trigger_ios_pairing', udid: sanitizedUdid, ...result });
      return result;
    }
    
    const command = `idevicepair -u ${sanitizedUdid} pair`;
    const execResult = await executeCommand(command);
    
    const isPaired = execResult.success || execResult.stdout.includes('SUCCESS');
    
    const result = {
      success: isPaired,
      message: isPaired ? 
        `SUCCESS: Paired with device ${sanitizedUdid}` : 
        'Pairing failed - user action required',
      triggered: true,
      requiresUserAction: !isPaired,
      authorizationType: authType,
      commandOutput: execResult.stdout,
      stderr: execResult.stderr,
      exitCode: execResult.exitCode,
      deviceUdid: sanitizedUdid,
      note: 'User must enter device passcode to complete pairing'
    };
    
    logAuthorizationTrigger({ action: 'trigger_ios_pairing', udid: sanitizedUdid, ...result });
    return result;
  }
  
  static async triggerIOSBackupEncryption(udid) {
    const sanitizedUdid = sanitizeInput(udid);
    const authType = 'ios_backup_encryption';
    
    if (!commandExists('idevicebackup2')) {
      const result = {
        success: false,
        message: 'libimobiledevice not installed on system',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'Command not found: idevicebackup2',
        toolMissing: true
      };
      logAuthorizationTrigger({ action: 'trigger_ios_backup_encryption', udid: sanitizedUdid, ...result });
      return result;
    }
    
    const idevicebackup2Cmd = getToolCommand('idevicebackup2');
    const command = `${quoteForShell(idevicebackup2Cmd)} -u ${sanitizedUdid} info`;
    const execResult = await executeCommand(command, 15000);
    
    const result = {
      success: execResult.success,
      message: execResult.success ? 
        'Backup encryption authorization queried' : 
        'Backup authorization required',
      triggered: true,
      requiresUserAction: !execResult.success,
      authorizationType: authType,
      commandOutput: execResult.stdout,
      stderr: execResult.stderr,
      exitCode: execResult.exitCode,
      deviceUdid: sanitizedUdid,
      note: 'May prompt for backup encryption password setup'
    };
    
    logAuthorizationTrigger({ action: 'trigger_ios_backup_encryption', udid: sanitizedUdid, ...result });
    return result;
  }
  
  static async triggerDFURecoveryMode(udid) {
    const sanitizedUdid = sanitizeInput(udid);
    const authType = 'dfu_recovery_mode';
    
    if (!commandExists('ideviceenterrecovery')) {
      const result = {
        success: false,
        message: 'libimobiledevice not installed on system',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'Command not found: ideviceenterrecovery',
        toolMissing: true
      };
      logAuthorizationTrigger({ action: 'trigger_dfu_recovery_mode', udid: sanitizedUdid, ...result });
      return result;
    }
    
    const command = `ideviceenterrecovery ${sanitizedUdid}`;
    const execResult = await executeCommand(command);
    
    const result = {
      success: execResult.success,
      message: execResult.success ? 
        'Device entering recovery mode' : 
        'Failed to enter recovery mode',
      triggered: execResult.success,
      requiresUserAction: execResult.success,
      authorizationType: authType,
      commandOutput: execResult.stdout,
      stderr: execResult.stderr,
      exitCode: execResult.exitCode,
      deviceUdid: sanitizedUdid,
      warning: 'Device will display recovery mode screen',
      note: 'User must manually exit recovery mode or restore device'
    };
    
    logAuthorizationTrigger({ action: 'trigger_dfu_recovery_mode', udid: sanitizedUdid, ...result });
    return result;
  }
  
  static async verifyFastbootUnlock(serial) {
    const sanitizedSerial = sanitizeInput(serial);
    const authType = 'fastboot_unlock_verification';
    
    if (!commandExists('fastboot')) {
      const result = {
        success: false,
        message: 'Fastboot not installed on system',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'Command not found: fastboot',
        toolMissing: true
      };
      logAuthorizationTrigger({ action: 'verify_fastboot_unlock', serial: sanitizedSerial, ...result });
      return result;
    }
    
    const fastbootCmd = getToolCommand('fastboot');
    const command = `${quoteForShell(fastbootCmd)} -s ${sanitizedSerial} getvar unlocked 2>&1`;
    const execResult = await executeCommand(command);
    
    const output = execResult.stdout + '\n' + execResult.stderr;
    const isUnlocked = output.includes('unlocked: yes');
    
    const result = {
      success: true,
      message: isUnlocked ? 'Bootloader is unlocked' : 'Bootloader is locked',
      triggered: true,
      requiresUserAction: false,
      authorizationType: authType,
      unlocked: isUnlocked,
      commandOutput: output,
      exitCode: execResult.exitCode,
      deviceSerial: sanitizedSerial
    };
    
    logAuthorizationTrigger({ action: 'verify_fastboot_unlock', serial: sanitizedSerial, ...result });
    return result;
  }
  
  static async triggerFastbootOEMUnlock(serial) {
    const sanitizedSerial = sanitizeInput(serial);
    const authType = 'fastboot_oem_unlock';
    
    if (!commandExists('fastboot')) {
      const result = {
        success: false,
        message: 'Fastboot not installed on system',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'Command not found: fastboot',
        toolMissing: true
      };
      logAuthorizationTrigger({ action: 'trigger_fastboot_oem_unlock', serial: sanitizedSerial, ...result });
      return result;
    }
    
    const fastbootCmd = getToolCommand('fastboot');
    const result = {
      success: false,
      message: 'DESTRUCTIVE OPERATION - Manual confirmation required',
      triggered: false,
      requiresUserAction: true,
      authorizationType: authType,
      deviceSerial: sanitizedSerial,
      warning: 'This will ERASE ALL DATA on the device',
      manualCommand: `${fastbootCmd} -s ${sanitizedSerial} oem unlock`,
      alternativeCommand: `${fastbootCmd} -s ${sanitizedSerial} flashing unlock`,
      note: 'This endpoint returns the command for manual execution only. User must type UNLOCK to confirm.'
    };
    
    logAuthorizationTrigger({ action: 'trigger_fastboot_oem_unlock', serial: sanitizedSerial, ...result });
    return result;
  }
  
  static async triggerSamsungDownloadMode(serial) {
    const sanitizedSerial = sanitizeInput(serial);
    const authType = 'samsung_download_mode';
    
    if (!commandExists('heimdall')) {
      const result = {
        success: false,
        message: 'Heimdall not installed on system',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'Command not found: heimdall',
        toolMissing: true,
        installGuide: 'Install Heimdall: https://github.com/Benjamin-Dobell/Heimdall'
      };
      logAuthorizationTrigger({ action: 'trigger_samsung_download_mode', serial: sanitizedSerial, ...result });
      return result;
    }
    
    const detectCmd = `heimdall detect`;
    const detectResult = await executeCommand(detectCmd);
    
    if (!detectResult.success || !detectResult.stdout.includes('Device detected')) {
      const result = {
        success: false,
        message: 'No Samsung device detected in Download Mode',
        triggered: false,
        requiresUserAction: true,
        authorizationType: authType,
        error: 'Device not in Download Mode',
        commandOutput: detectResult.stdout,
        stderr: detectResult.stderr,
        note: 'User must manually enter Download Mode: Power off, then hold Vol Down + Power'
      };
      logAuthorizationTrigger({ action: 'trigger_samsung_download_mode', serial: sanitizedSerial, ...result });
      return result;
    }
    
    const pitCmd = `heimdall print-pit --no-reboot --verbose`;
    const pitResult = await executeCommand(pitCmd);
    
    const result = {
      success: pitResult.success,
      message: 'Samsung device detected in Download Mode',
      triggered: true,
      requiresUserAction: false,
      authorizationType: authType,
      deviceInfo: {
        detected: true,
        mode: 'Download Mode (Odin)',
        commandOutput: pitResult.stdout.substring(0, 500)
      },
      commandOutput: pitResult.stdout,
      stderr: pitResult.stderr,
      exitCode: pitResult.exitCode,
      deviceSerial: sanitizedSerial
    };
    
    logAuthorizationTrigger({ action: 'trigger_samsung_download_mode', serial: sanitizedSerial, ...result });
    return result;
  }
  
  static async verifyQualcommEDL(serial) {
    const sanitizedSerial = sanitizeInput(serial);
    const authType = 'qualcomm_edl_mode';

    const pythonCmd = getPythonCommand();
    if (!pythonCmd) {
      const result = {
        success: false,
        message: 'Python3 not installed on system',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'Command not found: python3 (or python)',
        toolMissing: true
      };
      logAuthorizationTrigger({ action: 'verify_qualcomm_edl', serial: sanitizedSerial, ...result });
      return result;
    }
    
    const edlToolPath = path.join(__dirname, '../libs/edl/edl.py');
    if (!fs.existsSync(edlToolPath)) {
      const result = {
        success: false,
        message: 'EDL tools not found',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'EDL toolkit not installed',
        toolMissing: true,
        note: 'EDL tools must be installed in libs/edl/'
      };
      logAuthorizationTrigger({ action: 'verify_qualcomm_edl', serial: sanitizedSerial, ...result });
      return result;
    }
    
    const command = `${quoteForShell(pythonCmd)} ${quoteForShell(edlToolPath)} --help 2>&1`;
    const execResult = await executeCommand(command);
    
    const result = {
      success: execResult.success,
      message: execResult.success ? 
        'EDL tools available - device probe ready' : 
        'EDL tools verification failed',
      triggered: true,
      requiresUserAction: false,
      authorizationType: authType,
      note: 'Use python (or python3) edl.py printgpt to detect EDL device',
      commandOutput: execResult.stdout.substring(0, 300),
      stderr: execResult.stderr,
      exitCode: execResult.exitCode,
      deviceSerial: sanitizedSerial
    };
    
    logAuthorizationTrigger({ action: 'verify_qualcomm_edl', serial: sanitizedSerial, ...result });
    return result;
  }
  
  static async verifyMediatekFlash(serial) {
    const sanitizedSerial = sanitizeInput(serial);
    const authType = 'mediatek_sp_flash';

    const pythonCmd = getPythonCommand();
    if (!pythonCmd) {
      const result = {
        success: false,
        message: 'Python3 not installed on system',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'Command not found: python3 (or python)',
        toolMissing: true
      };
      logAuthorizationTrigger({ action: 'verify_mediatek_flash', serial: sanitizedSerial, ...result });
      return result;
    }
    
    const mtkClientPath = path.join(__dirname, '../libs/mtkclient');
    if (!fs.existsSync(mtkClientPath)) {
      const result = {
        success: false,
        message: 'MTKClient not found',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'MTKClient toolkit not installed',
        toolMissing: true,
        note: 'MTKClient must be installed in libs/mtkclient/'
      };
      logAuthorizationTrigger({ action: 'verify_mediatek_flash', serial: sanitizedSerial, ...result });
      return result;
    }
    
    const result = {
      success: true,
      message: 'MTKClient tools available - device probe ready',
      triggered: true,
      requiresUserAction: false,
      authorizationType: authType,
      note: 'Use python (or python3) mtk_cli.py printgpt to detect MediaTek device',
      deviceSerial: sanitizedSerial,
      toolPath: mtkClientPath
    };
    
    logAuthorizationTrigger({ action: 'verify_mediatek_flash', serial: sanitizedSerial, ...result });
    return result;
  }
  
  static async triggerADBInstallAuth(serial, apkPath) {
    const sanitizedSerial = sanitizeInput(serial);
    const authType = 'adb_install_permission';
    
    if (!commandExists('adb')) {
      const result = {
        success: false,
        message: 'ADB not installed on system',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'Command not found: adb',
        toolMissing: true
      };
      logAuthorizationTrigger({ action: 'trigger_adb_install_auth', serial: sanitizedSerial, ...result });
      return result;
    }
    
    const adbCmd = getToolCommand('adb');
    const result = {
      success: false,
      message: 'Install authorization test not implemented',
      triggered: false,
      requiresUserAction: true,
      authorizationType: authType,
      deviceSerial: sanitizedSerial,
      note: 'Requires actual APK file to trigger installation prompt',
      manualCommand: `${adbCmd} -s ${sanitizedSerial} install <path_to_apk>`
    };
    
    logAuthorizationTrigger({ action: 'trigger_adb_install_auth', serial: sanitizedSerial, ...result });
    return result;
  }
  
  static async rebootToRecovery(serial) {
    const sanitizedSerial = sanitizeInput(serial);
    const authType = 'reboot_recovery';
    
    if (!commandExists('adb')) {
      const result = {
        success: false,
        message: 'ADB not installed on system',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'Command not found: adb',
        toolMissing: true
      };
      logAuthorizationTrigger({ action: 'reboot_to_recovery', serial: sanitizedSerial, ...result });
      return result;
    }
    
    const adbCmd = getToolCommand('adb');
    const command = `${quoteForShell(adbCmd)} -s ${sanitizedSerial} reboot recovery`;
    const execResult = await executeCommand(command);
    
    const result = {
      success: execResult.success,
      message: execResult.success ? 
        'Device rebooting to recovery mode' : 
        'Failed to reboot device',
      triggered: execResult.success,
      requiresUserAction: false,
      authorizationType: authType,
      commandOutput: execResult.stdout,
      stderr: execResult.stderr,
      exitCode: execResult.exitCode,
      deviceSerial: sanitizedSerial,
      warning: 'Device will display recovery menu'
    };
    
    logAuthorizationTrigger({ action: 'reboot_to_recovery', serial: sanitizedSerial, ...result });
    return result;
  }
  
  static async rebootToBootloader(serial) {
    const sanitizedSerial = sanitizeInput(serial);
    const authType = 'reboot_bootloader';
    
    if (!commandExists('adb')) {
      const result = {
        success: false,
        message: 'ADB not installed on system',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'Command not found: adb',
        toolMissing: true
      };
      logAuthorizationTrigger({ action: 'reboot_to_bootloader', serial: sanitizedSerial, ...result });
      return result;
    }
    
    const adbCmd = getToolCommand('adb');
    const command = `${quoteForShell(adbCmd)} -s ${sanitizedSerial} reboot bootloader`;
    const execResult = await executeCommand(command);
    
    const result = {
      success: execResult.success,
      message: execResult.success ? 
        'Device rebooting to fastboot mode' : 
        'Failed to reboot device',
      triggered: execResult.success,
      requiresUserAction: false,
      authorizationType: authType,
      commandOutput: execResult.stdout,
      stderr: execResult.stderr,
      exitCode: execResult.exitCode,
      deviceSerial: sanitizedSerial,
      note: 'Device will enter fastboot mode'
    };
    
    logAuthorizationTrigger({ action: 'reboot_to_bootloader', serial: sanitizedSerial, ...result });
    return result;
  }
  
  static async rebootToEDL(serial) {
    const sanitizedSerial = sanitizeInput(serial);
    const authType = 'reboot_edl';
    
    if (!commandExists('adb')) {
      const result = {
        success: false,
        message: 'ADB not installed on system',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'Command not found: adb',
        toolMissing: true
      };
      logAuthorizationTrigger({ action: 'reboot_to_edl', serial: sanitizedSerial, ...result });
      return result;
    }
    
    const adbCmd = getToolCommand('adb');
    const command = `${quoteForShell(adbCmd)} -s ${sanitizedSerial} reboot edl`;
    const execResult = await executeCommand(command);
    
    const result = {
      success: execResult.success,
      message: execResult.success ? 
        'Device rebooting to EDL mode' : 
        'Failed to reboot to EDL mode',
      triggered: execResult.success,
      requiresUserAction: false,
      authorizationType: authType,
      commandOutput: execResult.stdout,
      stderr: execResult.stderr,
      exitCode: execResult.exitCode,
      deviceSerial: sanitizedSerial,
      warning: 'Device will enter Emergency Download Mode (Qualcomm only)',
      note: 'Screen will appear black - device is in EDL mode'
    };
    
    logAuthorizationTrigger({ action: 'reboot_to_edl', serial: sanitizedSerial, ...result });
    return result;
  }
  
  static async triggerWiFiADBAuth(serial) {
    const sanitizedSerial = sanitizeInput(serial);
    const authType = 'wifi_adb_debugging';
    
    if (!commandExists('adb')) {
      const result = {
        success: false,
        message: 'ADB not installed on system',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'Command not found: adb',
        toolMissing: true
      };
      logAuthorizationTrigger({ action: 'trigger_wifi_adb_auth', serial: sanitizedSerial, ...result });
      return result;
    }
    
    const adbCmd = getToolCommand('adb');
    const command = `${quoteForShell(adbCmd)} -s ${sanitizedSerial} tcpip 5555`;
    const execResult = await executeCommand(command);
    
    const result = {
      success: execResult.success,
      message: execResult.success ? 
        'WiFi ADB enabled on port 5555' : 
        'Failed to enable WiFi ADB',
      triggered: execResult.success,
      requiresUserAction: execResult.success,
      authorizationType: authType,
      commandOutput: execResult.stdout,
      stderr: execResult.stderr,
      exitCode: execResult.exitCode,
      deviceSerial: sanitizedSerial,
      note: 'Connect with: adb connect <device_ip>:5555'
    };
    
    logAuthorizationTrigger({ action: 'trigger_wifi_adb_auth', serial: sanitizedSerial, ...result });
    return result;
  }
  
  static async verifyDeveloperOptions(serial) {
    const sanitizedSerial = sanitizeInput(serial);
    const authType = 'developer_options_check';
    
    if (!commandExists('adb')) {
      const result = {
        success: false,
        message: 'ADB not installed on system',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'Command not found: adb',
        toolMissing: true
      };
      logAuthorizationTrigger({ action: 'verify_developer_options', serial: sanitizedSerial, ...result });
      return result;
    }
    
    const adbCmd = getToolCommand('adb');
    const command = `${quoteForShell(adbCmd)} -s ${sanitizedSerial} shell settings get global development_settings_enabled`;
    const execResult = await executeCommand(command);
    
    const isEnabled = execResult.stdout.trim() === '1';
    
    const result = {
      success: true,
      message: isEnabled ? 
        'Developer options are enabled' : 
        'Developer options are disabled',
      triggered: true,
      requiresUserAction: false,
      authorizationType: authType,
      developerOptionsEnabled: isEnabled,
      commandOutput: execResult.stdout,
      stderr: execResult.stderr,
      exitCode: execResult.exitCode,
      deviceSerial: sanitizedSerial,
      note: isEnabled ? undefined : 'User must enable Developer Options in Settings'
    };
    
    logAuthorizationTrigger({ action: 'verify_developer_options', serial: sanitizedSerial, ...result });
    return result;
  }
  
  static async checkUSBDebuggingStatus(serial) {
    const sanitizedSerial = sanitizeInput(serial);
    const authType = 'usb_debugging_status';
    
    if (!commandExists('adb')) {
      const result = {
        success: false,
        message: 'ADB not installed on system',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'Command not found: adb',
        toolMissing: true
      };
      logAuthorizationTrigger({ action: 'check_usb_debugging_status', serial: sanitizedSerial, ...result });
      return result;
    }
    
    const adbCmd = getToolCommand('adb');
    const command = `${quoteForShell(adbCmd)} devices -l`;
    const execResult = await executeCommand(command);
    
    const deviceLine = execResult.stdout.split('\n').find(line => line.includes(sanitizedSerial));
    let status = 'unknown';
    let authorized = false;
    
    if (deviceLine) {
      if (deviceLine.includes('unauthorized')) {
        status = 'unauthorized';
        authorized = false;
      } else if (deviceLine.includes('device')) {
        status = 'authorized';
        authorized = true;
      } else if (deviceLine.includes('offline')) {
        status = 'offline';
        authorized = false;
      }
    } else {
      status = 'not_found';
    }
    
    const result = {
      success: true,
      message: `Device status: ${status}`,
      triggered: true,
      requiresUserAction: !authorized,
      authorizationType: authType,
      authorized: authorized,
      status: status,
      commandOutput: execResult.stdout,
      stderr: execResult.stderr,
      exitCode: execResult.exitCode,
      deviceSerial: sanitizedSerial
    };
    
    logAuthorizationTrigger({ action: 'check_usb_debugging_status', serial: sanitizedSerial, ...result });
    return result;
  }
  
  static async triggerIOSAppInstallAuth(udid) {
    const sanitizedUdid = sanitizeInput(udid);
    const authType = 'ios_app_install_trust';
    
    if (!commandExists('ideviceinstaller')) {
      const result = {
        success: false,
        message: 'ideviceinstaller not installed on system',
        triggered: false,
        requiresUserAction: false,
        authorizationType: authType,
        error: 'Command not found: ideviceinstaller',
        toolMissing: true,
        installGuide: 'Install: brew install ideviceinstaller'
      };
      logAuthorizationTrigger({ action: 'trigger_ios_app_install_auth', udid: sanitizedUdid, ...result });
      return result;
    }
    
    const result = {
      success: false,
      message: 'App installation requires IPA file',
      triggered: false,
      requiresUserAction: true,
      authorizationType: authType,
      deviceUdid: sanitizedUdid,
      note: 'Requires actual IPA file to trigger installation prompt',
      manualCommand: `ideviceinstaller -u ${sanitizedUdid} -i <path_to_ipa>`
    };
    
    logAuthorizationTrigger({ action: 'trigger_ios_app_install_auth', udid: sanitizedUdid, ...result });
    return result;
  }
  
  static async triggerIOSDeveloperTrust(udid) {
    const sanitizedUdid = sanitizeInput(udid);
    const authType = 'ios_developer_trust';
    
    const result = {
      success: false,
      message: 'Developer trust must be configured manually',
      triggered: false,
      requiresUserAction: true,
      authorizationType: authType,
      deviceUdid: sanitizedUdid,
      note: 'User must: Settings > General > Device Management > Trust Developer',
      manualSteps: [
        '1. Open Settings app',
        '2. Go to General',
        '3. Tap Device Management (or Profiles)',
        '4. Select the developer profile',
        '5. Tap Trust'
      ]
    };
    
    logAuthorizationTrigger({ action: 'trigger_ios_developer_trust', udid: sanitizedUdid, ...result });
    return result;
  }
  
  static async getAllAvailableTriggers(platform = 'all') {
    const triggers = {
      android: [
        { id: 'adb_usb_debugging', name: 'ADB USB Debugging Authorization', method: 'triggerADBUSBDebugging' },
        { id: 'file_transfer', name: 'File Transfer Permission', method: 'triggerFileTransferAuth' },
        { id: 'backup_auth', name: 'Backup Authorization', method: 'triggerBackupAuth' },
        { id: 'screen_capture', name: 'Screen Capture Permission', method: 'triggerScreenCaptureAuth' },
        { id: 'install_auth', name: 'Install from Computer', method: 'triggerADBInstallAuth' },
        { id: 'wifi_adb', name: 'WiFi ADB Debugging', method: 'triggerWiFiADBAuth' },
        { id: 'developer_options', name: 'Developer Options Check', method: 'verifyDeveloperOptions' },
        { id: 'usb_debugging_status', name: 'USB Debugging Status', method: 'checkUSBDebuggingStatus' },
        { id: 'reboot_recovery', name: 'Reboot to Recovery', method: 'rebootToRecovery' },
        { id: 'reboot_bootloader', name: 'Reboot to Bootloader', method: 'rebootToBootloader' },
        { id: 'reboot_edl', name: 'Reboot to EDL', method: 'rebootToEDL' }
      ],
      ios: [
        { id: 'ios_trust', name: 'Trust This Computer', method: 'triggerIOSTrustComputer' },
        { id: 'ios_pairing', name: 'Device Pairing', method: 'triggerIOSPairing' },
        { id: 'ios_backup', name: 'Backup Encryption', method: 'triggerIOSBackupEncryption' },
        { id: 'ios_dfu', name: 'DFU/Recovery Mode', method: 'triggerDFURecoveryMode' },
        { id: 'ios_app_install', name: 'App Installation Trust', method: 'triggerIOSAppInstallAuth' },
        { id: 'ios_developer', name: 'Developer Trust', method: 'triggerIOSDeveloperTrust' }
      ],
      fastboot: [
        { id: 'fastboot_unlock', name: 'Verify Bootloader Unlock', method: 'verifyFastbootUnlock' },
        { id: 'fastboot_oem_unlock', name: 'OEM Unlock (DESTRUCTIVE)', method: 'triggerFastbootOEMUnlock' }
      ],
      samsung: [
        { id: 'samsung_download', name: 'Download Mode Detection', method: 'triggerSamsungDownloadMode' }
      ],
      qualcomm: [
        { id: 'qualcomm_edl', name: 'EDL Mode Verification', method: 'verifyQualcommEDL' }
      ],
      mediatek: [
        { id: 'mediatek_flash', name: 'SP Flash Tool Verification', method: 'verifyMediatekFlash' }
      ]
    };
    
    if (platform === 'all') {
      return {
        success: true,
        triggers: triggers,
        totalCount: Object.values(triggers).reduce((sum, arr) => sum + arr.length, 0)
      };
    }
    
    return {
      success: true,
      triggers: triggers[platform] || [],
      platform: platform
    };
  }
  
  static async triggerAllAvailableAuthorizations(deviceId, platform) {
    const sanitizedId = sanitizeInput(deviceId);
    const results = [];
    
    const platformTriggers = await this.getAllAvailableTriggers(platform);
    
    if (!platformTriggers.success || !platformTriggers.triggers || platformTriggers.triggers.length === 0) {
      return {
        success: false,
        message: `No triggers available for platform: ${platform}`,
        results: []
      };
    }
    
    for (const trigger of platformTriggers.triggers) {
      try {
        const result = await this[trigger.method](sanitizedId);
        results.push({
          triggerId: trigger.id,
          triggerName: trigger.name,
          ...result
        });
      } catch (error) {
        results.push({
          triggerId: trigger.id,
          triggerName: trigger.name,
          success: false,
          error: error.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    
    return {
      success: true,
      message: `Executed ${results.length} triggers for ${platform} platform`,
      deviceId: sanitizedId,
      platform: platform,
      totalTriggers: results.length,
      successfulTriggers: successCount,
      failedTriggers: results.length - successCount,
      results: results
    };
  }
}
