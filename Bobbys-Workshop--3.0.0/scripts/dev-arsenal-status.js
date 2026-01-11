const { execSync } = require("child_process");

function safeExec(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8" }).trim();
  } catch {
    return null;
  }
}

function has(cmd) {
  try {
    execSync(`command -v ${cmd}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function main() {
  const rustVersion = safeExec("rustc --version");
  const nodeVersion = safeExec("node --version");
  const pythonVersion = safeExec("python3 --version");

  let adbDevices = null;
  if (has("adb")) {
    adbDevices = safeExec("adb devices");
  }

  const status = {
    env: "codespaces",
    tools: {
      rust: {
        installed: !!rustVersion,
        version: rustVersion
      },
      node: {
        installed: !!nodeVersion,
        version: nodeVersion
      },
      python: {
        installed: !!pythonVersion,
        version: pythonVersion
      },
      adb: {
        installed: has("adb"),
        devices_raw: adbDevices
      },
      fastboot: {
        installed: has("fastboot")
      }
    }
  };

  console.log(JSON.stringify(status, null, 2));
}

main();
