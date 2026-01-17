const { execSync } = require("child_process");

function exists(cmd) {
  try {
    execSync(`command -v ${cmd}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function main() {
  const adb = exists("adb");
  const fastboot = exists("fastboot");

  const result = {
    adb: {
      installed: adb
    },
    fastboot: {
      installed: fastboot
    }
  };

  if (adb) {
    try {
      const devices = execSync("adb devices", { encoding: "utf-8" });
      result.adb.devices_raw = devices;
    } catch {
    }
  }

  console.log(JSON.stringify(result, null, 2));

  if (!adb || !fastboot) {
    process.exit(1);
  }
}

main();
