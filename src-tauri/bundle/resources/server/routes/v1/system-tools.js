/**
 * GET /api/v1/system-tools
 * 
 * System tools detection endpoint (migrated to v1 with envelope)
 */

import { execSync } from 'child_process';

function safeExec(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8", timeout: 5000 }).trim();
  } catch {
    return null;
  }
}

function commandExists(cmd) {
  try {
    if (process.platform === 'win32') {
      execSync(`where ${cmd}`, { stdio: 'ignore', timeout: 2000 });
    } else {
      execSync(`which ${cmd}`, { stdio: 'ignore', timeout: 2000 });
    }
    return true;
  } catch {
    return false;
  }
}

function getAndroidToolDiagnostics(toolName) {
  const installed = commandExists(toolName);
  if (!installed) {
    return { installed: false, version: null, path: null };
  }

  let version = null;
  try {
    const output = execSync(`${toolName} --version`, { encoding: "utf-8", timeout: 5000 });
    version = output.trim().split('\n')[0];
  } catch {
    // Version check failed
  }

  let path = null;
  try {
    if (process.platform === 'win32') {
      const output = execSync(`where ${toolName}`, { encoding: "utf-8", timeout: 2000 });
      path = output.trim().split('\n')[0];
    } else {
      const output = execSync(`which ${toolName}`, { encoding: "utf-8", timeout: 2000 });
      path = output.trim();
    }
  } catch {
    // Path check failed
  }

  return { installed, version, path };
}

export function systemToolsHandler(req, res) {
  const rustVersion = safeExec("rustc --version");
  const cargoVersion = safeExec("cargo --version");
  const nodeVersion = safeExec("node --version");
  const npmVersion = safeExec("npm --version");
  const pythonVersion = safeExec("python3 --version");
  const pipVersion = safeExec("pip3 --version");
  const gitVersion = safeExec("git --version");
  const dockerVersion = safeExec("docker --version");
  
  const adbDiagnostics = getAndroidToolDiagnostics('adb');
  const fastbootDiagnostics = getAndroidToolDiagnostics('fastboot');
  const adbInstalled = commandExists("adb");
  const fastbootInstalled = commandExists("fastboot");
  
  let adbDevices = null;
  let adbVersion = null;
  try {
    if (adbInstalled) {
      adbVersion = safeExec("adb version");
      const devicesOutput = safeExec("adb devices -l");
      if (devicesOutput) {
        const lines = devicesOutput.split('\n').filter(line => line.trim() && !line.includes('List of devices'));
        adbDevices = lines.length;
      }
    }
  } catch {
    // ADB check failed
  }
  
  const data = {
    rust: {
      installed: !!rustVersion,
      version: rustVersion
    },
    cargo: {
      installed: !!cargoVersion,
      version: cargoVersion
    },
    node: {
      installed: !!nodeVersion,
      version: nodeVersion
    },
    npm: {
      installed: !!npmVersion,
      version: npmVersion
    },
    python: {
      installed: !!pythonVersion,
      version: pythonVersion
    },
    pip: {
      installed: !!pipVersion,
      version: pipVersion
    },
    git: {
      installed: !!gitVersion,
      version: gitVersion
    },
    docker: {
      installed: !!dockerVersion,
      version: dockerVersion
    },
    android: {
      adb: {
        ...adbDiagnostics,
        devicesDetected: adbDevices || 0,
        versionInfo: adbVersion
      },
      fastboot: fastbootDiagnostics
    }
  };
  
  res.sendEnvelope(data);
}

